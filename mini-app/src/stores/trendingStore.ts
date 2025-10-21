import { createSignal, createRoot } from 'solid-js';
import { fetchTrendingTracks, fetchTrendingUsers } from '../utils/api';

export interface TrendingTrack {
  rank: number;
  id: string;
  title: string;
  artist: string;
  platform: string;
  platformId: string;
  url: string;
  thumbnail: string;
  shares: number;
  uniqueLikes?: number;
  uniqueReplies?: number;
  score?: number;
}

export interface TrendingContributor {
  rank: number;
  fid: string;
  username: string;
  displayName: string;
  avatar: string;
  trackCount: number;
  uniqueEngagers: number;
  score?: number;
}

const createTrendingStore = () => {
  const [tracks, setTracks] = createSignal<TrendingTrack[]>([]);
  const [contributors, setContributors] = createSignal<TrendingContributor[]>([]);
  const [isLoading, setIsLoading] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);
  const [lastUpdated, setLastUpdated] = createSignal<Date | null>(null);

  /**
   * Load trending tracks and users from the backend API
   */
  const loadTrendingData = async () => {
    if (isLoading()) return;

    setIsLoading(true);
    setError(null);

    try {
      // Fetch both trending tracks and users in parallel
      const [tracksResponse, usersResponse] = await Promise.all([
        fetchTrendingTracks(10),
        fetchTrendingUsers(10)
      ]);

      setTracks(tracksResponse.tracks);
      setContributors(usersResponse.contributors);
      setLastUpdated(new Date(tracksResponse.updatedAt || Date.now()));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load trending data';
      setError(errorMessage);
      console.error('Trending data load error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Refresh trending data
   */
  const refresh = async () => {
    await loadTrendingData();
  };

  return {
    tracks,
    contributors,
    isLoading,
    error,
    lastUpdated,
    loadTrendingData,
    refresh
  };
};

// Create singleton store
export const {
  tracks,
  contributors,
  isLoading,
  error,
  lastUpdated,
  loadTrendingData,
  refresh
} = createRoot(createTrendingStore);
