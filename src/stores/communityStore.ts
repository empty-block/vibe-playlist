import { createSignal } from 'solid-js';
import { 
  ActiveConversation, 
  LiveActivity, 
  NetworkActivity, 
  CommunityPlaylist, 
  CuratorSuggestion,
  CommunityUser,
  TrackShare,
  ConversationReply
} from '../types/community';

// Community data signals
export const [activeConversations, setActiveConversations] = createSignal<ActiveConversation[]>([]);
export const [liveActivities, setLiveActivities] = createSignal<LiveActivity[]>([]);
export const [networkActivity, setNetworkActivity] = createSignal<NetworkActivity | null>(null);
export const [communityPlaylists, setCommunityPlaylists] = createSignal<CommunityPlaylist[]>([]);
export const [curatorSuggestions, setCuratorSuggestions] = createSignal<CuratorSuggestion[]>([]);

// Loading states
export const [isConversationsLoading, setIsConversationsLoading] = createSignal(false);
export const [isActivitiesLoading, setIsActivitiesLoading] = createSignal(false);
export const [isNetworkLoading, setIsNetworkLoading] = createSignal(false);
export const [isPlaylistsLoading, setIsPlaylistsLoading] = createSignal(false);
export const [isSuggestionsLoading, setIsSuggestionsLoading] = createSignal(false);

// Mock users generator
const generateMockUsers = (): CommunityUser[] => [
  {
    userId: 'user1',
    username: 'sonic_sage',
    displayName: 'Sonic Sage',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sonic_sage',
    isOnline: true,
    followersCount: 2847,
    followingCount: 456,
    isFollowedByCurrentUser: false
  },
  {
    userId: 'user2', 
    username: 'beat_prophet',
    displayName: 'Beat Prophet',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=beat_prophet',
    isOnline: false,
    lastSeen: '2024-01-20T16:30:00Z',
    followersCount: 1923,
    followingCount: 234,
    isFollowedByCurrentUser: true
  },
  {
    userId: 'user3',
    username: 'melody_mystic',
    displayName: 'Melody Mystic',  
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=melody_mystic',
    isOnline: true,
    followersCount: 3156,
    followingCount: 678,
    isFollowedByCurrentUser: false
  },
  {
    userId: 'user4',
    username: 'rhythm_rebel',
    displayName: 'Rhythm Rebel',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=rhythm_rebel',
    isOnline: false,
    lastSeen: '2024-01-20T14:15:00Z',
    followersCount: 987,
    followingCount: 123,
    isFollowedByCurrentUser: true
  },
  {
    userId: 'user5',
    username: 'harmony_hacker',
    displayName: 'Harmony Hacker',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=harmony_hacker',
    isOnline: true,
    followersCount: 4521,
    followingCount: 891,
    isFollowedByCurrentUser: false
  }
];

