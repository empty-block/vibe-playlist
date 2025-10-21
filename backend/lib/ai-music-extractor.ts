/**
 * AI Music Metadata Extractor
 * Uses Claude API to normalize and enrich music metadata from OpenGraph data
 *
 * TASK-650: AI-powered extraction of normalized title, artist, album, genres, release dates
 */

import Anthropic from '@anthropic-ai/sdk'

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

// Curated genre taxonomy (28 genres)
const VALID_GENRES = [
  'ambient', 'bluegrass', 'blues', 'christian rap', 'classic rock', 'classical',
  'country', 'disco', 'drum-and-bass', 'electronic', 'folk', 'funk', 'hip-hop',
  'house', 'indie', 'jazz', 'k-pop', 'lo-fi', 'metal', 'old school hip-hop',
  'pop', 'pop punk', 'punk', 'r&b', 'reggae', 'rock', 'soul', 'synthwave'
] as const

const VALID_MUSIC_TYPES = ['song', 'album', 'playlist', 'artist'] as const

export interface MusicContext {
  platform_name: string
  platform_id: string
  og_title: string | null
  og_artist: string | null
  og_description: string | null
  og_metadata: any
  cast_text?: string // Optional: user's comment about the music
}

export interface ExtractedMusic {
  platform_name: string
  platform_id: string
  title: string | null
  artist: string | null
  album: string | null
  genres: string[]
  release_date: string | null
  music_type: 'song' | 'album' | 'playlist' | 'artist'
  confidence_score: number
}

/**
 * Extract music metadata using Claude API
 *
 * @param contexts - Array of music contexts with OpenGraph data
 * @param options - Extraction options
 * @returns Array of extracted music metadata
 */
export async function extractMusicMetadata(
  contexts: MusicContext[],
  options?: {
    model?: string
    temperature?: number
    maxTokens?: number
  }
): Promise<ExtractedMusic[]> {
  if (!contexts || contexts.length === 0) {
    return []
  }

  const model = options?.model || 'claude-3-5-haiku-20241022'
  const temperature = options?.temperature ?? 0.1
  const maxTokens = options?.maxTokens || 4000

  try {
    console.log(`[AI Extractor] Processing ${contexts.length} tracks with ${model}`)

    // Build the extraction prompt
    const prompt = buildExtractionPrompt(contexts)

    // Call Claude API
    const response = await anthropic.messages.create({
      model,
      max_tokens: maxTokens,
      temperature,
      messages: [
        { role: 'user', content: prompt }
      ]
    })

    // Extract text from response
    const responseText = response.content[0].type === 'text'
      ? response.content[0].text
      : ''

    // Parse and validate the response
    const extractions = parseClaudeResponse(responseText, contexts)

    console.log(`[AI Extractor] Successfully extracted ${extractions.length}/${contexts.length} tracks`)

    return extractions

  } catch (error: any) {
    console.error(`[AI Extractor] Extraction failed:`, error.message)
    throw new Error(`AI extraction failed: ${error.message}`)
  }
}

/**
 * Build the extraction prompt for Claude
 * Formats contexts with OpenGraph metadata and examples
 */
