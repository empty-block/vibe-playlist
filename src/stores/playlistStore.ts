import { createSignal } from 'solid-js';
import { createStore } from 'solid-js/store';

export type TrackSource = 'youtube' | 'spotify' | 'soundcloud' | 'bandcamp';

export interface Track {
  id: string;
  title: string;
  artist: string;
  duration: string;
  source: TrackSource;
  sourceId: string; // videoId for YouTube, track ID for Spotify, etc.
  thumbnail: string;
  addedBy: string;
  userAvatar: string;
  timestamp: string;
  comment: string;
  likes: number;
  replies: number;
  recasts: number;
  // Keep videoId for backward compatibility during transition
  videoId?: string;
}

export interface Playlist {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  trackCount: number;
}

export const playlists: Record<string, Playlist> = {
  '90s_hits': {
    id: '90s_hits',
    name: '90s Hits',
    description: 'The best grunge, alternative, and pop hits from the decade that changed music',
    icon: '🎸',
    color: '#ff6b6b',
    trackCount: 5
  },
  '80s_synthwave': {
    id: '80s_synthwave',
    name: '80s Synthwave',
    description: 'Neon-soaked synth beats and electric dreams from the decade of excess',
    icon: '🌈',
    color: '#ff0080',
    trackCount: 4
  },
  'chill_vibes': {
    id: 'chill_vibes',
    name: 'Chill Vibes',
    description: 'Laid-back tracks for studying, relaxing, or just vibing',
    icon: '🌙',
    color: '#4ecdc4',
    trackCount: 3
  },
  'party_bangers': {
    id: 'party_bangers',
    name: 'Party Bangers',
    description: 'High-energy tracks to get the party started and keep it going',
    icon: '🎉',
    color: '#ff6b35',
    trackCount: 3
  },
  'indie_gems': {
    id: 'indie_gems',
    name: 'Indie Gems',
    description: 'Hidden treasures and underground favorites from independent artists',
    icon: '💎',
    color: '#a8e6cf',
    trackCount: 3
  },
  'hip_hop_classics': {
    id: 'hip_hop_classics',
    name: 'Hip-Hop Classics',
    description: 'Essential tracks that defined the culture and shaped the genre',
    icon: '🎤',
    color: '#ffd93d',
    trackCount: 3
  }
};

