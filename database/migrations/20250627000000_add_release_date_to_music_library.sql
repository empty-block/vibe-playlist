-- Add release_date to music_library table
-- Based on Phase 1A research: Spotify, YouTube provide release/upload dates that are valuable for genre classification

ALTER TABLE public.music_library 
ADD COLUMN release_date DATE;

-- Add index for release date queries (era-based filtering, etc.)
CREATE INDEX idx_music_library_release_date ON public.music_library(release_date);

-- Add column comment
COMMENT ON COLUMN public.music_library.release_date IS 'Release date extracted from metadata (music:release_date, uploadDate, etc.) - useful for era-based genre classification'; 