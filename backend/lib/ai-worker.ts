/**
 * AI Music Worker
 * Background worker that automatically processes pending items in music_ai_queue
 *
 * TASK-657: Automated AI music metadata extraction
 */

import { processBatch } from './ai-queue-processor'

export interface AIWorkerConfig {
  /** Interval between processing runs in milliseconds */
  intervalMs?: number
  /** Maximum number of items to process per batch */
  batchSize?: number
  /** Whether to run immediately on start */
  runImmediately?: boolean
}

export interface AIWorkerStatus {
  isRunning: boolean
  isPaused: boolean
  isProcessing: boolean
  lastRunAt: string | null
  nextRunAt: string | null
  totalRuns: number
  totalProcessed: number
  totalSuccessful: number
  totalFailed: number
}

/**
 * Background worker for automated AI music processing
 * Runs on a configurable interval and processes batches from the queue
 */
export class AIWorker {
  private interval: Timer | null = null
  private isProcessing = false
  private isPaused = false
  private config: Required<AIWorkerConfig>
  private stats = {
    totalRuns: 0,
    totalProcessed: 0,
    totalSuccessful: 0,
    totalFailed: 0,
    lastRunAt: null as string | null
  }

  constructor(config: AIWorkerConfig = {}) {
    this.config = {
      intervalMs: config.intervalMs ?? 30000, // 30 seconds default
      batchSize: config.batchSize ?? 20, // 20 tracks max per batch
      runImmediately: config.runImmediately ?? true
    }

    console.log('[AI Worker] Initialized with config:', {
      intervalMs: this.config.intervalMs,
      batchSize: this.config.batchSize,
      runImmediately: this.config.runImmediately
    })
  }

  /**
   * Start the worker
   * Begins periodic processing of the AI queue
   */
  start(): void {
    if (this.interval) {
      console.log('[AI Worker] Already running')
      return
    }

    console.log('[AI Worker] Starting...')

    // Set up periodic processing
    this.interval = setInterval(() => {
      this.tick()
    }, this.config.intervalMs)

    // Run immediately if configured
    if (this.config.runImmediately) {
      this.tick()
    }

    console.log(`[AI Worker] Started (interval: ${this.config.intervalMs}ms, batch size: ${this.config.batchSize})`)
  }

  /**
   * Stop the worker
   * Clears the interval and prevents new processing
   */
  stop(): void {
    if (!this.interval) {
      console.log('[AI Worker] Not running')
      return
    }

    clearInterval(this.interval)
    this.interval = null
    this.isPaused = false

    console.log('[AI Worker] Stopped')
  }

  /**
   * Pause the worker
   * Keeps the interval running but skips processing
   */
  pause(): void {
    if (!this.interval) {
      throw new Error('Worker is not running')
    }

    this.isPaused = true
    console.log('[AI Worker] Paused')
  }

  /**
   * Resume the worker
   * Resumes processing after being paused
   */
  resume(): void {
    if (!this.interval) {
      throw new Error('Worker is not running')
    }

    this.isPaused = false
    console.log('[AI Worker] Resumed')

    // Run immediately on resume
    this.tick()
  }

  /**
   * Get current worker status
   */
  getStatus(): AIWorkerStatus {
    const nextRunAt = this.interval && !this.isPaused && !this.isProcessing
      ? new Date(Date.now() + this.config.intervalMs).toISOString()
      : null

    return {
      isRunning: this.interval !== null,
      isPaused: this.isPaused,
      isProcessing: this.isProcessing,
      lastRunAt: this.stats.lastRunAt,
      nextRunAt,
      totalRuns: this.stats.totalRuns,
      totalProcessed: this.stats.totalProcessed,
      totalSuccessful: this.stats.totalSuccessful,
      totalFailed: this.stats.totalFailed
    }
  }

  /**
   * Process a single tick/cycle
   * Called by the interval timer
   */
  private async tick(): Promise<void> {
    // Skip if paused
    if (this.isPaused) {
      console.log('[AI Worker] Tick skipped (paused)')
      return
    }

    // Skip if already processing (prevents overlapping runs)
    if (this.isProcessing) {
      console.log('[AI Worker] Tick skipped (already processing)')
      return
    }

    this.isProcessing = true
    this.stats.totalRuns++
    const startTime = Date.now()

    try {
      console.log('[AI Worker] Processing batch...')

      // Process batch using existing queue processor
      const result = await processBatch({
        batchSize: this.config.batchSize
      })

      // Update stats
      this.stats.totalProcessed += result.totalProcessed
      this.stats.totalSuccessful += result.successful
      this.stats.totalFailed += result.failed
      this.stats.lastRunAt = new Date().toISOString()

      const duration = Date.now() - startTime

      if (result.totalProcessed === 0) {
        console.log(`[AI Worker] No items in queue (${duration}ms)`)
      } else {
        console.log(
          `[AI Worker] Batch complete: ${result.successful} successful, ${result.failed} failed ` +
          `(${duration}ms, total processed: ${this.stats.totalProcessed})`
        )
      }

      // Log errors if any
      if (result.errors.length > 0) {
        console.error('[AI Worker] Batch had errors:', result.errors)
      }

    } catch (error: any) {
      console.error('[AI Worker] Tick failed:', error.message)
      // Don't throw - worker should continue running despite errors
    } finally {
      this.isProcessing = false
    }
  }
}

/**
 * Singleton instance for easy access across the application
 */
let workerInstance: AIWorker | null = null

/**
 * Get or create the global worker instance
 */
export function getWorker(config?: AIWorkerConfig): AIWorker {
  if (!workerInstance) {
    workerInstance = new AIWorker(config)
  }
  return workerInstance
}

/**
 * Create a new worker instance (for testing or multiple workers)
 */
export function createWorker(config?: AIWorkerConfig): AIWorker {
  return new AIWorker(config)
}
