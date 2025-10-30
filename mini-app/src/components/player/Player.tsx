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
  isSeekable,
  playNextTrack,
  playPreviousTrack,
  playerError
} from '../../stores/playerStore';
import { isInFarcasterSync } from '../../stores/farcasterStore';
import { playbackButtonHover, stateButtonHover, shuffleToggle, repeatToggle, statusPulse } from '../../utils/animations';
import RetroTitleBar from '../common/RetroTitleBar';
import { skipToNextOnConnect, skipToPreviousOnConnect } from '../../services/spotifyConnect';
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

  const handleSkipPrevious = async () => {
    console.log('Skip to previous track');

    // If in Farcaster with Spotify, use Connect API
    const track = currentTrack();
    if (isInFarcasterSync() && track?.source === 'spotify') {
      console.log('Using Spotify Connect API for skip previous');
      const success = await skipToPreviousOnConnect();
      if (!success) {
        console.error('Spotify Connect skip previous failed');
      }
      return;
    }

    // Otherwise use normal skip logic
    playPreviousTrack();
  };

  const handleSkipNext = async () => {
    console.log('Skip to next track');

    // If in Farcaster with Spotify, use Connect API
    const track = currentTrack();
    if (isInFarcasterSync() && track?.source === 'spotify') {
      console.log('Using Spotify Connect API for skip next');
      const success = await skipToNextOnConnect();
      if (!success) {
        console.error('Spotify Connect skip next failed');
      }
      return;
    }

    // Otherwise use normal skip logic
    playNextTrack();
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
          {/* Media Container - all sources now show in consistent layout */}
          <div class="player-audio-container" classList={{
            'player-audio-container--hidden': !isPlaying() && !(currentTrack()?.source === 'youtube' && isInFarcasterSync() === true && !(props.hasStartedPlayback && props.hasStartedPlayback())) && currentTrack()?.source !== 'spotify'
          }}>
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

          {/* Error Message Display */}
          <Show when={playerError()}>
            <div class="player-error-message">
              ⚠️ {playerError()}
            </div>
          </Show>

          {/* Track Info Panel - Green LCD style with integrated controls */}
          <div class="player-track-info">
            <div class="player-track-metadata">
              <div class="player-track-title">{currentTrack()?.title}</div>
              <div class="player-track-subtitle">{currentTrack()?.artist}</div>
              <div class="player-track-meta">
                <span class="player-shared-by">shared by @{currentTrack()?.addedBy}</span>
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