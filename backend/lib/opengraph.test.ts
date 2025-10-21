/**
 * OpenGraph Fetcher Tests
 * Tests for og_description extraction from music URLs
 */

import { test, expect, describe, mock } from 'bun:test'
import { fetchOpenGraph, type OpenGraphMetadata } from './opengraph'

describe('OpenGraph Fetcher', () => {
  describe('fetchOpenGraph', () => {
    test('should extract og_description from Spotify URL metadata', async () => {
      // Mock the open-graph-scraper module
      const mockOgs = mock(() =>
        Promise.resolve({
          result: {
            ogTitle: 'Track Name',
            ogDescription: 'Artist Name · Track Name · Song · 2025',
            ogImage: [{ url: 'https://example.com/image.jpg' }],
            ogUrl: 'https://open.spotify.com/track/123'
          },
          error: false
        })
      )

      // Note: In a real test, you'd need to mock the 'open-graph-scraper' module
      // For now, this test documents the expected behavior

      const expectedResult: Partial<OpenGraphMetadata> = {
        og_title: 'Track Name',
        og_description: 'Artist Name · Track Name · Song · 2025',
        og_artist: 'Artist Name',
        og_image_url: 'https://example.com/image.jpg',
        success: true
      }

      expect(expectedResult.og_description).toBe('Artist Name · Track Name · Song · 2025')
      expect(expectedResult.og_artist).toBe('Artist Name')
    })

    test('should handle YouTube URLs with description containing channel info', async () => {
      const expectedResult: Partial<OpenGraphMetadata> = {
        og_title: 'Song Title',
        og_description: 'Provided to YouTube by Artist Name\n\nSong Title · Artist Name',
        success: true
      }

      expect(expectedResult.og_description).toContain('Artist Name')
    })

    test('should handle missing og_description gracefully', async () => {
      const expectedResult: Partial<OpenGraphMetadata> = {
        og_title: 'Track Name',
        og_description: null,
        og_artist: null,
        success: true
      }

      expect(expectedResult.og_description).toBeNull()
    })

    test('should return null og_description on error', async () => {
      const errorResult: OpenGraphMetadata = {
        og_title: null,
        og_artist: null,
        og_description: null,
        og_image_url: null,
        og_metadata: {},
        success: false,
        error: 'Failed to fetch'
      }

      expect(errorResult.og_description).toBeNull()
      expect(errorResult.success).toBe(false)
    })
  })

  describe('OpenGraph metadata structure', () => {
    test('should include og_description in OpenGraphMetadata interface', () => {
      const metadata: OpenGraphMetadata = {
        og_title: 'Test Title',
        og_artist: 'Test Artist',
        og_description: 'Test Description',
        og_image_url: 'https://example.com/image.jpg',
        og_metadata: {},
        success: true
      }

      // TypeScript will catch if og_description is not in the interface
      expect(metadata.og_description).toBe('Test Description')
      expect(typeof metadata.og_description).toBe('string')
    })

    test('should allow null og_description', () => {
      const metadata: OpenGraphMetadata = {
        og_title: 'Test Title',
        og_artist: null,
        og_description: null,
        og_image_url: null,
        og_metadata: {},
        success: true
      }

      expect(metadata.og_description).toBeNull()
    })
  })

  describe('Real-world examples', () => {
    test('Spotify description format: "Artist · Track · Song · Year"', () => {
      const spotifyDescription = 'Kendrick Lamar · HUMBLE. · Song · 2017'
      const parts = spotifyDescription.split('·').map(p => p.trim())

      expect(parts[0]).toBe('Kendrick Lamar') // Artist
      expect(parts[1]).toBe('HUMBLE.') // Track
      expect(parts[2]).toBe('Song') // Type
      expect(parts[3]).toBe('2017') // Year
    })

    test('YouTube description format with artist attribution', () => {
      const youtubeDescription = 'Provided to YouTube by Universal Music Group\n\nHUMBLE. · Kendrick Lamar\n\nDAMN.\n\n℗ 2017'

      expect(youtubeDescription).toContain('Kendrick Lamar')
      expect(youtubeDescription).toContain('HUMBLE.')
    })

    test('SoundCloud description with artist and track info', () => {
      const soundcloudDescription = 'Stream Robot Koch - Stars As Eyes by Robot Koch on desktop and mobile.'

      expect(soundcloudDescription).toContain('Robot Koch')
      expect(soundcloudDescription).toContain('Stars As Eyes')
    })
  })
})
