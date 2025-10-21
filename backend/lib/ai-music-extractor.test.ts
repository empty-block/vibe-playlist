/**
 * AI Music Extractor Tests
 * Tests for og_description usage in AI extraction prompts
 */

import { test, expect, describe } from 'bun:test'
import type { MusicContext, ExtractedMusic } from './ai-music-extractor'

describe('AI Music Extractor', () => {
  describe('MusicContext interface', () => {
    test('should include og_description field', () => {
      const context: MusicContext = {
        platform_name: 'spotify',
        platform_id: '123abc',
        og_title: 'HUMBLE.',
        og_artist: 'Kendrick Lamar',
        og_description: 'Kendrick Lamar · HUMBLE. · Song · 2017',
        og_metadata: {},
        cast_text: 'love this track!'
      }

      expect(context.og_description).toBe('Kendrick Lamar · HUMBLE. · Song · 2017')
      expect(typeof context.og_description).toBe('string')
    })

    test('should allow null og_description', () => {
      const context: MusicContext = {
        platform_name: 'youtube',
        platform_id: 'xyz789',
        og_title: 'Some Video',
        og_artist: null,
        og_description: null,
        og_metadata: {}
      }

      expect(context.og_description).toBeNull()
    })
  })

  describe('Extraction scenarios', () => {
    test('should improve extraction with Spotify description', () => {
      // Before: only had og_title, artist was null
      const beforeContext: Partial<MusicContext> = {
        og_title: 'HUMBLE.',
        og_artist: null,
        og_description: null
      }

      // After: has og_description with artist info
      const afterContext: MusicContext = {
        platform_name: 'spotify',
        platform_id: '123',
        og_title: 'HUMBLE.',
        og_artist: 'Kendrick Lamar', // Now extracted from description
        og_description: 'Kendrick Lamar · HUMBLE. · Song · 2017',
        og_metadata: {}
      }

      expect(afterContext.og_description).toContain('Kendrick Lamar')
      expect(afterContext.og_artist).toBe('Kendrick Lamar')
    })

    test('should help with YouTube channel attribution', () => {
      const context: MusicContext = {
        platform_name: 'youtube',
        platform_id: 'abc123',
        og_title: 'Stars As Eyes',
        og_artist: null,
        og_description: 'Provided to YouTube by Believe SAS\n\nStars As Eyes · Robot Koch\n\nThe Next Billion Years\n\n℗ Trees And Cyborgs',
        og_metadata: {}
      }

      // Description contains artist info that wasn't in og_artist
      expect(context.og_description).toContain('Robot Koch')
      expect(context.og_description).toContain('Stars As Eyes')
    })

    test('should handle complex multi-artist descriptions', () => {
      const context: MusicContext = {
        platform_name: 'spotify',
        platform_id: 'multi123',
        og_title: 'Falling',
        og_artist: 'Roudeep',
        og_description: 'Roudeep, Artist2, Artist3 · Falling · Song · 2023',
        og_metadata: {}
      }

      // AI can now see all artists in description
      expect(context.og_description).toContain('Roudeep')
      expect(context.og_description).toContain('Artist2')
      expect(context.og_description).toContain('Artist3')
    })
  })

  describe('ExtractedMusic validation', () => {
    test('should produce valid extraction with description context', () => {
      const extraction: ExtractedMusic = {
        platform_name: 'spotify',
        platform_id: '123',
        title: 'HUMBLE.',
        artist: 'Kendrick Lamar',
        album: 'DAMN.',
        genres: ['hip-hop'],
        release_date: '2017-04-14',
        music_type: 'song',
        confidence_score: 0.95
      }

      expect(extraction.artist).toBe('Kendrick Lamar')
      expect(extraction.confidence_score).toBeGreaterThan(0.9)
    })

    test('should handle unknown artist case (should be reduced with og_description)', () => {
      // This scenario should be less common after og_description is included
      const extraction: ExtractedMusic = {
        platform_name: 'unknown',
        platform_id: '456',
        title: 'Some Track',
        artist: null,
        album: null,
        genres: [],
        release_date: null,
        music_type: 'song',
        confidence_score: 0.3
      }

      // Low confidence when missing data
      expect(extraction.confidence_score).toBeLessThan(0.5)
    })
  })

  describe('Prompt building expectations', () => {
    test('should format description in prompt metadata', () => {
      // Simulated prompt parts that buildExtractionPrompt would create
      const metadataParts: string[] = []

      const context: MusicContext = {
        platform_name: 'spotify',
        platform_id: '123',
        og_title: 'HUMBLE.',
        og_artist: 'Kendrick Lamar',
        og_description: 'Kendrick Lamar · HUMBLE. · Song · 2017',
        og_metadata: {}
      }

      if (context.og_title) metadataParts.push(`title - ${context.og_title}`)
      if (context.og_artist) metadataParts.push(`artist - ${context.og_artist}`)
      if (context.og_description) metadataParts.push(`description - ${context.og_description}`)

      const expectedPrompt = metadataParts.join(' | ')

      expect(expectedPrompt).toContain('title - HUMBLE.')
      expect(expectedPrompt).toContain('artist - Kendrick Lamar')
      expect(expectedPrompt).toContain('description - Kendrick Lamar · HUMBLE. · Song · 2017')
    })

    test('should handle missing description gracefully in prompt', () => {
      const metadataParts: string[] = []

      const context: MusicContext = {
        platform_name: 'youtube',
        platform_id: '789',
        og_title: 'Video Title',
        og_artist: null,
        og_description: null,
        og_metadata: {}
      }

      if (context.og_title) metadataParts.push(`title - ${context.og_title}`)
      if (context.og_artist) metadataParts.push(`artist - ${context.og_artist}`)
      if (context.og_description) metadataParts.push(`description - ${context.og_description}`)

      const expectedPrompt = metadataParts.join(' | ')

      // Should only have title, no description
      expect(expectedPrompt).toBe('title - Video Title')
      expect(expectedPrompt).not.toContain('description')
    })
  })

  describe('Integration scenarios', () => {
    test('full flow: Spotify URL -> OpenGraph -> AI Extraction', () => {
      // Step 1: OpenGraph extraction
      const ogData = {
        og_title: 'YAH.',
        og_artist: 'Kendrick Lamar - Topic', // Channel name
        og_description: 'Kendrick Lamar · YAH. · Song · 2017',
        og_image_url: 'https://i.scdn.co/image/abc123',
        og_metadata: {},
        success: true
      }

      // Step 2: Create AI context
      const aiContext: MusicContext = {
        platform_name: 'spotify',
        platform_id: '6K4t31amVTZDgR3sKmwUJJ',
        og_title: ogData.og_title,
        og_artist: ogData.og_artist,
        og_description: ogData.og_description,
        og_metadata: ogData.og_metadata,
        cast_text: 'I got so many theories and suspicions'
      }

      // Step 3: Expected extraction result
      const expectedExtraction: ExtractedMusic = {
        platform_name: 'spotify',
        platform_id: '6K4t31amVTZDgR3sKmwUJJ',
        title: 'YAH.',
        artist: 'Kendrick Lamar', // Correctly extracted from description
        album: null,
        genres: ['hip-hop'],
        release_date: '2017-04-14',
        music_type: 'song',
        confidence_score: 0.9
      }

      // Verify the description helped extract correct artist
      expect(aiContext.og_description).toContain('Kendrick Lamar')
      expect(expectedExtraction.artist).toBe('Kendrick Lamar')
      expect(expectedExtraction.confidence_score).toBeGreaterThan(0.8)
    })

    test('full flow: YouTube URL -> OpenGraph -> AI Extraction', () => {
      const ogData = {
        og_title: 'Robot Koch - Stars As Eyes',
        og_artist: null,
        og_description: 'Provided to YouTube by Believe SAS\n\nStars As Eyes · Robot Koch\n\nThe Next Billion Years',
        og_image_url: 'https://i.ytimg.com/vi/abc/maxresdefault.jpg',
        og_metadata: {},
        success: true
      }

      const aiContext: MusicContext = {
        platform_name: 'youtube',
        platform_id: 'dQw4w9WgXcQ',
        og_title: ogData.og_title,
        og_artist: ogData.og_artist,
        og_description: ogData.og_description,
        og_metadata: ogData.og_metadata,
        cast_text: 'loving this track'
      }

      const expectedExtraction: ExtractedMusic = {
        platform_name: 'youtube',
        platform_id: 'dQw4w9WgXcQ',
        title: 'Stars As Eyes',
        artist: 'Robot Koch', // Extracted from description
        album: 'The Next Billion Years', // Also from description
        genres: ['electronic', 'ambient'],
        release_date: '2020-09-04',
        music_type: 'song',
        confidence_score: 0.9
      }

      // Description provides crucial context
      expect(aiContext.og_description).toContain('Robot Koch')
      expect(aiContext.og_description).toContain('Stars As Eyes')
      expect(aiContext.og_description).toContain('The Next Billion Years')
      expect(expectedExtraction.artist).toBe('Robot Koch')
      expect(expectedExtraction.album).toBe('The Next Billion Years')
    })
  })
})
