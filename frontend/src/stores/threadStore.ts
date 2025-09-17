import { createSignal } from 'solid-js';
import { Track } from './playerStore';
import { PersonalTrack } from '../components/library/LibraryTable';

// Thread state management
const [threadMode, setThreadMode] = createSignal<boolean>(false);
const [threadStarter, setThreadStarter] = createSignal<Track | PersonalTrack | null>(null);
const [threadReplies, setThreadReplies] = createSignal<(Track | PersonalTrack)[]>([]);
const [threadLoading, setThreadLoading] = createSignal<boolean>(false);

// Thread actions
export const enterThreadMode = (starterTrack: Track | PersonalTrack, replies: (Track | PersonalTrack)[] = []) => {
  setThreadStarter(starterTrack);
  setThreadReplies(replies);
  setThreadMode(true);
};

export const exitThreadMode = () => {
  setThreadMode(false);
  setThreadStarter(null);
  setThreadReplies([]);
  setThreadLoading(false);
};

// Get all tracks for thread mode (starter + replies)
export const getThreadTracks = (): (Track | PersonalTrack)[] => {
  const starter = threadStarter();
  const replies = threadReplies();
  
  if (!starter) return [];
  
  // Return starter track first, then replies
  return [starter, ...replies];
};

export const loadThreadReplies = async (starterTrackId: string) => {
  setThreadLoading(true);
  try {
    // TODO: Implement API call to load thread replies
    // For now, this is a placeholder that would typically:
    // 1. Call Farcaster API to get replies to the cast
    // 2. Filter for music track replies
    // 3. Transform to Track/PersonalTrack format
    
    // Mock implementation - replace with real API call
    const mockReplies: (Track | PersonalTrack)[] = [];
    setThreadReplies(mockReplies);
  } catch (error) {
    console.error('Error loading thread replies:', error);
    throw error;
  } finally {
    setThreadLoading(false);
  }
};

// Export thread state
export {
  threadMode,
  setThreadMode,
  threadStarter,
  setThreadStarter,
  threadReplies,
  setThreadReplies,
  threadLoading,
  setThreadLoading
};