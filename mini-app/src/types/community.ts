export interface CommunityUser {
  userId: string;
  username: string;
  displayName: string;
  avatar: string;
  isOnline: boolean;
  lastSeen?: string;
  followersCount: number;
  followingCount: number;
  isFollowedByCurrentUser: boolean;
}

export interface TrackShare {
  id: string;
  trackId: string;
  track: {
    id: string;
    title: string;
    artist: string;
    duration: string;
    source: string;
    sourceId: string;
    thumbnail: string;
  };
  sharedBy: CommunityUser;
  timestamp: string;
  timeAgo: string;
  originalComment?: string;
  socialStats: {
    hearts: number;
    replies: number;
    recasts: number;
    shares: number;
  };
  hasCurrentUserHearted: boolean;
  hasCurrentUserRecast: boolean;
}

export interface ConversationReply {
  id: string;
  userId: string;
  user: CommunityUser;
  content: string;
  timestamp: string;
  timeAgo: string;
  hearts: number;
  hasCurrentUserHearted: boolean;
  parentReplyId?: string;
}

export interface ActiveConversation {
  id: string;
  trackShare: TrackShare;
  replies: ConversationReply[];
  replyCount: number;
  participantCount: number;
  lastActivity: string;
  isCurrentUserParticipant: boolean;
  isExpanded?: boolean;
}

export interface LiveActivity {
  id: string;
  type: 'share' | 'reply' | 'heart' | 'follow' | 'recast';
  user: CommunityUser;
  targetUser?: CommunityUser;
  track?: TrackShare['track'];
  content?: string;
  timestamp: string;
  timeAgo: string;
}

export interface NetworkActivity {
  recentShares: TrackShare[];
  activeConversations: number;
  newCurators: CommunityUser[];
  summary: {
    sharesLast24h: number;
    conversationsLast24h: number;
    newCuratorsLast24h: number;
  };
}

export interface CommunityPlaylist {
  id: string;
  name: string;
  description: string;
  createdBy: CommunityUser;
  contributors: CommunityUser[];
  trackCount: number;
  recentTracks: TrackShare['track'][];
  isPublic: boolean;
  tags: string[];
}

export interface CuratorSuggestion {
  curator: CommunityUser;
  reason: string; // "Similar taste" | "Popular in your genre" | "Friend of friend"
  matchScore: number; // 0-100
  sampleTracks: TrackShare['track'][];
  mutualConnections: CommunityUser[];
}