// Mock data generators
const generateMockConversations = (): ActiveConversation[] => {
  const users = generateMockUsers();
  
  return [
    {
      id: 'conv1',
      trackShare: {
        id: 'share1',
        trackId: 'track1',
        track: {
          id: 'track1',
          title: 'Midnight City',
          artist: 'M83',
          duration: '4:01',
          source: 'spotify',
          sourceId: '0VjIjW4GlUZAMYd2vXMi3b',
          thumbnail: 'https://i.scdn.co/image/ab67616d0000b2738863bc11d2aa12b54f5aeb36'
        },
        sharedBy: users[0],
        timestamp: '2024-01-20T17:30:00Z',
        timeAgo: '30 minutes ago',
        originalComment: 'This track perfectly captures that late-night drive aesthetic. The synth work is absolutely mesmerizing! 🌃',
        socialStats: {
          hearts: 23,
          replies: 8,
          recasts: 4,
          shares: 12
        },
        hasCurrentUserHearted: false,
        hasCurrentUserRecast: false
      },
      replies: [
        {
          id: 'reply1',
          userId: 'user2',
          user: users[1],
          content: 'YES! This is exactly what I needed for my nighttime coding sessions. The build-up around 2:30 gives me chills every time.',
          timestamp: '2024-01-20T17:45:00Z',
          timeAgo: '15 minutes ago',
          hearts: 5,
          hasCurrentUserHearted: true
        },
        {
          id: 'reply2',
          userId: 'user3',
          user: users[2],
          content: 'M83 never misses. Have you checked out their live album? The extended version of this track is phenomenal.',
          timestamp: '2024-01-20T17:50:00Z',
          timeAgo: '10 minutes ago',
          hearts: 3,
          hasCurrentUserHearted: false
        },
        {
          id: 'reply3',
          userId: 'user4',
          user: users[3],
          content: 'Adding this to my "Synthwave Dreams" playlist immediately. Thanks for the discovery! 🙌',
          timestamp: '2024-01-20T18:00:00Z',
          timeAgo: '5 minutes ago',
          hearts: 7,
          hasCurrentUserHearted: false
        }
      ],
      replyCount: 8,
      participantCount: 6,
      lastActivity: '2024-01-20T18:00:00Z',
      isCurrentUserParticipant: true,
      isExpanded: false
    },
    {
      id: 'conv2',
      trackShare: {
        id: 'share2',
        trackId: 'track2',
        track: {
          id: 'track2',
          title: 'Strobe',
          artist: 'Deadmau5',
          duration: '10:36',
          source: 'spotify',
          sourceId: '0ScQDVgElQS5JhwFZ8Nglx',
          thumbnail: 'https://i.scdn.co/image/ab67616d0000b27399794aa3b0b5ba7b73cf8cff'
        },
        sharedBy: users[1],
        timestamp: '2024-01-20T16:15:00Z',
        timeAgo: '1 hour ago',
        originalComment: 'Ten minutes of pure progressive house perfection. This track taught me patience in electronic music.',
        socialStats: {
          hearts: 45,
          replies: 15,
          recasts: 8,
          shares: 23
        },
        hasCurrentUserHearted: true,
        hasCurrentUserRecast: false
      },
      replies: [
        {
          id: 'reply4',
          userId: 'user5',
          user: users[4],
          content: 'The way this builds over 10 minutes is absolutely masterful. Peak deadmau5 craftsmanship right here.',
          timestamp: '2024-01-20T16:30:00Z',
          timeAgo: '1 hour ago',
          hearts: 12,
          hasCurrentUserHearted: false
        },
        {
          id: 'reply5',
          userId: 'user0',
          user: users[0],
          content: 'I remember hearing this for the first time at Ultra 2009. The crowd went absolutely wild during the breakdown.',
          timestamp: '2024-01-20T16:45:00Z',
          timeAgo: '45 minutes ago',
          hearts: 18,
          hasCurrentUserHearted: true
        }
      ],
      replyCount: 15,
      participantCount: 12,
      lastActivity: '2024-01-20T17:20:00Z',
      isCurrentUserParticipant: false,
      isExpanded: false
    },
    {
      id: 'conv3',
      trackShare: {
        id: 'share3',
        trackId: 'track3',
        track: {
          id: 'track3',
          title: 'Resonance',
          artist: 'HOME',
          duration: '3:32',
          source: 'youtube',
          sourceId: '8GW6sLrK40k',
          thumbnail: 'https://i.ytimg.com/vi/8GW6sLrK40k/maxresdefault.jpg'
        },
        sharedBy: users[2],
        timestamp: '2024-01-20T15:30:00Z',
        timeAgo: '2 hours ago',
        originalComment: 'Classic synthwave nostalgia. This track single-handedly defined the aesthetic for so many of us.',
        socialStats: {
          hearts: 67,
          replies: 22,
          recasts: 15,
          shares: 34
        },
        hasCurrentUserHearted: false,
        hasCurrentUserRecast: true
      },
      replies: [
        {
          id: 'reply6',
          userId: 'user4',
          user: users[3],
          content: 'This was my introduction to synthwave back in 2016. Still hits just as hard today. Timeless.',
          timestamp: '2024-01-20T15:45:00Z',
          timeAgo: '2 hours ago',
          hearts: 15,
          hasCurrentUserHearted: false
        }
      ],
      replyCount: 22,
      participantCount: 18,
      lastActivity: '2024-01-20T17:10:00Z',
      isCurrentUserParticipant: true,
      isExpanded: false
    }
  ];
};

