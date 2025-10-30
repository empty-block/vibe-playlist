/**
 * Odesli API Proxy
 * Proxies requests to song.link API to avoid CORS issues
 */

import type { Context } from 'hono'

interface OdesliApiResponse {
  entityUniqueId: string
  entitiesByUniqueId: Record<string, {
    id: string
    type: string
    title?: string
    artistName?: string
    thumbnailUrl?: string
    thumbnailWidth?: number
    thumbnailHeight?: number
    apiProvider: string
    platforms: string[]
  }>
  linksByPlatform: {
    youtube?: {
      url: string
      nativeAppUriMobile?: string
      nativeAppUriDesktop?: string
      entityUniqueId: string
    }
    spotify?: {
      url: string
      nativeAppUriMobile?: string
      nativeAppUriDesktop?: string
      entityUniqueId: string
    }
    soundcloud?: {
      url: string
      nativeAppUriMobile?: string
      nativeAppUriDesktop?: string
      entityUniqueId: string
    }
    [key: string]: any
  }
  userCountry?: string
}

/**
 * Resolve a music URL using Odesli API
 * GET /api/odesli/resolve?url=...
 */
export async function resolveUrl(c: Context) {
  const url = c.req.query('url')

  if (!url) {
    return c.json({ error: 'Missing url parameter' }, 400)
  }

  try {
    console.log(`[Odesli API] Resolving URL: ${url}`)

    const odesliUrl = `https://api.song.link/v1-alpha.1/links?url=${encodeURIComponent(url)}`

    const response = await fetch(odesliUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Jamzy/1.0; +https://jamzy.app)'
      }
    })

    if (!response.ok) {
      console.error(`[Odesli API] API returned ${response.status}`)
      return c.json({
        error: `Odesli API returned ${response.status}`,
        status: response.status
      }, response.status)
    }

    const data: OdesliApiResponse = await response.json()

    console.log(`[Odesli API] Successfully resolved URL`)

    // Return the full response
    return c.json(data)

  } catch (error: any) {
    console.error(`[Odesli API] Error:`, error.message)
    return c.json({
      error: `Failed to resolve URL: ${error.message}`
    }, 500)
  }
}
