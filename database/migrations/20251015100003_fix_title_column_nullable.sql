-- Migration: Make title column nullable
-- The title column is populated by AI normalization (TASK-640 / Tier 2)
-- OpenGraph extraction (Tier 1) only populates og_title
-- Therefore, title should be nullable until AI processing completes

ALTER TABLE public.music_library
  ALTER COLUMN title DROP NOT NULL;

-- Also make other AI-normalized columns explicitly nullable
ALTER TABLE public.music_library
  ALTER COLUMN artist DROP NOT NULL,
  ALTER COLUMN album DROP NOT NULL,
  ALTER COLUMN music_type DROP NOT NULL,
  ALTER COLUMN genres DROP NOT NULL;

-- Add comment to clarify
COMMENT ON COLUMN public.music_library.title IS 'AI-normalized track title (Tier 2 - NULL until TASK-640 completes)';
