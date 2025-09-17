-- Migration: Make ai_model_version and music_type optional in extracted_music_details
-- Date: 2025-01-23
-- Purpose: Allow flexibility for cases where model version is unknown or music type is ambiguous

-- Make ai_model_version nullable
ALTER TABLE public.extracted_music_details 
ALTER COLUMN ai_model_version DROP NOT NULL;

-- Make music_type nullable  
ALTER TABLE public.extracted_music_details
ALTER COLUMN music_type DROP NOT NULL;

-- Add comments for clarity
COMMENT ON COLUMN public.extracted_music_details.ai_model_version IS 'AI model used for extraction (optional - may be unknown for legacy extractions)';
COMMENT ON COLUMN public.extracted_music_details.music_type IS 'Type of music content (song/album/playlist/artist) - optional for ambiguous cases'; 