// Mock thread data for mini-app development
// Uses real YouTube and Spotify URLs for testing

export interface ThreadTrack {
  id: string;
  title: string;
  artist: string;
  url: string;
  source: 'youtube' | 'spotify';
  sourceId: string; // videoId for YouTube, track ID for Spotify
  thumbnail: string;
  likes: number;
  comments: number;
  timestamp: string;
  comment: string;
  duration?: string;
  addedBy?: string;
  userAvatar?: string;
  replies?: number;
  recasts?: number;
}

export interface ThreadAuthor {
  fid: number;
  username: string;
  displayName: string;
  pfpUrl: string;
}

export interface ThreadReply {
  castHash: string;
  author: ThreadAuthor;
  text: string;
  timestamp: string;
  track: ThreadTrack;
  likes: number;
}

export interface Thread {
  id: string;
  initialPost: {
    castHash: string;
    author: ThreadAuthor;
    text: string;
    timestamp: string;
    track: ThreadTrack;
  };
  replies: ThreadReply[];
  replyCount: number;
  likeCount: number;
}

// Mock users
const mockUsers: ThreadAuthor[] = [
  { fid: 1, username: 'musiclover420', displayName: 'Music Lover', pfpUrl: 'https://i.pravatar.cc/150?img=1' },
  { fid: 2, username: 'vinylhead', displayName: 'Vinyl Head', pfpUrl: 'https://i.pravatar.cc/150?img=2' },
  { fid: 3, username: 'beatmaster', displayName: 'Beat Master', pfpUrl: 'https://i.pravatar.cc/150?img=3' },
  { fid: 4, username: 'retrowave', displayName: 'Retro Wave', pfpUrl: 'https://i.pravatar.cc/150?img=4' },
  { fid: 5, username: 'indiekid', displayName: 'Indie Kid', pfpUrl: 'https://i.pravatar.cc/150?img=5' },
  { fid: 6, username: 'hiphophead', displayName: 'Hip Hop Head', pfpUrl: 'https://i.pravatar.cc/150?img=6' },
  { fid: 7, username: 'rockstar', displayName: 'Rock Star', pfpUrl: 'https://i.pravatar.cc/150?img=7' },
  { fid: 8, username: 'jazzcat', displayName: 'Jazz Cat', pfpUrl: 'https://i.pravatar.cc/150?img=8' },
];

const getRandomTimestamp = (hoursAgo: number) => {
  const date = new Date();
  date.setHours(date.getHours() - hoursAgo);
  return date.toISOString();
};

