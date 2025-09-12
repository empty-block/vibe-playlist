import { Track, Playlist, TrackSource } from '../stores/playerStore';

export interface User {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  bio: string;
  followers: number;
  following: number;
  tracksSubmitted: number;
  joinedDate: string;
  badgeTitle: string;
  badgeIcon: string;
}

// 15 diverse fake users who submit tracks to Jamzy
export const mockUsers: User[] = [
  {
    id: 'user_1',
    username: 'grunge_master_93',
    displayName: 'Alex Stone',
    avatar: '🎸',
    bio: 'Seattle-born, grunge-raised. Collecting vinyl since \'92.',
    followers: 2347,
    following: 892,
    tracksSubmitted: 127,
    joinedDate: '2023-03-15',
    badgeTitle: 'Elite Curator',
    badgeIcon: '⭐'
  },
  {
    id: 'user_2', 
    username: 'synth_prophet_85',
    displayName: 'Maya Neon',
    avatar: '🌈',
    bio: 'Synthwave evangelist. If it has neon lights and synthesizers, I\'m here for it.',
    followers: 1894,
    following: 654,
    tracksSubmitted: 95,
    joinedDate: '2023-01-20',
    badgeTitle: 'Master Curator',
    badgeIcon: '🏆'
  },
  {
    id: 'user_3',
    username: 'underground_oracle',
    displayName: 'Sam Hidden',
    avatar: '🔮',
    bio: 'Finding gems before they\'re cool. Deep cuts and rare finds specialist.',
    followers: 3721,
    following: 412,
    tracksSubmitted: 203,
    joinedDate: '2022-11-08',
    badgeTitle: 'Hidden Gems Expert', 
    badgeIcon: '💎'
  },
  {
    id: 'user_4',
    username: 'vinyl_archaeologist',
    displayName: 'Dr. Beats',
    avatar: '💿',
    bio: 'Digging through crates since the analog age. Rare records & forgotten classics.',
    followers: 1456,
    following: 234,
    tracksSubmitted: 156,
    joinedDate: '2023-02-12',
    badgeTitle: 'Rare Finds Specialist',
    badgeIcon: '📀'
  },
  {
    id: 'user_5',
    username: 'indie_wanderer',
    displayName: 'Riley Moon',
    avatar: '🌙',
    bio: 'Indie folk & dreamy shoegaze. Music for late night walks and coffee shops.',
    followers: 987,
    following: 567,
    tracksSubmitted: 89,
    joinedDate: '2023-04-03',
    badgeTitle: 'Dream Curator',
    badgeIcon: '☁️'
  },
  {
    id: 'user_6',
    username: 'beats_historian',
    displayName: 'Marcus Flow',
    avatar: '🎤',
    bio: 'Hip-hop head since day one. From golden age to new school, I got the tracks.',
    followers: 2891,
    following: 1245,
    tracksSubmitted: 189,
    joinedDate: '2022-12-19',
    badgeTitle: 'Culture Keeper',
    badgeIcon: '👑'
  },
  {
    id: 'user_7',
    username: 'electronic_voyager',
    displayName: 'Zoe Circuit',
    avatar: '🎛️',
    bio: 'From ambient to techno, IDM to house. Electronic music is my universe.',
    followers: 1234,
    following: 789,
    tracksSubmitted: 145,
    joinedDate: '2023-05-21',
    badgeTitle: 'Digital Explorer',
    badgeIcon: '🚀'
  },
  {
    id: 'user_8',
    username: 'jazz_wanderer',
    displayName: 'Charlie Smooth',
    avatar: '☕',
    bio: 'Smooth jazz, bebop, fusion. Coffee shop vibes and sophisticated grooves.',
    followers: 756,
    following: 345,
    tracksSubmitted: 67,
    joinedDate: '2023-06-14',
    badgeTitle: 'Smooth Operator',
    badgeIcon: '🎷'
  },
  {
    id: 'user_9',
    username: 'rock_titan_77',
    displayName: 'Thunder Rodriguez',
    avatar: '🤘',
    bio: 'Stadium rock, classic metal, arena anthems. If it doesn\'t make you headbang, I don\'t want it.',
    followers: 3456,
    following: 1876,
    tracksSubmitted: 178,
    joinedDate: '2022-10-05',
    badgeTitle: 'Rock God',
    badgeIcon: '⚡'
  },
  {
    id: 'user_10',
    username: 'lofi_dreamer',
    displayName: 'Casey Zen',
    avatar: '🍃',
    bio: 'Lo-fi beats, chill hop, study music. Creating soundscapes for focused minds.',
    followers: 4567,
    following: 234,
    tracksSubmitted: 234,
    joinedDate: '2023-01-08',
    badgeTitle: 'Chill Master',
    badgeIcon: '🧘'
  },
  {
    id: 'user_11',
    username: 'punk_rebel_84',
    displayName: 'Riot Kim',
    avatar: '💥',
    bio: 'Punk rock never died. Fast, loud, and uncompromising since \'84.',
    followers: 1678,
    following: 892,
    tracksSubmitted: 134,
    joinedDate: '2023-03-29',
    badgeTitle: 'Chaos Curator',
    badgeIcon: '🔥'
  },
  {
    id: 'user_12',
    username: 'soul_keeper',
    displayName: 'Diana Groove',
    avatar: '✨',
    bio: 'Soul, funk, R&B. Keeping the groove alive with tracks that move your spirit.',
    followers: 2134,
    following: 678,
    tracksSubmitted: 167,
    joinedDate: '2022-11-23',
    badgeTitle: 'Soul Guardian',
    badgeIcon: '💫'
  },
  {
    id: 'user_13',
    username: 'metal_forge',
    displayName: 'Iron Mike',
    avatar: '⚔️',
    bio: 'Forging playlists in the fires of metal. From black to death to power metal.',
    followers: 1897,
    following: 1234,
    tracksSubmitted: 145,
    joinedDate: '2023-02-27',
    badgeTitle: 'Metal Smith',
    badgeIcon: '🔨'
  },
  {
    id: 'user_14',
    username: 'ambient_space',
    displayName: 'Luna Orbit',
    avatar: '🌌',
    bio: 'Ambient, drone, space music. Soundtracks for inner and outer space exploration.',
    followers: 892,
    following: 456,
    tracksSubmitted: 78,
    joinedDate: '2023-07-11',
    badgeTitle: 'Space Curator',
    badgeIcon: '🛸'
  },
  {
    id: 'user_15',
    username: 'world_nomad',
    displayName: 'Kai Global',
    avatar: '🌍',
    bio: 'World music collector. From Afrobeat to K-pop, celebrating global sounds.',
    followers: 2765,
    following: 1567,
    tracksSubmitted: 198,
    joinedDate: '2022-09-16',
    badgeTitle: 'Global Explorer',
    badgeIcon: '🗺️'
  },
  // Current logged-in user
  {
    id: 'current_user',
    username: 'my_jamzy',
    displayName: 'My JAMZY',
    avatar: '🎵',
    bio: 'Music lover • JAMZY enthusiast • Always discovering new tracks',
    followers: 156,
    following: 89,
    tracksSubmitted: 23,
    joinedDate: '2024-01-15',
    badgeTitle: 'Music Explorer',
    badgeIcon: '🎵'
  }
];

