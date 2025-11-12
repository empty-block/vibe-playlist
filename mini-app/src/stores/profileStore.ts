import { createSignal, createRoot } from 'solid-js';
import {
  fetchUserProfile,
  fetchUserThreads,
  fetchUserActivity,
  triggerUserSync,
  ApiUserProfile,
  ApiUserThread,
  ApiActivity
} from '../utils/api';

const createProfileStore = () => {
  const [profileUser, setProfileUser] = createSignal<ApiUserProfile | null>(null);
  const [activity, setActivity] = createSignal<ApiActivity[]>([]);
  const [isLoading, setIsLoading] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);
  const [nextCursor, setNextCursor] = createSignal<string | undefined>(undefined);
  const [currentFid, setCurrentFid] = createSignal<string | null>(null);

  // Track background sync refetch timeout
  let syncRefetchTimeout: number | undefined;

  /**
   * Refetch activity data silently (without showing loading state)
   */
  const refetchActivity = async (fid: string) => {
    try {
      console.log('[Profile Store] Refetching activity after background sync...');

      // Fetch updated threads and activity in parallel
      const [threadsResponse, activityResponse] = await Promise.all([
        fetchUserThreads(fid),
        fetchUserActivity(fid)
      ]);

      // Convert threads to activity format with AUTHORED type
      const authoredActivity: ApiActivity[] = threadsResponse.threads.map(thread => ({
        type: 'AUTHORED' as const,
        user: thread.author,
        cast: thread,
        timestamp: thread.timestamp
      }));

      // Combine authored and interaction activity, deduplicate by castHash, sort by timestamp
      const allActivity = [...authoredActivity, ...activityResponse.activity];

      // Deduplicate: prefer AUTHORED over LIKED/RECASTED for the same cast
      const seenCasts = new Set<string>();
      const combinedActivity = allActivity
        .filter(activity => {
          const castHash = activity.cast.castHash;
          if (seenCasts.has(castHash)) {
            return false; // Skip duplicate
          }
          seenCasts.add(castHash);
          return true;
        })
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      // Update activity silently - UI will reactively update
      setActivity(combinedActivity);
      console.log('[Profile Store] Activity refetched successfully');
    } catch (err) {
      console.warn('[Profile Store] Failed to refetch activity:', err);
      // Non-fatal - don't show error to user
    }
  };

  /**
   * Load user profile and initial activity
   */
  const loadUserProfile = async (fid: string, options?: { skipSync?: boolean }) => {
    if (isLoading()) return;

    // Clear any pending refetch timeout
    if (syncRefetchTimeout) {
      clearTimeout(syncRefetchTimeout);
      syncRefetchTimeout = undefined;
    }

    // Reset state when loading a different user
    if (currentFid() !== fid) {
      setProfileUser(null);
      setActivity([]);
      setNextCursor(undefined);
      setCurrentFid(fid);
    }

    setIsLoading(true);
    setError(null);

    try {
      // Trigger background sync for user's likes (non-blocking)
      if (!options?.skipSync) {
        triggerUserSync(fid, { type: 'likes' });

        // Schedule delayed refetch to pick up newly synced likes
        syncRefetchTimeout = setTimeout(() => {
          const currentlyViewedFid = currentFid();
          // Only refetch if user is still on the same profile
          if (currentlyViewedFid === fid) {
            refetchActivity(fid);
          }
        }, 10000) as unknown as number; // 10 seconds
      }

      // Fetch profile, threads (for AUTHORED), and activity (for LIKED/RECASTED) in parallel
      const [profileResponse, threadsResponse, activityResponse] = await Promise.all([
        fetchUserProfile(fid),
        fetchUserThreads(fid),
        fetchUserActivity(fid)
      ]);

      // Convert threads to activity format with AUTHORED type
      const authoredActivity: ApiActivity[] = threadsResponse.threads.map(thread => ({
        type: 'AUTHORED' as const,
        user: thread.author,
        cast: thread,
        timestamp: thread.timestamp
      }));

      // Combine authored and interaction activity, deduplicate by castHash, sort by timestamp
      const allActivity = [...authoredActivity, ...activityResponse.activity];

      // Deduplicate: prefer AUTHORED over LIKED/RECASTED for the same cast
      const seenCasts = new Set<string>();
      const combinedActivity = allActivity
        .filter(activity => {
          const castHash = activity.cast.castHash;
          if (seenCasts.has(castHash)) {
            return false; // Skip duplicate
          }
          seenCasts.add(castHash);
          return true;
        })
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      setProfileUser(profileResponse);
      setActivity(combinedActivity);
      // Note: Using threads nextCursor for now, ideally we'd need to handle both cursors
      setNextCursor(threadsResponse.nextCursor);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load user profile';
      setError(errorMessage);
      console.error('Profile load error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Load more activity (pagination)
   */
  const loadMoreActivity = async () => {
    const fid = currentFid();
    const cursor = nextCursor();

    if (!fid || !cursor || isLoading()) return;

    setIsLoading(true);
    setError(null);

    try {
      // Fetch more threads and activity in parallel
      const [threadsResponse, activityResponse] = await Promise.all([
        fetchUserThreads(fid, cursor),
        fetchUserActivity(fid, cursor)
      ]);

      // Convert threads to activity format with AUTHORED type
      const authoredActivity: ApiActivity[] = threadsResponse.threads.map(thread => ({
        type: 'AUTHORED' as const,
        user: thread.author,
        cast: thread,
        timestamp: thread.timestamp
      }));

      // Combine authored and interaction activity, deduplicate by castHash, sort by timestamp
      const allNewActivity = [...authoredActivity, ...activityResponse.activity];

      // Deduplicate within new activity batch
      const seenCasts = new Set<string>();
      const newActivity = allNewActivity
        .filter(activity => {
          const castHash = activity.cast.castHash;
          if (seenCasts.has(castHash)) {
            return false; // Skip duplicate
          }
          seenCasts.add(castHash);
          return true;
        })
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      // Append new activity to existing ones, check for duplicates with existing data
      setActivity(prev => {
        const existingCastHashes = new Set(prev.map(a => a.cast.castHash));
        const uniqueNewActivity = newActivity.filter(a => !existingCastHashes.has(a.cast.castHash));
        return [...prev, ...uniqueNewActivity];
      });
      setNextCursor(threadsResponse.nextCursor);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load more activity';
      setError(errorMessage);
      console.error('Load more activity error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Reset store state
   */
  const reset = () => {
    // Clear any pending refetch timeout
    if (syncRefetchTimeout) {
      clearTimeout(syncRefetchTimeout);
      syncRefetchTimeout = undefined;
    }

    setProfileUser(null);
    setActivity([]);
    setNextCursor(undefined);
    setError(null);
    setCurrentFid(null);
  };

  return {
    profileUser,
    activity,
    isLoading,
    error,
    nextCursor,
    currentFid,
    loadUserProfile,
    loadMoreActivity,
    reset
  };
};

// Create singleton store
export const {
  profileUser,
  activity,
  isLoading,
  error,
  nextCursor,
  currentFid,
  loadUserProfile,
  loadMoreActivity,
  reset
} = createRoot(createProfileStore);
