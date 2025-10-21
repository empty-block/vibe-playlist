/**
 * AI Worker Tests
 * Tests for background worker that processes AI music queue
 */

import { test, expect, describe, beforeEach, afterEach, mock, spyOn } from 'bun:test'
import { createWorker, type AIWorker } from './ai-worker'
import * as queueProcessor from './ai-queue-processor'

describe('AIWorker', () => {
  let worker: AIWorker
  let processBatchSpy: any

  beforeEach(() => {
    // Mock processBatch to avoid actual API calls
    processBatchSpy = spyOn(queueProcessor, 'processBatch').mockResolvedValue({
      totalProcessed: 5,
      successful: 4,
      failed: 1,
      errors: ['One item failed']
    })
  })

  afterEach(() => {
    // Restore original function
    if (processBatchSpy) {
      processBatchSpy.mockRestore()
    }

    // Stop worker if running
    if (worker) {
      worker.stop()
    }
  })

  describe('Initialization', () => {
    test('should create worker with default config', () => {
      worker = createWorker()
      const status = worker.getStatus()

      expect(status.isRunning).toBe(false)
      expect(status.isPaused).toBe(false)
      expect(status.totalRuns).toBe(0)
    })

    test('should create worker with custom config', () => {
      worker = createWorker({
        intervalMs: 5000,
        batchSize: 10,
        runImmediately: false
      })

      const status = worker.getStatus()
      expect(status.isRunning).toBe(false)
    })
  })

  describe('Start and Stop', () => {
    test('should start worker', async () => {
      worker = createWorker({ runImmediately: false })
      worker.start()

      const status = worker.getStatus()
      expect(status.isRunning).toBe(true)
      expect(status.isPaused).toBe(false)
    })

    test('should not start if already running', () => {
      worker = createWorker({ runImmediately: false })
      worker.start()
      worker.start() // Try to start again

      const status = worker.getStatus()
      expect(status.isRunning).toBe(true)
    })

    test('should stop worker', () => {
      worker = createWorker({ runImmediately: false })
      worker.start()
      worker.stop()

      const status = worker.getStatus()
      expect(status.isRunning).toBe(false)
    })

    test('should handle stop when not running', () => {
      worker = createWorker()
      worker.stop() // Should not throw

      const status = worker.getStatus()
      expect(status.isRunning).toBe(false)
    })
  })

  describe('Pause and Resume', () => {
    test('should pause worker', () => {
      worker = createWorker({ runImmediately: false })
      worker.start()
      worker.pause()

      const status = worker.getStatus()
      expect(status.isRunning).toBe(true)
      expect(status.isPaused).toBe(true)
    })

    test('should resume worker', async () => {
      worker = createWorker({ runImmediately: false })
      worker.start()
      worker.pause()
      worker.resume()

      const status = worker.getStatus()
      expect(status.isRunning).toBe(true)
      expect(status.isPaused).toBe(false)

      // Wait a bit for resume to trigger processing
      await new Promise(resolve => setTimeout(resolve, 100))

      // Should have called processBatch
      expect(queueProcessor.processBatch).toHaveBeenCalled()
    })

    test('should throw error when pausing non-running worker', () => {
      worker = createWorker()
      expect(() => worker.pause()).toThrow('Worker is not running')
    })

    test('should throw error when resuming non-running worker', () => {
      worker = createWorker()
      expect(() => worker.resume()).toThrow('Worker is not running')
    })
  })

  describe('Processing', () => {
    test('should run immediately on start if configured', async () => {
      worker = createWorker({ runImmediately: true })
      worker.start()

      // Wait for async processing
      await new Promise(resolve => setTimeout(resolve, 100))

      expect(processBatchSpy).toHaveBeenCalled()

      const status = worker.getStatus()
      expect(status.totalRuns).toBeGreaterThan(0)
      expect(status.totalProcessed).toBe(5)
      expect(status.totalSuccessful).toBe(4)
      expect(status.totalFailed).toBe(1)
    })

    test('should not run immediately if configured', async () => {
      worker = createWorker({ runImmediately: false, intervalMs: 10000 })
      worker.start()

      // Wait a bit
      await new Promise(resolve => setTimeout(resolve, 100))

      expect(processBatchSpy).not.toHaveBeenCalled()
    })

    test('should process on interval', async () => {
      worker = createWorker({
        intervalMs: 200, // 200ms interval for testing
        runImmediately: false
      })
      worker.start()

      // Wait for first interval
      await new Promise(resolve => setTimeout(resolve, 250))

      expect(processBatchSpy).toHaveBeenCalledTimes(1)

      // Wait for second interval
      await new Promise(resolve => setTimeout(resolve, 200))

      expect(processBatchSpy).toHaveBeenCalledTimes(2)
    })

    test('should skip processing when paused', async () => {
      worker = createWorker({
        intervalMs: 100,
        runImmediately: false
      })
      worker.start()
      worker.pause()

      // Wait for interval
      await new Promise(resolve => setTimeout(resolve, 150))

      // Should not have processed
      expect(processBatchSpy).not.toHaveBeenCalled()
    })

    test('should prevent overlapping runs', async () => {
      let callCount = 0
      // Mock processBatch to take time
      processBatchSpy.mockImplementation(async () => {
        callCount++
        const currentCall = callCount
        console.log(`[Test] processBatch call #${currentCall} started`)
        await new Promise(resolve => setTimeout(resolve, 250))
        console.log(`[Test] processBatch call #${currentCall} finished`)
        return {
          totalProcessed: 1,
          successful: 1,
          failed: 0,
          errors: []
        }
      })

      worker = createWorker({
        intervalMs: 100, // Interval shorter than processing time
        runImmediately: true
      })
      worker.start()

      // Wait through first processing (250ms) + one interval (100ms) + buffer
      await new Promise(resolve => setTimeout(resolve, 400))

      // Verify that despite the shorter interval, we don't have overlapping runs
      // After first run completes (~250ms), the next run should start
      // So we should have at most 2 total runs, not 4+ that would happen without overlap prevention
      expect(processBatchSpy).toHaveBeenCalledTimes(2)

      const status = worker.getStatus()
      expect(status.totalRuns).toBe(2)
    })

    test('should pass correct batch size to processBatch', async () => {
      const customBatchSize = 15
      worker = createWorker({
        batchSize: customBatchSize,
        runImmediately: true
      })
      worker.start()

      await new Promise(resolve => setTimeout(resolve, 100))

      expect(processBatchSpy).toHaveBeenCalledWith({
        batchSize: customBatchSize
      })
    })

    test('should handle empty queue gracefully', async () => {
      processBatchSpy.mockResolvedValue({
        totalProcessed: 0,
        successful: 0,
        failed: 0,
        errors: []
      })

      worker = createWorker({ runImmediately: true })
      worker.start()

      await new Promise(resolve => setTimeout(resolve, 100))

      const status = worker.getStatus()
      expect(status.totalProcessed).toBe(0)
      expect(status.totalRuns).toBe(1)
    })

    test('should handle processing errors gracefully', async () => {
      processBatchSpy.mockRejectedValue(new Error('Processing failed'))

      worker = createWorker({ runImmediately: true })
      worker.start()

      // Should not throw - worker continues running
      await new Promise(resolve => setTimeout(resolve, 100))

      const status = worker.getStatus()
      expect(status.isRunning).toBe(true)
      expect(status.totalRuns).toBe(1)
    })
  })

  describe('Status', () => {
    test('should report accurate status', async () => {
      worker = createWorker({
        intervalMs: 100,
        runImmediately: true
      })
      worker.start()

      await new Promise(resolve => setTimeout(resolve, 150))

      const status = worker.getStatus()

      expect(status.isRunning).toBe(true)
      expect(status.isPaused).toBe(false)
      expect(status.isProcessing).toBe(false) // Should be done processing
      expect(status.lastRunAt).not.toBeNull()
      expect(status.nextRunAt).not.toBeNull()
      expect(status.totalRuns).toBeGreaterThan(0)
      expect(status.totalProcessed).toBeGreaterThan(0)
    })

    test('should report null nextRunAt when paused', () => {
      worker = createWorker({ runImmediately: false })
      worker.start()
      worker.pause()

      const status = worker.getStatus()
      expect(status.nextRunAt).toBeNull()
    })

    test('should report null nextRunAt when stopped', () => {
      worker = createWorker()

      const status = worker.getStatus()
      expect(status.nextRunAt).toBeNull()
    })

    test('should accumulate stats across multiple runs', async () => {
      worker = createWorker({
        intervalMs: 100,
        runImmediately: true
      })
      worker.start()

      // Wait for multiple runs
      await new Promise(resolve => setTimeout(resolve, 350))

      const status = worker.getStatus()
      expect(status.totalRuns).toBeGreaterThanOrEqual(3)
      expect(status.totalProcessed).toBeGreaterThanOrEqual(15) // 5 per run
    })
  })
})
