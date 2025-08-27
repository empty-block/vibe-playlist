import { createSignal } from 'solid-js';
import { TrendingTrack, FreshTrack, CuratorProfile, GenreTag, ConversationThread } from '../types/discover';

// Section data signals
export const [trendingTracks, setTrendingTracks] = createSignal<TrendingTrack[]>([]);
export const [freshTracks, setFreshTracks] = createSignal<FreshTrack[]>([]);
export const [featuredCurators, setFeaturedCurators] = createSignal<CuratorProfile[]>([]);
export const [genreTags, setGenreTags] = createSignal<GenreTag[]>([]);
export const [activeConversations, setActiveConversations] = createSignal<ConversationThread[]>([]);

// Loading states
export const [isTrendingLoading, setIsTrendingLoading] = createSignal(false);
export const [isFreshLoading, setIsFreshLoading] = createSignal(false);
export const [isCuratorsLoading, setIsCuratorsLoading] = createSignal(false);
export const [isGenresLoading, setIsGenresLoading] = createSignal(false);
export const [isConversationsLoading, setIsConversationsLoading] = createSignal(false);

// Mock data generators
const generateMockTrendingTracks = (): TrendingTrack[] => [
  {
    id: 'trending-1',
    title: 'Blinding Lights',
    artist: 'The Weeknd',
    duration: '3:20',
    source: 'spotify',
    sourceId: '0VjIjW4GlUZAMYd2vXMi3b',
    thumbnail: 'https://i.scdn.co/image/ab67616d0000b2738863bc11d2aa12b54f5aeb36',
    addedBy: 'music_maven',
    userAvatar: '🎵',
    timestamp: '2024-01-20T14:30:00Z',
    trendScore: 95,
    socialContext: {
      shareCount: 147,
      replyCount: 23,
      recastCount: 89,
      lastActivity: '2024-01-20T16:45:00Z'
    },
    genre: ['pop', 'synthwave', '80s']
  },
  {
    id: 'trending-2',
    title: 'Industry Baby',
    artist: 'Lil Nas X ft. Jack Harlow',
    duration: '3:32',
    source: 'youtube',
    sourceId: 'UTHLKHL_whs',
    thumbnail: 'https://i.ytimg.com/vi/UTHLKHL_whs/maxresdefault.jpg',
    addedBy: 'hip_hop_head',
    userAvatar: '🎤',
    timestamp: '2024-01-20T12:15:00Z',
    trendScore: 88,
    socialContext: {
      shareCount: 112,
      replyCount: 45,
      recastCount: 67,
      lastActivity: '2024-01-20T17:20:00Z'
    },
    genre: ['hip-hop', 'rap', 'pop']
  },
  {
    id: 'trending-3',
    title: 'Heat Waves',
    artist: 'Glass Animals',
    duration: '3:58',
    source: 'spotify',
    sourceId: '02MWAaffLxlfxAUY7c5dvx',
    thumbnail: 'https://i.scdn.co/image/ab67616d0000b273aa9f0f3900ff8a3c3804b7c9',
    addedBy: 'indie_explorer',
    userAvatar: '🌊',
    timestamp: '2024-01-20T10:45:00Z',
    trendScore: 82,
    socialContext: {
      shareCount: 95,
      replyCount: 31,
      recastCount: 54,
      lastActivity: '2024-01-20T15:30:00Z'
    },
    genre: ['indie', 'alternative', 'psychedelic']
  },
  {
    id: 'trending-4',
    title: 'As It Was',
    artist: 'Harry Styles',
    duration: '2:47',
    source: 'spotify',
    sourceId: '4Dvkj6JhhA12EX05fT7y2e',
    thumbnail: 'https://i.scdn.co/image/ab67616d0000b2732e8ed79e177ff6011076f5f0',
    addedBy: 'pop_princess',
    userAvatar: '✨',
    timestamp: '2024-01-20T09:20:00Z',
    trendScore: 79,
    socialContext: {
      shareCount: 87,
      replyCount: 19,
      recastCount: 42,
      lastActivity: '2024-01-20T14:15:00Z'
    },
    genre: ['pop', 'indie-pop', 'folk']
  }
];