const playlistSongs: Record<string, Track[]> = {
  '90s_hits': [
    {
      id: '1',
      title: 'Smells Like Teen Spirit',
      artist: 'Nirvana',
      duration: '5:01',
      source: 'youtube',
      sourceId: 'hTWKbfoikeg',
      videoId: 'hTWKbfoikeg', // Backward compatibility
      thumbnail: 'https://img.youtube.com/vi/hTWKbfoikeg/mqdefault.jpg',
      addedBy: 'grunge_kid_92',
      userAvatar: '🎸',
      timestamp: '2 min ago',
      comment: 'This song changed everything for me in high school. Peak 90s energy! 🔥',
      likes: 25,
      replies: 8,
      recasts: 12
    },
    {
      id: '2',
      title: 'Come As You Are',
      artist: 'Nirvana',
      duration: '3:39',
      source: 'spotify',
      sourceId: '2RsAajgo0g7bMCHxwH3Sk0', // Example Spotify track ID
      thumbnail: 'https://i.scdn.co/image/ab67616d0000b273e175a19e530c898d167d39bf',
      addedBy: 'spotify_user_93',
      userAvatar: '🎵',
      timestamp: '4 min ago',
      comment: 'Spotify exclusive! Love having the full album here.',
      likes: 18,
      replies: 6,
      recasts: 8
    },
    {
      id: '3',
      title: 'Loser',
      artist: 'Beck',
      duration: '3:54',
      source: 'youtube',
      sourceId: 'YgSPaXgAdzE',
      videoId: 'YgSPaXgAdzE', // Backward compatibility
      thumbnail: 'https://img.youtube.com/vi/YgSPaXgAdzE/mqdefault.jpg',
      addedBy: 'alt_rock_alice',
      userAvatar: '🎭',
      timestamp: '5 min ago',
      comment: 'Perfect slacker anthem. Beck was so ahead of his time.',
      likes: 20,
      replies: 4,
      recasts: 9
    },
    {
      id: '4',
      title: 'Creep',
      artist: 'Radiohead',
      duration: '3:58',
      source: 'youtube',
      sourceId: 'XFkzRNyygfk',
      videoId: 'XFkzRNyygfk', // Backward compatibility
      thumbnail: 'https://img.youtube.com/vi/XFkzRNyygfk/mqdefault.jpg',
      addedBy: 'radiohead_stan',
      userAvatar: '👁️',
      timestamp: '8 min ago',
      comment: 'Before OK Computer, there was this masterpiece. Still hits different.',
      likes: 29,
      replies: 12,
      recasts: 15
    },
    {
      id: '5',
      title: 'Black',
      artist: 'Pearl Jam',
      duration: '5:43',
      source: 'youtube',
      sourceId: 'cs-XZ_dN4Hc',
      videoId: 'cs-XZ_dN4Hc', // Backward compatibility
      thumbnail: 'https://img.youtube.com/vi/cs-XZ_dN4Hc/mqdefault.jpg',
      addedBy: 'seattle_sound',
      userAvatar: '🌧️',
      timestamp: '12 min ago',
      comment: 'Eddie Vedder\'s voice on this track... pure emotion. Seattle forever.',
      likes: 36,
      replies: 11,
      recasts: 18
    },
    {
      id: '6',
      title: 'Zombie',
      artist: 'The Cranberries',
      duration: '5:06',
      source: 'youtube',
      sourceId: '6Ejga4kJUts',
      videoId: '6Ejga4kJUts', // Backward compatibility
      thumbnail: 'https://img.youtube.com/vi/6Ejga4kJUts/mqdefault.jpg',
      addedBy: 'irish_dreamer',
      userAvatar: '🍀',
      timestamp: '15 min ago',
      comment: 'Dolores O\'Riordan had such a unique voice. RIP to a legend.',
      likes: 45,
      replies: 14,
      recasts: 22
    }
  ],
  '80s_synthwave': [
    {
      id: '1',
      title: 'Blue Monday',
      artist: 'New Order',
      duration: '7:29',
      source: 'youtube',
      sourceId: 'FYH8DsU2WCk',
      videoId: 'FYH8DsU2WCk', // Backward compatibility
      thumbnail: 'https://img.youtube.com/vi/FYH8DsU2WCk/mqdefault.jpg',
      addedBy: 'synth_master',
      userAvatar: '🎹',
      timestamp: '3 min ago',
      comment: 'The bassline that launched a thousand dancefloors',
      likes: 42,
      replies: 7,
      recasts: 15
    },
    {
      id: '2',
      title: 'Take On Me',
      artist: 'a-ha',
      duration: '3:48',
      source: 'youtube',
      sourceId: 'djV11Xbc914',
      videoId: 'djV11Xbc914', // Backward compatibility
      thumbnail: 'https://img.youtube.com/vi/djV11Xbc914/mqdefault.jpg',
      addedBy: 'retro_lover',
      userAvatar: '📼',
      timestamp: '10 min ago',
      comment: 'That music video though! Pure 80s magic ✨',
      likes: 38,
      replies: 5,
      recasts: 12
    },
    {
      id: '3',
      title: 'Everybody Wants to Rule the World',
      artist: 'Tears for Fears',
      duration: '4:11',
      source: 'youtube',
      sourceId: 'aGCdLKXNF3w',
      videoId: 'aGCdLKXNF3w', // Backward compatibility
      thumbnail: 'https://img.youtube.com/vi/aGCdLKXNF3w/mqdefault.jpg',
      addedBy: 'new_wave_fan',
      userAvatar: '🌊',
      timestamp: '15 min ago',
      comment: 'Timeless synth-pop perfection',
      likes: 33,
      replies: 9,
      recasts: 11
    }
  ],
  'chill_vibes': [
    {
      id: '1',
      title: 'Midnight City',
      artist: 'M83',
      duration: '4:03',
      source: 'youtube',
      sourceId: 'dX3k_QDnzHE',
      videoId: 'dX3k_QDnzHE', // Backward compatibility
      thumbnail: 'https://img.youtube.com/vi/dX3k_QDnzHE/mqdefault.jpg',
      addedBy: 'night_owl',
      userAvatar: '🌃',
      timestamp: '5 min ago',
      comment: 'Perfect for late night drives 🌙',
      likes: 28,
      replies: 6,
      recasts: 10
    },
    {
      id: '2',
      title: 'Breathe',
      artist: 'Télépopmusik',
      duration: '3:40',
      source: 'youtube',
      sourceId: 'vyut3GyQtn0',
      videoId: 'vyut3GyQtn0', // Backward compatibility
      thumbnail: 'https://img.youtube.com/vi/vyut3GyQtn0/mqdefault.jpg',
      addedBy: 'chill_seeker',
      userAvatar: '😌',
      timestamp: '20 min ago',
      comment: 'Just breathe... and vibe',
      likes: 22,
      replies: 3,
      recasts: 8
    }
  ],
  'party_bangers': [
    {
      id: '1',
      title: 'Mr. Brightside',
      artist: 'The Killers',
      duration: '3:42',
      source: 'youtube',
      sourceId: 'gGdGFtwCNBE',
      videoId: 'gGdGFtwCNBE', // Backward compatibility
      thumbnail: 'https://img.youtube.com/vi/gGdGFtwCNBE/mqdefault.jpg',
      addedBy: 'party_starter',
      userAvatar: '🎉',
      timestamp: '2 min ago',
      comment: 'COMING OUT OF MY CAGE AND IVE BEEN DOING JUST FINE',
      likes: 55,
      replies: 15,
      recasts: 25
    },
    {
      id: '2',
      title: 'Pump It',
      artist: 'The Black Eyed Peas',
      duration: '3:35',
      source: 'youtube',
      sourceId: 'ZaI2IlHwmgQ',
      videoId: 'ZaI2IlHwmgQ', // Backward compatibility
      thumbnail: 'https://img.youtube.com/vi/ZaI2IlHwmgQ/mqdefault.jpg',
      addedBy: 'dance_machine',
      userAvatar: '🕺',
      timestamp: '7 min ago',
      comment: 'Turn it up when the crowd gets wild!',
      likes: 41,
      replies: 8,
      recasts: 18
    }
  ],
  'indie_gems': [
    {
      id: '1',
      title: 'Electric Feel',
      artist: 'MGMT',
      duration: '3:49',
      source: 'youtube',
      sourceId: 'MmZexg8sxyk',
      videoId: 'MmZexg8sxyk', // Backward compatibility
      thumbnail: 'https://img.youtube.com/vi/MmZexg8sxyk/mqdefault.jpg',
      addedBy: 'indie_kid',
      userAvatar: '🎨',
      timestamp: '12 min ago',
      comment: 'This song makes me feel like I\'m floating',
      likes: 31,
      replies: 7,
      recasts: 13
    }
  ],
  'hip_hop_classics': [
    {
      id: '1',
      title: 'Juicy',
      artist: 'The Notorious B.I.G.',
      duration: '5:01',
      source: 'youtube',
      sourceId: '_JZom_gVfuw',
      videoId: '_JZom_gVfuw', // Backward compatibility
      thumbnail: 'https://img.youtube.com/vi/_JZom_gVfuw/mqdefault.jpg',
      addedBy: 'hip_hop_head',
      userAvatar: '👑',
      timestamp: '4 min ago',
      comment: 'It was all a dream... RIP Biggie 🙏',
      likes: 48,
      replies: 12,
      recasts: 20
    },
    {
      id: '2',
      title: 'Ms. Jackson',
      artist: 'OutKast',
      duration: '4:30',
      source: 'youtube',
      sourceId: 'MYxAiK6VnXw',
      videoId: 'MYxAiK6VnXw', // Backward compatibility
      thumbnail: 'https://img.youtube.com/vi/MYxAiK6VnXw/mqdefault.jpg',
      addedBy: 'atl_finest',
      userAvatar: '🍑',
      timestamp: '18 min ago',
      comment: 'Forever sorry Ms. Jackson... ICONIC!',
      likes: 35,
      replies: 9,
      recasts: 16
    }
  ]
};

// Signals and stores
export const [currentPlaylistId, setCurrentPlaylistId] = createSignal<string>('90s_hits');
export const [playlistTracks, setPlaylistTracks] = createStore<Record<string, Track[]>>(playlistSongs);
export const [currentTrack, setCurrentTrack] = createSignal<Track | null>(null);
export const [isPlaying, setIsPlaying] = createSignal(false);

// Temporary migration function to add missing source fields
const addMissingSourceFields = (track: any): Track => {
  if (!track.source && track.videoId) {
    console.log('Migrating track:', track.title, 'from videoId:', track.videoId);
    return {
      ...track,
      source: 'youtube' as TrackSource,
      sourceId: track.videoId
    };
  }
  console.log('Track already has source:', track.title, track.source);
  return track as Track;
};

export const getCurrentPlaylistTracks = () => {
  const tracks = playlistTracks[currentPlaylistId()] || [];
  console.log('getCurrentPlaylistTracks called, raw tracks:', tracks.length);
  const migratedTracks = tracks.map(addMissingSourceFields);
  console.log('After migration:', migratedTracks.map(t => ({ title: t.title, source: t.source })));
  return migratedTracks;
};