function buildExtractionPrompt(contexts: MusicContext[]): string {
  // Build context blocks
  const contextBlocks = contexts.map((ctx, i) => {
    const idx = i + 1
    let block = `${idx}.`

    // Add cast text if available
    if (ctx.cast_text) {
      block += ` ${ctx.cast_text.trim()}`
    }

    // Add OpenGraph metadata
    const metadataParts: string[] = []
    if (ctx.og_title) metadataParts.push(`title - ${ctx.og_title}`)
    if (ctx.og_artist) metadataParts.push(`artist - ${ctx.og_artist}`)
    if (ctx.og_description) metadataParts.push(`description - ${ctx.og_description}`)

    // Extract additional metadata from og_metadata JSONB
    if (ctx.og_metadata) {
      if (ctx.og_metadata.musicReleaseDate) {
        metadataParts.push(`release_date - ${ctx.og_metadata.musicReleaseDate}`)
      }
      if (ctx.og_metadata.musicAlbum) {
        metadataParts.push(`album - ${ctx.og_metadata.musicAlbum}`)
      }
    }

    if (metadataParts.length > 0) {
      block += ` → ${metadataParts.join(' | ')}`
    }

    return block
  }).join('\n')

  const prompt = `Extract music from these posts with embedded content:

${contextBlocks}

GENRE CLASSIFICATION: Select 1-3 genres from this curated list only:
${VALID_GENRES.join(', ')}

RELEASE DATE EXTRACTION: Look for release_date, upload_date, or year in metadata. Format as YYYY-MM-DD or YYYY.

Examples:
"I got so many theories and suspicions → title - YAH. | channel - Kendrick Lamar - Topic | release_date - 2017-04-14" → {"embed_id":"1","music_type":"song","title":"YAH.","artist":"Kendrick Lamar","album":null,"genres":["hip-hop"],"release_date":"2017-04-14","confidence":0.9}
"love this new track → title - Roudeep - Falling | channel - GEORGIA BEATS | genre - Deep House | release_date - 2023-08-15" → {"embed_id":"2","music_type":"song","title":"Falling","artist":"Roudeep","album":null,"genres":["house","electronic"],"release_date":"2023-08-15","confidence":0.8}
"qc your favorite album of 2025 so far → title - Black Hole Superette by Aesop Rock | release_date - 2025-01-15" → {"embed_id":"3","music_type":"album","title":"Black Hole Superette","artist":"Aesop Rock","album":"Black Hole Superette","genres":["hip-hop"],"release_date":"2025-01-15","confidence":0.9}
"My kind of Saturday vibes 🫶🏻✨ → title - The Cast of Buena Vista Social Club: Tiny Desk Concert | channel - NPR Music | upload_date - 2019-05-22" → {"embed_id":"4","music_type":"song","title":"Tiny Desk Concert","artist":"The Cast of Buena Vista Social Club","album":null,"genres":["jazz","folk"],"release_date":"2019-05-22","confidence":0.8}
"Is every New Yorker on the street just an undercover rapper?? → title - Guy in a SUIT Shocks EVERYONE with INCREDIBLE Freestyle | channel - ARIatHOME | upload_date - 2024-03-10" → {"embed_id":"5","music_type":"song","title":"Guy in a SUIT Shocks EVERYONE with INCREDIBLE Freestyle","artist":"ARIatHOME","album":null,"genres":["hip-hop"],"release_date":"2024-03-10","confidence":0.7}
"classic Worship DnB set → title - Sub Focus, Dimension, Culture Shock & 1991: LA Livestream | WORSHIP x DNBNL x UKF On Air | channel - UKF On Air | upload_date - 2022-11-18" → {"embed_id":"6","music_type":"song","title":"Sub Focus, Dimension, Culture Shock & 1991: LA Livestream","artist":"Worship","album":null,"genres":["drum-and-bass","electronic"],"release_date":"2022-11-18","confidence":0.8}
"loving this track → title - Stars As Eyes | artist - Robot Koch | album - The Next Billion Years | release_date - 2020-09-04" → {"embed_id":"7","music_type":"song","title":"Stars As Eyes","artist":"Robot Koch","album":"The Next Billion Years","genres":["electronic","ambient"],"release_date":"2020-09-04","confidence":0.9}
"absolutely loving this classic → title - Ain't Wastin' Time No More | artist - Allman Brothers Band | album - Eat A Peach | release_date - 1972-02-12" → {"embed_id":"8","music_type":"song","title":"Ain't Wastin' Time No More","artist":"Allman Brothers Band","album":"Eat A Peach","genres":["rock","classic rock"],"release_date":"1972-02-12","confidence":0.9}
"new lorde track hits different → title - Man Of The Year | artist - Lorde | album - Solar Power | release_date - 2025-06-27" → {"embed_id":"9","music_type":"song","title":"Man Of The Year","artist":"Lorde","album":"Solar Power","genres":["pop","indie"],"release_date":"2025-06-27","confidence":0.9}

Return JSON array (ONE extraction per embed - if no music found, return empty object):
[{"embed_id":"1","music_type":"song","title":"Name","artist":"Artist","album":"Album","genres":["genre1","genre2"],"release_date":"YYYY-MM-DD","confidence":0.8}]

Return [] if no music found.`

  return prompt
}

/**
 * Parse Claude's JSON response and validate
 * Maps embed_id back to original contexts
 */
