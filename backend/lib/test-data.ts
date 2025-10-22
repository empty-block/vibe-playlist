// Test data helpers for mock API development

/**
 * Generates a mock Farcaster cast hash
 * Format: 0x[40 hex characters]
 */
export function generateMockCastHash(): string {
  const randomHex = Array.from({ length: 40 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join('')
  return `0x${randomHex}`
}

/**
 * Generates a mock Farcaster FID (user ID)
 * Returns a random number between 1000 and 999999 as a string
 */
export function generateMockFid(): string {
  return Math.floor(Math.random() * 998999 + 1000).toString()
}

/**
 * Mock user data for testing
 */
export const MOCK_USERS = [
  {
    node_id: '12345',
    fname: 'musiclover',
    display_name: 'Music Lover',
    avatar_url: 'https://i.imgur.com/placeholder1.jpg'
  },
  {
    node_id: '67890',
    fname: 'vibesking',
    display_name: 'Vibes King',
    avatar_url: 'https://i.imgur.com/placeholder2.jpg'
  },
  {
    node_id: '11111',
    fname: 'jamzyuser',
    display_name: 'Jamzy User',
    avatar_url: 'https://i.imgur.com/placeholder3.jpg'
  }
]

/**
 * Mock music metadata for testing
 */
export const MOCK_MUSIC = {
  spotify: {
    platform: 'spotify',
    artist: 'Test Artist',
    title: 'Test Track',
    album: 'Test Album',
    duration: 210,
    thumbnail_url: 'https://i.scdn.co/image/test'
  },
  youtube: {
    platform: 'youtube',
    artist: 'YouTube Artist',
    title: 'YouTube Video',
    duration: 240,
    thumbnail_url: 'https://i.ytimg.com/vi/test/maxresdefault.jpg'
  },
  soundcloud: {
    platform: 'soundcloud',
    artist: 'SoundCloud Artist',
    title: 'SoundCloud Track',
    duration: 180,
    thumbnail_url: 'https://i1.sndcdn.com/artworks/test-large.jpg'
  }
}

/**
 * Helper to get a random mock user
 */
export function getRandomMockUser() {
  return MOCK_USERS[Math.floor(Math.random() * MOCK_USERS.length)]
}

/**
 * Helper to get mock user by FID
 */
export function getMockUserByFid(fid: string) {
  return MOCK_USERS.find(u => u.node_id === fid) || MOCK_USERS[0]
}
