-- Rename tables for better clarity and maintainability
-- This migration improves table naming to be more descriptive

-- Rename edges table to cast_edges (more specific about the type of edges)
ALTER TABLE public.edges RENAME TO cast_edges;

-- Rename extracted_music_details to music_library (more user-friendly name)
ALTER TABLE public.extracted_music_details RENAME TO music_library;

-- Update comments to reflect new table names
COMMENT ON TABLE public.cast_edges IS 'Relationships between users and casts (AUTHORED, LIKED, RECASTED, REPLIED)';
COMMENT ON TABLE public.music_library IS 'AI-extracted music information from complete cast analysis (text + all embeds together). Multiple music entries can exist per cast.';

-- Note: Indexes and constraints are automatically renamed by PostgreSQL
-- Foreign key references will continue to work as they reference the actual table objects 