// Helper to get user by username
export const getUserByUsername = (username: string): User | undefined => {
  return mockUsers.find(user => user.username === username);
};

// Helper to get user by id
export const getUserById = (id: string): User | undefined => {
  return mockUsers.find(user => user.id === id);
};

// Track submissions - each user has submitted 10-20 tracks
export const mockTrackSubmissions: Track[] = [
  // grunge_master_93 submissions (15 tracks)
  {
    id: 'track_1',
    title: 'Smells Like Teen Spirit',
    artist: 'Nirvana',
    duration: '5:01',
    source: 'youtube',
    sourceId: 'hTWKbfoikeg',
    thumbnail: 'https://img.youtube.com/vi/hTWKbfoikeg/mqdefault.jpg',
    addedBy: 'grunge_master_93',
    userAvatar: '🎸',
    timestamp: '2 hours ago',
    comment: 'This song changed everything. Peak 90s grunge energy! 🔥',
    likes: 89,
    replies: 23,
    recasts: 45,
    tags: ['grunge', '90s', 'alternative', 'rock']
  },
  {
    id: 'track_2', 
    title: 'Come As You Are',
    artist: 'Nirvana',
    duration: '3:39',
    source: 'spotify',
    sourceId: '2RsAajgo0g7bMCHxwH3Sk0',
    thumbnail: 'https://i.scdn.co/image/ab67616d0000b273e175a19e530c898d167d39bf',
    addedBy: 'grunge_master_93',
    userAvatar: '🎸',
    timestamp: '4 hours ago',
    comment: 'Another Nirvana classic. Kurt\'s guitar tone is unmatched.',
    likes: 67,
    replies: 18,
    recasts: 32,
    tags: ['nirvana', 'grunge', 'classic']
  },
  {
    id: 'track_3',
    title: 'Black',
    artist: 'Pearl Jam',
    duration: '5:43',
    source: 'youtube',
    sourceId: 'j1L5Qr2UKLs', 
    thumbnail: 'https://img.youtube.com/vi/j1L5Qr2UKLs/mqdefault.jpg',
    addedBy: 'grunge_master_93',
    userAvatar: '🎸',
    timestamp: '6 hours ago',
    comment: 'Eddie Vedder\'s vocals hit different on this one. Pure emotion.',
    likes: 74,
    replies: 21,
    recasts: 38
  },
  {
    id: 'track_4',
    title: 'Hunger Strike',
    artist: 'Temple of the Dog',
    duration: '4:03',
    source: 'youtube',
    sourceId: 'VUb450Alpps',
    thumbnail: 'https://img.youtube.com/vi/VUb450Alpps/mqdefault.jpg',
    addedBy: 'grunge_master_93',
    userAvatar: '🎸',
    timestamp: '8 hours ago',
    comment: 'Chris Cornell and Eddie Vedder together. Doesn\'t get better.',
    likes: 56,
    replies: 15,
    recasts: 29
  },
  {
    id: 'track_5',
    title: 'Alive',
    artist: 'Pearl Jam',
    duration: '5:41',
    source: 'spotify',
    sourceId: '4qMzPFJQD3KoHT0m3wQzNl',
    thumbnail: 'https://i.scdn.co/image/ab67616d0000b273f8d52239d59dd6bfbf3c5b56',
    addedBy: 'grunge_master_93', 
    userAvatar: '🎸',
    timestamp: '10 hours ago',
    comment: 'First Pearl Jam song I ever heard. Still gives me chills.',
    likes: 62,
    replies: 19,
    recasts: 34
  },

  // synth_prophet_85 submissions (12 tracks)
  {
    id: 'track_6',
    title: 'Midnight City',
    artist: 'M83',
    duration: '4:03',
    source: 'youtube',
    sourceId: 'dX3k_QDnzHE',
    thumbnail: 'https://img.youtube.com/vi/dX3k_QDnzHE/mqdefault.jpg',
    addedBy: 'synth_prophet_85',
    userAvatar: '🌈',
    timestamp: '1 hour ago',
    comment: 'That saxophone solo at the end... pure synthwave perfection! 🌈',
    likes: 145,
    replies: 34,
    recasts: 67
  },
  {
    id: 'track_7',
    title: 'Digital Love',
    artist: 'Daft Punk',
    duration: '4:58',
    source: 'spotify',
    sourceId: '3O2dn2O0rhQD6HSOwStnQu',
    thumbnail: 'https://i.scdn.co/image/ab67616d0000b273b3c8a38aad487e9ba3e21dc5',
    addedBy: 'synth_prophet_85',
    userAvatar: '🌈',
    timestamp: '3 hours ago',
    comment: 'Daft Punk mastered the art of electronic emotion. RIP robots 🤖',
    likes: 123,
    replies: 28,
    recasts: 56
  },
  {
    id: 'track_8',
    title: 'Take On Me',
    artist: 'a-ha',
    duration: '3:46',
    source: 'youtube',
    sourceId: 'djV11Xbc914',
    thumbnail: 'https://img.youtube.com/vi/djV11Xbc914/mqdefault.jpg',
    addedBy: 'synth_prophet_85',
    userAvatar: '🌈',
    timestamp: '5 hours ago',
    comment: '80s synthpop at its absolute peak. That falsetto! 🎹',
    likes: 198,
    replies: 42,
    recasts: 89
  },

  // More grunge_master_93 submissions
  {
    id: 'track_11',
    title: 'Jeremy',
    artist: 'Pearl Jam',
    duration: '5:19',
    source: 'youtube',
    sourceId: 'MS91knuzoOA',
    thumbnail: 'https://img.youtube.com/vi/MS91knuzoOA/mqdefault.jpg',
    addedBy: 'grunge_master_93',
    userAvatar: '🎸',
    timestamp: '12 hours ago',
    comment: 'Such a heavy topic, but the music video was iconic.',
    likes: 78,
    replies: 25,
    recasts: 41
  },
  {
    id: 'track_12',
    title: 'Man in the Box',
    artist: 'Alice in Chains',
    duration: '4:46',
    source: 'spotify',
    sourceId: '64liTbdXUaU7EAEM6eQwIA',
    thumbnail: 'https://i.scdn.co/image/ab67616d0000b273f8d52239d59dd6bfbf3c5b56',
    addedBy: 'grunge_master_93',
    userAvatar: '🎸',
    timestamp: '14 hours ago',
    comment: 'Layne Staley had the most haunting voice in grunge.',
    likes: 65,
    replies: 17,
    recasts: 33
  },
  {
    id: 'track_13',
    title: 'Touch Me I\'m Sick',
    artist: 'Mudhoney',
    duration: '2:35',
    source: 'youtube',
    sourceId: 'c8qrwON1-QE',
    thumbnail: 'https://img.youtube.com/vi/c8qrwON1-QE/mqdefault.jpg',
    addedBy: 'grunge_master_93',
    userAvatar: '🎸',
    timestamp: '16 hours ago',
    comment: 'Raw garage punk that influenced everything that came after.',
    likes: 45,
    replies: 12,
    recasts: 28
  },
  {
    id: 'track_14',
    title: 'Spoonman',
    artist: 'Soundgarden',
    duration: '4:06',
    source: 'spotify',
    sourceId: '2PuKRJsNP8mCDEOz0Q3vPF',
    thumbnail: 'https://i.scdn.co/image/ab67616d0000b273a00b11c129b27a88fc72f36b',
    addedBy: 'grunge_master_93',
    userAvatar: '🎸',
    timestamp: '18 hours ago',
    comment: 'Chris Cornell was a god. RIP to the legend.',
    likes: 92,
    replies: 34,
    recasts: 57
  },
  {
    id: 'track_15',
    title: 'Would?',
    artist: 'Alice in Chains',
    duration: '3:28',
    source: 'youtube',
    sourceId: 'Nco_kh8xJDs',
    thumbnail: 'https://img.youtube.com/vi/Nco_kh8xJDs/mqdefault.jpg',
    addedBy: 'grunge_master_93',
    userAvatar: '🎸',
    timestamp: '20 hours ago',
    comment: 'From the Singles soundtrack. Dark and beautiful.',
    likes: 73,
    replies: 21,
    recasts: 39
  },

  // More synth_prophet_85 submissions
  {
    id: 'track_16',
    title: 'Blinding Lights',
    artist: 'The Weeknd',
    duration: '3:20',
    source: 'spotify',
    sourceId: '0VjIjW4GlUZAMYd2vXMi3b',
    thumbnail: 'https://i.scdn.co/image/ab67616d0000b2738863bc11d2aa12b54f5aeb36',
    addedBy: 'synth_prophet_85',
    userAvatar: '🌈',
    timestamp: '7 hours ago',
    comment: 'Modern synthwave perfection. That 80s influence is so clean! ✨',
    likes: 167,
    replies: 45,
    recasts: 78
  },
  {
    id: 'track_17',
    title: 'Blue Monday',
    artist: 'New Order',
    duration: '7:30',
    source: 'youtube',
    sourceId: 'FYH8DsU2WCk',
    thumbnail: 'https://img.youtube.com/vi/FYH8DsU2WCk/mqdefault.jpg',
    addedBy: 'synth_prophet_85',
    userAvatar: '🌈',
    timestamp: '9 hours ago',
    comment: 'The blueprint for electronic dance music. Timeless! 🕺',
    likes: 134,
    replies: 37,
    recasts: 65
  },
  {
    id: 'track_18',
    title: 'Drive',
    artist: 'Kavinsky',
    duration: '4:03',
    source: 'spotify',
    sourceId: '4gzJDlH3X8CaGdBJoTIrSz',
    thumbnail: 'https://i.scdn.co/image/ab67616d0000b273ee2fe4a7b285d3817b470859',
    addedBy: 'synth_prophet_85',
    userAvatar: '🌈',
    timestamp: '11 hours ago',
    comment: 'Pure outrun vibes. Makes me want to drive at night forever.',
    likes: 156,
    replies: 41,
    recasts: 73
  },
  {
    id: 'track_19',
    title: 'Sunset',
    artist: 'The Midnight',
    duration: '3:49',
    source: 'youtube',
    sourceId: 'VcGG-VfhNt0',
    thumbnail: 'https://img.youtube.com/vi/VcGG-VfhNt0/mqdefault.jpg',
    addedBy: 'synth_prophet_85',
    userAvatar: '🌈',
    timestamp: '13 hours ago',
    comment: 'Modern synthwave at its most emotional. Love these guys.',
    likes: 98,
    replies: 29,
    recasts: 52
  },
  {
    id: 'track_20',
    title: 'Rio',
    artist: 'Duran Duran',
    duration: '5:31',
    source: 'spotify',
    sourceId: '1Q9FXbMbm6FGjq4g9nN7Tk',
    thumbnail: 'https://i.scdn.co/image/ab67616d0000b273c8a1169782cf4d18c1894c88',
    addedBy: 'synth_prophet_85',
    userAvatar: '🌈',
    timestamp: '15 hours ago',
    comment: '80s new wave perfection. Those synths are everything! 🌴',
    likes: 112,
    replies: 33,
    recasts: 58
  },

  // underground_oracle submissions (18 tracks)
  {
    id: 'track_21',
    title: 'Fourth of July',
    artist: 'Sufjan Stevens',
    duration: '4:36',
    source: 'spotify',
    sourceId: '59KOoHFcw5XfICnO57holu',
    thumbnail: 'https://i.scdn.co/image/ab67616d0000b2734ae1c4c5c45aabe565499163',
    addedBy: 'underground_oracle',
    userAvatar: '🔮',
    timestamp: '30 minutes ago',
    comment: 'Hidden emotional masterpiece. Sufjan never misses. 💎',
    likes: 67,
    replies: 23,
    recasts: 41
  },
  {
    id: 'track_22',
    title: 'Holocene',
    artist: 'Bon Iver',
    duration: '5:36',
    source: 'youtube',
    sourceId: 'TWcyIpul8OE',
    thumbnail: 'https://img.youtube.com/vi/TWcyIpul8OE/mqdefault.jpg',
    addedBy: 'underground_oracle',
    userAvatar: '🔮',
    timestamp: '2 hours ago',
    comment: 'Justin Vernon\'s falsetto over these production layers... transcendent.',
    likes: 89,
    replies: 31,
    recasts: 52
  },
  {
    id: 'track_23',
    title: 'White Winter Hymnal',
    artist: 'Fleet Foxes',
    duration: '2:27',
    source: 'youtube',
    sourceId: 'DrQRS40OKNE',
    thumbnail: 'https://img.youtube.com/vi/DrQRS40OKNE/mqdefault.jpg',
    addedBy: 'underground_oracle',
    userAvatar: '🔮',
    timestamp: '4 hours ago',
    comment: 'Indie folk harmony perfection. These vocals layer so beautifully.',
    likes: 76,
    replies: 28,
    recasts: 44
  },
  {
    id: 'track_24',
    title: 'Two Weeks',
    artist: 'FKA twigs',
    duration: '4:04',
    source: 'spotify',
    sourceId: '4JJhSUXjdgFif7bfQUvthx',
    thumbnail: 'https://i.scdn.co/image/ab67616d0000b273c14e0cddfab4c6ec82a05b8c',
    addedBy: 'underground_oracle',
    userAvatar: '🔮',
    timestamp: '6 hours ago',
    comment: 'Ethereal R&B that sounds like nothing else. Pure artistry.',
    likes: 94,
    replies: 35,
    recasts: 61
  },
  {
    id: 'track_25',
    title: 'Myth',
    artist: 'Beach House',
    duration: '4:18',
    source: 'youtube',
    sourceId: 'FuvWc3ToDHg',
    thumbnail: 'https://img.youtube.com/vi/FuvWc3ToDHg/mqdefault.jpg',
    addedBy: 'underground_oracle',
    userAvatar: '🔮',
    timestamp: '8 hours ago',
    comment: 'Dream pop at its most hypnotic. Gets better every listen.',
    likes: 82,
    replies: 26,
    recasts: 47
  },

  // vinyl_archaeologist submissions (14 tracks)
  {
    id: 'track_26',
    title: 'Maggot Brain',
    artist: 'Funkadelic',
    duration: '10:20',
    source: 'spotify',
    sourceId: '2PYNiCCqWoGjdQIJhU8dOq',
    thumbnail: 'https://i.scdn.co/image/ab67616d0000b2738a385b4b00c2de766c4c8b85',
    addedBy: 'vinyl_archaeologist',
    userAvatar: '💿',
    timestamp: '1 hour ago',
    comment: 'Eddie Hazel\'s guitar solo is 10 minutes of pure soul. Essential listening.',
    likes: 123,
    replies: 45,
    recasts: 67
  },
  {
    id: 'track_27',
    title: 'Love Supreme',
    artist: 'John Coltrane',
    duration: '7:42',
    source: 'youtube',
    sourceId: 'clC6cgoh1sU',
    thumbnail: 'https://img.youtube.com/vi/clC6cgoh1sU/mqdefault.jpg',
    addedBy: 'vinyl_archaeologist',
    userAvatar: '💿',
    timestamp: '3 hours ago',
    comment: 'Spiritual jazz masterpiece. Coltrane at his most transcendent.',
    likes: 87,
    replies: 32,
    recasts: 49
  },
  {
    id: 'track_28',
    title: 'The Creator Has a Master Plan',
    artist: 'Pharoah Sanders',
    duration: '32:44',
    source: 'spotify',
    sourceId: '6hOHgpsYEQkQx4NtvbJjnx',
    thumbnail: 'https://i.scdn.co/image/ab67616d0000b273f99077bccc8e8f9c45c5dac0',
    addedBy: 'vinyl_archaeologist',
    userAvatar: '💿',
    timestamp: '5 hours ago',
    comment: 'Epic spiritual jazz journey. Leon Thomas\' vocals are otherworldly.',
    likes: 65,
    replies: 21,
    recasts: 38
  },

  // beats_historian submissions (16 tracks)
  {
    id: 'track_29',
    title: 'Nuthin\' But a \'G\' Thang',
    artist: 'Dr. Dre ft. Snoop Dogg',
    duration: '3:58',
    source: 'youtube',
    sourceId: 'aeL9gagV_VA',
    thumbnail: 'https://img.youtube.com/vi/aeL9gagV_VA/mqdefault.jpg',
    addedBy: 'beats_historian',
    userAvatar: '🎤',
    timestamp: '45 minutes ago',
    comment: 'G-funk perfection. This beat changed the game forever. 🔥',
    likes: 156,
    replies: 48,
    recasts: 89
  },
  {
    id: 'track_30',
    title: 'N.Y. State of Mind',
    artist: 'Nas',
    duration: '4:54',
    source: 'spotify',
    sourceId: '7lmeHLHBe4nmXzuXc0HDjk',
    thumbnail: 'https://i.scdn.co/image/ab67616d0000b273f5c6c7b35fdff7c57a5b6841',
    addedBy: 'beats_historian',
    userAvatar: '🎤',
    timestamp: '2 hours ago',
    comment: 'Illmatic is the greatest hip-hop album ever. This track proves it.',
    likes: 134,
    replies: 42,
    recasts: 71
  },
  {
    id: 'track_31',
    title: 'The World is Yours',
    artist: 'Nas',
    duration: '4:50',
    source: 'youtube',
    sourceId: 'e5PnuIRnJW8',
    thumbnail: 'https://img.youtube.com/vi/e5PnuIRnJW8/mqdefault.jpg',
    addedBy: 'beats_historian',
    userAvatar: '🎤',
    timestamp: '4 hours ago',
    comment: 'Pete Rock production at its finest. That piano sample! 🎹',
    likes: 118,
    replies: 36,
    recasts: 63
  },

  // Current user (my_jamzy) submissions (12 tracks)
  {
    id: 'track_32',
    title: 'Fake Plastic Trees',
    artist: 'Radiohead',
    duration: '4:50',
    source: 'youtube',
    sourceId: 'n5h0qHwNrHk',
    thumbnail: 'https://img.youtube.com/vi/n5h0qHwNrHk/mqdefault.jpg',
    addedBy: 'my_jamzy',
    userAvatar: '🎵',
    timestamp: '1 hour ago',
    comment: 'This song hits different every time I listen to it. Thom Yorke\'s vocals are haunting.',
    likes: 15,
    replies: 4,
    recasts: 7
  },
  {
    id: 'track_33',
    title: 'Paranoid Android',
    artist: 'Radiohead',
    duration: '6:23',
    source: 'spotify',
    sourceId: '6DgdZNlAC1stgCGEkr2NRH',
    thumbnail: 'https://i.scdn.co/image/ab67616d0000b273c8b444df094279e70d0ed856',
    addedBy: 'my_jamzy',
    userAvatar: '🎵',
    timestamp: '3 hours ago',
    comment: 'OK Computer was ahead of its time. This track is a masterpiece.',
    likes: 28,
    replies: 9,
    recasts: 14
  },
  {
    id: 'track_34',
    title: 'Everything in Its Right Place',
    artist: 'Radiohead',
    duration: '4:11',
    source: 'youtube',
    sourceId: 'onRk0sjSgFU',
    thumbnail: 'https://img.youtube.com/vi/onRk0sjSgFU/mqdefault.jpg',
    addedBy: 'my_jamzy',
    userAvatar: '🎵',
    timestamp: '5 hours ago',
    comment: 'Kid A changed how I think about music. Electronic meets alternative perfectly.',
    likes: 22,
    replies: 6,
    recasts: 11
  },
  {
    id: 'track_35',
    title: 'Mr. Brightside',
    artist: 'The Killers',
    duration: '3:42',
    source: 'spotify',
    sourceId: '003vvx7Niy0yvhvHt4a68B',
    thumbnail: 'https://i.scdn.co/image/ab67616d0000b273ccdddd46119a4ff53eaf1f5d',
    addedBy: 'my_jamzy',
    userAvatar: '🎵',
    timestamp: '8 hours ago',
    comment: 'Still one of the best anthems ever made. Never gets old!',
    likes: 31,
    replies: 12,
    recasts: 18
  },
  {
    id: 'track_36',
    title: 'Somebody Told Me',
    artist: 'The Killers',
    duration: '3:17',
    source: 'youtube',
    sourceId: 'Y5fBdpreJiU',
    thumbnail: 'https://img.youtube.com/vi/Y5fBdpreJiU/mqdefault.jpg',
    addedBy: 'my_jamzy',
    userAvatar: '🎵',
    timestamp: '12 hours ago',
    comment: 'Hot Fuss was such an incredible debut album. Peak 2000s energy.',
    likes: 19,
    replies: 7,
    recasts: 9
  },
  {
    id: 'track_37',
    title: 'Time to Dance',
    artist: 'The Sounds',
    duration: '3:42',
    source: 'youtube',
    sourceId: 'F_6IjeprfEs',
    thumbnail: 'https://img.youtube.com/vi/F_6IjeprfEs/mqdefault.jpg',
    addedBy: 'my_jamzy',
    userAvatar: '🎵',
    timestamp: '1 day ago',
    comment: 'Swedish rock with that garage punk attitude. So underrated!',
    likes: 12,
    replies: 3,
    recasts: 6
  },
  {
    id: 'track_38',
    title: 'Last Nite',
    artist: 'The Strokes',
    duration: '3:17',
    source: 'spotify',
    sourceId: '3jZ78a5VC49kpUJNHTc2pV',
    thumbnail: 'https://i.scdn.co/image/ab67616d0000b273d2c283e2c3095985e9a96e5a',
    addedBy: 'my_jamzy',
    userAvatar: '🎵',
    timestamp: '1 day ago',
    comment: 'Is This It revived rock music. Julian Casablancas is a genius.',
    likes: 26,
    replies: 8,
    recasts: 13
  },
  {
    id: 'track_39',
    title: 'Hard to Explain',
    artist: 'The Strokes',
    duration: '3:47',
    source: 'youtube',
    sourceId: 'BXkm6h6uq0k',
    thumbnail: 'https://img.youtube.com/vi/BXkm6h6uq0k/mqdefault.jpg',
    addedBy: 'my_jamzy',
    userAvatar: '🎵',
    timestamp: '2 days ago',
    comment: 'That guitar tone is perfect. NYC indie rock at its finest.',
    likes: 18,
    replies: 5,
    recasts: 8
  },
  {
    id: 'track_40',
    title: 'Seven Nation Army',
    artist: 'The White Stripes',
    duration: '3:51',
    source: 'spotify',
    sourceId: '3dPQuX8Gs42Y7b454ybpMR',
    thumbnail: 'https://i.scdn.co/image/ab67616d0000b2739b9b36b0e22870b9f542d937',
    addedBy: 'my_jamzy',
    userAvatar: '🎵',
    timestamp: '2 days ago',
    comment: 'That bassline is iconic. Everyone knows this one!',
    likes: 45,
    replies: 16,
    recasts: 22
  },
  {
    id: 'track_41',
    title: 'Fell in Love with a Girl',
    artist: 'The White Stripes',
    duration: '1:50',
    source: 'youtube',
    sourceId: 'fTH71AAxXmM',
    thumbnail: 'https://img.youtube.com/vi/fTH71AAxXmM/mqdefault.jpg',
    addedBy: 'my_jamzy',
    userAvatar: '🎵',
    timestamp: '3 days ago',
    comment: 'Short, sweet, and perfect. Jack White\'s guitar work is incredible.',
    likes: 21,
    replies: 6,
    recasts: 10
  },
  {
    id: 'track_42',
    title: 'Feel Good Hit of the Summer',
    artist: 'Queens of the Stone Age',
    duration: '2:43',
    source: 'spotify',
    sourceId: '4qRBjrAYvOOq0CyYPuabyA',
    thumbnail: 'https://i.scdn.co/image/ab67616d0000b273a53cc6fbc22f9fb8b7ac6ab8',
    addedBy: 'my_jamzy',
    userAvatar: '🎵',
    timestamp: '3 days ago',
    comment: 'Desert rock perfection. Josh Homme is a riff master.',
    likes: 17,
    replies: 4,
    recasts: 8
  },
  {
    id: 'track_43',
    title: 'Go With the Flow',
    artist: 'Queens of the Stone Age',
    duration: '3:07',
    source: 'youtube',
    sourceId: 'DcHKOC64KnE',
    thumbnail: 'https://img.youtube.com/vi/DcHKOC64KnE/mqdefault.jpg',
    addedBy: 'my_jamzy',
    userAvatar: '🎵',
    timestamp: '4 days ago',
    comment: 'Songs for the Deaf is a masterpiece. This track flows so well.',
    likes: 24,
    replies: 7,
    recasts: 12
  }
];

