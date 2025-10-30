// API Client for Jamzy Backend

import type { ApiThreadsResponse, ApiThreadDetailResponse } from '../types/api';
import { farcasterFetch } from '../stores/farcasterStore';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Startup logging - helps debug production issues
console.log('[API] Using API_BASE_URL:', API_BASE_URL);

// Warn if localhost in production (misconfigured build)
if (typeof window !== 'undefined' && API_BASE_URL.includes('localhost') && window.location.hostname !== 'localhost') {
  console.error('❌ [API] MISCONFIGURED: Using localhost API in production!');
  console.error('[API] The app was built without VITE_API_URL set.');
  console.error('[API] Expected:', 'https://jamzy-backend.ncmaddrey.workers.dev');
  console.error('[API] Got:', API_BASE_URL);
}

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function apiFetch<T>(endpoint: string, options?: RequestInit, retries = 2): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      // Log API calls (helps debug production issues)
      const method = options?.method || 'GET';
      const retryInfo = attempt > 0 ? ` (retry ${attempt}/${retries})` : '';
      console.log(`[API] ${method} ${url}${retryInfo}`);

      // Use Farcaster authenticated fetch if available, otherwise fall back to regular fetch
      const response = await farcasterFetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: { message: 'Request failed' } }));
        throw new ApiError(
          response.status,
          errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      return await response.json();
    } catch (error) {
      // Don't retry 4xx client errors (bad request, not found, etc.)
      if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
        console.error(`[API] Client error ${error.status}:`, error.message);
        throw error;
      }

      // Retry on network errors or 5xx server errors
      if (attempt < retries) {
        const delay = Math.min(1000 * Math.pow(2, attempt), 5000); // Exponential backoff, max 5s
        console.warn(`[API] Request failed, retrying in ${delay}ms...`, error instanceof Error ? error.message : error);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }

      // Final failure after all retries
      console.error(`[API] Request failed after ${retries + 1} attempts:`, error);
      throw error instanceof ApiError ? error : new ApiError(0, error instanceof Error ? error.message : 'Network request failed');
    }
  }

  // Should never reach here
  throw new ApiError(0, 'Request failed');
}

/**
 * Fetch all threads
 */
export async function fetchThreads(params?: {
  limit?: number;
  cursor?: string;
}): Promise<ApiThreadsResponse> {
  const queryParams = new URLSearchParams();

  if (params?.limit) queryParams.set('limit', params.limit.toString());
  if (params?.cursor) queryParams.set('cursor', params.cursor);

  const query = queryParams.toString();
  const endpoint = `/api/threads${query ? `?${query}` : ''}`;

  return apiFetch<ApiThreadsResponse>(endpoint);
}

/**
 * Fetch a single thread by castHash
 */
export async function fetchThread(castHash: string): Promise<ApiThreadDetailResponse> {
  return apiFetch<ApiThreadDetailResponse>(`/api/threads/${castHash}`);
}

/**
 * Create a new thread
 */
export async function createThread(data: {
  text: string;
  userId: string;
  trackUrls?: string[];
  farcasterToken?: string;
}): Promise<any> {
  return apiFetch('/api/threads', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Reply to a thread
 */
export async function replyToThread(
  castHash: string,
  data: {
    text: string;
    userId: string;
    trackUrls?: string[];
  }
): Promise<any> {
  return apiFetch(`/api/threads/${castHash}/reply`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Fetch all channels
 */
export async function fetchChannels(): Promise<{ channels: any[] }> {
  return apiFetch('/api/channels');
}

/**
 * Fetch channel details
 */
export async function fetchChannelDetails(channelId: string): Promise<any> {
  return apiFetch(`/api/channels/${channelId}`);
}

/**
 * Fetch channel feed (threads for a channel)
 */
export async function fetchChannelFeed(
  channelId: string,
  params?: {
    limit?: number;
    cursor?: string;
    musicOnly?: boolean;
    sort?: string;
    minLikes?: number;
    musicSources?: string[];
    genres?: string[];
  }
): Promise<ApiThreadsResponse> {
  const queryParams = new URLSearchParams();

  if (params?.limit) queryParams.set('limit', params.limit.toString());
  if (params?.cursor) queryParams.set('cursor', params.cursor);
  // Default to showing only posts with music
  queryParams.set('musicOnly', String(params?.musicOnly ?? true));

  // Add sort option (defaults to 'recent' on backend)
  if (params?.sort) queryParams.set('sort', params.sort);

  // Add quality filter
  if (params?.minLikes) queryParams.set('minLikes', params.minLikes.toString());

  // Add music sources filter (comma-separated)
  if (params?.musicSources && params.musicSources.length > 0) {
    queryParams.set('musicSources', params.musicSources.join(','));
  }

  // Add genres filter (comma-separated)
  if (params?.genres && params.genres.length > 0) {
    queryParams.set('genres', params.genres.join(','));
  }

  const query = queryParams.toString();
  const endpoint = `/api/channels/${channelId}/feed${query ? `?${query}` : ''}`;

  return apiFetch<ApiThreadsResponse>(endpoint);
}

/**
 * Fetch home feed (threads from all channels combined)
 */
export async function fetchHomeFeed(
  params?: {
    limit?: number;
    cursor?: string;
    musicOnly?: boolean;
    sort?: string;
    minLikes?: number;
    musicSources?: string[];
    genres?: string[];
  }
): Promise<ApiThreadsResponse> {
  const queryParams = new URLSearchParams();

  if (params?.limit) queryParams.set('limit', params.limit.toString());
  if (params?.cursor) queryParams.set('cursor', params.cursor);
  // Default to showing only posts with music
  queryParams.set('musicOnly', String(params?.musicOnly ?? true));

  // Add sort option (defaults to 'recent' on backend)
  if (params?.sort) queryParams.set('sort', params.sort);

  // Add quality filter (defaults to 3 on backend for home feed)
  if (params?.minLikes !== undefined) queryParams.set('minLikes', params.minLikes.toString());

  // Add music sources filter (comma-separated)
  if (params?.musicSources && params.musicSources.length > 0) {
    queryParams.set('musicSources', params.musicSources.join(','));
  }

  // Add genres filter (comma-separated)
  if (params?.genres && params.genres.length > 0) {
    queryParams.set('genres', params.genres.join(','));
  }

  const query = queryParams.toString();
  const endpoint = `/api/channels/home/feed${query ? `?${query}` : ''}`;

  return apiFetch<ApiThreadsResponse>(endpoint);
}

export { ApiError };
