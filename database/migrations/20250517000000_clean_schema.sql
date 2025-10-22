-- Clean schema migration
-- All tables in public schema with proper constraints

-- Create edge_type enum
CREATE TYPE public.edge_type AS ENUM ('AUTHORED', 'LIKED', 'RECASTED', 'REPLIED');

-- Create UserNode table
CREATE TABLE public.user_nodes (
  node_id TEXT PRIMARY KEY,
  fname TEXT,
  display_name TEXT,
  avatar_url TEXT
);
CREATE INDEX idx_user_nodes_fname ON public.user_nodes(fname);

-- Create CastNode table
CREATE TABLE public.cast_nodes (
  node_id TEXT PRIMARY KEY,
  cast_text TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL,
  author_fid TEXT NOT NULL,
  cast_channel TEXT,
  FOREIGN KEY (author_fid) REFERENCES public.user_nodes(node_id)
);
CREATE INDEX idx_cast_nodes_author_fid ON public.cast_nodes(author_fid);

-- Create Edge table (with nullable target_user_id)
CREATE TABLE public.edges (
  source_user_id TEXT NOT NULL,
  target_user_id TEXT, -- Nullable for REPLIED type
  cast_id TEXT NOT NULL,
  edge_type public.edge_type NOT NULL,
  created_at TIMESTAMP NOT NULL,
  PRIMARY KEY (source_user_id, cast_id, edge_type), -- Modified for nullable target
  FOREIGN KEY (source_user_id) REFERENCES public.user_nodes(node_id),
  FOREIGN KEY (target_user_id) REFERENCES public.user_nodes(node_id),
  FOREIGN KEY (cast_id) REFERENCES public.cast_nodes(node_id)
);
CREATE INDEX idx_edges_source_user_id ON public.edges(source_user_id);
CREATE INDEX idx_edges_target_user_id ON public.edges(target_user_id);

-- Create Embeds table
CREATE TABLE public.embeds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cast_hash TEXT NOT NULL,
  embed_url TEXT NOT NULL,
  embed_type TEXT NOT NULL,
  embed_index INTEGER NOT NULL,
  artist TEXT,
  track_title TEXT,
  album TEXT,
  duration INTEGER,
  platform_id TEXT,
  FOREIGN KEY (cast_hash) REFERENCES public.cast_nodes(node_id)
);
CREATE INDEX idx_embeds_cast_hash ON public.embeds(cast_hash);
CREATE INDEX idx_embeds_artist ON public.embeds(artist);

-- Add documentation
COMMENT ON COLUMN public.edges.target_user_id IS 'User ID of the target. Can be null for REPLIED edge type.';

-- Set permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT USAGE ON TYPE public.edge_type TO postgres, anon, authenticated, service_role; 