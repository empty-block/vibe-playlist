-- Migration: Update cast_music_edges for consistency
-- Related: TASK-639 - Two-tier music metadata extraction
-- Date: 2025-10-15
--
-- Changes:
-- 1. Rename music_platform → music_platform_name (for consistency with music_library.platform_name)
-- 2. Add embed_index column to track position in cast embeds array
-- 3. Update foreign key constraints

-- =====================================================
-- Step 1: Drop existing foreign key constraint
-- =====================================================

-- Drop FK constraints dynamically (names may vary)
DO $$
DECLARE
  constraint_name text;
BEGIN
  -- Find and drop FK constraint to music_library
  FOR constraint_name IN
    SELECT conname
    FROM pg_constraint
    WHERE conrelid = 'public.cast_music_edges'::regclass
      AND confrelid = 'public.music_library'::regclass
      AND contype = 'f'
  LOOP
    EXECUTE format('ALTER TABLE public.cast_music_edges DROP CONSTRAINT IF EXISTS %I', constraint_name);
    RAISE NOTICE 'Dropped FK constraint: %', constraint_name;
  END LOOP;
END $$;

-- =====================================================
-- Step 2: Rename column for consistency
-- =====================================================

-- Rename music_platform to music_platform_name (if it exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'cast_music_edges'
      AND column_name = 'music_platform'
  ) THEN
    ALTER TABLE public.cast_music_edges
      RENAME COLUMN music_platform TO music_platform_name;
    RAISE NOTICE 'Renamed music_platform to music_platform_name';
  ELSE
    RAISE NOTICE 'Column music_platform does not exist, skipping rename';

    -- Ensure music_platform_name exists
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'cast_music_edges'
        AND column_name = 'music_platform_name'
    ) THEN
      ALTER TABLE public.cast_music_edges ADD COLUMN music_platform_name TEXT;
      RAISE NOTICE 'Created music_platform_name column';
    END IF;
  END IF;
END $$;

-- =====================================================
-- Step 3: Add embed_index column
-- =====================================================

-- Add column to track position in embeds array (useful for debugging and ordering)
ALTER TABLE public.cast_music_edges
  ADD COLUMN IF NOT EXISTS embed_index INTEGER;

-- =====================================================
-- Step 4: Update primary key constraint
-- =====================================================

-- Drop old primary key
ALTER TABLE public.cast_music_edges
  DROP CONSTRAINT IF EXISTS cast_music_edges_pkey;

-- Add new primary key with updated column name
ALTER TABLE public.cast_music_edges
  ADD PRIMARY KEY (cast_id, music_platform_name, music_platform_id);

-- =====================================================
-- Step 5: Recreate foreign key constraints
-- =====================================================

-- Foreign key to cast_nodes
ALTER TABLE public.cast_music_edges
  ADD CONSTRAINT cast_music_edges_cast_fkey
    FOREIGN KEY (cast_id)
    REFERENCES public.cast_nodes(node_id)
    ON DELETE CASCADE;

-- Foreign key to music_library (with new column names)
ALTER TABLE public.cast_music_edges
  ADD CONSTRAINT cast_music_edges_music_fkey
    FOREIGN KEY (music_platform_name, music_platform_id)
    REFERENCES public.music_library(platform_name, platform_id)
    ON DELETE CASCADE;

-- =====================================================
-- Step 6: Update indexes
-- =====================================================

-- Drop old indexes if they exist
DROP INDEX IF EXISTS idx_cast_music_edges_music;

-- Recreate with new column name
CREATE INDEX IF NOT EXISTS idx_cast_music_edges_music
  ON public.cast_music_edges(music_platform_name, music_platform_id);

CREATE INDEX IF NOT EXISTS idx_cast_music_edges_cast
  ON public.cast_music_edges(cast_id);

CREATE INDEX IF NOT EXISTS idx_cast_music_edges_embed_index
  ON public.cast_music_edges(embed_index);

-- =====================================================
-- Step 7: Add comments
-- =====================================================

COMMENT ON TABLE public.cast_music_edges IS 'Many-to-many junction table linking casts to music tracks. Same track shared in multiple casts = multiple edges.';
COMMENT ON COLUMN public.cast_music_edges.cast_id IS 'Cast hash from cast_nodes';
COMMENT ON COLUMN public.cast_music_edges.music_platform_name IS 'Platform identifier (spotify, youtube, soundcloud, etc.)';
COMMENT ON COLUMN public.cast_music_edges.music_platform_id IS 'Platform-specific track ID';
COMMENT ON COLUMN public.cast_music_edges.embed_index IS 'Position in cast embeds array (0-indexed). NULL for legacy data.';
COMMENT ON COLUMN public.cast_music_edges.created_at IS 'When this edge was created (typically when cast was synced)';

-- Grant permissions
GRANT ALL ON public.cast_music_edges TO authenticated, anon, service_role;
