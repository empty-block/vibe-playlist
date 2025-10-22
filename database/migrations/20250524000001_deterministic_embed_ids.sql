-- Migration: Use deterministic composite primary keys for embeds
-- This eliminates duplicate processing issues by making IDs predictable

-- Drop existing tables to recreate with new schema
DROP TABLE IF EXISTS public.embeds_metadata;
DROP TABLE IF EXISTS public.embeds;

-- Recreate embeds table with composite primary key
CREATE TABLE public.embeds (
  cast_id TEXT NOT NULL REFERENCES public.cast_nodes(node_id),
  embed_index INTEGER NOT NULL,
  embed_url TEXT NOT NULL,
  embed_type TEXT NOT NULL, -- 'URL','CAST'
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  PRIMARY KEY (cast_id, embed_index)
);

-- Recreate embeds metadata table with composite primary key
CREATE TABLE public.embeds_metadata (
  cast_id TEXT NOT NULL,
  embed_index INTEGER NOT NULL,
  url TEXT NOT NULL,
  url_domain TEXT, -- Domain extracted from URL (e.g., 'spotify.com', 'youtube.com')
  og_metadata TEXT, -- Complete Open Graph + structured metadata as JSON
  extraction_success BOOLEAN NOT NULL,
  extraction_error TEXT,
  processed_at TIMESTAMP NOT NULL DEFAULT NOW(),
  PRIMARY KEY (cast_id, embed_index),
  FOREIGN KEY (cast_id, embed_index) REFERENCES public.embeds(cast_id, embed_index)
);

-- Update extracted_music_details to use composite primary key
-- Drop and recreate to change primary key
DROP TABLE IF EXISTS public.extracted_music_details;

CREATE TABLE public.extracted_music_details (
  cast_id TEXT NOT NULL,
  embed_index INTEGER NOT NULL,
  author_fid TEXT NOT NULL,
  music_type TEXT NOT NULL CHECK (music_type IN ('song', 'album', 'playlist', 'artist')),
  title TEXT NOT NULL,
  artist TEXT,
  album TEXT,
  confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
  ai_model_version TEXT NOT NULL DEFAULT 'claude-3-sonnet',
  processed_at TIMESTAMP NOT NULL DEFAULT NOW(),
  PRIMARY KEY (cast_id, embed_index),
  FOREIGN KEY (cast_id, embed_index) REFERENCES public.embeds(cast_id, embed_index)
);

-- Create indexes for performance
CREATE INDEX idx_embeds_cast_id ON public.embeds(cast_id);
CREATE INDEX idx_embeds_metadata_cast_id ON public.embeds_metadata(cast_id);
CREATE INDEX idx_embeds_metadata_success ON public.embeds_metadata(extraction_success);
CREATE INDEX idx_extracted_music_cast_id ON public.extracted_music_details(cast_id);
CREATE INDEX idx_extracted_music_author ON public.extracted_music_details(author_fid); 