const generateMockLiveActivities = (): LiveActivity[] => {
  const users = generateMockUsers();
  
  return [
    {
      id: 'activity1',
      type: 'share',
      user: users[4],
      track: {
        id: 'track4',
        title: 'Innerbloom',
        artist: 'RÜFÜS DU SOL',
        duration: '9:36',
        source: 'spotify',
        sourceId: '5W8EwHCpzoT4w4RhU2FjNP',
        thumbnail: 'https://i.scdn.co/image/ab67616d0000b273aa9f0f3900ff8a3c3804b7c9'
      },
      timestamp: '2024-01-20T18:02:00Z',
      timeAgo: '2 minutes ago'
    },
    {
      id: 'activity2',
      type: 'reply',
      user: users[1],
      content: 'This gives me serious Boiler Room vibes!',
      timestamp: '2024-01-20T18:01:00Z',
      timeAgo: '3 minutes ago'
    },
    {
      id: 'activity3',
      type: 'follow',
      user: users[3],
      targetUser: users[0],
      timestamp: '2024-01-20T18:00:00Z',
      timeAgo: '4 minutes ago'
    },
    {
      id: 'activity4',
      type: 'heart',
      user: users[2],
      track: {
        id: 'track1',
        title: 'Midnight City',
        artist: 'M83',
        duration: '4:01',
        source: 'spotify',
        sourceId: '0VjIjW4GlUZAMYd2vXMi3b',
        thumbnail: 'https://i.scdn.co/image/ab67616d0000b2738863bc11d2aa12b54f5aeb36'
      },
      timestamp: '2024-01-20T17:58:00Z',
      timeAgo: '6 minutes ago'
    },
    {
      id: 'activity5',
      type: 'recast',
      user: users[0],
      track: {
        id: 'track3',
        title: 'Resonance',
        artist: 'HOME',
        duration: '3:32',
        source: 'youtube',
        sourceId: '8GW6sLrK40k',
        thumbnail: 'https://i.ytimg.com/vi/8GW6sLrK40k/maxresdefault.jpg'
      },
      timestamp: '2024-01-20T17:55:00Z',
      timeAgo: '9 minutes ago'
    }
  ];
};

const generateMockNetworkActivity = (): NetworkActivity => {
  const users = generateMockUsers();
  
  return {
    recentShares: [
      {
        id: 'network1',
        trackId: 'track5',
        track: {
          id: 'track5',
          title: 'Flashing Lights',
          artist: 'Kanye West',
          duration: '3:57',
          source: 'spotify',
          sourceId: '23E4p7wlel1GGIIbyTEELw',
          thumbnail: 'https://i.scdn.co/image/ab67616d0000b273cd945b4e3de57edd28481a3f'
        },
        sharedBy: users[1],
        timestamp: '2024-01-20T17:45:00Z',
        timeAgo: '20 minutes ago',
        originalComment: 'Graduation era was peak Kanye. This production is flawless.',
        socialStats: { hearts: 34, replies: 12, recasts: 6, shares: 18 },
        hasCurrentUserHearted: false,
        hasCurrentUserRecast: false
      }
    ],
    activeConversations: 8,
    newCurators: [users[4]],
    summary: {
      sharesLast24h: 23,
      conversationsLast24h: 8,
      newCuratorsLast24h: 3
    }
  };
};

