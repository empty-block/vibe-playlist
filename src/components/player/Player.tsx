import { Component, Show, JSX, createSignal, onMount } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { currentTrack, isPlaying, playingPlaylistId, setCurrentPlaylistId } from '../../stores/playlistStore';
import { playbackButtonHover } from '../../utils/animations';
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
  
  let playButtonRef: HTMLButtonElement | undefined;
  let prevButtonRef: HTMLButtonElement | undefined;
  let nextButtonRef: HTMLButtonElement | undefined;

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

  const handleGoToPlayingPlaylist = () => {
    // Set the current playlist to the one that's actually playing
    setCurrentPlaylistId(playingPlaylistId());
    // Navigate to player page to show the playing playlist
    navigate('/player');
  };

  // Set up animations
  onMount(() => {
    [playButtonRef, prevButtonRef, nextButtonRef]
      .filter(Boolean)
      .forEach(button => {
        button!.addEventListener('mouseenter', () => playbackButtonHover.enter(button!));
        button!.addEventListener('mouseleave', () => playbackButtonHover.leave(button!));
      });
  });

  return (
    <Show when={currentTrack()}>
      <div class={styles.playerContainer}>
        {/* Track Info Section */}
        <div class={styles.trackInfo}>
          <div class="flex items-center gap-2 mb-1">
            <div class={`${styles.statusIndicator} ${!isPlaying() ? styles.paused : ''}`}></div>
            <h3 class={styles.trackTitle}>
              {currentTrack()?.title}
            </h3>
            <div class={styles.platformBadge}>
              {currentTrack()?.source?.toUpperCase()}
            </div>
          </div>
          <div class={styles.trackMeta}>
            <span>{currentTrack()?.artist}</span>
            <span>•</span>
            <span>Added by {currentTrack()?.addedBy}</span>
          </div>
        </div>

        {/* Controls Section */}
        <div class={styles.controls}>
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

          {/* Secondary Actions */}
          <div class="flex gap-2 ml-4">
            <button 
              class={`${styles.controlButton} text-sm`} 
              onClick={handleGoToPlayingPlaylist}
              title="View playlist"
            >
              <i class="fas fa-list"></i>
            </button>
            <button 
              class={`${styles.controlButton} text-sm`} 
              onClick={() => console.log('Open chat')}
              title="Open chat"
            >
              <i class="fas fa-comment"></i>
            </button>
          </div>
        </div>

        {/* Media Section - Desktop Only */}
        <div class={`${styles.mediaSection} hidden md:block`}>
          {props.mediaComponent}
        </div>

        {/* Progress Bar - Non-YouTube sources */}
        <Show when={currentTrack()?.source !== 'youtube' && props.currentTime}>
          <div class={styles.progress}>
            <div 
              class={styles.progressBar}
              style={{
                width: `${((props.currentTime?.() || 0) / (props.duration?.() || 1)) * 100}%`
              }}
            ></div>
          </div>
        </Show>
      </div>
    </Show>
  );
};

export default Player;