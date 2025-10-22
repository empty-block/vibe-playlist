-- Migration: Redesign music_library for OpenGraph + AI Pipeline
-- Related: TASK-639 - Two-tier music metadata extraction
-- Date: 2025-10-15
--
-- Changes:
-- 1. Change PK from 'id' to (platform_name, platform_id) for deduplication
-- 2. Add OpenGraph metadata fields for Tier 1 (fast extraction)
-- 3. Add processing pipeline status tracking
-- 4. Remove cast-specific fields (cast_id, author_fid) - use cast_music_edges junction instead
-- 5. Add canonical URL field

-- =====================================================
-- Step 1: Drop constraints that will conflict
-- =====================================================

-- Drop foreign key from cast_music_edges temporarily
-- Find and drop the actual FK constraint dynamically (name may vary)
DO $$
DECLARE
  constraint_name text;
BEGIN
  -- Find FK constraint from cast_music_edges to music_library
  SELECT conname INTO constraint_name
  FROM pg_constraint
  WHERE conrelid = 'public.cast_music_edges'::regclass
    AND confrelid = 'public.music_library'::regclass
    AND contype = 'f';

  IF constraint_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE public.cast_music_edges DROP CONSTRAINT %I', constraint_name);
    RAISE NOTICE 'Dropped FK constraint: %', constraint_name;
  ELSE
    RAISE NOTICE 'No FK constraint found between cast_music_edges and music_library';
  END IF;
END $$;

-- =====================================================
-- Step 2: Add new columns for OpenGraph and pipeline
-- =====================================================

-- OpenGraph metadata (Tier 1 - instant)
ALTER TABLE public.music_library
  ADD COLUMN IF NOT EXISTS og_title TEXT,
  ADD COLUMN IF NOT EXISTS og_artist TEXT,
  ADD COLUMN IF NOT EXISTS og_image_url TEXT,
  ADD COLUMN IF NOT EXISTS og_metadata JSONB,
  ADD COLUMN IF NOT EXISTS og_fetched_at TIMESTAMP;

-- Processing pipeline tracking
ALTER TABLE public.music_library
  ADD COLUMN IF NOT EXISTS url TEXT,
  ADD COLUMN IF NOT EXISTS processing_status TEXT DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS ai_processed_at TIMESTAMP,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- AI-normalized metadata (Tier 2 - TASK-640)
ALTER TABLE public.music_library
  ADD COLUMN IF NOT EXISTS title TEXT,
  ADD COLUMN IF NOT EXISTS artist TEXT,
  ADD COLUMN IF NOT EXISTS album TEXT,
  ADD COLUMN IF NOT EXISTS music_type TEXT,
  ADD COLUMN IF NOT EXISTS confidence_score DECIMAL(3,2),
  ADD COLUMN IF NOT EXISTS genres TEXT[];

-- =====================================================
-- Step 3: Ensure platform columns exist and are populated
-- =====================================================

-- Make sure platform_name and platform_id exist
ALTER TABLE public.music_library
  ADD COLUMN IF NOT EXISTS platform_name TEXT,
  ADD COLUMN IF NOT EXISTS platform_id TEXT;

-- Populate platform_name from platform column if needed
UPDATE public.music_library
SET platform_name = platform
WHERE platform_name IS NULL AND platform IS NOT NULL;

-- =====================================================
-- Step 4: Change primary key to (platform_name, platform_id)
-- =====================================================

-- First, ensure no NULL values in new PK columns
-- For existing records without platform info, generate placeholder IDs using UUID
UPDATE public.music_library
SET
  platform_name = COALESCE(platform_name, 'unknown'),
  platform_id = COALESCE(platform_id, 'legacy-' || gen_random_uuid()::text)
WHERE platform_name IS NULL OR platform_id IS NULL;

-- Make columns NOT NULL
ALTER TABLE public.music_library
  ALTER COLUMN platform_name SET NOT NULL,
  ALTER COLUMN platform_id SET NOT NULL;

-- Drop old primary key
ALTER TABLE public.music_library
  DROP CONSTRAINT IF EXISTS music_library_pkey,
  DROP CONSTRAINT IF EXISTS extracted_music_details_pkey;

-- Add new composite primary key
ALTER TABLE public.music_library
  ADD PRIMARY KEY (platform_name, platform_id);

-- =====================================================
-- Step 5: Drop old columns no longer needed
-- =====================================================

