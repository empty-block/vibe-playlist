-- Migration 3: Grant Permissions
-- Ensure proper RLS and permissions for new functions

-- Grant permissions for search_music_library
GRANT EXECUTE ON FUNCTION search_music_library TO authenticated;
GRANT EXECUTE ON FUNCTION search_music_library TO anon;

-- Grant permissions for sort_music_library
GRANT EXECUTE ON FUNCTION sort_music_library TO authenticated;
GRANT EXECUTE ON FUNCTION sort_music_library TO anon;

-- Grant permissions for get_engagement_stats_batch  
GRANT EXECUTE ON FUNCTION get_engagement_stats_batch TO authenticated;
GRANT EXECUTE ON FUNCTION get_engagement_stats_batch TO anon;