const generateMockFreshTracks = (): FreshTrack[] => [
  {
    id: 'fresh-1',
    title: 'vampire',
    artist: 'Olivia Rodrigo',
    duration: '3:39',
    source: 'spotify',
    sourceId: '1kuGVB7EU95pJObxwvfwKS',
    thumbnail: 'https://i.scdn.co/image/ab67616d0000b273e85259a1cae29a8d91f2093d',
    addedBy: 'rodrigo_stan',
    userAvatar: '🧛‍♀️',
    userDisplayName: 'Olivia Stan',
    timestamp: '2024-01-20T17:45:00Z',
    comment: 'This bridge hits different every single time 😭',
    timeAgo: '23 minutes ago'
  },
  {
    id: 'fresh-2',
    title: 'Paint The Town Red',
    artist: 'Doja Cat',
    duration: '3:50',
    source: 'youtube',
    sourceId: 'GUmopKiyw_4',
    thumbnail: 'https://i.ytimg.com/vi/GUmopKiyw_4/maxresdefault.jpg',
    addedBy: 'doja_devotee',
    userAvatar: '🐱',
    userDisplayName: 'Cat Lover',
    timestamp: '2024-01-20T17:12:00Z',
    comment: 'The production on this is absolutely insane',
    timeAgo: '56 minutes ago'
  },
  {
    id: 'fresh-3',
    title: 'Seven (feat. Latto)',
    artist: 'Jung Kook',
    duration: '3:05',
    source: 'spotify',
    sourceId: '7wIgaCIfyQ0uJlJ2oNzX9R',
    thumbnail: 'https://i.scdn.co/image/ab67616d0000b273bb54bc71d1b23047cd57be8c',
    addedBy: 'kpop_king',
    userAvatar: '👑',
    userDisplayName: 'BTS Army',
    timestamp: '2024-01-20T16:30:00Z',
    timeAgo: '1 hour ago'
  },
  {
    id: 'fresh-4',
    title: 'Flowers',
    artist: 'Miley Cyrus',
    duration: '3:20',
    source: 'youtube',
    sourceId: 'G7KNmW9a75Y',
    thumbnail: 'https://i.ytimg.com/vi/G7KNmW9a75Y/maxresdefault.jpg',
    addedBy: 'miley_fan',
    userAvatar: '🌸',
    userDisplayName: 'Flower Power',
    timestamp: '2024-01-20T15:45:00Z',
    comment: 'Self-love anthem of the year 💐',
    timeAgo: '2 hours ago'
  },
  {
    id: 'fresh-5',
    title: 'Anti-Hero',
    artist: 'Taylor Swift',
    duration: '3:20',
    source: 'spotify',
    sourceId: '0V3wPSX9ygBnCm8psDIegu',
    thumbnail: 'https://i.scdn.co/image/ab67616d0000b273bb54bc71d1b23047cd57be8c',
    addedBy: 'swiftie_13',
    userAvatar: '🐍',
    userDisplayName: 'Swiftie Forever',
    timestamp: '2024-01-20T14:20:00Z',
    comment: 'Taylor really said "it\'s me, hi, I\'m the problem, it\'s me" and we all felt that',
    timeAgo: '3 hours ago'
  }
];

const generateMockCurators = (): CuratorProfile[] => [
  {
    userId: 'curator-1',
    username: 'sonic_sommelier',
    displayName: 'Sonic Sommelier',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sonic_sommelier',
    followerCount: 2847,
    trackCount: 156,
    curationScore: 94,
    bio: 'Curating the finest electronic & ambient sounds since 2018',
    sampleTracks: [
      generateMockTrendingTracks()[0],
      generateMockTrendingTracks()[2]
    ]
  },
  {
    userId: 'curator-2', 
    username: 'vinyl_virtuoso',
    displayName: 'Vinyl Virtuoso',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=vinyl_virtuoso',
    followerCount: 1923,
    trackCount: 89,
    curationScore: 91,
    bio: 'Deep cuts & hidden gems from the golden age of music',
    sampleTracks: [
      generateMockTrendingTracks()[1],
      generateMockTrendingTracks()[3]
    ]
  },
  {
    userId: 'curator-3',
    username: 'beat_botanist', 
    displayName: 'Beat Botanist',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=beat_botanist',
    followerCount: 3156,
    trackCount: 203,
    curationScore: 96,
    bio: 'Growing beats like plants - organic, diverse, always evolving',
    sampleTracks: [
      generateMockTrendingTracks()[0],
      generateMockTrendingTracks()[1]
    ]
  }
];

