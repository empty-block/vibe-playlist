// Animation types and interfaces

export interface AnimationConfig {
  duration?: number;
  easing?: string;
  delay?: number;
}

export interface HoverAnimation {
  enter: (element: HTMLElement) => void;
  leave: (element: HTMLElement) => void;
}

export interface SlideAnimation {
  fromTop: (element: HTMLElement) => void;
  fromBottom: (element: HTMLElement) => void;
  fromLeft: (element: HTMLElement) => void;
}

export interface ToggleAnimation {
  expand: (element: HTMLElement) => void;
  collapse: (element: HTMLElement) => void;
}

export interface MusicPlayerSyncAnimation {
  highlightActiveSection: (sectionElement: HTMLElement, platform: string) => void;
  nowPlayingPulse: (element: HTMLElement, isPlaying: boolean) => void;
}

export interface MusicReactiveAnimation {
  tempoSync: (element: HTMLElement, bpm?: number) => void;
  activityIndicator: (element: HTMLElement, isActive?: boolean) => void;
  visualizerPulse: (elements: HTMLElement[], audioData?: number[]) => void;
}