function parseClaudeResponse(
  responseText: string,
  contexts: MusicContext[]
): ExtractedMusic[] {
  try {
    // Try multiple approaches to extract JSON from Claude's response
    let extractionsJson: any[] | null = null

    // Method 1: Look for JSON inside markdown code blocks
    const codeBlockMatch = responseText.match(/```json\s*(\[.*?\])\s*```/s)
    if (codeBlockMatch) {
      try {
        extractionsJson = JSON.parse(codeBlockMatch[1])
        console.log('[AI Extractor] Found JSON in markdown code block')
      } catch (e) {
        // Continue to next method
      }
    }

    // Method 2: Look for the last/final JSON array in the response
    if (!extractionsJson) {
      const jsonMatches = responseText.match(/\[(?:[^\[\]]|\[.*?\])*\]/gs)
      if (jsonMatches) {
        // Try from the end (most recent/final output)
        for (let i = jsonMatches.length - 1; i >= 0; i--) {
          try {
            const parsed = JSON.parse(jsonMatches[i])
            if (Array.isArray(parsed)) {
              extractionsJson = parsed
              console.log('[AI Extractor] Found JSON array in response text')
              break
            }
          } catch (e) {
            continue
          }
        }
      }
    }

    if (!extractionsJson) {
      console.warn('[AI Extractor] No valid JSON array found in response')
      console.log('[AI Extractor] Response preview:', responseText.substring(0, 200))
      return []
    }

    // Process each extraction
    const results: ExtractedMusic[] = []

    for (const extraction of extractionsJson) {
      if (!extraction || typeof extraction !== 'object') {
        continue
      }

      // Get embed_id and map back to context
      const embedId = extraction.embed_id ? parseInt(extraction.embed_id) : null
      if (!embedId || embedId < 1 || embedId > contexts.length) {
        console.warn(`[AI Extractor] Invalid embed_id: ${embedId}`)
        continue
      }

      const context = contexts[embedId - 1] // Convert to 0-indexed

      // Validate and normalize genres
      const genres = Array.isArray(extraction.genres)
        ? extraction.genres
            .filter((g: string) => VALID_GENRES.includes(g as any))
            .slice(0, 3) // Max 3 genres
        : []

      // Normalize release date
      let releaseDate = extraction.release_date
      if (releaseDate && releaseDate !== 'null') {
        // If just a year, convert to YYYY-01-01
        if (/^\d{4}$/.test(releaseDate)) {
          releaseDate = `${releaseDate}-01-01`
        }
      } else {
        releaseDate = null
      }

      // Validate music_type
      let musicType: 'song' | 'album' | 'playlist' | 'artist' = 'song'
      if (VALID_MUSIC_TYPES.includes(extraction.music_type)) {
        musicType = extraction.music_type
      }

      // Parse confidence score
      const confidence = typeof extraction.confidence === 'number'
        ? Math.max(0, Math.min(1, extraction.confidence))
        : 0.5

      const result: ExtractedMusic = {
        platform_name: context.platform_name,
        platform_id: context.platform_id,
        title: extraction.title?.trim() || null,
        artist: extraction.artist?.trim() || null,
        album: extraction.album?.trim() || null,
        genres,
        release_date: releaseDate,
        music_type: musicType,
        confidence_score: confidence
      }

      // Only include if we have at least a title
      if (result.title) {
        results.push(result)
      }
    }

    console.log(`[AI Extractor] Parsed ${results.length} valid extractions from response`)
    return results

  } catch (error: any) {
    console.error(`[AI Extractor] Error parsing response:`, error.message)
    console.log('[AI Extractor] Response preview:', responseText.substring(0, 300))
    return []
  }
}

/**
 * Validate an extraction result
 */
export function validateExtraction(extraction: ExtractedMusic): boolean {
  // Must have title
  if (!extraction.title) {
    return false
  }

  // Confidence must be between 0 and 1
  if (extraction.confidence_score < 0 || extraction.confidence_score > 1) {
    return false
  }

  // Genres must be valid
  if (extraction.genres.some(g => !VALID_GENRES.includes(g as any))) {
    return false
  }

  // Music type must be valid
  if (!VALID_MUSIC_TYPES.includes(extraction.music_type)) {
    return false
  }

  return true
}
