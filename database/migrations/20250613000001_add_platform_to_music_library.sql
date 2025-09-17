-- Add platform_name column to music_library table
-- This links music entries to their source platform for analytics and filtering

ALTER TABLE public.music_library 
ADD COLUMN platform_name TEXT;

-- Add index for common query patterns (filtering by platform)
CREATE INDEX idx_music_library_platform_name ON public.music_library(platform_name);

-- Add comment
COMMENT ON COLUMN public.music_library.platform_name IS 'Platform extraction key (e.g. spotify, youtube_music) - references music_sources.platform_name'; 