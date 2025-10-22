import { createSignal, createRoot } from 'solid-js';
import {
  fetchUserProfile,
  fetchUserThreads,
  fetchUserActivity,
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

  /**
   * Load user profile and initial activity
   */
  const loadUserProfile = async (fid: string) => {
    if (isLoading()) return;

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

      // Combine authored and interaction activity, sort by timestamp
      const combinedActivity = [...authoredActivity, ...activityResponse.activity]
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

      // Combine authored and interaction activity, sort by timestamp
      const newActivity = [...authoredActivity, ...activityResponse.activity]
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      // Append new activity to existing ones
      setActivity(prev => [...prev, ...newActivity]);
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
