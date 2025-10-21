-- Backfill Script for Fixing Timestamps
-- Run this in Supabase SQL Editor to fix existing data

-- 1. Backfill cast_music_edges.created_at from cast_nodes.created_at
-- This updates the edge creation timestamp to match the actual cast creation time
UPDATE cast_music_edges
SET created_at = cast_nodes.created_at
FROM cast_nodes
WHERE cast_music_edges.cast_id = cast_nodes.node_id
  AND cast_music_edges.created_at != cast_nodes.created_at;

-- 2. Backfill music_library.created_at from the earliest cast_nodes.created_at
-- This sets the track creation timestamp to the first time it was cast
UPDATE music_library
SET created_at = earliest_cast.min_created_at
FROM (
  SELECT
    cme.music_platform_name,
    cme.music_platform_id,
    MIN(cn.created_at) as min_created_at
  FROM cast_music_edges cme
  JOIN cast_nodes cn ON cme.cast_id = cn.node_id
  GROUP BY cme.music_platform_name, cme.music_platform_id
) AS earliest_cast
WHERE music_library.platform_name = earliest_cast.music_platform_name
  AND music_library.platform_id = earliest_cast.music_platform_id
  AND music_library.created_at != earliest_cast.min_created_at;

-- Verification queries:

-- Check how many rows will be affected in cast_music_edges
SELECT COUNT(*) as rows_to_update
FROM cast_music_edges cme
JOIN cast_nodes cn ON cme.cast_id = cn.node_id
WHERE cme.created_at != cn.created_at;

-- Check how many rows will be affected in music_library
SELECT COUNT(*) as rows_to_update
FROM music_library ml
JOIN (
  SELECT
    cme.music_platform_name,
    cme.music_platform_id,
    MIN(cn.created_at) as min_created_at
  FROM cast_music_edges cme
  JOIN cast_nodes cn ON cme.cast_id = cn.node_id
  GROUP BY cme.music_platform_name, cme.music_platform_id
) AS earliest_cast
  ON ml.platform_name = earliest_cast.music_platform_name
  AND ml.platform_id = earliest_cast.music_platform_id
WHERE ml.created_at != earliest_cast.min_created_at;

-- Sample check: View timestamp differences for cast_music_edges
SELECT
  cme.cast_id,
  cme.created_at as edge_created_at,
  cn.created_at as cast_created_at,
  EXTRACT(DAY FROM cme.created_at - cn.created_at) as days_difference
FROM cast_music_edges cme
JOIN cast_nodes cn ON cme.cast_id = cn.node_id
WHERE cme.created_at != cn.created_at
ORDER BY days_difference DESC
LIMIT 10;
