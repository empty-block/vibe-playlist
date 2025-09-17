-- Get platform distribution within time range
-- Purpose: Returns count of songs shared per platform
-- Parameters: time_filter (optional) - only include records after this timestamp
-- Returns: platform name and song count
CREATE OR REPLACE FUNCTION get_platform_distribution_by_time_range(time_filter timestamptz DEFAULT NULL)
RETURNS TABLE(platform_name text, count bigint) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ml.platform_name,
    COUNT(*) as count
  FROM music_library ml
  WHERE ml.platform_name IS NOT NULL 
    AND ml.platform_name != ''
    AND (time_filter IS NULL OR ml.processed_at >= time_filter)
  GROUP BY ml.platform_name
  ORDER BY count DESC;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_platform_distribution_by_time_range TO authenticated;
GRANT EXECUTE ON FUNCTION get_platform_distribution_by_time_range TO anon; 