import { createSignal } from 'solid-js';
import { createStore } from 'solid-js/store';

export type TrackSource = 'youtube' | 'spotify' | 'soundcloud' | 'bandcamp';

export interface Reply {
  id: string;
  username: string;
  userAvatar: string;
  comment: string;
  timestamp: string;
  likes: number;
}

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
  repliesData?: Reply[]; // Actual reply objects
  // Keep videoId for backward compatibility during transition
  videoId?: string;
  // Filter-specific flags for ProfilePage
  isLiked?: boolean;
  isConversation?: boolean;
}

export interface Playlist {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  image?: string;
  trackCount: number;
  createdBy: string;
  creatorAvatar: string;
  createdAt: string;
  memberCount?: number;
  isCollaborative?: boolean;
}

export const playlists: Record<string, Playlist> = {
  '90s_hits': {
    id: '90s_hits',
    name: '90s Hits 🎸',
    description: 'The best grunge, alternative, and pop hits from the decade that changed music',
    icon: '🎸',
    color: '#ff6b6b',
    image: 'https://img.youtube.com/vi/hTWKbfoikeg/maxresdefault.jpg',
    trackCount: 16,
    createdBy: 'nostalgia_curator',
    creatorAvatar: '🎸',
    createdAt: '3 months ago',
    memberCount: 1248,
    isCollaborative: true
  },
  '80s_synthwave': {
    id: '80s_synthwave',
    name: '80s Synthwave 🌈',
    description: 'Neon-soaked synth beats and electric dreams from the decade of excess',
    icon: '🌈',
    color: '#ff0080',
    image: 'https://img.youtube.com/vi/dX3k_QDnzHE/maxresdefault.jpg',
    trackCount: 12,
    createdBy: 'synth_prophet_85',
    creatorAvatar: '🌈',
    createdAt: '5 months ago',
    memberCount: 892,
    isCollaborative: true
  },
  'chill_vibes': {
    id: 'chill_vibes',
    name: 'Chill Vibes 🌙',
    description: 'Laid-back tracks for studying, relaxing, or just vibing',
    icon: '🌙',
    color: '#4ecdc4',
    image: 'https://img.youtube.com/vi/lTRiuFIWV54/maxresdefault.jpg',
    trackCount: 10,
    createdBy: 'lofi_dreamer',
    creatorAvatar: '🌙',
    createdAt: '2 months ago',
    memberCount: 567,
    isCollaborative: true
  },
  'party_bangers': {
    id: 'party_bangers',
    name: 'Party Bangers 🎉',
    description: 'High-energy tracks to get the party started and keep it going',
    icon: '🎉',
    color: '#ff6b35',
    trackCount: 10,
    createdBy: 'dj_hype_master',
    creatorAvatar: '🎉',
    createdAt: '1 month ago',
    memberCount: 2341,
    isCollaborative: true
  },
  'indie_gems': {
    id: 'indie_gems',
    name: 'Indie Gems 💎',
    description: 'Hidden treasures and underground favorites from independent artists',
    icon: '💎',
    color: '#a8e6cf',
    trackCount: 10,
    createdBy: 'underground_oracle',
    creatorAvatar: '💎',
    createdAt: '6 months ago',
    memberCount: 423,
    isCollaborative: true
  },
  'hip_hop_classics': {
    id: 'hip_hop_classics',
    name: 'Hip-Hop Classics 🎤',
    description: 'Essential tracks that defined the culture and shaped the genre',
    icon: '🎤',
    color: '#ffd93d',
    trackCount: 13,
    createdBy: 'beats_historian',
    creatorAvatar: '🎤',
    createdAt: '4 months ago',
    memberCount: 1876,
    isCollaborative: true
  },
  'rock_anthems': {
    id: 'rock_anthems',
    name: 'Rock Anthems 🤘',
    description: 'Stadium-filling rock classics that make you want to headbang',
    icon: '🤘',
    color: '#dc2626',
    trackCount: 11,
    createdBy: 'rock_god_77',
    creatorAvatar: '🤘',
    createdAt: '2 weeks ago',
    memberCount: 3456,
    isCollaborative: true
  },
  'electronic_journey': {
    id: 'electronic_journey',
    name: 'Electronic Journey 🎛️',
    description: 'From ambient to techno - a journey through electronic music evolution',
    icon: '🎛️',
    color: '#7c3aed',
    trackCount: 14,
    createdBy: 'electronic_explorer',
    creatorAvatar: '🎛️',
    createdAt: '1 week ago',
    memberCount: 789,
    isCollaborative: true
  },
  'summer_roadtrip': {
    id: 'summer_roadtrip',
    name: 'Summer Roadtrip ☀️',
    description: 'Windows down, music up - perfect tracks for cruising',
    icon: '☀️',
    color: '#f59e0b',
    trackCount: 15,
    createdBy: 'highway_hero',
    creatorAvatar: '☀️',
    createdAt: '3 days ago',
    memberCount: 287,
    isCollaborative: true
  },
  'late_night_coding': {
    id: 'late_night_coding',
    name: 'Late Night Coding 💻',
    description: 'Focus tracks for those 3am debugging sessions',
    icon: '💻',
    color: '#10b981',
    trackCount: 22,
    createdBy: 'code_ninja_dev',
    creatorAvatar: '💻',
    createdAt: '5 days ago',
    memberCount: 1523,
    isCollaborative: true
  },
  'jazz_cafe': {
    id: 'jazz_cafe',
    name: 'Jazz Cafe ☕',
    description: 'Smooth jazz and coffee house vibes for sophisticated listening',
    icon: '☕',
    color: '#8b4513',
    trackCount: 18,
    createdBy: 'smooth_operator',
    creatorAvatar: '☕',
    createdAt: '1 week ago',
    memberCount: 456,
    isCollaborative: true
  },
  'workout_pump': {
    id: 'workout_pump',
    name: 'Workout Pump 💪',
    description: 'High-energy beats to power through your fitness routine',
    icon: '💪',
    color: '#ef4444',
    trackCount: 25,
    createdBy: 'fitness_beast',
    creatorAvatar: '💪',
    createdAt: '2 days ago',
    memberCount: 2891,
    isCollaborative: true
  },
  'acoustic_sunset': {
    id: 'acoustic_sunset',
    name: 'Acoustic Sunset 🌅',
    description: 'Gentle acoustic melodies for peaceful evening moments',
    icon: '🌅',
    color: '#f97316',
    trackCount: 14,
    createdBy: 'sunset_strummer',
    creatorAvatar: '🌅',
    createdAt: '4 days ago',
    memberCount: 678,
    isCollaborative: true
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
      recasts: 12,
      repliesData: [
        {
          id: 'reply_1',
          username: 'alt_rock_lover',
          userAvatar: '🤘',
          comment: 'Totally agree! This was my anthem in \'92. Kurt was a legend.',
          timestamp: '1 min ago',
          likes: 12
        },
        {
          id: 'reply_2',
          username: 'seattle_sound',
          userAvatar: '🌧️',
          comment: 'The whole Nevermind album is pure gold. RIP Kurt 💔',
          timestamp: '45 sec ago',
          likes: 8
        },
        {
          id: 'reply_3',
          username: 'vinyl_collector',
          userAvatar: '💿',
          comment: 'Still have the original pressing! Sounds incredible on vinyl.',
          timestamp: '30 sec ago',
          likes: 5
        },
        {
          id: 'reply_4',
          username: 'gen_x_kid',
          userAvatar: '📻',
          comment: 'First heard this on MTV. Changed music forever!',
          timestamp: '15 sec ago',
          likes: 3
        }
      ]
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
    },
    {
      id: '7',
      title: 'Losing My Religion',
      artist: 'R.E.M.',
      duration: '4:27',
      source: 'youtube',
      sourceId: 'xwtdhWltSIg',
      videoId: 'xwtdhWltSIg',
      thumbnail: 'https://img.youtube.com/vi/xwtdhWltSIg/mqdefault.jpg',
      addedBy: 'alternative_alice',
      userAvatar: '🎨',
      timestamp: '18 min ago',
      comment: 'Michael Stipe\'s most haunting performance. That mandolin...',
      likes: 32,
      replies: 9,
      recasts: 14
    },
    {
      id: '8',
      title: 'Under the Bridge',
      artist: 'Red Hot Chili Peppers',
      duration: '4:24',
      source: 'youtube',
      sourceId: 'lwlogyj7nFE',
      videoId: 'lwlogyj7nFE',
      thumbnail: 'https://img.youtube.com/vi/lwlogyj7nFE/mqdefault.jpg',
      addedBy: 'funk_master',
      userAvatar: '🌶️',
      timestamp: '22 min ago',
      comment: 'Anthony Kiedis singing about LA with his soul laid bare.',
      likes: 41,
      replies: 13,
      recasts: 19
    },
    {
      id: '9',
      title: 'Plush',
      artist: 'Stone Temple Pilots',
      duration: '5:13',
      source: 'youtube',
      sourceId: 'V5UOC0C0x8Q',
      videoId: 'V5UOC0C0x8Q',
      thumbnail: 'https://img.youtube.com/vi/V5UOC0C0x8Q/mqdefault.jpg',
      addedBy: 'stp_fan',
      userAvatar: '🪨',
      timestamp: '25 min ago',
      comment: 'Scott Weiland at his peak. What a voice.',
      likes: 27,
      replies: 8,
      recasts: 12
    },
    {
      id: '10',
      title: 'Touch Me I\'m Sick',
      artist: 'Mudhoney',
      duration: '2:35',
      source: 'youtube',
      sourceId: 'HD73jsuh7Ts',
      videoId: 'HD73jsuh7Ts',
      thumbnail: 'https://img.youtube.com/vi/HD73jsuh7Ts/mqdefault.jpg',
      addedBy: 'garage_punk',
      userAvatar: '🏠',
      timestamp: '30 min ago',
      comment: 'Raw Seattle garage punk. This influenced everything.',
      likes: 19,
      replies: 4,
      recasts: 7
    },
    {
      id: '11',
      title: 'High and Dry',
      artist: 'Radiohead',
      duration: '4:17',
      source: 'youtube',
      sourceId: 'BciOfJsqh7M',
      videoId: 'BciOfJsqh7M',
      thumbnail: 'https://img.youtube.com/vi/BciOfJsqh7M/mqdefault.jpg',
      addedBy: 'radiohead_superfan',
      userAvatar: '👁️‍🗨️',
      timestamp: '35 min ago',
      comment: 'Before they went electronic. Pure alternative beauty.',
      likes: 34,
      replies: 11,
      recasts: 16
    },
    {
      id: '12',
      title: 'Connection',
      artist: 'Elastica',
      duration: '2:27',
      source: 'youtube',
      sourceId: 'ilKcXIFi-Rc',
      videoId: 'ilKcXIFi-Rc',
      thumbnail: 'https://img.youtube.com/vi/ilKcXIFi-Rc/mqdefault.jpg',
      addedBy: 'brit_pop_girl',
      userAvatar: '🇬🇧',
      timestamp: '38 min ago',
      comment: 'Justine Frischmann was so cool. Britpop at its finest.',
      likes: 25,
      replies: 6,
      recasts: 10
    },
    {
      id: '13',
      title: 'Cannonball',
      artist: 'The Breeders',
      duration: '3:33',
      source: 'youtube',
      sourceId: 'fxvkI9MTQw4',
      videoId: 'fxvkI9MTQw4',
      thumbnail: 'https://img.youtube.com/vi/fxvkI9MTQw4/mqdefault.jpg',
      addedBy: 'pixies_lover',
      userAvatar: '🧚‍♀️',
      timestamp: '42 min ago',
      comment: 'Kim Deal proving she\'s a songwriting genius outside the Pixies.',
      likes: 29,
      replies: 7,
      recasts: 13
    },
    {
      id: '14',
      title: 'Possum Kingdom',
      artist: 'Toadies',
      duration: '5:30',
      source: 'youtube',
      sourceId: 'EkwD5rQ-_d4',
      videoId: 'EkwD5rQ-_d4',
      thumbnail: 'https://img.youtube.com/vi/EkwD5rQ-_d4/mqdefault.jpg',
      addedBy: 'texas_rock',
      userAvatar: '🤠',
      timestamp: '45 min ago',
      comment: 'Dark Texas alternative. That guitar tone is perfection.',
      likes: 22,
      replies: 5,
      recasts: 9
    },
    {
      id: '15',
      title: 'Counting Blue Cars',
      artist: 'Dishwalla',
      duration: '4:45',
      source: 'youtube',
      sourceId: 'Clxtg2pqsPs',
      videoId: 'Clxtg2pqsPs',
      thumbnail: 'https://img.youtube.com/vi/Clxtg2pqsPs/mqdefault.jpg',
      addedBy: 'alt_radio_dj',
      userAvatar: '📻',
      timestamp: '48 min ago',
      comment: 'Tell me all your thoughts on God... deep 90s alternative.',
      likes: 31,
      replies: 10,
      recasts: 15
    },
    {
      id: '16',
      title: 'Big Empty',
      artist: 'Stone Temple Pilots',
      duration: '4:55',
      source: 'youtube',
      sourceId: 'gGaq4tb7jZA',
      videoId: 'gGaq4tb7jZA',
      thumbnail: 'https://img.youtube.com/vi/gGaq4tb7jZA/mqdefault.jpg',
      addedBy: 'core_four_fan',
      userAvatar: '🎬',
      timestamp: '52 min ago',
      comment: 'From The Crow soundtrack. Perfect grunge atmosphere.',
      likes: 38,
      replies: 12,
      recasts: 17
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
    },
    {
      id: '4',
      title: 'Sweet Dreams (Are Made of This)',
      artist: 'Eurythmics',
      duration: '3:36',
      source: 'youtube',
      sourceId: 'qeMFqkcPYcg',
      videoId: 'qeMFqkcPYcg',
      thumbnail: 'https://img.youtube.com/vi/qeMFqkcPYcg/mqdefault.jpg',
      addedBy: 'synth_queen',
      userAvatar: '👑',
      timestamp: '20 min ago',
      comment: 'Annie Lennox was iconic. This synth line is legendary.',
      likes: 44,
      replies: 8,
      recasts: 16
    },
    {
      id: '5',
      title: 'Tainted Love',
      artist: 'Soft Cell',
      duration: '2:43',
      source: 'youtube',
      sourceId: 'XZVpR3Pk-rQ',
      videoId: 'XZVpR3Pk-rQ',
      thumbnail: 'https://img.youtube.com/vi/XZVpR3Pk-rQ/mqdefault.jpg',
      addedBy: 'darkwave_fan',
      userAvatar: '🖤',
      timestamp: '25 min ago',
      comment: 'Cover that surpassed the original. Pure synth perfection.',
      likes: 35,
      replies: 6,
      recasts: 13
    },
    {
      id: '6',
      title: 'Don\'t You (Forget About Me)',
      artist: 'Simple Minds',
      duration: '4:20',
      source: 'youtube',
      sourceId: 'CdqoNKCCt7A',
      videoId: 'CdqoNKCCt7A',
      thumbnail: 'https://img.youtube.com/vi/CdqoNKCCt7A/mqdefault.jpg',
      addedBy: 'breakfast_club',
      userAvatar: '🏫',
      timestamp: '30 min ago',
      comment: 'The Breakfast Club anthem. Peak 80s movie moment.',
      likes: 52,
      replies: 11,
      recasts: 21
    },
    {
      id: '7',
      title: 'Personal Jesus',
      artist: 'Depeche Mode',
      duration: '4:56',
      source: 'youtube',
      sourceId: 'u1xrNaTO1bI',
      videoId: 'u1xrNaTO1bI',
      thumbnail: 'https://img.youtube.com/vi/u1xrNaTO1bI/mqdefault.jpg',
      addedBy: 'mode_devotee',
      userAvatar: '⛪',
      timestamp: '35 min ago',
      comment: 'Dave Gahan\'s voice + Martin Gore\'s songwriting = perfection.',
      likes: 47,
      replies: 9,
      recasts: 18
    },
    {
      id: '8',
      title: 'Cars',
      artist: 'Gary Numan',
      duration: '3:59',
      source: 'youtube',
      sourceId: 'Ldyx3KHOFXw',
      videoId: 'Ldyx3KHOFXw',
      thumbnail: 'https://img.youtube.com/vi/Ldyx3KHOFXw/mqdefault.jpg',
      addedBy: 'electronic_pioneer',
      userAvatar: '🚗',
      timestamp: '40 min ago',
      comment: 'Gary Numan invented the future. This track is timeless.',
      likes: 29,
      replies: 7,
      recasts: 12
    },
    {
      id: '9',
      title: 'Rio',
      artist: 'Duran Duran',
      duration: '5:31',
      source: 'youtube',
      sourceId: 'e3We6lRniCg',
      videoId: 'e3We6lRniCg',
      thumbnail: 'https://img.youtube.com/vi/e3We6lRniCg/mqdefault.jpg',
      addedBy: 'new_romantic',
      userAvatar: '💎',
      timestamp: '45 min ago',
      comment: 'John Taylor\'s bass line is absolutely infectious.',
      likes: 38,
      replies: 10,
      recasts: 15
    },
    {
      id: '10',
      title: 'True',
      artist: 'Spandau Ballet',
      duration: '5:31',
      source: 'youtube',
      sourceId: 'AR8D2yqgQ1U',
      videoId: 'AR8D2yqgQ1U',
      thumbnail: 'https://img.youtube.com/vi/AR8D2yqgQ1U/mqdefault.jpg',
      addedBy: 'gold_era',
      userAvatar: '✨',
      timestamp: '50 min ago',
      comment: 'Tony Hadley\'s voice was made for this song. Pure class.',
      likes: 33,
      replies: 8,
      recasts: 14
    },
    {
      id: '11',
      title: 'The Safety Dance',
      artist: 'Men Without Hats',
      duration: '2:43',
      source: 'youtube',
      sourceId: 'AjPau5QYtYs',
      videoId: 'AjPau5QYtYs',
      thumbnail: 'https://img.youtube.com/vi/AjPau5QYtYs/mqdefault.jpg',
      addedBy: 'dance_fever',
      userAvatar: '🕺',
      timestamp: '55 min ago',
      comment: 'We can dance if we want to! Peak new wave fun.',
      likes: 41,
      replies: 12,
      recasts: 19
    },
    {
      id: '12',
      title: 'I Ran (So Far Away)',
      artist: 'A Flock of Seagulls',
      duration: '4:09',
      source: 'youtube',
      sourceId: 'iIpfWORQWhU',
      videoId: 'iIpfWORQWhU',
      thumbnail: 'https://img.youtube.com/vi/iIpfWORQWhU/mqdefault.jpg',
      addedBy: 'space_age',
      userAvatar: '🚀',
      timestamp: '1 hr ago',
      comment: 'That hair, that synth sound... pure 80s sci-fi vibes.',
      likes: 26,
      replies: 5,
      recasts: 10
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
    },
    {
      id: '3',
      title: 'Weightless',
      artist: 'Marconi Union',
      duration: '8:10',
      source: 'youtube',
      sourceId: 'UfcAVejslrU',
      videoId: 'UfcAVejslrU',
      thumbnail: 'https://img.youtube.com/vi/UfcAVejslrU/mqdefault.jpg',
      addedBy: 'ambient_lover',
      userAvatar: '☁️',
      timestamp: '25 min ago',
      comment: 'Scientifically designed to reduce anxiety. Pure bliss.',
      likes: 31,
      replies: 4,
      recasts: 11
    },
    {
      id: '4',
      title: 'Holocene',
      artist: 'Bon Iver',
      duration: '5:36',
      source: 'youtube',
      sourceId: 'TWcyIpul8OE',
      videoId: 'TWcyIpul8OE',
      thumbnail: 'https://img.youtube.com/vi/TWcyIpul8OE/mqdefault.jpg',
      addedBy: 'indie_soul',
      userAvatar: '🏔️',
      timestamp: '30 min ago',
      comment: 'Justin Vernon\'s falsetto over gentle guitars. Heaven.',
      likes: 45,
      replies: 8,
      recasts: 16
    },
    {
      id: '5',
      title: 'Boards of Canada',
      artist: 'Roygbiv',
      duration: '2:31',
      source: 'youtube',
      sourceId: 'yT0gRc2c2wQ',
      videoId: 'yT0gRc2c2wQ',
      thumbnail: 'https://img.youtube.com/vi/yT0gRc2c2wQ/mqdefault.jpg',
      addedBy: 'idm_fan',
      userAvatar: '🌀',
      timestamp: '35 min ago',
      comment: 'Nostalgic electronic warmth. Perfect for contemplation.',
      likes: 27,
      replies: 6,
      recasts: 9
    },
    {
      id: '6',
      title: 'Mad World',
      artist: 'Gary Jules',
      duration: '3:07',
      source: 'youtube',
      sourceId: '4N3N1MlvVc4',
      videoId: '4N3N1MlvVc4',
      thumbnail: 'https://img.youtube.com/vi/4N3N1MlvVc4/mqdefault.jpg',
      addedBy: 'melancholy_mood',
      userAvatar: '🌧️',
      timestamp: '40 min ago',
      comment: 'Haunting cover that surpassed the original. Donnie Darko vibes.',
      likes: 52,
      replies: 11,
      recasts: 20
    },
    {
      id: '7',
      title: 'Intro',
      artist: 'The xx',
      duration: '2:12',
      source: 'youtube',
      sourceId: '_VPKfacgXao',
      videoId: '_VPKfacgXao',
      thumbnail: 'https://img.youtube.com/vi/_VPKfacgXao/mqdefault.jpg',
      addedBy: 'minimal_vibes',
      userAvatar: '⚫',
      timestamp: '45 min ago',
      comment: 'Minimalism perfected. Less is so much more.',
      likes: 39,
      replies: 7,
      recasts: 14
    },
    {
      id: '8',
      title: 'Pink Moon',
      artist: 'Nick Drake',
      duration: '2:04',
      source: 'youtube',
      sourceId: 'irq959oNVww',
      videoId: 'irq959oNVww',
      thumbnail: 'https://img.youtube.com/vi/irq959oNVww/mqdefault.jpg',
      addedBy: 'folk_dreamer',
      userAvatar: '🌸',
      timestamp: '50 min ago',
      comment: 'Nick Drake\'s whispered poetry. Timeless melancholy.',
      likes: 44,
      replies: 9,
      recasts: 17
    },
    {
      id: '9',
      title: 'Svefn-g-englar',
      artist: 'Sigur Rós',
      duration: '10:04',
      source: 'youtube',
      sourceId: '8LeQN249Jqw',
      videoId: '8LeQN249Jqw',
      thumbnail: 'https://img.youtube.com/vi/8LeQN249Jqw/mqdefault.jpg',
      addedBy: 'post_rock_lover',
      userAvatar: '🏔️',
      timestamp: '55 min ago',
      comment: 'Jónsi\'s ethereal voice creates pure magic. Iceland\'s gift to the world.',
      likes: 33,
      replies: 5,
      recasts: 12
    },
    {
      id: '10',
      title: 'Avril 14th',
      artist: 'Aphex Twin',
      duration: '2:05',
      source: 'youtube',
      sourceId: 'MBFXJw7n-fU',
      videoId: 'MBFXJw7n-fU',
      thumbnail: 'https://img.youtube.com/vi/MBFXJw7n-fU/mqdefault.jpg',
      addedBy: 'electronic_purist',
      userAvatar: '🎹',
      timestamp: '1 hr ago',
      comment: 'Richard D. James showing his gentle side. Beautifully haunting.',
      likes: 28,
      replies: 4,
      recasts: 10
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
    },
    {
      id: '3',
      title: 'Gold Digger',
      artist: 'Kanye West ft. Jamie Foxx',
      duration: '3:28',
      source: 'youtube',
      sourceId: '6vwNcNOTVzY',
      videoId: '6vwNcNOTVzY',
      thumbnail: 'https://img.youtube.com/vi/6vwNcNOTVzY/mqdefault.jpg',
      addedBy: 'kanye_stan',
      userAvatar: '👑',
      timestamp: '25 min ago',
      comment: 'Kanye sampling Ray Charles = pure genius. Jamie Foxx killed it.',
      likes: 43,
      replies: 10,
      recasts: 18
    },
    {
      id: '4',
      title: 'C.R.E.A.M.',
      artist: 'Wu-Tang Clan',
      duration: '4:12',
      source: 'youtube',
      sourceId: 'PBwAxmrE194',
      videoId: 'PBwAxmrE194',
      thumbnail: 'https://img.youtube.com/vi/PBwAxmrE194/mqdefault.jpg',
      addedBy: 'wu_tang_forever',
      userAvatar: '🗡️',
      timestamp: '30 min ago',
      comment: 'Cash rules everything around me. 36 chambers of wisdom.',
      likes: 56,
      replies: 14,
      recasts: 24
    },
    {
      id: '5',
      title: 'The Message',
      artist: 'Grandmaster Flash and the Furious Five',
      duration: '7:11',
      source: 'youtube',
      sourceId: 'gYMkEMCHtJ4',
      videoId: 'gYMkEMCHtJ4',
      thumbnail: 'https://img.youtube.com/vi/gYMkEMCHtJ4/mqdefault.jpg',
      addedBy: 'old_school_og',
      userAvatar: '📻',
      timestamp: '35 min ago',
      comment: 'This is how hip-hop became conscious. Revolutionary.',
      likes: 39,
      replies: 8,
      recasts: 15
    },
    {
      id: '6',
      title: 'N.Y. State of Mind',
      artist: 'Nas',
      duration: '4:54',
      source: 'youtube',
      sourceId: 'hI8A14Qcv68',
      videoId: 'hI8A14Qcv68',
      thumbnail: 'https://img.youtube.com/vi/hI8A14Qcv68/mqdefault.jpg',
      addedBy: 'lyrical_genius',
      userAvatar: '🗽',
      timestamp: '40 min ago',
      comment: 'Nas painted Queens with his words. Poetry in motion.',
      likes: 47,
      replies: 11,
      recasts: 19
    },
    {
      id: '7',
      title: 'Shook Ones Pt. II',
      artist: 'Mobb Deep',
      duration: '4:26',
      source: 'youtube',
      sourceId: '0NUX4tW5pps',
      videoId: '0NUX4tW5pps',
      thumbnail: 'https://img.youtube.com/vi/0NUX4tW5pps/mqdefault.jpg',
      addedBy: 'queensbridge_kid',
      userAvatar: '🏙️',
      timestamp: '45 min ago',
      comment: 'Havoc\'s production + Prodigy\'s flow = perfection.',
      likes: 41,
      replies: 9,
      recasts: 17
    },
    {
      id: '8',
      title: 'Lose Yourself',
      artist: 'Eminem',
      duration: '5:26',
      source: 'youtube',
      sourceId: '_Yhyp-_hX2s',
      videoId: '_Yhyp-_hX2s',
      thumbnail: 'https://img.youtube.com/vi/_Yhyp-_hX2s/mqdefault.jpg',
      addedBy: 'slim_shady_fan',
      userAvatar: '🎬',
      timestamp: '50 min ago',
      comment: 'Oscar-winning bars. Marshall at his absolute peak.',
      likes: 62,
      replies: 15,
      recasts: 28
    },
    {
      id: '9',
      title: 'Dear Mama',
      artist: '2Pac',
      duration: '4:38',
      source: 'youtube',
      sourceId: 'Mb1ZvUDvLDY',
      videoId: 'Mb1ZvUDvLDY',
      thumbnail: 'https://img.youtube.com/vi/Mb1ZvUDvLDY/mqdefault.jpg',
      addedBy: 'makaveli_disciple',
      userAvatar: '🌹',
      timestamp: '55 min ago',
      comment: '2Pac\'s love letter to his mother. Pure heart on wax.',
      likes: 54,
      replies: 13,
      recasts: 22
    },
    {
      id: '10',
      title: 'Rapper\'s Delight',
      artist: 'Sugarhill Gang',
      duration: '14:35',
      source: 'youtube',
      sourceId: 'rKTUAESacQM',
      videoId: 'rKTUAESacQM',
      thumbnail: 'https://img.youtube.com/vi/rKTUAESacQM/mqdefault.jpg',
      addedBy: 'hip_hop_historian',
      userAvatar: '📚',
      timestamp: '1 hr ago',
      comment: 'Where it all began. The song that started a revolution.',
      likes: 33,
      replies: 7,
      recasts: 14
    },
    {
      id: '11',
      title: 'Ice Ice Baby',
      artist: 'Vanilla Ice',
      duration: '4:30',
      source: 'youtube',
      sourceId: 'rog8ou-ZepE',
      videoId: 'rog8ou-ZepE',
      thumbnail: 'https://img.youtube.com/vi/rog8ou-ZepE/mqdefault.jpg',
      addedBy: '90s_nostalgia',
      userAvatar: '❄️',
      timestamp: '1 hr 5 min ago',
      comment: 'Love it or hate it, this was everywhere in \'90. Guilty pleasure.',
      likes: 28,
      replies: 12,
      recasts: 11
    },
    {
      id: '12',
      title: 'Hypnotize',
      artist: 'The Notorious B.I.G.',
      duration: '3:50',
      source: 'youtube',
      sourceId: 'glEiPXAYE-U',
      videoId: 'glEiPXAYE-U',
      thumbnail: 'https://img.youtube.com/vi/glEiPXAYE-U/mqdefault.jpg',
      addedBy: 'brooklyn_legend',
      userAvatar: '👑',
      timestamp: '1 hr 10 min ago',
      comment: 'Biggie\'s flow was hypnotic. Ready to Die is immortal.',
      likes: 49,
      replies: 11,
      recasts: 20
    },
    {
      id: '13',
      title: 'California Love',
      artist: '2Pac ft. Dr. Dre',
      duration: '4:17',
      source: 'youtube',
      sourceId: '5wBTdfAkqGU',
      videoId: '5wBTdfAkqGU',
      thumbnail: 'https://img.youtube.com/vi/5wBTdfAkqGU/mqdefault.jpg',
      addedBy: 'west_coast_rider',
      userAvatar: '🌴',
      timestamp: '1 hr 15 min ago',
      comment: '2Pac + Dre = West Coast perfection. That Roger Troutman talk box!',
      likes: 58,
      replies: 16,
      recasts: 25
    }
  ]
};

// Signals and stores
export const [currentPlaylistId, setCurrentPlaylistId] = createSignal<string>('90s_hits');
export const [playingPlaylistId, setPlayingPlaylistId] = createSignal<string>('90s_hits'); // Tracks which playlist is actually playing
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
