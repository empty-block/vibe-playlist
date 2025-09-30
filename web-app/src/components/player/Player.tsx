import { Component, Show, JSX, createSignal, onMount } from 'solid-js';
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
import styles from './player.module.css';

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
      <div class={styles.playerContainer}>
        {/* Track Info Section - Left */}
        <div class={styles.trackInfo}>
          <h3 class={styles.trackTitle}>
            <div ref={statusIndicatorRef!} class={`${styles.statusIndicator} ${!isPlaying() ? styles.paused : ''}`}></div>
            {currentTrack()?.title}
          </h3>
          <div class={styles.artistName} onClick={handleArtistClick}>
            {currentTrack()?.artist}
          </div>
          <div class={styles.socialContext}>
            <span class={styles.sharedByLabel}>shared by</span>
            <span class={styles.username}>{currentTrack()?.addedBy}</span>
            <span>•</span>
            <span class={styles.platformBadge}>{currentTrack()?.source?.toUpperCase()}</span>
          </div>
        </div>

        {/* Controls Section - Center */}
        <div class={styles.controls}>
          <button
            ref={shuffleButtonRef!}
            onClick={handleShuffleToggle}
            class={`${styles.controlButton} ${styles.shuffleButton} ${shuffleMode() ? styles.active : ''}`}
            disabled={!props.playerReady()}
            title={`Shuffle ${shuffleMode() ? 'ON' : 'OFF'}`}
          >
            <i class="fas fa-random"></i>
          </button>

          <button
            ref={prevButtonRef!}
            onClick={handleSkipPrevious}
            class={styles.controlButton}
            disabled={!props.playerReady()}
            title="Previous track"
          >
            <i class="fas fa-step-backward"></i>
          </button>

          <button
            ref={playButtonRef!}
            onClick={props.onTogglePlay}
            class={`${styles.controlButton} ${styles.playButton}`}
            disabled={!props.playerReady()}
            title={isPlaying() ? 'Pause' : 'Play'}
          >
            <i class={`fas ${isPlaying() ? 'fa-pause' : 'fa-play'}`} style={{
              'margin-left': isPlaying() ? '0' : '4px'
            }}></i>
          </button>

          <button
            ref={nextButtonRef!}
            onClick={handleSkipNext}
            class={styles.controlButton}
            disabled={!props.playerReady()}
            title="Next track"
          >
            <i class="fas fa-step-forward"></i>
          </button>

          <button
            ref={chatButtonRef!}
            onClick={handleChatToggle}
            class={`${styles.controlButton} ${styles.chatButton}`}
            disabled={!props.playerReady()}
            title="Open chat"
          >
            <i class="fas fa-comments"></i>
          </button>
        </div>

        {/* Media Section - Right */}
        <div class={styles.mediaSection}>
          {props.mediaComponent}
        </div>

        {/* Progress Bar - Full Width Bottom */}
        <Show when={currentTrack()?.source !== 'youtube' && props.currentTime}>
          <div 
            class={styles.progressContainer}
            onClick={handleProgressClick}
            title="Click to seek"
          >
            <div 
              class={styles.progressBar}
              style={{
                width: `${((props.currentTime?.() || 0) / (props.duration?.() || 1)) * 100}%`
              }}
            >
              <div class={styles.progressHandle}></div>
            </div>
          </div>
        </Show>
      </div>
    </Show>
  );
};

export default Player;