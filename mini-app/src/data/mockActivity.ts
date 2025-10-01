import { Track } from '../stores/playerStore';
import { mockUsers } from './mockThreads';

export interface ActivityUser {
  fid: number;
  username: string;
  displayName: string;
  avatar: string;
}

export type ActivityType = 'track_share' | 'reply' | 'aggregated_likes';

export interface BaseActivity {
  id: string;
  type: ActivityType;
  timestamp: string; // Relative time string (e.g., "2h ago")
  user: ActivityUser;
}

export interface TrackShareActivity extends BaseActivity {
  type: 'track_share';
  track: Track;
  threadId: string;
}

export interface ReplyActivity extends BaseActivity {
  type: 'reply';
  track: Track; // The reply track
  originalTrack: Track; // The track being replied to
  originalUser: ActivityUser;
  originalThreadId: string;
  threadId: string;
}

export interface AggregatedLikesActivity extends BaseActivity {
  type: 'aggregated_likes';
  track: Track;
  likeCount: number;
  likedByUsers: ActivityUser[];
  threadId: string;
}

export type ActivityEvent =
  | TrackShareActivity
  | ReplyActivity
  | AggregatedLikesActivity;

// Helper to create relative timestamps
const getRelativeTime = (hoursAgo: number): string => {
  if (hoursAgo < 1) return `${Math.floor(hoursAgo * 60)}m ago`;
  if (hoursAgo < 24) return `${Math.floor(hoursAgo)}h ago`;
  return `${Math.floor(hoursAgo / 24)}d ago`;
};

// Helper to convert ThreadAuthor to ActivityUser
const toActivityUser = (threadAuthor: typeof mockUsers[0]): ActivityUser => ({
  fid: threadAuthor.fid,
  username: threadAuthor.username,
  displayName: threadAuthor.displayName,
  avatar: threadAuthor.pfpUrl
});

