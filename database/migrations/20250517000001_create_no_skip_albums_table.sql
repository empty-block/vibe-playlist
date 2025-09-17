-- Create no_skip_albums table
-- This table stores enriched cast data from the No Skip Albums thread

CREATE TABLE public.no_skip_albums (
  node_id TEXT PRIMARY KEY,
  cast_text TEXT NOT NULL,
  cast_created_at TIMESTAMP NOT NULL,
  embeds JSONB,
  author_fid BIGINT NOT NULL,
  author_fname TEXT,
  author_display_name TEXT,
  author_avatar_url TEXT,
  author_bio TEXT,
  cast_channel TEXT NOT NULL DEFAULT 'no_skip_albums'
);

-- Create indexes for common query patterns
CREATE INDEX idx_no_skip_albums_author_fid ON public.no_skip_albums(author_fid);
CREATE INDEX idx_no_skip_albums_cast_created_at ON public.no_skip_albums(cast_created_at);
CREATE INDEX idx_no_skip_albums_author_fname ON public.no_skip_albums(author_fname);

-- Add table comment
COMMENT ON TABLE public.no_skip_albums IS 'Enriched cast data from the No Skip Albums thread, including user profiles and spam filtering';

-- Set permissions
GRANT ALL PRIVILEGES ON TABLE public.no_skip_albums TO postgres, anon, authenticated, service_role; 