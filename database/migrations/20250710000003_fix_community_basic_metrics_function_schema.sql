-- Fix the get_community_basic_metrics function with correct table schema
CREATE OR REPLACE FUNCTION get_community_basic_metrics(time_filter timestamptz DEFAULT NULL)
RETURNS TABLE (
    total_songs_shared bigint,
    total_interactions bigint,
    active_users bigint
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(DISTINCT ml.cast_id) as total_songs_shared,
        COUNT(DISTINCT (ce.source_user_id, ce.cast_id, ce.edge_type)) as total_interactions,
        COUNT(DISTINCT ml.author_fid) as active_users
    FROM music_library ml
    LEFT JOIN cast_edges ce ON ml.cast_id = ce.cast_id
    LEFT JOIN cast_nodes cn ON ml.cast_id = cn.node_id
    WHERE (time_filter IS NULL OR cn.created_at >= time_filter);
END;
$$ LANGUAGE plpgsql; 