// This is just a sample - in a real app you'd have hundreds of tracks from all 15 users

// Mock playlists - built from submitted tracks only
export const mockPlaylists: Playlist[] = [
  {
    id: 'grunge_master_jams',
    name: 'grunge_master_93\'s Jams',
    description: 'Alex\'s personal collection of grunge and alternative favorites',
    icon: '🎸',
    color: '#ff6b6b',
    trackCount: 15,
    createdBy: 'grunge_master_93',
    creatorAvatar: '🎸',
    createdAt: '3 months ago',
    memberCount: 847,
    isCollaborative: false
  },
  {
    id: 'synth_prophet_jams',
    name: 'synth_prophet_85\'s Jams',
    description: 'Maya\'s synthwave and electronic essentials',
    icon: '🌈', 
    color: '#ff0080',
    trackCount: 12,
    createdBy: 'synth_prophet_85',
    creatorAvatar: '🌈',
    createdAt: '5 months ago',
    memberCount: 692,
    isCollaborative: false
  },
  {
    id: 'underground_oracle_jams',
    name: 'underground_oracle\'s Jams',
    description: 'Sam\'s curated collection of indie gems and deep cuts',
    icon: '🔮',
    color: '#a8e6cf',
    trackCount: 18,
    createdBy: 'underground_oracle',
    creatorAvatar: '🔮',
    createdAt: '6 months ago',
    memberCount: 1234,
    isCollaborative: false
  },
  // Collaborative themed playlists
  {
    id: '90s_grunge_revival',
    name: '90s Grunge Revival',
    description: 'The best grunge hits from the decade that changed music',
    icon: '🎸',
    color: '#dc2626',
    trackCount: 24,
    createdBy: 'grunge_master_93',
    creatorAvatar: '🎸',
    createdAt: '2 months ago',
    memberCount: 2341,
    isCollaborative: true
  },
  {
    id: 'synthwave_nights',
    name: 'Synthwave Nights',
    description: 'Neon-soaked electronic dreams and retro-future vibes',
    icon: '🌈',
    color: '#7c3aed',
    trackCount: 19,
    createdBy: 'synth_prophet_85',
    creatorAvatar: '🌈',
    createdAt: '4 months ago',
    memberCount: 1876,
    isCollaborative: true
  },
  {
    id: 'hidden_indie_gems',
    name: 'Hidden Indie Gems',
    description: 'Underground treasures and overlooked masterpieces',
    icon: '💎',
    color: '#10b981',
    trackCount: 5,
    createdBy: 'underground_oracle',
    creatorAvatar: '🔮',
    createdAt: '1 month ago',
    memberCount: 967,
    isCollaborative: true
  },
  {
    id: 'vinyl_archaeologist_jams',
    name: 'vinyl_archaeologist\'s Jams',
    description: 'Dr. Beats\' collection of rare vinyl finds and forgotten classics',
    icon: '💿',
    color: '#8b4513',
    trackCount: 3,
    createdBy: 'vinyl_archaeologist',
    creatorAvatar: '💿',
    createdAt: '2 weeks ago',
    memberCount: 456,
    isCollaborative: false
  },
  {
    id: 'beats_historian_jams',
    name: 'beats_historian\'s Jams',
    description: 'Marcus\' hip-hop essentials from the golden age',
    icon: '🎤',
    color: '#ffd93d',
    trackCount: 3,
    createdBy: 'beats_historian',
    creatorAvatar: '🎤',
    createdAt: '1 week ago',
    memberCount: 234,
    isCollaborative: false
  },
  {
    id: 'rare_vinyl_finds',
    name: 'Rare Vinyl Finds',
    description: 'Collaborative collection of deep cuts from the analog era',
    icon: '📀',
    color: '#dc2626',
    trackCount: 3,
    createdBy: 'vinyl_archaeologist',
    creatorAvatar: '💿',
    createdAt: '3 weeks ago',
    memberCount: 789,
    isCollaborative: true
  },
  {
    id: 'golden_age_hip_hop',
    name: 'Golden Age Hip-Hop',
    description: 'Essential tracks from hip-hop\'s most influential era',
    icon: '👑',
    color: '#f59e0b',
    trackCount: 3,
    createdBy: 'beats_historian',
    creatorAvatar: '🎤',
    createdAt: '5 days ago',
    memberCount: 1234,
    isCollaborative: true
  },
  // Current user's personal jam playlist
  {
    id: 'my_jamzy_jams',
    name: 'my_jamzy\'s Jams',
    description: 'My personal collection of alternative rock and indie favorites',
    icon: '🎵',
    color: '#8a2be2',
    trackCount: 12,
    createdBy: 'my_jamzy',
    creatorAvatar: '🎵',
    createdAt: '1 month ago',
    memberCount: 67,
    isCollaborative: false
  },
  // Alternative rock collaborative playlist
  {
    id: 'alt_rock_essentials',
    name: 'Alternative Rock Essentials',
    description: 'The best alternative rock tracks from the 90s to today',
    icon: '🎸',
    color: '#dc143c',
    trackCount: 8,
    createdBy: 'my_jamzy',
    creatorAvatar: '🎵',
    createdAt: '2 weeks ago',
    memberCount: 234,
    isCollaborative: true
  }
];

