import { NeynarAPIClient, Configuration } from '@neynar/nodejs-sdk'

/**
 * Neynar Service - Wrapper around Neynar SDK
 *
 * Provides a clean interface for interacting with Neynar's Farcaster API.
 * Handles error handling, rate limiting, and retry logic.
 */
export class NeynarService {
  private client: NeynarAPIClient
  private lastCallTime: number = 0
  private minCallInterval: number = 1000 // 1 second between calls

  constructor() {
    const apiKey = process.env.NEYNAR_API_KEY

    if (!apiKey || apiKey === 'CHANGEME') {
      throw new Error(
        'NEYNAR_API_KEY is not configured. Get your API key from https://neynar.com'
      )
    }

    const config = new Configuration({
      apiKey
    })

    this.client = new NeynarAPIClient(config)
  }

  /**
   * Simple rate limiter - ensures minimum interval between API calls
   */
  private async throttle(): Promise<void> {
    const now = Date.now()
    const timeSinceLastCall = now - this.lastCallTime

    if (timeSinceLastCall < this.minCallInterval) {
      const delay = this.minCallInterval - timeSinceLastCall
      await new Promise(resolve => setTimeout(resolve, delay))
    }

    this.lastCallTime = Date.now()
  }

  /**
   * Retry wrapper with exponential backoff
   */
  private async retryWithBackoff<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3
  ): Promise<T> {
    let lastError: Error | undefined

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await fn()
      } catch (error) {
        lastError = error as Error

        // Don't retry on authentication or validation errors
        if (error && typeof error === 'object' && 'status' in error) {
          const statusError = error as { status?: number }
          if (statusError.status === 401 || statusError.status === 400) {
            throw error
          }
        }

        if (attempt < maxRetries - 1) {
          // Exponential backoff: 1s, 2s, 4s
          const delay = Math.pow(2, attempt) * 1000
          console.log(`Neynar API call failed, retrying in ${delay}ms...`)
          await new Promise(resolve => setTimeout(resolve, delay))
        }
      }
    }

    throw lastError || new Error('Max retries exceeded')
  }

  /**
   * Fetch casts from a Farcaster channel
   *
   * @param channelId - The channel ID (e.g., 'hip-hop', 'jazz')
   * @param options - Optional parameters for cursor pagination and limit
   * @returns Channel feed with casts and pagination cursor
   */
  async fetchChannelFeed(
    channelId: string,
    options?: {
      cursor?: string
      limit?: number
    }
  ): Promise<{
    casts: any[]
    nextCursor?: string
  }> {
    await this.throttle()

    return this.retryWithBackoff(async () => {
      const limit = Math.min(options?.limit || 50, 100) // Max 100 per API docs

      const response = await this.client.fetchFeed({
        feedType: 'filter' as any,
        filterType: 'channel_id' as any,
        channelId,
        limit,
        cursor: options?.cursor
      })

      return {
        casts: response.casts || [],
        nextCursor: response.next?.cursor
      }
    })
  }

  /**
   * Fetch a cast with its replies (conversation tree)
   *
   * @param castHash - The cast hash identifier
   * @param options - Optional parameters for reply depth
   * @returns Cast with nested replies
   */
  async fetchCastWithReplies(
    castHash: string,
    options?: {
      replyDepth?: number
    }
  ): Promise<any> {
    await this.throttle()

    return this.retryWithBackoff(async () => {
      const conversation = await this.client.lookupCastConversation({
        identifier: castHash,
        type: 'hash',
        replyDepth: Math.min(options?.replyDepth || 2, 5) // Max 5 per API docs
      })

      return conversation.conversation
    })
  }

  /**
   * Fetch multiple casts by their hashes
   *
   * @param castHashes - Array of cast hash identifiers
   * @returns Array of cast objects
   */
  async fetchBulkCasts(castHashes: string[]): Promise<any[]> {
    await this.throttle()

    return this.retryWithBackoff(async () => {
      const response = await this.client.fetchBulkCasts(castHashes)
      return response.result?.casts || []
    })
  }

  /**
   * Fetch user information by FID
   *
   * @param fid - Farcaster ID (user identifier)
   * @returns User profile data
   */
  async fetchUserByFid(fid: number): Promise<any> {
    await this.throttle()

    return this.retryWithBackoff(async () => {
      const response = await this.client.fetchBulkUsers([fid])
      return response.users?.[0]
    })
  }

  /**
   * Fetch reactions (likes and recasts) for a specific cast
   *
   * @param castHash - The cast hash identifier
   * @param options - Optional parameters for reaction types, limit, and viewer
   * @returns Reactions data with likes and recasts
   */
  async fetchCastReactions(
    castHash: string,
    options?: {
      types?: ('likes' | 'recasts')[]
      limit?: number
      viewerFid?: number
    }
  ): Promise<{
    likes: any[]
    recasts: any[]
  }> {
    await this.throttle()

    return this.retryWithBackoff(async () => {
      const types = options?.types || ['likes', 'recasts']
      const limit = Math.min(options?.limit || 100, 100) // Max 100 per API docs

      const response = await this.client.fetchCastReactions({
        hash: castHash,
        types: types as any,
        limit,
        viewerFid: options?.viewerFid
      })

      // The API returns reactions as a flat array with reaction_type field
      // Filter them by type
      const reactions = response.reactions || []
      const likes = reactions.filter((r: any) => r.reaction_type === 'like')
      const recasts = reactions.filter((r: any) => r.reaction_type === 'recast')

      return { likes, recasts }
    })
  }
}

// Singleton instance
let neynarService: NeynarService | null = null

/**
 * Get or create the Neynar service instance
 */
export function getNeynarService(): NeynarService {
  if (!neynarService) {
    neynarService = new NeynarService()
  }
  return neynarService
}
