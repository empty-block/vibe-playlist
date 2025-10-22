-- Migration: Seed Channels
-- Seeds initial set of curated music channels for testing and development

INSERT INTO channels (id, name, description, is_official, is_curated, sort_order, color_hex) VALUES
  -- Official Jamzy channels
  ('hip-hop', 'Hip Hop Heads', 'Golden era hip-hop, underground classics, and modern bangers', TRUE, TRUE, 1, '#FF6B35'),
  ('techno', 'Techno Basement', '4/4 forever - minimal, deep, and industrial techno', TRUE, TRUE, 2, '#00D9FF'),
  ('indie', 'Indie Bedroom', 'Lo-fi bedroom pop, dream pop, and indie gems', TRUE, TRUE, 3, '#FFB800'),
  ('jazz', 'Jazz After Midnight', 'Standards, bebop, fusion, and beyond', TRUE, TRUE, 4, '#9B51E0'),
  ('electronic', 'Electronic Dreams', 'IDM, ambient, experimental sounds and glitch', TRUE, TRUE, 5, '#00FFA3'),

  -- Community channels (for testing)
  ('vaporwave', 'Vaporwave Sanctuary', 'A E S T H E T I C vibes only', FALSE, TRUE, 10, '#FF71CE'),
  ('punk', 'Punk Basement', 'Hardcore, post-punk, and garage rock', FALSE, TRUE, 11, '#FF3864'),
  ('metal', 'Metal Mosh Pit', 'From doom to death metal and everything heavy', FALSE, TRUE, 12, '#8B0000'),

  -- General music channel (maps to existing data)
  ('music', 'Music General', 'All genres welcome - general music discussion', FALSE, TRUE, 20, '#9D4EDD')
ON CONFLICT (id) DO NOTHING;

-- Update some existing cast_nodes to use the new channels for testing
-- This gives us test data without needing to create new casts
-- Note: Only updates casts that already have channel='music'
UPDATE cast_nodes
SET channel = (
  CASE
    -- Randomly assign to different channels based on node_id
    WHEN substring(node_id from 1 for 1) IN ('0', '1', '2') THEN 'hip-hop'
    WHEN substring(node_id from 1 for 1) IN ('3', '4') THEN 'techno'
    WHEN substring(node_id from 1 for 1) IN ('5', '6') THEN 'indie'
    WHEN substring(node_id from 1 for 1) IN ('7', '8') THEN 'electronic'
    WHEN substring(node_id from 1 for 1) IN ('9', 'a', 'b') THEN 'jazz'
    ELSE 'music'
  END
)
WHERE node_id IN (
  SELECT node_id
  FROM cast_nodes
  WHERE channel = 'music'
    AND parent_cast_hash IS NULL  -- Only update root threads
  LIMIT 50
);

-- Add comment explaining the data
COMMENT ON TABLE channels IS 'Curated music channels. Initial seed includes 5 official Jamzy channels and 4 community channels for testing.';
