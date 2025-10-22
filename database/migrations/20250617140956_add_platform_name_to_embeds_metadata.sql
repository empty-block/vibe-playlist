-- Add platform_name column to embeds_metadata table
-- This stores the platform identifier (e.g., 'spotify', 'youtube', 'soundcloud')
-- for better music platform tracking and filtering

ALTER TABLE public.embeds_metadata 
ADD COLUMN platform_name TEXT;

-- Add index for efficient filtering by platform
CREATE INDEX idx_embeds_metadata_platform_name ON public.embeds_metadata(platform_name);

-- Add column comment
COMMENT ON COLUMN public.embeds_metadata.platform_name IS 'Music platform identifier (e.g., spotify, youtube, soundcloud)';
