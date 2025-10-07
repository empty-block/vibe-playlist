-- Migration: Add mini-app columns to existing schema
-- Related: TASK-605 - Backend API Thread CRUD & Music Operations
-- Date: 2025-10-06

-- Add thread/reply support to cast_nodes
ALTER TABLE public.cast_nodes
  ADD COLUMN IF NOT EXISTS parent_cast_hash TEXT,
  ADD COLUMN IF NOT EXISTS root_parent_hash TEXT,
  ADD COLUMN IF NOT EXISTS cast_channel TEXT;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_cast_nodes_parent ON public.cast_nodes(parent_cast_hash);
CREATE INDEX IF NOT EXISTS idx_cast_nodes_root_parent ON public.cast_nodes(root_parent_hash);

COMMENT ON COLUMN public.cast_nodes.parent_cast_hash IS 'Parent cast hash for replies (NULL for top-level threads)';
COMMENT ON COLUMN public.cast_nodes.root_parent_hash IS 'Root thread hash for nested replies';

-- Add mini-app fields to music_library if not exists
ALTER TABLE public.music_library
  ADD COLUMN IF NOT EXISTS platform_id TEXT,
  ADD COLUMN IF NOT EXISTS platform TEXT;

-- Add index for platform lookup
CREATE INDEX IF NOT EXISTS idx_music_library_platform ON public.music_library(platform, platform_id)
  WHERE platform_id IS NOT NULL;

-- Create cast_music_edges junction table (for mini-app music linking)
CREATE TABLE IF NOT EXISTS public.cast_music_edges (
  cast_id TEXT NOT NULL,
  music_platform TEXT NOT NULL,
  music_platform_id TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (cast_id, music_platform, music_platform_id),
  FOREIGN KEY (cast_id) REFERENCES public.cast_nodes(node_id) ON DELETE CASCADE,
  FOREIGN KEY (music_platform, music_platform_id)
    REFERENCES public.music_library(platform, platform_id)
    ON DELETE CASCADE
);

-- Add indexes for cast_music_edges
CREATE INDEX IF NOT EXISTS idx_cast_music_edges_cast ON public.cast_music_edges(cast_id);
CREATE INDEX IF NOT EXISTS idx_cast_music_edges_music ON public.cast_music_edges(music_platform, music_platform_id);

COMMENT ON TABLE public.cast_music_edges IS 'Many-to-many relationship between casts and music tracks (mini-app only)';
