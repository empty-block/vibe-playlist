import { Track } from '../stores/playerStore';

// Personal track interface for profile mode
export interface PersonalTrack extends Track {
  userInteraction: {
    type: 'shared' | 'liked' | 'conversation' | 'recast';
    timestamp: string;
    context?: string;
    socialStats?: {
      likes: number;
      replies: number;
      recasts: number;
    };
  };
}

// Personal filter types for profile mode
export type PersonalFilterType = 'all' | 'shared' | 'liked' | 'conversations' | 'recasts';