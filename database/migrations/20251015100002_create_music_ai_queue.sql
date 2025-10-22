-- Migration: Create music_ai_queue table
-- Related: TASK-639 (setup) and TASK-640 (processing)
-- Date: 2025-10-15
--
-- Purpose:
-- Queue table for async AI processing of music metadata normalization.
-- After OpenGraph is fetched (Tier 1), tracks are queued here for AI processing (Tier 2).
-- TASK-640 will implement the worker that processes this queue.

-- =====================================================
-- Create music_ai_queue table
-- =====================================================

CREATE TABLE public.music_ai_queue (
  platform_name TEXT NOT NULL,
  platform_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  priority INTEGER DEFAULT 0,
  queued_at TIMESTAMP NOT NULL DEFAULT NOW(),
  processing_started_at TIMESTAMP,
  processed_at TIMESTAMP,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  PRIMARY KEY (platform_name, platform_id),
  FOREIGN KEY (platform_name, platform_id)
    REFERENCES public.music_library(platform_name, platform_id)
    ON DELETE CASCADE
);

-- =====================================================
-- Create indexes for queue processing
-- =====================================================

-- Index for workers to find next pending items (ordered by priority + queue time)
CREATE INDEX idx_music_ai_queue_pending
  ON public.music_ai_queue(status, priority DESC, queued_at ASC)
  WHERE status = 'pending';

-- Index for monitoring failed items
CREATE INDEX idx_music_ai_queue_failed
  ON public.music_ai_queue(status, retry_count)
  WHERE status = 'failed';

-- Index for time-based queries
CREATE INDEX idx_music_ai_queue_queued_at
  ON public.music_ai_queue(queued_at);

CREATE INDEX idx_music_ai_queue_processed_at
  ON public.music_ai_queue(processed_at)
  WHERE processed_at IS NOT NULL;

-- =====================================================
-- Add constraints
-- =====================================================

-- Status enum constraint
ALTER TABLE public.music_ai_queue
  ADD CONSTRAINT music_ai_queue_status_check
    CHECK (status IN ('pending', 'processing', 'completed', 'failed'));

-- Priority range (0-10, higher = more important)
ALTER TABLE public.music_ai_queue
  ADD CONSTRAINT music_ai_queue_priority_check
    CHECK (priority >= 0 AND priority <= 10);

-- Retry count limit
ALTER TABLE public.music_ai_queue
  ADD CONSTRAINT music_ai_queue_retry_count_check
    CHECK (retry_count >= 0 AND retry_count <= 5);

-- =====================================================
-- Add table and column comments
-- =====================================================

COMMENT ON TABLE public.music_ai_queue IS 'Queue for async AI processing of music metadata normalization (TASK-640). Items added after OpenGraph fetch.';
COMMENT ON COLUMN public.music_ai_queue.platform_name IS 'Platform identifier (spotify, youtube, soundcloud)';
COMMENT ON COLUMN public.music_ai_queue.platform_id IS 'Platform-specific track ID';
COMMENT ON COLUMN public.music_ai_queue.status IS 'Queue status: pending → processing → completed/failed';
COMMENT ON COLUMN public.music_ai_queue.priority IS 'Priority 0-10 (higher = process sooner). Use for popular tracks.';
COMMENT ON COLUMN public.music_ai_queue.queued_at IS 'When track was added to queue';
COMMENT ON COLUMN public.music_ai_queue.processing_started_at IS 'When AI worker started processing';
COMMENT ON COLUMN public.music_ai_queue.processed_at IS 'When processing completed (success or failure)';
COMMENT ON COLUMN public.music_ai_queue.error_message IS 'Error message if status=failed';
COMMENT ON COLUMN public.music_ai_queue.retry_count IS 'Number of retry attempts (max 5)';

-- =====================================================
-- Grant permissions
-- =====================================================

GRANT ALL ON public.music_ai_queue TO authenticated, anon, service_role;

-- =====================================================
-- Helper function: Get next batch for processing
-- =====================================================

CREATE OR REPLACE FUNCTION get_next_ai_queue_batch(
  batch_size INTEGER DEFAULT 10
)
RETURNS TABLE(
  platform_name TEXT,
  platform_id TEXT,
  url TEXT,
  og_title TEXT,
  og_artist TEXT,
  og_metadata JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    q.platform_name,
    q.platform_id,
    ml.url,
    ml.og_title,
    ml.og_artist,
    ml.og_metadata
  FROM music_ai_queue q
  INNER JOIN music_library ml
    ON q.platform_name = ml.platform_name
    AND q.platform_id = ml.platform_id
  WHERE q.status = 'pending'
  ORDER BY q.priority DESC, q.queued_at ASC
  LIMIT batch_size;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_next_ai_queue_batch IS 'Returns next batch of pending tracks for AI processing (TASK-640 worker)';

GRANT EXECUTE ON FUNCTION get_next_ai_queue_batch TO authenticated, anon, service_role;