const generateMockGenreTags = (): GenreTag[] => [
  { id: 'pop', name: 'Pop', trackCount: 1247, popularity: 9, color: '#ff6b9d', emoji: '🎵' },
  { id: 'hip-hop', name: 'Hip-Hop', trackCount: 987, popularity: 8, color: '#f06292', emoji: '🎤' },
  { id: 'electronic', name: 'Electronic', trackCount: 756, popularity: 7, color: '#00bcd4', emoji: '🎛️' },
  { id: 'indie', name: 'Indie', trackCount: 623, popularity: 6, color: '#4caf50', emoji: '🌿' },
  { id: 'rock', name: 'Rock', trackCount: 543, popularity: 6, color: '#ff5722', emoji: '🎸' },
  { id: 'jazz', name: 'Jazz', trackCount: 312, popularity: 5, color: '#9c27b0', emoji: '🎺' },
  { id: 'r&b', name: 'R&B', trackCount: 298, popularity: 5, color: '#e91e63', emoji: '💜' },
  { id: 'folk', name: 'Folk', trackCount: 234, popularity: 4, color: '#8bc34a', emoji: '🪕' },
  { id: 'ambient', name: 'Ambient', trackCount: 189, popularity: 4, color: '#607d8b', emoji: '🌊' },
  { id: 'funk', name: 'Funk', trackCount: 167, popularity: 3, color: '#ff9800', emoji: '🕺' }
];

const generateMockConversations = (): ConversationThread[] => [
  {
    trackId: 'trending-1',
    track: generateMockTrendingTracks()[0],
    replyCount: 23,
    participantCount: 15,
    lastReply: '2024-01-20T17:30:00Z',
    isActive: true,
    previewReplies: [
      {
        id: 'reply-1',
        userId: 'user1',
        userDisplayName: 'SynthWave Sally',
        userAvatar: '🌅',
        content: 'This track perfectly captures that late-night drive aesthetic',
        timestamp: '2024-01-20T17:30:00Z',
        timeAgo: '30 minutes ago'
      },
      {
        id: 'reply-2', 
        userId: 'user2',
        userDisplayName: 'Retro Rick',
        userAvatar: '📼',
        content: 'The production quality on this is absolutely phenomenal',
        timestamp: '2024-01-20T17:15:00Z',
        timeAgo: '45 minutes ago'
      }
    ]
  },
  {
    trackId: 'trending-2',
    track: generateMockTrendingTracks()[1],
    replyCount: 45,
    participantCount: 28,
    lastReply: '2024-01-20T17:45:00Z',
    isActive: true,
    previewReplies: [
      {
        id: 'reply-3',
        userId: 'user3',
        userDisplayName: 'Hip Hop Hannah',
        userAvatar: '🎤',
        content: 'Jack Harlow\'s verse goes so hard on this one',
        timestamp: '2024-01-20T17:45:00Z',
        timeAgo: '15 minutes ago'
      }
    ]
  }
];

// Data loading functions
export const loadTrendingTracks = async () => {
  setIsTrendingLoading(true);
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    setTrendingTracks(generateMockTrendingTracks());
  } finally {
    setIsTrendingLoading(false);
  }
};

export const loadFreshTracks = async () => {
  setIsFreshLoading(true);
  try {
    await new Promise(resolve => setTimeout(resolve, 600));
    setFreshTracks(generateMockFreshTracks());
  } finally {
    setIsFreshLoading(false);
  }
};

export const loadFeaturedCurators = async () => {
  setIsCuratorsLoading(true);
  try {
    await new Promise(resolve => setTimeout(resolve, 700));
    setFeaturedCurators(generateMockCurators());
  } finally {
    setIsCuratorsLoading(false);
  }
};

export const loadGenreTags = async () => {
  setIsGenresLoading(true);
  try {
    await new Promise(resolve => setTimeout(resolve, 400));
    setGenreTags(generateMockGenreTags());
  } finally {
    setIsGenresLoading(false);
  }
};

export const loadActiveConversations = async () => {
  setIsConversationsLoading(true);
  try {
    await new Promise(resolve => setTimeout(resolve, 900));
    setActiveConversations(generateMockConversations());
  } finally {
    setIsConversationsLoading(false);
  }
};

// Initialize all data
export const initializeDiscoverData = async () => {
  await Promise.all([
    loadTrendingTracks(),
    loadFreshTracks(), 
    loadFeaturedCurators(),
    loadGenreTags(),
    loadActiveConversations()
  ]);
};