// Mock activity feed - chronological from newest to oldest
export const mockActivityFeed: ActivityEvent[] = [
  // Recent track share (30 minutes ago)
  {
    id: 'activity_1',
    type: 'track_share',
    timestamp: getRelativeTime(0.5),
    user: toActivityUser(mockUsers[0]),
    track: {
      id: 'track_new_1',
      title: 'Fade Into You',
      artist: 'Mazzy Star',
      url: 'https://www.youtube.com/watch?v=ImKY6TZEyrI',
      source: 'youtube',
      sourceId: 'ImKY6TZEyrI',
      thumbnail: 'https://i.ytimg.com/vi/ImKY6TZEyrI/default.jpg',
      likes: 3,
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      comment: 'This song is pure dreamy bliss. Hope Sandoval\'s voice is hypnotic.',
      duration: '4:55',
      addedBy: mockUsers[0].username,
      userAvatar: mockUsers[0].pfpUrl,
      replies: 0,
      recasts: 1
    },
    threadId: 'thread_new_1'
  },

  // Aggregated likes (1 hour ago)
  {
    id: 'activity_2',
    type: 'aggregated_likes',
    timestamp: getRelativeTime(1),
    user: toActivityUser(mockUsers[1]),
    track: {
      id: 'track_everlong',
      title: 'Everlong',
      artist: 'Foo Fighters',
      url: 'https://www.youtube.com/watch?v=eBG7P-K-r1Y',
      source: 'youtube',
      sourceId: 'eBG7P-K-r1Y',
      thumbnail: 'https://i.ytimg.com/vi/eBG7P-K-r1Y/default.jpg',
      likes: 24,
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      comment: 'This song completely changed my perspective on what rock music could be.',
      duration: '4:10',
      addedBy: mockUsers[0].username,
      userAvatar: mockUsers[0].pfpUrl,
      replies: 2,
      recasts: 5
    },
    likeCount: 12,
    likedByUsers: [
      toActivityUser(mockUsers[1]),
      toActivityUser(mockUsers[2]),
      toActivityUser(mockUsers[3]),
      toActivityUser(mockUsers[4])
    ],
    threadId: 'thread_1'
  },

  // Reply activity (2 hours ago)
  {
    id: 'activity_3',
    type: 'reply',
    timestamp: getRelativeTime(2),
    user: toActivityUser(mockUsers[3]),
    track: {
      id: 'track_reply_1',
      title: 'Come As You Are',
      artist: 'Nirvana',
      url: 'https://www.youtube.com/watch?v=vabnZ9-ex7o',
      source: 'youtube',
      sourceId: 'vabnZ9-ex7o',
      thumbnail: 'https://i.ytimg.com/vi/vabnZ9-ex7o/default.jpg',
      likes: 8,
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      comment: 'If we\'re doing grunge, this is essential. Kurt\'s delivery is haunting.',
      duration: '3:38',
      addedBy: mockUsers[3].username,
      userAvatar: mockUsers[3].pfpUrl,
      replies: 0,
      recasts: 2
    },
    originalTrack: {
      id: 'track_everlong',
      title: 'Everlong',
      artist: 'Foo Fighters',
      url: 'https://www.youtube.com/watch?v=eBG7P-K-r1Y',
      source: 'youtube',
      sourceId: 'eBG7P-K-r1Y',
      thumbnail: 'https://i.ytimg.com/vi/eBG7P-K-r1Y/default.jpg',
      likes: 24,
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      comment: 'This song completely changed my perspective on what rock music could be.',
      duration: '4:10',
      addedBy: mockUsers[0].username,
      userAvatar: mockUsers[0].pfpUrl,
      replies: 2,
      recasts: 5
    },
    originalUser: toActivityUser(mockUsers[0]),
    originalThreadId: 'thread_1',
    threadId: 'thread_1'
  },

  // Track share (3 hours ago)
  {
    id: 'activity_4',
    type: 'track_share',
    timestamp: getRelativeTime(3),
    user: toActivityUser(mockUsers[4]),
    track: {
      id: 'track_new_2',
      title: 'Bittersweet Symphony',
      artist: 'The Verve',
      url: 'https://www.youtube.com/watch?v=1lyu1KKwC74',
      source: 'youtube',
      sourceId: '1lyu1KKwC74',
      thumbnail: 'https://i.ytimg.com/vi/1lyu1KKwC74/default.jpg',
      likes: 7,
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      comment: 'The orchestral strings combined with Richard Ashcroft\'s vocals create pure magic.',
      duration: '5:58',
      addedBy: mockUsers[4].username,
      userAvatar: mockUsers[4].pfpUrl,
      replies: 1,
      recasts: 3
    },
    threadId: 'thread_new_2'
  },

  // Aggregated likes (4 hours ago)
  {
    id: 'activity_5',
    type: 'aggregated_likes',
    timestamp: getRelativeTime(4),
    user: toActivityUser(mockUsers[2]),
    track: {
      id: 'track_wonderwall',
      title: 'Wonderwall',
      artist: 'Oasis',
      url: 'https://www.youtube.com/watch?v=bx1Bh8ZvH84',
      source: 'youtube',
      sourceId: 'bx1Bh8ZvH84',
      thumbnail: 'https://i.ytimg.com/vi/bx1Bh8ZvH84/default.jpg',
      likes: 42,
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      comment: 'Wonderwall is an absolute masterpiece of songwriting.',
      duration: '4:18',
      addedBy: mockUsers[3].username,
      userAvatar: mockUsers[3].pfpUrl,
      replies: 3,
      recasts: 8
    },
    likeCount: 18,
    likedByUsers: [
      toActivityUser(mockUsers[2]),
      toActivityUser(mockUsers[5]),
      toActivityUser(mockUsers[6]),
      toActivityUser(mockUsers[7])
    ],
    threadId: 'thread_2'
  },

  // Reply activity (5 hours ago)
  {
    id: 'activity_6',
    type: 'reply',
    timestamp: getRelativeTime(5),
    user: toActivityUser(mockUsers[1]),
    track: {
      id: 'track_reply_2',
      title: 'Today',
      artist: 'The Smashing Pumpkins',
      url: 'https://www.youtube.com/watch?v=xmUZ6nCFNoU',
      source: 'youtube',
      sourceId: 'xmUZ6nCFNoU',
      thumbnail: 'https://i.ytimg.com/vi/xmUZ6nCFNoU/default.jpg',
      likes: 14,
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      comment: 'Billy Corgan\'s alternative rock masterpiece. The wall of distorted guitars is beautiful.',
      duration: '3:20',
      addedBy: mockUsers[1].username,
      userAvatar: mockUsers[1].pfpUrl,
      replies: 0,
      recasts: 4
    },
    originalTrack: {
      id: 'track_wonderwall',
      title: 'Wonderwall',
      artist: 'Oasis',
      url: 'https://www.youtube.com/watch?v=bx1Bh8ZvH84',
      source: 'youtube',
      sourceId: 'bx1Bh8ZvH84',
      thumbnail: 'https://i.ytimg.com/vi/bx1Bh8ZvH84/default.jpg',
      likes: 42,
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      comment: 'Wonderwall is an absolute masterpiece of songwriting.',
      duration: '4:18',
      addedBy: mockUsers[3].username,
      userAvatar: mockUsers[3].pfpUrl,
      replies: 3,
      recasts: 8
    },
    originalUser: toActivityUser(mockUsers[3]),
    originalThreadId: 'thread_2',
    threadId: 'thread_2'
  },

  // Track share (6 hours ago)
  {
    id: 'activity_7',
    type: 'track_share',
    timestamp: getRelativeTime(6),
    user: toActivityUser(mockUsers[5]),
    track: {
      id: 'track_new_3',
      title: 'Changes',
      artist: '2Pac',
      url: 'https://www.youtube.com/watch?v=eXvBjCO19QY',
      source: 'youtube',
      sourceId: 'eXvBjCO19QY',
      thumbnail: 'https://i.ytimg.com/vi/eXvBjCO19QY/default.jpg',
      likes: 19,
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      comment: 'Powerful message that still resonates today. 2Pac was a poet.',
      duration: '4:28',
      addedBy: mockUsers[5].username,
      userAvatar: mockUsers[5].pfpUrl,
      replies: 2,
      recasts: 6
    },
    threadId: 'thread_new_3'
  },

  // Aggregated likes (8 hours ago)
  {
    id: 'activity_8',
    type: 'aggregated_likes',
    timestamp: getRelativeTime(8),
    user: toActivityUser(mockUsers[0]),
    track: {
      id: 'track_bohemian',
      title: 'Bohemian Rhapsody',
      artist: 'Queen',
      url: 'https://www.youtube.com/watch?v=fJ9rUzIMcZQ',
      source: 'youtube',
      sourceId: 'fJ9rUzIMcZQ',
      thumbnail: 'https://i.ytimg.com/vi/fJ9rUzIMcZQ/default.jpg',
      likes: 78,
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      comment: 'This isn\'t just a song, it\'s a complete musical journey.',
      duration: '5:55',
      addedBy: mockUsers[6].username,
      userAvatar: mockUsers[6].pfpUrl,
      replies: 2,
      recasts: 12
    },
    likeCount: 25,
    likedByUsers: [
      toActivityUser(mockUsers[0]),
      toActivityUser(mockUsers[1]),
      toActivityUser(mockUsers[4]),
      toActivityUser(mockUsers[5])
    ],
    threadId: 'thread_5'
  },

  // Track share (10 hours ago)
  {
    id: 'activity_9',
    type: 'track_share',
    timestamp: getRelativeTime(10),
    user: toActivityUser(mockUsers[7]),
    track: {
      id: 'track_new_4',
      title: 'So What',
      artist: 'Miles Davis',
      url: 'https://www.youtube.com/watch?v=zqNTltOGh5c',
      source: 'youtube',
      sourceId: 'zqNTltOGh5c',
      thumbnail: 'https://i.ytimg.com/vi/zqNTltOGh5c/default.jpg',
      likes: 11,
      timestamp: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
      comment: 'Modal jazz at its finest. Miles Davis revolutionized the genre with Kind of Blue.',
      duration: '9:22',
      addedBy: mockUsers[7].username,
      userAvatar: mockUsers[7].pfpUrl,
      replies: 1,
      recasts: 2
    },
    threadId: 'thread_new_4'
  },

  // Reply activity (12 hours ago)
  {
    id: 'activity_10',
    type: 'reply',
    timestamp: getRelativeTime(12),
    user: toActivityUser(mockUsers[4]),
    track: {
      id: 'track_reply_3',
      title: 'Fluorescent Adolescent',
      artist: 'Arctic Monkeys',
      url: 'https://www.youtube.com/watch?v=ma9I9VBKPiw',
      source: 'youtube',
      sourceId: 'ma9I9VBKPiw',
      thumbnail: 'https://i.ytimg.com/vi/ma9I9VBKPiw/default.jpg',
      likes: 16,
      timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      comment: 'Peak Arctic Monkeys. The storytelling in this track is brilliant.',
      duration: '2:57',
      addedBy: mockUsers[4].username,
      userAvatar: mockUsers[4].pfpUrl,
      replies: 0,
      recasts: 3
    },
    originalTrack: {
      id: 'track_electric_feel',
      title: 'Electric Feel',
      artist: 'MGMT',
      url: 'https://www.youtube.com/watch?v=MmZexg8sxyk',
      source: 'youtube',
      sourceId: 'MmZexg8sxyk',
      thumbnail: 'https://i.ytimg.com/vi/MmZexg8sxyk/default.jpg',
      likes: 33,
      timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      comment: 'MGMT captured lightning in a bottle with this track.',
      duration: '3:49',
      addedBy: mockUsers[4].username,
      userAvatar: mockUsers[4].pfpUrl,
      replies: 3,
      recasts: 6
    },
    originalUser: toActivityUser(mockUsers[4]),
    originalThreadId: 'thread_4',
    threadId: 'thread_4'
  }
];

// Helper function to format timestamps
export const formatTimeAgo = (timestamp: string): string => {
  const now = new Date();
  const past = new Date(timestamp);
  const diffMs = now.getTime() - past.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
};
