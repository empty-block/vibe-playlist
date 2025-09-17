-- Create music_extractions table
-- This table stores processed music information extracted from casts

CREATE TABLE public.music_extractions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  node_id TEXT NOT NULL REFERENCES public.no_skip_albums(node_id),
  author_fid BIGINT NOT NULL,
  cast_created_at TIMESTAMP NOT NULL,
  cast_channel TEXT NOT NULL DEFAULT 'no_skip_albums',
  music_type TEXT NOT NULL CHECK (music_type IN ('song', 'album', 'playlist', 'artist')),
  title TEXT NOT NULL,
  artist TEXT,
  album TEXT,
  confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
  processed_at TIMESTAMP NOT NULL DEFAULT NOW(),
  claude_model TEXT NOT NULL DEFAULT 'claude-3-haiku-20240307'
);

-- Create indexes for common query patterns
CREATE INDEX idx_music_extractions_node_id ON public.music_extractions(node_id);
CREATE INDEX idx_music_extractions_author_fid ON public.music_extractions(author_fid);
CREATE INDEX idx_music_extractions_music_type ON public.music_extractions(music_type);
CREATE INDEX idx_music_extractions_artist ON public.music_extractions(artist);
CREATE INDEX idx_music_extractions_processed_at ON public.music_extractions(processed_at);
CREATE INDEX idx_music_extractions_confidence_score ON public.music_extractions(confidence_score);

-- Add table comment
COMMENT ON TABLE public.music_extractions IS 'Music information extracted from No Skip Albums casts using Claude API';

-- Add column comments
COMMENT ON COLUMN public.music_extractions.confidence_score IS 'Claude confidence in extraction accuracy (0.0-1.0)';
COMMENT ON COLUMN public.music_extractions.music_type IS 'Type of music reference: song, album, playlist, or artist';

-- Set permissions
GRANT ALL PRIVILEGES ON TABLE public.music_extractions TO postgres, anon, authenticated, service_role; 