// API Client for Jamzy Backend

import type { ApiThreadsResponse, ApiThreadDetailResponse } from '../types/api';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4201';

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
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
    if (error instanceof ApiError) {
      throw error;
    }

    // Network or other errors
    throw new ApiError(0, error instanceof Error ? error.message : 'Network request failed');
  }
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

export { ApiError };
