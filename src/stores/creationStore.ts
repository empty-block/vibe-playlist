import { createSignal, createEffect } from 'solid-js';
import type { VibeType } from '../components/playlist/VibeSelector';

export type CreationStep = 'vibe' | 'discovery' | 'composition' | 'social' | 'publish';

export interface TrackSuggestion {
  id: string;
  title: string;
  artist: string;
  source: 'youtube' | 'spotify' | 'soundcloud';
  sourceId: string;
  preview?: string;
  reasoning?: string;
  addedAt?: Date;
}

export interface SelectedVibe {
  id: VibeType;
  name: string;
  description: string;
  color: string;
  gradient: string;
  keywords: string[];
  customDescription?: string;
}

export interface PlaylistCreation {
  id: string;
  title: string;
  image?: string;
  vibe: SelectedVibe;
  tracks: TrackSuggestion[];
  threadText: string;
  isComplete: boolean;
  createdAt: Date;
  estimatedEngagement?: {
    score: number;
    predictedReplies: number;
    reachEstimate: number;
  };
}

// Global creation state
const [currentStep, setCurrentStep] = createSignal<CreationStep>('vibe');
const [selectedVibe, setSelectedVibe] = createSignal<SelectedVibe | null>(null);
const [selectedTracks, setSelectedTracks] = createSignal<TrackSuggestion[]>([]);
const [threadText, setThreadText] = createSignal('');
const [playlistTitle, setPlaylistTitle] = createSignal('');
const [playlistImage, setPlaylistImage] = createSignal<string | null>(null);
const [customVibeDescription, setCustomVibeDescription] = createSignal('');

// Derived state
const [isStepComplete, setIsStepComplete] = createSignal(false);
const [canProceed, setCanProceed] = createSignal(false);

// Update step completion status
createEffect(() => {
  const step = currentStep();
  const vibe = selectedVibe();
  const tracks = selectedTracks();
  const thread = threadText();
  
  let complete = false;
  let proceed = false;

  switch (step) {
    case 'vibe':
      complete = !!vibe || !!customVibeDescription();
      proceed = complete;
      break;
    
    case 'discovery':
      complete = tracks.length > 0;
      proceed = tracks.length >= 3; // Recommend at least 3 tracks
      break;
    
    case 'composition':
      complete = tracks.length >= 1 && !!playlistTitle();
      proceed = complete;
      break;
    
    case 'social':
      complete = !!thread.trim();
      proceed = complete && thread.length >= 20; // Meaningful thread text
      break;
    
    case 'publish':
      complete = true;
      proceed = tracks.length >= 1 && !!thread.trim() && !!vibe && !!playlistTitle();
      break;
  }

  setIsStepComplete(complete);
  setCanProceed(proceed);
});

// Auto-generate playlist title based on vibe and tracks
createEffect(() => {
  const vibe = selectedVibe();
  const tracks = selectedTracks();
  const customDesc = customVibeDescription();
  
  if (!playlistTitle() && (vibe || customDesc) && tracks.length >= 2) {
    let title = '';
    
    if (customDesc) {
      // Extract key words from custom description
      const words = customDesc.split(' ')
        .filter(w => w.length > 3)
        .slice(0, 3);
      title = words.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    } else if (vibe) {
      // Use vibe name with first track artist or genre hint
      const firstArtist = tracks[0]?.artist;
      if (firstArtist && firstArtist.length < 20) {
        title = `${vibe.name} Vibes ft. ${firstArtist}`;
      } else {
        title = `${vibe.name} ${getTimeOfDayContext()}`;
      }
    }
    
    setPlaylistTitle(title || 'New Playlist');
  }
});

// Helper function to add time context
const getTimeOfDayContext = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Morning';
  if (hour < 17) return 'Afternoon';
  if (hour < 22) return 'Evening';
  return 'Late Night';
};

// Auto-generate thread text based on context
createEffect(() => {
  const vibe = selectedVibe();
  const tracks = selectedTracks();
  const title = playlistTitle();
  const customDesc = customVibeDescription();
  
  if (!threadText() && tracks.length >= 2 && (vibe || customDesc)) {
    const vibeName = customDesc || vibe?.description || 'this vibe';
    const trackCount = tracks.length;
    
    const templates = [
      `Just curated ${trackCount} tracks for ${vibeName} - what would you add to complete this energy?`,
      `Building the perfect playlist for ${vibeName}. These ${trackCount} tracks are just the start... help me expand it!`,
      `Found some gems that perfectly capture ${vibeName}. Drop your favorite tracks that match this mood!`,
      `"${title}" is coming together nicely. What tracks am I missing for ${vibeName}?`,
    ];
    
    const randomTemplate = templates[Math.floor(Math.random() * templates.length)];
    setThreadText(randomTemplate);
  }
});