// Playlist-to-tracks mapping (only includes tracks that were submitted by users)
export const mockPlaylistTracks: Record<string, string[]> = {
  'grunge_master_jams': ['track_1', 'track_2', 'track_3', 'track_4', 'track_5', 'track_11', 'track_12', 'track_13', 'track_14', 'track_15'],
  'synth_prophet_jams': ['track_6', 'track_7', 'track_8', 'track_16', 'track_17', 'track_18', 'track_19', 'track_20'],
  'underground_oracle_jams': ['track_21', 'track_22', 'track_23', 'track_24', 'track_25'],
  'vinyl_archaeologist_jams': ['track_26', 'track_27', 'track_28'],
  'beats_historian_jams': ['track_29', 'track_30', 'track_31'],
  '90s_grunge_revival': ['track_1', 'track_2', 'track_3', 'track_4', 'track_5', 'track_11', 'track_12', 'track_13', 'track_14', 'track_15'],
  'synthwave_nights': ['track_6', 'track_7', 'track_8', 'track_16', 'track_17', 'track_18', 'track_19', 'track_20'],
  'hidden_indie_gems': ['track_21', 'track_22', 'track_23', 'track_24', 'track_25'],
  'rare_vinyl_finds': ['track_26', 'track_27', 'track_28'],
  'golden_age_hip_hop': ['track_29', 'track_30', 'track_31'],
  'my_jamzy_jams': ['track_32', 'track_33', 'track_34', 'track_35', 'track_36', 'track_37', 'track_38', 'track_39', 'track_40', 'track_41', 'track_42', 'track_43'],
  'alt_rock_essentials': ['track_32', 'track_33', 'track_35', 'track_38', 'track_39', 'track_40', 'track_41', 'track_43']
};