-- Remove cast-specific columns (now handled by cast_music_edges junction)
ALTER TABLE public.music_library
  DROP COLUMN IF EXISTS cast_id,
  DROP COLUMN IF EXISTS author_fid,
  DROP COLUMN IF EXISTS id,
  DROP COLUMN IF EXISTS embed_index; -- Belongs in cast_music_edges, not here

-- Remove old AI processing columns
ALTER TABLE public.music_library
  DROP COLUMN IF EXISTS ai_model_version,
  DROP COLUMN IF EXISTS processed_at;

-- Remove duplicate platform column (we standardized on platform_name)
ALTER TABLE public.music_library
  DROP COLUMN IF EXISTS platform;

-- =====================================================
-- Step 6: Foreign key recreation
-- =====================================================

-- NOTE: We do NOT recreate the FK constraint here.
-- Migration 2 (20251015100001) will handle FK recreation after
-- renaming columns in cast_music_edges for consistency.
-- This avoids column name mismatches between migrations.

-- =====================================================
-- Step 7: Create indexes for new columns
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_music_library_og_title ON public.music_library(og_title);
CREATE INDEX IF NOT EXISTS idx_music_library_processing_status ON public.music_library(processing_status);
CREATE INDEX IF NOT EXISTS idx_music_library_url ON public.music_library(url);
CREATE INDEX IF NOT EXISTS idx_music_library_updated_at ON public.music_library(updated_at);

-- Add index for composite PK lookups
CREATE INDEX IF NOT EXISTS idx_music_library_pk ON public.music_library(platform_name, platform_id);

-- =====================================================
-- Step 8: Add constraints and comments
-- =====================================================

-- Processing status enum constraint
ALTER TABLE public.music_library
  ADD CONSTRAINT music_library_processing_status_check
    CHECK (processing_status IN ('pending', 'og_fetched', 'ai_processing', 'ai_completed', 'failed'));

-- Update table and column comments
COMMENT ON TABLE public.music_library IS 'Canonical registry of music tracks with two-tier metadata: OpenGraph (fast) and AI-normalized (quality)';
COMMENT ON COLUMN public.music_library.platform_name IS 'Platform identifier (e.g., spotify, youtube, soundcloud)';
COMMENT ON COLUMN public.music_library.platform_id IS 'Platform-specific track ID extracted from URL';
COMMENT ON COLUMN public.music_library.url IS 'Canonical music URL';
COMMENT ON COLUMN public.music_library.og_title IS 'OpenGraph og:title (Tier 1 - instant display)';
COMMENT ON COLUMN public.music_library.og_artist IS 'OpenGraph og:artist or parsed from title (Tier 1)';
COMMENT ON COLUMN public.music_library.og_image_url IS 'OpenGraph og:image thumbnail URL (Tier 1)';
COMMENT ON COLUMN public.music_library.og_metadata IS 'Full OpenGraph response for debugging';
COMMENT ON COLUMN public.music_library.og_fetched_at IS 'Timestamp when OpenGraph was fetched';
COMMENT ON COLUMN public.music_library.title IS 'AI-normalized track title (Tier 2 - NULL until TASK-640)';
COMMENT ON COLUMN public.music_library.artist IS 'AI-normalized artist name (Tier 2)';
COMMENT ON COLUMN public.music_library.album IS 'AI-normalized album name (Tier 2)';
COMMENT ON COLUMN public.music_library.genres IS 'AI-extracted genre tags (Tier 2)';
COMMENT ON COLUMN public.music_library.confidence_score IS 'AI confidence in extraction (0.00-1.00, Tier 2)';
COMMENT ON COLUMN public.music_library.processing_status IS 'Pipeline status: pending → og_fetched → ai_processing → ai_completed';
COMMENT ON COLUMN public.music_library.ai_processed_at IS 'Timestamp when AI normalization completed (TASK-640)';
COMMENT ON COLUMN public.music_library.music_type IS 'Type: song, album, playlist, or artist';
COMMENT ON COLUMN public.music_library.release_date IS 'Release/upload date from metadata';
COMMENT ON COLUMN public.music_library.created_at IS 'When this record was first created';
COMMENT ON COLUMN public.music_library.updated_at IS 'Last update timestamp';

-- Grant permissions
GRANT ALL ON public.music_library TO authenticated, anon, service_role;
