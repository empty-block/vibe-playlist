import { createSignal, createRoot } from 'solid-js';
import {
  fetchUserProfile,
  fetchUserThreads,
  ApiUserProfile,
  ApiUserThread
} from '../utils/api';

const createProfileStore = () => {
  const [profileUser, setProfileUser] = createSignal<ApiUserProfile | null>(null);
  const [threads, setThreads] = createSignal<ApiUserThread[]>([]);
  const [isLoading, setIsLoading] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);
  const [nextCursor, setNextCursor] = createSignal<string | undefined>(undefined);
  const [currentFid, setCurrentFid] = createSignal<string | null>(null);

  /**
   * Load user profile and initial threads
   */
  const loadUserProfile = async (fid: string) => {
    if (isLoading()) return;

    // Reset state when loading a different user
    if (currentFid() !== fid) {
      setProfileUser(null);
      setThreads([]);
      setNextCursor(undefined);
      setCurrentFid(fid);
    }

    setIsLoading(true);
    setError(null);

    try {
      // Fetch profile and threads in parallel
      const [profileResponse, threadsResponse] = await Promise.all([
        fetchUserProfile(fid),
        fetchUserThreads(fid)
      ]);

      setProfileUser(profileResponse);
      setThreads(threadsResponse.threads);
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
   * Load more threads (pagination)
   */
  const loadMoreThreads = async () => {
    const fid = currentFid();
    const cursor = nextCursor();

    if (!fid || !cursor || isLoading()) return;

    setIsLoading(true);
    setError(null);

    try {
      const threadsResponse = await fetchUserThreads(fid, cursor);

      // Append new threads to existing ones
      setThreads(prev => [...prev, ...threadsResponse.threads]);
      setNextCursor(threadsResponse.nextCursor);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load more threads';
      setError(errorMessage);
      console.error('Load more threads error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Reset store state
   */
  const reset = () => {
    setProfileUser(null);
    setThreads([]);
    setNextCursor(undefined);
    setError(null);
    setCurrentFid(null);
  };

  return {
    profileUser,
    threads,
    isLoading,
    error,
    nextCursor,
    currentFid,
    loadUserProfile,
    loadMoreThreads,
    reset
  };
};

// Create singleton store
export const {
  profileUser,
  threads,
  isLoading,
  error,
  nextCursor,
  currentFid,
  loadUserProfile,
  loadMoreThreads,
  reset
} = createRoot(createProfileStore);