export const mockThreads: Thread[] = [
  {
    id: '1',
    initialPost: {
      castHash: 'thread1_post',
      author: mockUsers[0],
      text: 'What are you jamming to right now? 🎧',
      timestamp: getRandomTimestamp(2),
      track: {
        id: 'track1',
        title: 'Everlong',
        artist: 'Foo Fighters',
        url: 'https://www.youtube.com/watch?v=eBG7P-K-r1Y',
        source: 'youtube',
        sourceId: 'eBG7P-K-r1Y',
        thumbnail: 'https://i.ytimg.com/vi/eBG7P-K-r1Y/default.jpg',
        likes: 24,
        comments: 8,
        timestamp: getRandomTimestamp(2),
        comment: 'What are you jamming to right now? 🎧',
        duration: '4:10',
        addedBy: 'musiclover420',
        userAvatar: 'https://i.pravatar.cc/150?img=1',
        replies: 2,
        recasts: 5
      }
    },
    replies: [
      {
        castHash: 'thread1_reply1',
        author: mockUsers[1],
        text: 'This is my jam rn! 🔥',
        timestamp: getRandomTimestamp(1.5),
        track: {
          id: 'track2',
          title: 'Mr. Brightside',
          artist: 'The Killers',
          url: 'https://www.youtube.com/watch?v=gGdGFtwCNBE',
          source: 'youtube',
          sourceId: 'gGdGFtwCNBE',
          thumbnail: 'https://i.ytimg.com/vi/gGdGFtwCNBE/default.jpg',
          likes: 15,
          comments: 0,
          timestamp: getRandomTimestamp(1.5),
          comment: 'This is my jam rn! 🔥'
        },
        likes: 15
      },
      {
        castHash: 'thread1_reply2',
        author: mockUsers[2],
        text: 'Can\'t stop listening to this one',
        timestamp: getRandomTimestamp(1),
        track: {
          id: 'track3',
          title: 'Smells Like Teen Spirit',
          artist: 'Nirvana',
          url: 'https://open.spotify.com/track/4CeeEOM32jQcH3eN9Q2dGj',
          source: 'spotify',
          sourceId: '4CeeEOM32jQcH3eN9Q2dGj',
          thumbnail: 'https://i.scdn.co/image/ab67616d0000b273e175a19e530c898d167d39bf',
          likes: 18,
          comments: 0,
          timestamp: getRandomTimestamp(1),
          comment: 'Can\'t stop listening to this one'
        },
        likes: 18
      }
    ],
    replyCount: 2,
    likeCount: 24
  },
  {
    id: '2',
    initialPost: {
      castHash: 'thread2_post',
      author: mockUsers[3],
      text: 'Name your favorite 90s jams 📼',
      timestamp: getRandomTimestamp(5),
      track: {
        id: 'track4',
        title: 'Wonderwall',
        artist: 'Oasis',
        url: 'https://www.youtube.com/watch?v=bx1Bh8ZvH84',
        source: 'youtube',
        sourceId: 'bx1Bh8ZvH84',
        thumbnail: 'https://i.ytimg.com/vi/bx1Bh8ZvH84/default.jpg',
        likes: 42,
        comments: 12,
        timestamp: getRandomTimestamp(5),
        comment: 'Name your favorite 90s jams 📼'
      }
    },
    replies: [
      {
        castHash: 'thread2_reply1',
        author: mockUsers[0],
        text: 'Absolute classic!',
        timestamp: getRandomTimestamp(4.5),
        track: {
          id: 'track5',
          title: 'Basket Case',
          artist: 'Green Day',
          url: 'https://www.youtube.com/watch?v=NUTGr5t3MoY',
          source: 'youtube',
          sourceId: 'NUTGr5t3MoY',
          thumbnail: 'https://i.ytimg.com/vi/NUTGr5t3MoY/default.jpg',
          likes: 28,
          comments: 0,
          timestamp: getRandomTimestamp(4.5),
          comment: 'Absolute classic!'
        },
        likes: 28
      },
      {
        castHash: 'thread2_reply2',
        author: mockUsers[1],
        text: 'This was THE song',
        timestamp: getRandomTimestamp(4),
        track: {
          id: 'track6',
          title: 'Black Hole Sun',
          artist: 'Soundgarden',
          url: 'https://open.spotify.com/track/0vFOzaXqZHahrZp6enQwQb',
          source: 'spotify',
          sourceId: '0vFOzaXqZHahrZp6enQwQb',
          thumbnail: 'https://i.scdn.co/image/ab67616d0000b2739e2e5e54bb4b4d1dc6c03fc3',
          likes: 22,
          comments: 0,
          timestamp: getRandomTimestamp(4),
          comment: 'This was THE song'
        },
        likes: 22
      },
      {
        castHash: 'thread2_reply3',
        author: mockUsers[2],
        text: 'Peak 90s right here',
        timestamp: getRandomTimestamp(3),
        track: {
          id: 'track7',
          title: 'Creep',
          artist: 'Radiohead',
          url: 'https://www.youtube.com/watch?v=XFkzRNyygfk',
          source: 'youtube',
          sourceId: 'XFkzRNyygfk',
          thumbnail: 'https://i.ytimg.com/vi/XFkzRNyygfk/default.jpg',
          likes: 31,
          comments: 0,
          timestamp: getRandomTimestamp(3),
          comment: 'Peak 90s right here'
        },
        likes: 31
      }
    ],
    replyCount: 3,
    likeCount: 42
  },
  {
    id: '3',
    initialPost: {
      castHash: 'thread3_post',
      author: mockUsers[5],
      text: 'Who are the best hip hop artists ever? 🎤',
      timestamp: getRandomTimestamp(8),
      track: {
        id: 'track8',
        title: 'Juicy',
        artist: 'The Notorious B.I.G.',
        url: 'https://www.youtube.com/watch?v=_JZom_gVfuw',
        source: 'youtube',
        sourceId: '_JZom_gVfuw',
        thumbnail: 'https://i.ytimg.com/vi/_JZom_gVfuw/default.jpg',
        likes: 56,
        comments: 15,
        timestamp: getRandomTimestamp(8),
        comment: 'Who are the best hip hop artists ever? 🎤'
      }
    },
    replies: [
      {
        castHash: 'thread3_reply1',
        author: mockUsers[2],
        text: 'The GOAT 🐐',
        timestamp: getRandomTimestamp(7),
        track: {
          id: 'track9',
          title: 'N.Y. State of Mind',
          artist: 'Nas',
          url: 'https://open.spotify.com/track/5LYMamLv12UPbemOaTPyeV',
          source: 'spotify',
          sourceId: '5LYMamLv12UPbemOaTPyeV',
          thumbnail: 'https://i.scdn.co/image/ab67616d0000b2736ca5c90113b30c3c43ffb8f4',
          likes: 38,
          comments: 0,
          timestamp: getRandomTimestamp(7),
          comment: 'The GOAT 🐐'
        },
        likes: 38
      },
      {
        castHash: 'thread3_reply2',
        author: mockUsers[3],
        text: 'Can\'t forget this one',
        timestamp: getRandomTimestamp(6),
        track: {
          id: 'track10',
          title: 'The Message',
          artist: 'Grandmaster Flash and the Furious Five',
          url: 'https://www.youtube.com/watch?v=gYMkEMCHtJ4',
          source: 'youtube',
          sourceId: 'gYMkEMCHtJ4',
          thumbnail: 'https://i.ytimg.com/vi/gYMkEMCHtJ4/default.jpg',
          likes: 29,
          comments: 0,
          timestamp: getRandomTimestamp(6),
          comment: 'Can\'t forget this one'
        },
        likes: 29
      }
    ],
    replyCount: 2,
    likeCount: 56
  },
  {
    id: '4',
    initialPost: {
      castHash: 'thread4_post',
      author: mockUsers[4],
      text: 'Hot indie tracks 🔥',
      timestamp: getRandomTimestamp(12),
      track: {
        id: 'track11',
        title: 'Electric Feel',
        artist: 'MGMT',
        url: 'https://www.youtube.com/watch?v=MmZexg8sxyk',
        source: 'youtube',
        sourceId: 'MmZexg8sxyk',
        thumbnail: 'https://i.ytimg.com/vi/MmZexg8sxyk/default.jpg',
        likes: 33,
        comments: 9,
        timestamp: getRandomTimestamp(12),
        comment: 'Hot indie tracks 🔥'
      }
    },
    replies: [
      {
        castHash: 'thread4_reply1',
        author: mockUsers[0],
        text: 'Love this vibe',
        timestamp: getRandomTimestamp(11),
        track: {
          id: 'track12',
          title: 'Take Me Out',
          artist: 'Franz Ferdinand',
          url: 'https://open.spotify.com/track/0J8pBXqXoBpzLy61VC4Ofj',
          source: 'spotify',
          sourceId: '0J8pBXqXoBpzLy61VC4Ofj',
          thumbnail: 'https://i.scdn.co/image/ab67616d0000b273b040d0a84420e8d9c5b0d314',
          likes: 26,
          comments: 0,
          timestamp: getRandomTimestamp(11),
          comment: 'Love this vibe'
        },
        likes: 26
      },
      {
        castHash: 'thread4_reply2',
        author: mockUsers[1],
        text: 'This is fire 🔥',
        timestamp: getRandomTimestamp(10),
        track: {
          id: 'track13',
          title: 'Dog Days Are Over',
          artist: 'Florence + The Machine',
          url: 'https://www.youtube.com/watch?v=iWOyfLBYtuU',
          source: 'youtube',
          sourceId: 'iWOyfLBYtuU',
          thumbnail: 'https://i.ytimg.com/vi/iWOyfLBYtuU/default.jpg',
          likes: 21,
          comments: 0,
          timestamp: getRandomTimestamp(10),
          comment: 'This is fire 🔥'
        },
        likes: 21
      },
      {
        castHash: 'thread4_reply3',
        author: mockUsers[7],
        text: 'Adding to my playlist rn',
        timestamp: getRandomTimestamp(9),
        track: {
          id: 'track14',
          title: 'Do I Wanna Know?',
          artist: 'Arctic Monkeys',
          url: 'https://open.spotify.com/track/5FVd6KXrgO9B3JPmC8OPst',
          source: 'spotify',
          sourceId: '5FVd6KXrgO9B3JPmC8OPst',
          thumbnail: 'https://i.scdn.co/image/ab67616d0000b27384243a01af3c77b56fe01ab1',
          likes: 35,
          comments: 0,
          timestamp: getRandomTimestamp(9),
          comment: 'Adding to my playlist rn'
        },
        likes: 35
      }
    ],
    replyCount: 3,
    likeCount: 33
  },
  {
    id: '5',
    initialPost: {
      castHash: 'thread5_post',
      author: mockUsers[6],
      text: 'Classic rock vibes only 🎸',
      timestamp: getRandomTimestamp(15),
      track: {
        id: 'track15',
        title: 'Bohemian Rhapsody',
        artist: 'Queen',
        url: 'https://www.youtube.com/watch?v=fJ9rUzIMcZQ',
        source: 'youtube',
        sourceId: 'fJ9rUzIMcZQ',
        thumbnail: 'https://i.ytimg.com/vi/fJ9rUzIMcZQ/default.jpg',
        likes: 78,
        comments: 18,
        timestamp: getRandomTimestamp(15),
        comment: 'Classic rock vibes only 🎸'
      }
    },
    replies: [
      {
        castHash: 'thread5_reply1',
        author: mockUsers[2],
        text: 'Absolute masterpiece',
        timestamp: getRandomTimestamp(14),
        track: {
          id: 'track16',
          title: 'Stairway to Heaven',
          artist: 'Led Zeppelin',
          url: 'https://open.spotify.com/track/5CQ30WqJwcep0pYcV4AMNc',
          source: 'spotify',
          sourceId: '5CQ30WqJwcep0pYcV4AMNc',
          thumbnail: 'https://i.scdn.co/image/ab67616d0000b27390a50cfe99a4c19ff3cbfbdb',
          likes: 62,
          comments: 0,
          timestamp: getRandomTimestamp(14),
          comment: 'Absolute masterpiece'
        },
        likes: 62
      },
      {
        castHash: 'thread5_reply2',
        author: mockUsers[3],
        text: 'This never gets old',
        timestamp: getRandomTimestamp(13),
        track: {
          id: 'track17',
          title: 'Hotel California',
          artist: 'Eagles',
          url: 'https://www.youtube.com/watch?v=09839DpTctU',
          source: 'youtube',
          sourceId: '09839DpTctU',
          thumbnail: 'https://i.ytimg.com/vi/09839DpTctU/default.jpg',
          likes: 54,
          comments: 0,
          timestamp: getRandomTimestamp(13),
          comment: 'This never gets old'
        },
        likes: 54
      }
    ],
    replyCount: 2,
    likeCount: 78
  }
];

export const getThreadById = (id: string): Thread | undefined => {
  return mockThreads.find(thread => thread.id === id);
};
