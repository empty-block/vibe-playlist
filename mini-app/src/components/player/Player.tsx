import { Component, Show, JSX, createSignal, onMount, For } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import {
  currentTrack,
  isPlaying,
  playingPlaylistId,
  setCurrentPlaylistId,
  shuffleMode,
  setShuffleMode,
  repeatMode,
  setRepeatMode,
  currentTime,
  duration,
  isSeekable
} from '../../stores/playerStore';
import { playbackButtonHover, stateButtonHover, shuffleToggle, repeatToggle, statusPulse } from '../../utils/animations';
import RetroTitleBar from '../common/RetroTitleBar';
import './player.css';

interface PlayerProps {
  mediaComponent: JSX.Element;
  onTogglePlay: () => void;
  playerReady: () => boolean;
  currentTime?: () => number;
  duration?: () => number;
  onSeek?: (time: number) => void;
}

const Player: Component<PlayerProps> = (props) => {
  const navigate = useNavigate();
  const [isTouchDevice, setIsTouchDevice] = createSignal(false);

  let playButtonRef: HTMLButtonElement | undefined;
  let prevButtonRef: HTMLButtonElement | undefined;
  let nextButtonRef: HTMLButtonElement | undefined;
  let shuffleButtonRef: HTMLButtonElement | undefined;
  let chatButtonRef: HTMLButtonElement | undefined;
  let statusIndicatorRef: HTMLDivElement | undefined;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSkipPrevious = () => {
    console.log('Skip to previous track');
    // TODO: Implement playlist navigation
  };

  const handleSkipNext = () => {
    console.log('Skip to next track');
    // TODO: Implement playlist navigation
  };

  const handleShuffleToggle = () => {
    const newShuffleState = !shuffleMode();
    setShuffleMode(newShuffleState);
    
    // Visual feedback
    if (shuffleButtonRef) {
      shuffleToggle(shuffleButtonRef, newShuffleState);
    }
    
    console.log('Shuffle:', newShuffleState ? 'ON' : 'OFF');
  };

  const handleChatToggle = () => {
    console.log('Open chat for track:', currentTrack()?.id);
    // TODO: Navigate to track's conversation thread or open chat sidebar
  };

  const handleArtistClick = () => {
    navigate(`/artist/${encodeURIComponent(currentTrack()?.artist || '')}`);
  };

  const handleProgressClick = (event: MouseEvent) => {
    if (!isSeekable() || !props.onSeek) return;
    
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const percentage = ((event.clientX - rect.left) / rect.width) * 100;
    const targetTime = (duration() * percentage) / 100;
    
    props.onSeek(targetTime);
  };


  // Set up animations
  onMount(() => {
    // Detect touch device
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    setIsTouchDevice(hasTouch);

    // Only add hover animations on non-touch devices
    if (!hasTouch) {
      // Primary playback buttons
      [playButtonRef, prevButtonRef, nextButtonRef, chatButtonRef]
        .filter(Boolean)
        .forEach(button => {
          button!.addEventListener('mouseenter', () => playbackButtonHover.enter(button!));
          button!.addEventListener('mouseleave', () => playbackButtonHover.leave(button!));
        });

      // Shuffle button
      if (shuffleButtonRef) {
        shuffleButtonRef.addEventListener('mouseenter', () =>
          stateButtonHover.enter(shuffleButtonRef!, shuffleMode())
        );
        shuffleButtonRef.addEventListener('mouseleave', () =>
          stateButtonHover.leave(shuffleButtonRef!)
        );
      }
    }

    // Status indicator pulsing animation (works on all devices)
    if (statusIndicatorRef && isPlaying()) {
      statusPulse(statusIndicatorRef);
    }
  });

  return (
    <Show when={currentTrack()}>
      <div class="player-bar">
        {/* Retro Title Bar */}
        <RetroTitleBar
          title="Now Playing"
          showMinimize={true}
          showMaximize={true}
          showClose={true}
        />

        <div class="player-content">
          {/* YouTube Video Container - hide when paused but keep mounted */}
          <div class="player-video" classList={{ 'player-video--hidden': !isPlaying() }}>
            {props.mediaComponent}
          </div>

          {/* Track Info Panel - Green LCD style with integrated controls */}
          <div class="player-track-info">
            <div class="player-track-metadata">
              <div class="player-track-title">{currentTrack()?.title}</div>
              <div class="player-track-subtitle">{currentTrack()?.artist}</div>
              <div class="player-track-meta">
                <span class="player-shared-by">shared by @{currentTrack()?.addedBy}</span>
              </div>
            </div>

            {/* Playback Controls - integrated into track info panel */}
            <div class="player-controls">
              <button
                ref={playButtonRef!}
                onClick={props.onTogglePlay}
                class="player-control player-control--play"
                disabled={!props.playerReady()}
                title={isPlaying() ? 'Pause' : 'Play'}
              >
                {isPlaying() ? '⏸' : '▶'}
              </button>
              <button
                ref={prevButtonRef!}
                onClick={handleSkipPrevious}
                class="player-control"
                disabled={!props.playerReady()}
                title="Previous track"
              >
                ⏮
              </button>
              <button
                ref={nextButtonRef!}
                onClick={handleSkipNext}
                class="player-control"
                disabled={!props.playerReady()}
                title="Next track"
              >
                ⏭
              </button>
            </div>
          </div>

          {/* Animated Visualizer - only show when playing and player is ready */}
          <Show when={isPlaying() && props.playerReady()}>
            <div class="player-visualizer">
              <For each={Array(16).fill(0)}>
                {() => <div class="player-visualizer-bar"></div>}
              </For>
            </div>
          </Show>
        </div>
      </div>
    </Show>
  );
};

export default Player;