// Mock Data Service - API-like interface for fetching data
export class MockDataService {
  // Simulate API delay
  private async delay(ms: number = 100): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Fetch all users
  async getUsers(): Promise<User[]> {
    await this.delay();
    return mockUsers;
  }

  // Fetch user by username
  async getUserByUsername(username: string): Promise<User | null> {
    await this.delay();
    return getUserByUsername(username) || null;
  }

  // Fetch all playlists
  async getPlaylists(): Promise<Playlist[]> {
    await this.delay();
    return mockPlaylists;
  }

  // Fetch playlist by ID
  async getPlaylistById(id: string): Promise<Playlist | null> {
    await this.delay();
    return mockPlaylists.find(p => p.id === id) || null;
  }

  // Fetch tracks for a playlist
  async getPlaylistTracks(playlistId: string): Promise<Track[]> {
    await this.delay();
    const trackIds = mockPlaylistTracks[playlistId] || [];
    return mockTrackSubmissions.filter(track => trackIds.includes(track.id));
  }

  // Fetch all track submissions
  async getAllTracks(): Promise<Track[]> {
    await this.delay();
    return mockTrackSubmissions;
  }

  // Fetch tracks by user
  async getTracksByUser(username: string): Promise<Track[]> {
    await this.delay();
    return mockTrackSubmissions.filter(track => track.addedBy === username);
  }

