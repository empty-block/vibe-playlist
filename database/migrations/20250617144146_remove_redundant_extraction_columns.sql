-- Remove redundant extraction tracking columns from embeds_metadata
-- Since failed extractions don't get inserted into the database,
-- the presence of a record itself indicates extraction success

-- Drop the redundant columns
ALTER TABLE public.embeds_metadata 
DROP COLUMN IF EXISTS extraction_success,
DROP COLUMN IF EXISTS extraction_error;

-- Add comment to document the simplified approach
COMMENT ON TABLE public.embeds_metadata IS 'URL metadata extraction results. Presence of record indicates successful extraction.';
