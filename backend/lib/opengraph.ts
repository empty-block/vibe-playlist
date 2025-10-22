/**
 * OpenGraph Fetcher Service
 * Fetches OpenGraph metadata from music URLs
 *
 * Used for Tier 1 (fast) metadata extraction before AI normalization
 */

import ogs from 'open-graph-scraper'

export interface OpenGraphMetadata {
  og_title: string | null
  og_artist: string | null
  og_description: string | null
  og_image_url: string | null
  og_metadata: Record<string, any>
  success: boolean
  error?: string
}

/**
 * Fetch OpenGraph metadata from a URL
 *
 * @param url - Music URL to fetch metadata from
 * @param options - Optional fetch configuration
 * @returns OpenGraph metadata or null if fetch fails
 */
export async function fetchOpenGraph(
  url: string,
  options?: {
    timeout?: number
    retries?: number
  }
): Promise<OpenGraphMetadata> {
  const timeout = options?.timeout || 10000 // 10 seconds default
  const maxRetries = options?.retries || 2

  let lastError: Error | undefined

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const { result, error } = await ogs({
        url,
        timeout,
        retry: {
          limit: 1,
          statusCodes: [408, 413, 429, 500, 502, 503, 504]
        },
        fetchOptions: {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; Jamzy/1.0; +https://jamzy.app)'
          }
        }
      })

      if (error) {
        throw new Error(`OpenGraph fetch error: ${JSON.stringify(error)}`)
      }

      if (!result) {
        throw new Error('No result from OpenGraph scraper')
      }

      // Extract relevant fields
      const og_title = result.ogTitle || result.dcTitle || result.twitterTitle || null
      const og_description = result.ogDescription || result.dcDescription || result.twitterDescription || null
      const og_image_url =
        result.ogImage?.[0]?.url ||
        result.twitterImage?.[0]?.url ||
        result.ogImage?.url ||
        null

      // Try to extract artist from various fields
      let og_artist: string | null = null

      // Check for music-specific OG tags (works for some platforms)
      if (result.musicSong?.length > 0) {
        og_artist = result.musicMusician?.[0]?.name || null
      }

      // Spotify-specific: Check for artist in description
      if (!og_artist && result.ogDescription) {
        console.log(`[OpenGraph] Spotify description found: "${result.ogDescription}"`)
        // Spotify format: "Artist1, Artist2 · Track Name · Song · 2025"
        // Artist names come BEFORE the first "·"
        const parts = result.ogDescription.split('·').map(p => p.trim())
        console.log(`[OpenGraph] Split into ${parts.length} parts:`, parts)
        if (parts.length >= 2) {
          // First part should be artist(s)
          const potentialArtist = parts[0]

          // Verify this looks like an artist (not a sentence or long text)
          // Artists are usually short, comma-separated names
          if (potentialArtist && potentialArtist.length < 100 && !potentialArtist.includes('Listen to')) {
            og_artist = potentialArtist
            console.log(`[OpenGraph] Extracted Spotify artist: "${og_artist}"`)
          }
        }
      } else if (!og_artist) {
        console.log(`[OpenGraph] No ogDescription found for artist extraction`)
      }

      // Try parsing from title (e.g., "Song Name - Artist Name" or "Artist Name - Song Name")
      if (!og_artist && og_title) {
        const match = og_title.match(/(.+?)\s*[-–—]\s*(.+)/)
        if (match) {
          // For Spotify, the format is usually "Track - Artist" or just the track name
          og_artist = match[2].trim()
        }
      }

      // Check musicMusician field (array or string) - but skip if it's a URL
      if (!og_artist && result.musicMusician) {
        let musicianValue = null
        if (Array.isArray(result.musicMusician)) {
          musicianValue = result.musicMusician[0]?.name || result.musicMusician[0] || null
        } else if (typeof result.musicMusician === 'string') {
          musicianValue = result.musicMusician
        }

        // Only use musicMusician if it's not a URL
        if (musicianValue && !musicianValue.startsWith('http')) {
          og_artist = musicianValue
        }
      }

      // Last resort: check twitter creator or site name
      if (!og_artist) {
        og_artist = result.twitterCreator || null
      }

      return {
        og_title,
        og_artist,
        og_description,
        og_image_url,
        og_metadata: {
          description: result.ogDescription || result.dcDescription || null,
          site_name: result.ogSiteName || null,
          type: result.ogType || null,
          url: result.ogUrl || url,
          music: {
            duration: result.musicDuration || null,
            album: result.musicAlbum || null,
            release_date: result.musicReleaseDate || null
          },
          raw: result // Keep full response for debugging
        },
        success: true
      }
    } catch (error: any) {
      lastError = error
      console.error(
        `[OpenGraph] Fetch attempt ${attempt + 1}/${maxRetries} failed for ${url}:`,
        error.message
      )

      // Exponential backoff: 1s, 2s
      if (attempt < maxRetries - 1) {
        const delay = Math.pow(2, attempt) * 1000
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }

  // All retries failed
  return {
    og_title: null,
    og_artist: null,
    og_description: null,
    og_image_url: null,
    og_metadata: {},
    success: false,
    error: lastError?.message || 'Failed to fetch OpenGraph metadata'
  }
}

/**
 * Batch fetch OpenGraph metadata for multiple URLs
 * Processes in parallel with concurrency limit
 */
export async function fetchOpenGraphBatch(
  urls: string[],
  options?: {
    concurrency?: number
    timeout?: number
  }
): Promise<Map<string, OpenGraphMetadata>> {
  const concurrency = options?.concurrency || 5
  const results = new Map<string, OpenGraphMetadata>()

  // Process in batches
  for (let i = 0; i < urls.length; i += concurrency) {
    const batch = urls.slice(i, i + concurrency)
    const batchPromises = batch.map(async url => {
      const metadata = await fetchOpenGraph(url, options)
      return { url, metadata }
    })

    const batchResults = await Promise.all(batchPromises)
    batchResults.forEach(({ url, metadata }) => {
      results.set(url, metadata)
    })
  }

  return results
}

/**
 * Extract artist name from OpenGraph title
 * Common patterns: "Track - Artist", "Artist - Track", "Track (Artist)"
 */
export function extractArtistFromTitle(title: string): string | null {
  // Pattern 1: "Track - Artist" or "Artist - Track"
  const dashMatch = title.match(/^(.+?)\s*[-–—]\s*(.+)$/)
  if (dashMatch) {
    // Heuristic: shorter part is likely the artist
    const [, part1, part2] = dashMatch
    return part1.length < part2.length ? part1.trim() : part2.trim()
  }

  // Pattern 2: "Track (Artist)" or "Track [Artist]"
  const parenMatch = title.match(/^(.+?)\s*[(\[](.+?)[)\]]$/)
  if (parenMatch) {
    return parenMatch[2].trim()
  }

  return null
}
