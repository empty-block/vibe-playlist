export interface SocialContext {
  shareCount: number;
  replyCount: number;
  recastCount: number;
  lastActivity: string;
}

export interface TrendingTrack {
  id: string;
  title: string;
  artist: string;
  duration: string;
  source: string;
  sourceId: string;
  thumbnail: string;
  addedBy: string;
  userAvatar: string;
  timestamp: string;
  trendScore: number;
  socialContext: SocialContext;
  genre?: string[];
}

export interface FreshTrack {
  id: string;
  title: string;
  artist: string;
  duration: string;
  source: string;
  sourceId: string;
  thumbnail: string;
  addedBy: string;
  userAvatar: string;
  userDisplayName: string;
  timestamp: string;
  comment?: string;
  timeAgo: string;
}

export interface CuratorProfile {
  userId: string;
  username: string;
  displayName: string;
  avatar: string;
  followerCount: number;
  trackCount: number;
  curationScore: number;
  sampleTracks: TrendingTrack[];
  bio?: string;
}

export interface GenreTag {
  id: string;
  name: string;
  trackCount: number;
  popularity: number; // 1-10 scale
  color: string;
  emoji?: string;
}

export interface ConversationThread {
  trackId: string;
  track: TrendingTrack;
  replyCount: number;
  participantCount: number;
  lastReply: string;
  previewReplies: ConversationReply[];
  isActive: boolean;
}

export interface ConversationReply {
  id: string;
  userId: string;
  userDisplayName: string;
  userAvatar: string;
  content: string;
  timestamp: string;
  timeAgo: string;
}