  // Fetch trending data (simplified version)
  async getTrendingData(category: 'playlists' | 'songs' | 'artists' | 'users', timeframe: 'today' | 'week' | 'month' | 'all') {
    await this.delay();
    // This would normally calculate trending based on engagement metrics
    // For now, return static data organized by category
    const trendingPlaylists = mockPlaylists.slice(0, 5).map((playlist, index) => ({
      id: playlist.id,
      rank: index + 1,
      change: ['up', 'down', 'same'][Math.floor(Math.random() * 3)] as 'up' | 'down' | 'same',
      title: playlist.name,
      subtitle: `curated by ${playlist.createdBy}`,
      metric: `+${Math.floor(Math.random() * 50)}% plays ${timeframe}`,
      icon: playlist.icon
    }));

    const trendingUsers = mockUsers.slice(0, 5).map((user, index) => ({
      id: user.id,
      rank: index + 1,
      change: ['up', 'down', 'same'][Math.floor(Math.random() * 3)] as 'up' | 'down' | 'same',
      title: user.username,
      subtitle: `${user.badgeIcon} ${user.badgeTitle}`,
      metric: `+${Math.floor(Math.random() * 100)}% engagement`,
      avatar: user.avatar
    }));

    switch (category) {
      case 'playlists':
        return trendingPlaylists;
      case 'users':
        return trendingUsers;
      default:
        return [];
    }
  }
}

// Export singleton instance
export const mockDataService = new MockDataService();