-- Redistribute threads more evenly across all channels
-- This will give each channel some test data to work with

-- First, let's redistribute based on a more even hash distribution
-- We'll take threads from 'music' and 'hip-hop' and spread them across all channels

-- Techno (take some threads)
UPDATE cast_nodes
SET channel = 'techno'
WHERE node_id IN (
  SELECT node_id
  FROM cast_nodes
  WHERE (channel = 'music' OR channel = 'hip-hop')
    AND parent_cast_hash IS NULL
  ORDER BY created_at DESC
  LIMIT 10
);

-- Indie
UPDATE cast_nodes
SET channel = 'indie'
WHERE node_id IN (
  SELECT node_id
  FROM cast_nodes
  WHERE (channel = 'music' OR channel = 'hip-hop')
    AND parent_cast_hash IS NULL
    AND channel NOT IN ('techno')
  ORDER BY created_at DESC
  LIMIT 10
);

-- Jazz
UPDATE cast_nodes
SET channel = 'jazz'
WHERE node_id IN (
  SELECT node_id
  FROM cast_nodes
  WHERE (channel = 'music' OR channel = 'hip-hop')
    AND parent_cast_hash IS NULL
    AND channel NOT IN ('techno', 'indie')
  ORDER BY created_at DESC
  LIMIT 8
);

-- Electronic
UPDATE cast_nodes
SET channel = 'electronic'
WHERE node_id IN (
  SELECT node_id
  FROM cast_nodes
  WHERE (channel = 'music' OR channel = 'hip-hop')
    AND parent_cast_hash IS NULL
    AND channel NOT IN ('techno', 'indie', 'jazz')
  ORDER BY created_at DESC
  LIMIT 12
);

-- Vaporwave
UPDATE cast_nodes
SET channel = 'vaporwave'
WHERE node_id IN (
  SELECT node_id
  FROM cast_nodes
  WHERE (channel = 'music' OR channel = 'hip-hop')
    AND parent_cast_hash IS NULL
    AND channel NOT IN ('techno', 'indie', 'jazz', 'electronic')
  ORDER BY created_at DESC
  LIMIT 7
);

-- Punk
UPDATE cast_nodes
SET channel = 'punk'
WHERE node_id IN (
  SELECT node_id
  FROM cast_nodes
  WHERE (channel = 'music' OR channel = 'hip-hop')
    AND parent_cast_hash IS NULL
    AND channel NOT IN ('techno', 'indie', 'jazz', 'electronic', 'vaporwave')
  ORDER BY created_at DESC
  LIMIT 9
);

-- Metal
UPDATE cast_nodes
SET channel = 'metal'
WHERE node_id IN (
  SELECT node_id
  FROM cast_nodes
  WHERE (channel = 'music' OR channel = 'hip-hop')
    AND parent_cast_hash IS NULL
    AND channel NOT IN ('techno', 'indie', 'jazz', 'electronic', 'vaporwave', 'punk')
  ORDER BY created_at DESC
  LIMIT 11
);

-- Music (general channel - keep some threads here)
UPDATE cast_nodes
SET channel = 'music'
WHERE node_id IN (
  SELECT node_id
  FROM cast_nodes
  WHERE channel = 'hip-hop'
    AND parent_cast_hash IS NULL
    AND channel NOT IN ('techno', 'indie', 'jazz', 'electronic', 'vaporwave', 'punk', 'metal')
  ORDER BY created_at DESC
  LIMIT 5
);

-- Verify the distribution
SELECT
  channel,
  COUNT(*) as thread_count,
  MIN(created_at) as oldest_thread,
  MAX(created_at) as newest_thread
FROM cast_nodes
WHERE parent_cast_hash IS NULL
GROUP BY channel
ORDER BY thread_count DESC;
