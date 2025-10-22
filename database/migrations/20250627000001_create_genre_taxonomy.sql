-- Create genre taxonomy table with curated genre list
-- Based on Phase 1B: Define consistent genre vocabulary for AI classification

CREATE TABLE public.genre_taxonomy (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  genre_name TEXT NOT NULL UNIQUE,
  category TEXT, -- Optional grouping (e.g., 'electronic', 'rock', 'hip-hop')
  description TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Insert curated genre list from jamzy specs
INSERT INTO public.genre_taxonomy (genre_name, category) VALUES
  ('rock', 'rock'),
  ('hip-hop', 'hip-hop'),
  ('jazz', 'jazz'),
  ('electronic', 'electronic'),
  ('lo-fi', 'electronic'),
  ('indie', 'indie'),
  ('folk', 'folk'),
  ('r&b', 'r&b'),
  ('country', 'country'),
  ('bluegrass', 'country'),
  ('roots', 'folk'),
  ('classical', 'classical'),
  ('metal', 'rock'),
  ('punk', 'rock'),
  ('pop punk', 'rock'),
  ('old school hip-hop', 'hip-hop'),
  ('reggae', 'reggae'),
  ('drum-and-bass', 'electronic'),
  ('synthwave', 'electronic'),
  ('ambient', 'electronic'),
  ('disco', 'disco'),
  ('classic rock', 'rock'),
  ('blues', 'blues'),
  ('soul', 'r&b'),
  ('funk', 'funk'),
  ('house', 'electronic'),
  ('pop', 'pop'),
  ('k-pop', 'pop'),
  ('christian rap', 'hip-hop');

-- Add genre field to music_library table
ALTER TABLE public.music_library 
ADD COLUMN genre TEXT[];

-- Create index for genre queries
CREATE INDEX idx_music_library_genre ON public.music_library USING GIN(genre);

-- Add table and column comments
COMMENT ON TABLE public.genre_taxonomy IS 'Curated list of music genres for consistent AI classification';
COMMENT ON COLUMN public.music_library.genre IS 'Array of genres selected from curated taxonomy (1-3 max recommended)';

-- Set permissions
GRANT ALL PRIVILEGES ON TABLE public.genre_taxonomy TO postgres, anon, authenticated, service_role; 