// API Response Types - matching backend response format

export interface ApiThreadAuthor {
  fid: string;
  username: string;
  displayName: string;
  pfpUrl?: string;
}

export interface ApiThreadMusic {
  id: string;
  title: string;
  artist: string;
  platform: 'youtube' | 'spotify' | 'soundcloud';
  platformId: string;
  url: string;
  thumbnail?: string;
  musicType?: 'song' | 'album' | 'playlist'; // From database music_type field
}

export interface ApiThreadStats {
  replies: number;
  likes: number;
  recasts: number;
}

export interface ApiThread {
  castHash: string;
  text: string;
  author: ApiThreadAuthor;
  timestamp: string;
  music: ApiThreadMusic[];
  stats: ApiThreadStats;
}

export interface ApiThreadsResponse {
  threads: ApiThread[];
  nextCursor?: string;
}

export interface ApiThreadReply {
  castHash: string;
  text: string;
  author: ApiThreadAuthor;
  timestamp: string;
  music: ApiThreadMusic[];
  stats: ApiThreadStats;
}

export interface ApiThreadDetailResponse {
  cast: ApiThread;
  replies: ApiThreadReply[];
}

// Transform API response to app Thread format
import { Thread, ThreadAuthor, ThreadTrack, ThreadReply } from '../data/mockThreads';

export function transformApiAuthor(apiAuthor: ApiThreadAuthor): ThreadAuthor {
  return {
    fid: parseInt(apiAuthor.fid),
    username: apiAuthor.username,
    displayName: apiAuthor.displayName,
    pfpUrl: apiAuthor.pfpUrl || ''
  };
}

export function transformApiMusic(apiMusic: ApiThreadMusic): ThreadTrack {
  // Map database music_type to player contentType
  const mapMusicTypeToContentType = (musicType?: string): 'track' | 'album' | 'playlist' | undefined => {
    if (!musicType) return undefined;
    if (musicType === 'song') return 'track';
    if (musicType === 'album') return 'album';
    if (musicType === 'playlist') return 'playlist';
    return 'track'; // Default to track for unknown types
  };

  return {
    id: apiMusic.id,
    title: apiMusic.title,
    artist: apiMusic.artist,
    url: apiMusic.url,
    source: apiMusic.platform,
    sourceId: apiMusic.platformId,
    thumbnail: apiMusic.thumbnail || '',
    contentType: mapMusicTypeToContentType(apiMusic.musicType),
    likes: 0,
    comments: 0,
    timestamp: new Date().toISOString(),
    comment: ''
  };
}

export function transformApiThread(apiThread: ApiThread): Thread {
  return {
    id: apiThread.castHash,
    initialPost: {
      castHash: apiThread.castHash,
      author: transformApiAuthor(apiThread.author),
      text: apiThread.text,
      timestamp: apiThread.timestamp,
      track: apiThread.music.length > 0 ? transformApiMusic(apiThread.music[0]) : undefined
    },
    replies: [], // Replies are loaded separately in thread detail view
    replyCount: apiThread.stats.replies,
    likeCount: apiThread.stats.likes
  };
}

export function transformApiThreadDetail(apiResponse: ApiThreadDetailResponse): Thread {
  const replies: ThreadReply[] = apiResponse.replies.map(reply => ({
    castHash: reply.castHash,
    author: transformApiAuthor(reply.author),
    text: reply.text,
    timestamp: reply.timestamp,
    track: reply.music.length > 0 ? transformApiMusic(reply.music[0]) : {
      id: '',
      title: '',
      artist: '',
      url: '',
      source: 'youtube' as const,
      sourceId: '',
      thumbnail: '',
      likes: 0,
      comments: 0,
      timestamp: reply.timestamp,
      comment: ''
    },
    likes: reply.stats.likes
  }));

  return {
    id: apiResponse.cast.castHash,
    initialPost: {
      castHash: apiResponse.cast.castHash,
      author: transformApiAuthor(apiResponse.cast.author),
      text: apiResponse.cast.text,
      timestamp: apiResponse.cast.timestamp,
      track: apiResponse.cast.music.length > 0 ? transformApiMusic(apiResponse.cast.music[0]) : undefined
    },
    replies,
    replyCount: apiResponse.cast.stats.replies,
    likeCount: apiResponse.cast.stats.likes
  };
}
