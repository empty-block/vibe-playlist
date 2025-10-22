-- Migration: Add total_casts_synced to channel_sync_status
-- Tracks cumulative count of all casts synced for a channel

ALTER TABLE channel_sync_status
ADD COLUMN IF NOT EXISTS total_casts_synced INTEGER DEFAULT 0;

COMMENT ON COLUMN channel_sync_status.total_casts_synced IS 'Cumulative count of all casts synced for this channel';

-- Initialize total_casts_synced based on current cast count
UPDATE channel_sync_status cs
SET total_casts_synced = (
  SELECT COUNT(*)
  FROM cast_nodes cn
  WHERE cn.channel = cs.channel_id
);
