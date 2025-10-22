-- Update embeds table to align with simplified approach
-- Remove pre-parsed fields that conflict with our raw metadata strategy

-- Remove old pre-parsed fields from embeds table
ALTER TABLE public.embeds 
DROP COLUMN IF EXISTS artist,
DROP COLUMN IF EXISTS track_title,
DROP COLUMN IF EXISTS album,
DROP COLUMN IF EXISTS duration,
DROP COLUMN IF EXISTS platform_id;

-- Update foreign key to use cast_id instead of cast_hash for consistency
ALTER TABLE public.embeds 
RENAME COLUMN cast_hash TO cast_id;

-- Add created_at timestamp for consistency
ALTER TABLE public.embeds 
ADD COLUMN created_at TIMESTAMP NOT NULL DEFAULT NOW();

-- Drop old index and create new one
DROP INDEX IF EXISTS idx_embeds_artist;
CREATE INDEX idx_embeds_cast_id ON public.embeds(cast_id);
CREATE INDEX idx_embeds_embed_url ON public.embeds(embed_url);

-- Update table comment
COMMENT ON TABLE public.embeds IS 'URLs found in Farcaster cast embeds (music platforms, images, etc.)';

-- Update permissions
GRANT ALL PRIVILEGES ON TABLE public.embeds TO postgres, anon, authenticated, service_role; 