const generateMockCommunityPlaylists = (): CommunityPlaylist[] => {
  const users = generateMockUsers();
  
  return [
    {
      id: 'playlist1',
      name: 'Late Night Coding',
      description: 'Perfect ambient tracks for deep focus sessions',
      createdBy: users[0],
      contributors: [users[1], users[2], users[3]],
      trackCount: 47,
      recentTracks: [
        {
          id: 'track6',
          title: 'Weightless',
          artist: 'Marconi Union',
          duration: '8:10',
          source: 'youtube',
          sourceId: 'UfcAVejslrU',
          thumbnail: 'https://i.ytimg.com/vi/UfcAVejslrU/maxresdefault.jpg'
        }
      ],
      isPublic: true,
      tags: ['ambient', 'coding', 'focus', 'electronic']
    },
    {
      id: 'playlist2',
      name: 'Synthwave Essentials',
      description: 'The definitive collection of synthwave classics',
      createdBy: users[2],
      contributors: [users[0], users[4]],
      trackCount: 89,
      recentTracks: [
        {
          id: 'track7',
          title: 'Turbo Killer',
          artist: 'Carpenter Brut',
          duration: '3:49',
          source: 'spotify',
          sourceId: '1QiPCASamL8nP2CqWLCfTV',
          thumbnail: 'https://i.scdn.co/image/ab67616d0000b273a0c8bd9c72bd84e08aa82982'
        }
      ],
      isPublic: true,
      tags: ['synthwave', 'retro', '80s', 'electronic']
    }
  ];
};

const generateMockCuratorSuggestions = (): CuratorSuggestion[] => {
  const users = generateMockUsers();
  
  return [
    {
      curator: users[4],
      reason: 'Similar taste in electronic music',
      matchScore: 94,
      sampleTracks: [
        {
          id: 'sample1',
          title: 'Opus',
          artist: 'Eric Prydz',
          duration: '9:16',
          source: 'spotify',
          sourceId: '4uLU6hMCjMI75M1A2tKUQC',
          thumbnail: 'https://i.scdn.co/image/ab67616d0000b273d1061c5600c0dc5fb5b95d3f'
        }
      ],
      mutualConnections: [users[1]]
    },
    {
      curator: users[3],
      reason: 'Popular in your hip-hop circles',
      matchScore: 87,
      sampleTracks: [
        {
          id: 'sample2',
          title: 'HUMBLE.',
          artist: 'Kendrick Lamar',
          duration: '2:57',
          source: 'spotify',
          sourceId: '7KXjTSCq5nL1LoYtL7XAwS',
          thumbnail: 'https://i.scdn.co/image/ab67616d0000b273aeb5e6b4c2b6c6c9b9e9a2de'
        }
      ],
      mutualConnections: [users[0], users[2]]
    }
  ];
};

// Data loading functions
export const loadActiveConversations = async () => {
  setIsConversationsLoading(true);
  try {
    await new Promise(resolve => setTimeout(resolve, 800));
    setActiveConversations(generateMockConversations());
  } finally {
    setIsConversationsLoading(false);
  }
};

export const loadLiveActivities = async () => {
  setIsActivitiesLoading(true);
  try {
    await new Promise(resolve => setTimeout(resolve, 400));
    setLiveActivities(generateMockLiveActivities());
  } finally {
    setIsActivitiesLoading(false);
  }
};

export const loadNetworkActivity = async () => {
  setIsNetworkLoading(true);
  try {
    await new Promise(resolve => setTimeout(resolve, 600));
    setNetworkActivity(generateMockNetworkActivity());
  } finally {
    setIsNetworkLoading(false);
  }
};

export const loadCommunityPlaylists = async () => {
  setIsPlaylistsLoading(true);
  try {
    await new Promise(resolve => setTimeout(resolve, 500));
    setCommunityPlaylists(generateMockCommunityPlaylists());
  } finally {
    setIsPlaylistsLoading(false);
  }
};

export const loadCuratorSuggestions = async () => {
  setIsSuggestionsLoading(true);
  try {
    await new Promise(resolve => setTimeout(resolve, 700));
    setCuratorSuggestions(generateMockCuratorSuggestions());
  } finally {
    setIsSuggestionsLoading(false);
  }
};

// Initialize all community data
export const initializeCommunityData = async () => {
  await Promise.all([
    loadActiveConversations(),
    loadLiveActivities(),
    loadNetworkActivity(),
    loadCommunityPlaylists(),
    loadCuratorSuggestions()
  ]);
};