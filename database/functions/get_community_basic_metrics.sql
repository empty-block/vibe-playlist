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
        COUNT(DISTINCT ce.id) as total_interactions,
        COUNT(DISTINCT ml.author_fid) as active_users
    FROM music_library ml
    LEFT JOIN cast_edges ce ON ml.cast_id = ce.cast_id
    WHERE (time_filter IS NULL OR ml.processed_at >= time_filter);
END;
$$ LANGUAGE plpgsql; 