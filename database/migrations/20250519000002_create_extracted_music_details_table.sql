-- Create extracted_music_details table
-- Stores AI-extracted music information from complete cast analysis (text + all embeds)

CREATE TABLE public.extracted_music_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cast_id TEXT NOT NULL REFERENCES public.cast_nodes(node_id) ON DELETE CASCADE,
  author_fid TEXT NOT NULL REFERENCES public.user_nodes(node_id),
  music_type TEXT NOT NULL CHECK (music_type IN ('song', 'album', 'playlist', 'artist')),
  title TEXT NOT NULL,
  artist TEXT,
  album TEXT,
  confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
  ai_model_version TEXT NOT NULL DEFAULT 'claude-3-sonnet',
  processed_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes for common query patterns
CREATE INDEX idx_extracted_music_details_cast_id ON public.extracted_music_details(cast_id);
CREATE INDEX idx_extracted_music_details_author_fid ON public.extracted_music_details(author_fid);
CREATE INDEX idx_extracted_music_details_music_type ON public.extracted_music_details(music_type);
CREATE INDEX idx_extracted_music_details_artist ON public.extracted_music_details(artist);
CREATE INDEX idx_extracted_music_details_title ON public.extracted_music_details(title);
CREATE INDEX idx_extracted_music_details_confidence ON public.extracted_music_details(confidence_score);
CREATE INDEX idx_extracted_music_details_processed_at ON public.extracted_music_details(processed_at);

-- Add table comment
COMMENT ON TABLE public.extracted_music_details IS 'AI-extracted music information from complete cast analysis (text + all embeds together). Multiple music entries can exist per cast.';

-- Add column comments
COMMENT ON COLUMN public.extracted_music_details.confidence_score IS 'AI confidence in extraction accuracy (0.0-1.0)';
COMMENT ON COLUMN public.extracted_music_details.music_type IS 'Type of music reference: song, album, playlist, or artist';

-- Set permissions
GRANT ALL PRIVILEGES ON TABLE public.extracted_music_details TO postgres, anon, authenticated, service_role; 