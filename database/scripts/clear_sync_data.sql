-- Clear all sync data except channels and music_sources tables
-- This allows for a clean fresh sync test

-- Delete music-related data (in correct order for FK constraints)
TRUNCATE TABLE public.cast_music_edges CASCADE;
TRUNCATE TABLE public.music_ai_queue CASCADE;
TRUNCATE TABLE public.music_library CASCADE;

-- Delete cast data
TRUNCATE TABLE public.cast_nodes CASCADE;

-- Delete sync status
TRUNCATE TABLE public.channel_sync_status CASCADE;

-- Verify what's left (should only be channels and music_sources)
SELECT
  schemaname,
  tablename,
  (SELECT COUNT(*) FROM pg_class WHERE relname = tablename) as row_count
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename NOT LIKE 'pg_%'
ORDER BY tablename;
