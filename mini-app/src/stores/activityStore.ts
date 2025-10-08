import { createSignal, createRoot } from 'solid-js';
import { fetchActivity, ApiActivity } from '../utils/api';
import { formatRelativeTime } from '../utils/time';
import { Track } from './playerStore';
import { ActivityEvent, ActivityUser, TrackShareActivity } from '../data/mockActivity';

/**
 * Transform backend API activity to frontend format
 */
function transformActivity(apiActivity: ApiActivity): ActivityEvent | null {
  // Transform to frontend user format
  const user: ActivityUser = {
    fid: parseInt(apiActivity.user.fid),
    username: apiActivity.user.username,
    displayName: apiActivity.user.displayName,
    avatar: apiActivity.user.pfpUrl || '/api/placeholder/40/40'
  };

  // Handle different activity types
  if (apiActivity.type === 'AUTHORED') {
    // For AUTHORED activities, create track_share
    let track: Track;

    if (apiActivity.cast.music && apiActivity.cast.music.length > 0) {
      // Has music - create proper track
      const musicTrack = apiActivity.cast.music[0]; // Take first track
      track = {
        id: musicTrack.id,
        title: musicTrack.title,
        artist: musicTrack.artist,
        url: musicTrack.url,
        source: musicTrack.platform as 'youtube' | 'spotify' | 'soundcloud',
        sourceId: musicTrack.platformId,
        thumbnail: musicTrack.thumbnail,
        likes: apiActivity.cast.stats.likes,
        timestamp: apiActivity.cast.timestamp,
        comment: apiActivity.cast.text,
        duration: undefined,
        addedBy: apiActivity.user.username,
        userAvatar: user.avatar,
        replies: apiActivity.cast.stats.replies,
        recasts: apiActivity.cast.stats.recasts
      };
    } else {
      // Text-only post - create placeholder track
      track = {
        id: `text-${apiActivity.cast.castHash}`,
        title: 'Text Post',
        artist: apiActivity.user.displayName,
        url: '', // No URL for text posts
        source: 'youtube' as const, // Placeholder
        sourceId: '',
        thumbnail: user.avatar, // Use user avatar as thumbnail
        likes: apiActivity.cast.stats.likes,
        timestamp: apiActivity.cast.timestamp,
        comment: apiActivity.cast.text,
        duration: undefined,
        addedBy: apiActivity.user.username,
        userAvatar: user.avatar,
        replies: apiActivity.cast.stats.replies,
        recasts: apiActivity.cast.stats.recasts
      };
    }

    const activity: TrackShareActivity = {
      id: apiActivity.cast.castHash,
      type: 'track_share',
      timestamp: formatRelativeTime(apiActivity.timestamp),
      user,
      track,
      threadId: apiActivity.cast.castHash
    };

    return activity;
  }

  // For LIKED and RECASTED, also show as track_share for now (MVP)
  if (apiActivity.type === 'LIKED' || apiActivity.type === 'RECASTED') {
    // For these activities, show the cast AUTHOR as the user (not the actor who liked/recasted)
    const castAuthor: ActivityUser = {
      fid: parseInt(apiActivity.cast.author.fid),
      username: apiActivity.cast.author.username,
      displayName: apiActivity.cast.author.displayName,
      avatar: apiActivity.cast.author.pfpUrl || '/api/placeholder/40/40'
    };

    let track: Track;

    if (apiActivity.cast.music && apiActivity.cast.music.length > 0) {
      const musicTrack = apiActivity.cast.music[0];
      track = {
        id: musicTrack.id,
        title: musicTrack.title,
        artist: musicTrack.artist,
        url: musicTrack.url,
        source: musicTrack.platform as 'youtube' | 'spotify' | 'soundcloud',
        sourceId: musicTrack.platformId,
        thumbnail: musicTrack.thumbnail,
        likes: apiActivity.cast.stats.likes,
        timestamp: apiActivity.cast.timestamp,
        comment: apiActivity.cast.text,
        duration: undefined,
        addedBy: apiActivity.cast.author.username,
        userAvatar: apiActivity.cast.author.pfpUrl || '/api/placeholder/40/40',
        replies: apiActivity.cast.stats.replies,
        recasts: apiActivity.cast.stats.recasts
      };
    } else {
      // Text-only liked/recasted post
      track = {
        id: `text-${apiActivity.cast.castHash}`,
        title: 'Text Post',
        artist: apiActivity.cast.author.displayName,
        url: '',
        source: 'youtube' as const,
        sourceId: '',
        thumbnail: apiActivity.cast.author.pfpUrl || '/api/placeholder/40/40',
        likes: apiActivity.cast.stats.likes,
        timestamp: apiActivity.cast.timestamp,
        comment: apiActivity.cast.text,
        duration: undefined,
        addedBy: apiActivity.cast.author.username,
        userAvatar: apiActivity.cast.author.pfpUrl || '/api/placeholder/40/40',
        replies: apiActivity.cast.stats.replies,
        recasts: apiActivity.cast.stats.recasts
      };
    }

    const activity: TrackShareActivity = {
      id: `${apiActivity.type}-${apiActivity.cast.castHash}`,
      type: 'track_share',
      timestamp: formatRelativeTime(apiActivity.timestamp),
      user: castAuthor, // Use cast author, not the actor
      track,
      threadId: apiActivity.cast.castHash
    };

    return activity;
  }

  return null;
}

const createActivityStore = () => {
  const [activityFeed, setActivityFeed] = createSignal<ActivityEvent[]>([]);
  const [isLoading, setIsLoading] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);
  const [cursor, setCursor] = createSignal<string | undefined>(undefined);
  const [hasMore, setHasMore] = createSignal(true);

  /**
   * Fetch activity from the backend API
   */
  const loadActivity = async (reset: boolean = false) => {
    if (isLoading()) return;
    if (!hasMore() && !reset) return;

    setIsLoading(true);
    setError(null);

    try {
      const currentCursor = reset ? undefined : cursor();
      const response = await fetchActivity(currentCursor);

      // Transform activities
      const transformed = response.activity
        .map(transformActivity)
        .filter((a): a is ActivityEvent => a !== null);

      // Update feed
      if (reset) {
        setActivityFeed(transformed);
      } else {
        setActivityFeed(prev => [...prev, ...transformed]);
      }

      // Update pagination
      setCursor(response.nextCursor);
      setHasMore(!!response.nextCursor);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load activity';
      setError(errorMessage);
      console.error('Activity load error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Load more activities (pagination)
   */
  const loadMore = async () => {
    await loadActivity(false);
  };

  /**
   * Refresh activity feed (reset to beginning)
   */
  const refresh = async () => {
    await loadActivity(true);
  };

  return {
    activityFeed,
    isLoading,
    error,
    hasMore,
    loadActivity,
    loadMore,
    refresh
  };
};

// Create singleton store
export const {
  activityFeed,
  isLoading,
  error,
  hasMore,
  loadActivity,
  loadMore,
  refresh
} = createRoot(createActivityStore);
