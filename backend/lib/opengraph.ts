/**
 * OpenGraph Fetcher Service
 * Fetches OpenGraph metadata from music URLs
 *
 * Used for Tier 1 (fast) metadata extraction before AI normalization
 *
 * Note: Uses native fetch for Cloudflare Workers compatibility
 */

// Removed open-graph-scraper dependency for Cloudflare Workers compatibility
// Using native fetch + HTML parsing instead

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
 * Parse meta tags from HTML string
 */
function parseMetaTags(html: string): Record<string, string> {
  const meta: Record<string, string> = {}

  // Extract meta tags using regex (simple but effective for our needs)
  const metaRegex = /<meta\s+(?:[^>]*?\s+)?(?:property|name)=["']([^"']+)["']\s+content=["']([^"']+)["']|<meta\s+(?:[^>]*?\s+)?content=["']([^"']+)["']\s+(?:property|name)=["']([^"']+)["']/gi

  let match
  while ((match = metaRegex.exec(html)) !== null) {
    const key = match[1] || match[4]
    const value = match[2] || match[3]
    if (key && value) {
      meta[key] = value
    }
  }

  // Also extract title tag
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
  if (titleMatch) {
    meta['title'] = titleMatch[1]
  }

  return meta
}

/**
 * Fetch metadata from Odesli API (song.link)
 * Used as fallback for Apple Music URLs
 */
async function fetchFromOdesli(url: string): Promise<OpenGraphMetadata | null> {
  try {
    const odesliUrl = `https://api.song.link/v1-alpha.1/links?url=${encodeURIComponent(url)}`

    console.log(`[OpenGraph] Fetching from Odesli API: ${url}`)

    const response = await fetch(odesliUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Jamzy/1.0; +https://jamzy.app)'
      }
    })

    if (!response.ok) {
      console.warn(`[OpenGraph] Odesli API returned ${response.status}`)
      return null
    }

    const data = await response.json()

    // Extract metadata from Odesli response
    const entityId = data.entityUniqueId
    const entity = data.entitiesByUniqueId?.[entityId]

    if (!entity) {
      console.warn(`[OpenGraph] No entity found in Odesli response`)
      return null
    }

    const og_title = entity.title || null
    const og_artist = entity.artistName || null
    const og_image_url = entity.thumbnailUrl || null
    const og_description = og_artist && og_title ? `${og_artist} - ${og_title}` : null

    console.log(`[OpenGraph] Odesli extracted: title="${og_title}", artist="${og_artist}"`)

    return {
      og_title,
      og_artist,
      og_description,
      og_image_url,
      og_metadata: {
        description: og_description,
        site_name: 'Odesli',
        type: 'music.song',
        url,
        music: {
          duration: null,
          album: null,
          release_date: null
        },
        raw: data
      },
      success: true
    }
  } catch (error: any) {
    console.error(`[OpenGraph] Odesli fetch failed:`, error.message)
    return null
  }
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

  // APPLE MUSIC FALLBACK: Use Odesli API for Apple Music URLs
  // Apple Music blocks/rate-limits OpenGraph scraping
  if (url.includes('music.apple.com')) {
    console.log(`[OpenGraph] Detected Apple Music URL, using Odesli API`)
    const odesliResult = await fetchFromOdesli(url)

    if (odesliResult) {
      return odesliResult
    }

    console.warn(`[OpenGraph] Odesli fallback failed, attempting direct fetch`)
    // Continue to regular OpenGraph fetch as last resort
  }

  let lastError: Error | undefined

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // Fetch HTML with native fetch (Cloudflare Workers compatible)
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), timeout)

      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; Jamzy/1.0; +https://jamzy.app)'
        },
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const html = await response.text()
      const meta = parseMetaTags(html)

      // Extract relevant fields
      const og_title = meta['og:title'] || meta['twitter:title'] || meta['dc:title'] || meta['title'] || null
      const og_description = meta['og:description'] || meta['twitter:description'] || meta['dc:description'] || meta['description'] || null
      const og_image_url = meta['og:image'] || meta['twitter:image'] || null

      // Try to extract artist from various fields
      let og_artist: string | null = null

      // Check for music-specific OG tags
      const musicMusician = meta['music:musician'] || meta['music:musician:name']
      if (musicMusician && !musicMusician.startsWith('http')) {
        og_artist = musicMusician
      }

      // Spotify-specific: Check for artist in description
      if (!og_artist && og_description) {
        console.log(`[OpenGraph] Spotify description found: "${og_description}"`)
        // Spotify format: "Artist1, Artist2 · Track Name · Song · 2025"
        const parts = og_description.split('·').map(p => p.trim())
        console.log(`[OpenGraph] Split into ${parts.length} parts:`, parts)
        if (parts.length >= 2) {
          const potentialArtist = parts[0]
          if (potentialArtist && potentialArtist.length < 100 && !potentialArtist.includes('Listen to')) {
            og_artist = potentialArtist
            console.log(`[OpenGraph] Extracted Spotify artist: "${og_artist}"`)
          }
        }
      }

      // Try parsing from title
      if (!og_artist && og_title) {
        const match = og_title.match(/(.+?)\s*[-–—]\s*(.+)/)
        if (match) {
          og_artist = match[2].trim()
        }
      }

      // Last resort: check twitter creator
      if (!og_artist) {
        og_artist = meta['twitter:creator'] || null
      }

      return {
        og_title,
        og_artist,
        og_description,
        og_image_url,
        og_metadata: {
          description: og_description,
          site_name: meta['og:site_name'] || null,
          type: meta['og:type'] || null,
          url: meta['og:url'] || url,
          music: {
            duration: meta['music:duration'] ? parseInt(meta['music:duration']) : null,
            album: meta['music:album'] || null,
            release_date: meta['music:release_date'] || null
          },
          raw: meta
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
