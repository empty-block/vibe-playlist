import { createSignal } from 'solid-js';
import { createStore } from 'solid-js/store';

export interface SharedPost {
  id: string;
  text: string;
  tracks: SharedTrack[];
  playlistId?: string;
  playlistTitle?: string;
  isCollaborative: boolean;
  author: string;
  timestamp: string;
  likes: number;
  replies: number;
  recasts: number;
}

export interface SharedTrack {
  id: string;
  url: string;
  title: string;
  artist: string;
  source: 'youtube' | 'spotify' | 'soundcloud';
  sourceId: string;
  thumbnail?: string;
}

interface ShareStore {
  recentShares: SharedPost[];
  suggestedPlaylists: string[];
  currentContext: 'personal' | 'prompt' | 'vibe' | null;
}

// Store for managing natural sharing flow
const [shareStore, setShareStore] = createStore<ShareStore>({
  recentShares: [],
  suggestedPlaylists: ['My Jams', 'Current Obsessions', 'Daily Discoveries'],
  currentContext: null
});

// Detect sharing context from text
export const detectContext = (text: string): ShareStore['currentContext'] => {
  const lower = text.toLowerCase();
  
  if (lower.includes('?') || lower.includes('what are') || lower.includes('favorite')) {
    return 'prompt';
  }
  if (lower.includes('vibe') || lower.includes('mood') || lower.includes('feeling')) {
    return 'vibe';
  }
  return 'personal';
};

// Suggest playlist based on context
export const suggestPlaylist = (text: string): string => {
  const context = detectContext(text);
  const lower = text.toLowerCase();
  
  switch (context) {
    case 'prompt':
      // Extract topic from question
      if (lower.includes('90s')) return '90s Nostalgia';
      if (lower.includes('workout')) return 'Gym Hits';
      if (lower.includes('study')) return 'Study Focus';
      if (lower.includes('party')) return 'Party Starters';
      return 'Community Picks';
      
    case 'vibe':
      // Extract mood
      if (lower.includes('chill')) return 'Chill Vibes';
      if (lower.includes('sad')) return 'In My Feels';
      if (lower.includes('happy')) return 'Good Vibes Only';
      if (lower.includes('night')) return 'Late Night Sessions';
      return 'Current Mood';
      
    default:
      // Personal shares
      if (lower.includes('obsessed')) return 'Current Obsessions';
      if (lower.includes('discovered')) return 'New Discoveries';
      if (lower.includes('classic')) return 'Timeless Classics';
      return 'My Jams';
  }
};

// Extract track info from URLs
export const extractTrackInfo = async (url: string): Promise<SharedTrack | null> => {
  // YouTube
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    const videoIdMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
    if (videoIdMatch) {
      return {
        id: Date.now().toString(),
        url,
        title: 'YouTube Track', // Would fetch from API
        artist: 'Artist',
        source: 'youtube',
        sourceId: videoIdMatch[1],
        thumbnail: `https://img.youtube.com/vi/${videoIdMatch[1]}/mqdefault.jpg`
      };
    }
  }
  
  // Spotify
  if (url.includes('spotify.com/track/')) {
    const trackIdMatch = url.match(/track\/([^?\s]+)/);
    if (trackIdMatch) {
      return {
        id: Date.now().toString(),
        url,
        title: 'Spotify Track', // Would fetch from API
        artist: 'Artist',
        source: 'spotify',
        sourceId: trackIdMatch[1]
      };
    }
  }
  
  // SoundCloud
  if (url.includes('soundcloud.com')) {
    return {
      id: Date.now().toString(),
      url,
      title: 'SoundCloud Track',
      artist: 'Artist',
      source: 'soundcloud',
      sourceId: url.split('/').pop() || ''
    };
  }
  
  return null;
};

// Create a share and organize it
export const createShare = async (
  text: string,
  trackUrls: string[] = []
): Promise<SharedPost> => {
  const context = detectContext(text);
  const playlistTitle = suggestPlaylist(text);
  
  // Extract tracks from URLs
  const tracks: SharedTrack[] = [];
  for (const url of trackUrls) {
    const track = await extractTrackInfo(url);
    if (track) tracks.push(track);
  }
  
  const share: SharedPost = {
    id: Date.now().toString(),
    text,
    tracks,
    playlistTitle,
    isCollaborative: context === 'prompt',
    author: 'You', // Would come from auth
    timestamp: new Date().toISOString(),
    likes: 0,
    replies: 0,
    recasts: 0
  };
  
  // Add to recent shares
  setShareStore('recentShares', (shares) => [share, ...shares]);
  
  // If it has tracks, also add to the suggested playlist
  if (tracks.length > 0) {
    // This would integrate with playlistStore to actually add the tracks
    console.log(`Adding ${tracks.length} tracks to "${playlistTitle}"`);
  }
  
  return share;
};

// Get shares for a specific playlist
export const getPlaylistShares = (playlistTitle: string): SharedPost[] => {
  return shareStore.recentShares.filter(share => share.playlistTitle === playlistTitle);
};

export { shareStore };