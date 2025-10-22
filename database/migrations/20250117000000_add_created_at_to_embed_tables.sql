-- Add created_at columns to embed tables for consistent date filtering
-- This eliminates the need for JOINs when filtering embeds by cast creation date

-- Add created_at column to embeds table (if it doesn't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'embeds' AND column_name = 'created_at') THEN
        ALTER TABLE embeds ADD COLUMN created_at TIMESTAMP WITHOUT TIME ZONE;
    END IF;
END $$;

-- Add created_at column to embeds_metadata table (if it doesn't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'embeds_metadata' AND column_name = 'created_at') THEN
        ALTER TABLE embeds_metadata ADD COLUMN created_at TIMESTAMP WITHOUT TIME ZONE;
    END IF;
END $$;

-- Populate embeds.created_at from cast_nodes
UPDATE embeds e 
SET created_at = cn.created_at 
FROM cast_nodes cn 
WHERE e.cast_id = cn.node_id;

-- Populate embeds_metadata.created_at from cast_nodes
UPDATE embeds_metadata em 
SET created_at = cn.created_at 
FROM cast_nodes cn 
WHERE em.cast_id = cn.node_id;

-- Add indexes for efficient date filtering
CREATE INDEX IF NOT EXISTS idx_embeds_created_at 
ON embeds(created_at);

CREATE INDEX IF NOT EXISTS idx_embeds_metadata_created_at 
ON embeds_metadata(created_at);

-- Add comments for documentation
COMMENT ON COLUMN embeds.created_at IS 'Cast creation timestamp, copied from cast_nodes for efficient filtering';
COMMENT ON COLUMN embeds_metadata.created_at IS 'Cast creation timestamp, copied from cast_nodes for efficient filtering'; 