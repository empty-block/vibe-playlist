import { Component, Show, JSX, createSignal, onMount, createEffect, For } from 'solid-js';
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
  isSeekable,
  playerError
} from '../../stores/playerStore';
import { playbackButtonHover, statusPulse, playerTransitions } from '../../utils/animations';
import './player.css';

interface PlayerProps {
  mediaComponent: JSX.Element;
  onTogglePlay: () => void;
  playerReady: () => boolean;
  currentTime?: () => number;
  duration?: () => number;
  onSeek?: (time: number) => void;
  hasStartedPlayback?: () => boolean;
}

const Player: Component<PlayerProps> = (props) => {
  const navigate = useNavigate();
  const [isTouchDevice, setIsTouchDevice] = createSignal(false);

  let playButtonRef: HTMLButtonElement | undefined;
  let chatButtonRef: HTMLButtonElement | undefined;
  let statusIndicatorRef: HTMLDivElement | undefined;
  let playerBarRef: HTMLDivElement | undefined;

  // Track changes for animations
  createEffect(() => {
    const track = currentTrack();
    if (track && playerBarRef) {
      playerTransitions.trackChange(playerBarRef);
    }
  });

  // Play/pause state changes for animations
  createEffect(() => {
    const playing = isPlaying();
    if (playerBarRef) {
      playerTransitions.stateChange(playerBarRef);
    }
  });

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };


  const handleChatToggle = async () => {
    const track = currentTrack();
    if (!track?.castHash) {
      console.log('[Player] No castHash available for track:', track?.id);
      return;
    }

    try {
      const { default: sdk } = await import('@farcaster/miniapp-sdk');
      console.log('[Player] Opening cast with hash:', track.castHash);
      await sdk.actions.viewCast({
        hash: track.castHash
      });
    } catch (error) {
      console.error('[Player] Failed to open cast:', error);
    }
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
      [playButtonRef, chatButtonRef]
        .filter(Boolean)
        .forEach(button => {
          button!.addEventListener('mouseenter', () => playbackButtonHover.enter(button!));
          button!.addEventListener('mouseleave', () => playbackButtonHover.leave(button!));
        });
    }

    // Status indicator pulsing animation (works on all devices)
    if (statusIndicatorRef && isPlaying()) {
      statusPulse(statusIndicatorRef);
    }
  });

  return (
    <Show when={currentTrack()}>
      <div ref={playerBarRef} class="player-bar">
        <div class="player-content">
          {/* Media Container - show when playing */}
          <Show when={isPlaying() && props.hasStartedPlayback?.()}>
            <div class="player-audio-container">
              <div class="player-audio-embed" classList={{
                'player-video-embed': currentTrack()?.source === 'youtube'
              }}>
                {props.mediaComponent}
              </div>
              {/* Progress Bar - show for all sources */}
              <Show when={isSeekable()}>
                <div class="player-progress-container">
                  <div class="player-time">{formatTime(currentTime())}</div>
                  <div
                    class="player-progress-bar"
                    onClick={handleProgressClick}
                  >
                    <div
                      class="player-progress-fill"
                      style={{
                        width: `${duration() > 0 ? (currentTime() / duration()) * 100 : 0}%`
                      }}
                    ></div>
                  </div>
                  <div class="player-time">{formatTime(duration())}</div>
                </div>
              </Show>
            </div>
          </Show>

          {/* Error Message Display */}
          <Show when={playerError()}>
            <div class="player-error-message">
              ⚠️ {playerError()}
            </div>
          </Show>

          {/* Track Info Panel - Green LCD style with integrated controls */}
          {/* Always show when playback has started */}
          <Show when={props.hasStartedPlayback?.()}>
            <div class="player-track-info">
            <div class="player-track-metadata">
              <div class="player-track-title">{currentTrack()?.title}</div>
              <div class="player-track-subtitle">{currentTrack()?.artist}</div>
              <div class="player-track-meta">
                <span class="player-shared-by">shared by {currentTrack()?.addedBy}</span>
                {/* Show Songlink attribution when track was resolved from song.link or Apple Music */}
                <Show when={currentTrack()?.originalSource === 'songlink' || currentTrack()?.originalSource === 'apple_music'}>
                  <span class="player-songlink-attribution" style="margin-left: 8px; opacity: 0.6; font-size: 0.85em;">
                    • via Songlink
                  </span>
                </Show>
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
                <i class={isPlaying() ? 'fas fa-pause' : 'fas fa-play'}></i>
              </button>
              <button
                ref={chatButtonRef!}
                onClick={handleChatToggle}
                class="player-control player-control--reply"
                disabled={!currentTrack()?.castHash}
                title={currentTrack()?.castHash ? 'Reply in Farcaster' : 'No conversation available'}
              >
                <i class="fas fa-comment"></i>
              </button>
            </div>
          </div>
          </Show>
        </div>
      </div>
    </Show>
  );
};

export default Player;