// Creation flow actions
export const creationStore = {
  // State getters
  currentStep,
  selectedVibe,
  selectedTracks,
  threadText,
  playlistTitle,
  playlistImage,
  customVibeDescription,
  isStepComplete,
  canProceed,

  // Navigation
  setCurrentStep,
  nextStep: () => {
    const steps: CreationStep[] = ['vibe', 'discovery', 'composition', 'social', 'publish'];
    const currentIndex = steps.indexOf(currentStep());
    if (currentIndex < steps.length - 1 && canProceed()) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  },
  skipStep: () => {
    const steps: CreationStep[] = ['vibe', 'discovery', 'composition', 'social', 'publish'];
    const currentIndex = steps.indexOf(currentStep());
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  },
  previousStep: () => {
    const steps: CreationStep[] = ['vibe', 'discovery', 'composition', 'social', 'publish'];
    const currentIndex = steps.indexOf(currentStep());
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  },
  goToStep: (step: CreationStep) => {
    setCurrentStep(step);
  },

  // Vibe management
  setSelectedVibe,
  setCustomVibeDescription,
  clearVibe: () => {
    setSelectedVibe(null);
    setCustomVibeDescription('');
  },

  // Track management
  setSelectedTracks,
  addTrack: (track: TrackSuggestion) => {
    const tracks = selectedTracks();
    if (!tracks.some(t => t.id === track.id)) {
      setSelectedTracks([...tracks, { ...track, addedAt: new Date() }]);
    }
  },
  removeTrack: (trackId: string) => {
    setSelectedTracks(prev => prev.filter(t => t.id !== trackId));
  },
  reorderTracks: (newOrder: TrackSuggestion[]) => {
    setSelectedTracks(newOrder);
  },
  clearTracks: () => {
    setSelectedTracks([]);
  },

  // Content management
  setThreadText,
  setPlaylistTitle,
  setPlaylistImage,
  
  // Creation completion
  createPlaylist: (): PlaylistCreation => {
    const vibe = selectedVibe();
    const tracks = selectedTracks();
    const thread = threadText();
    const title = playlistTitle();
    
    if (!vibe || !tracks.length || !thread) {
      throw new Error('Cannot create playlist: missing required fields');
    }

    const playlist: PlaylistCreation = {
      id: `playlist_${Date.now()}`,
      title: title || `${vibe.name} Playlist`,
      image: playlistImage(),
      vibe: customVibeDescription() ? {
        ...vibe,
        customDescription: customVibeDescription()
      } : vibe,
      tracks,
      threadText: thread,
      isComplete: true,
      createdAt: new Date(),
      estimatedEngagement: {
        score: calculateEngagementScore(tracks, thread, vibe),
        predictedReplies: Math.floor(tracks.length * 2.5 + (thread.includes('?') ? 5 : 0)),
        reachEstimate: Math.floor(Math.random() * 200 + 100)
      }
    };

    return playlist;
  },

  // Reset creation flow
  reset: () => {
    setCurrentStep('vibe');
    setSelectedVibe(null);
    setSelectedTracks([]);
    setThreadText('');
    setPlaylistTitle('');
    setPlaylistImage(null);
    setCustomVibeDescription('');
  },

  // Get creation progress
  getProgress: () => {
    const steps: CreationStep[] = ['vibe', 'discovery', 'composition', 'social', 'publish'];
    const currentIndex = steps.indexOf(currentStep());
    return {
      currentStep: currentIndex + 1,
      totalSteps: steps.length,
      percentage: Math.round(((currentIndex + 1) / steps.length) * 100)
    };
  }
};

// Helper function to calculate engagement score
const calculateEngagementScore = (
  tracks: TrackSuggestion[], 
  threadText: string, 
  vibe: SelectedVibe
): number => {
  let score = 20; // Base score
  
  // Track count bonus
  if (tracks.length >= 3) score += 30;
  if (tracks.length >= 5) score += 20;
  if (tracks.length >= 8) score += 15;
  
  // Thread text quality
  if (threadText.length >= 20) score += 15;
  if (threadText.includes('?')) score += 10; // Questions encourage engagement
  if (threadText.toLowerCase().includes('help') || threadText.toLowerCase().includes('suggest')) score += 10;
  
  // Vibe clarity bonus
  if (vibe.keywords.length >= 3) score += 5;
  
  // Time of posting bonus (evening/weekend gets higher engagement)
  const hour = new Date().getHours();
  const day = new Date().getDay();
  if ((hour >= 18 && hour <= 22) || day === 0 || day === 6) score += 10;
  
  return Math.min(score, 95); // Cap at 95%
};