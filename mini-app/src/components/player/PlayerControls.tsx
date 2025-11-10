import { Component, Show, createSignal, onMount, onCleanup } from 'solid-js';
import { isPlaying } from '../../stores/playerStore';
import { NEON_COLORS, STATE_COLORS, PLAYER_CONSTANTS } from './styles/neonTheme';
import { createNeonButton, PLAYER_STYLES } from './styles/neonStyles';
import { playbackButtonHover } from '../../utils/animations';

interface PlayerControlsProps {
  isCompact: () => boolean;
  onTogglePlay: () => void;
  onSkipPrevious: () => void;
  onSkipNext: () => void;
  playerReady: () => boolean;
  currentTime?: () => number;
  duration?: () => number;
  onSeek?: (time: number) => void;
}

const PlayerControls: Component<PlayerControlsProps> = (props) => {
  // Button refs for animations
  let playButtonRef: HTMLButtonElement;
  let compactPlayButtonRef: HTMLButtonElement;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Set up button animations
  onMount(() => {
    const buttons = [
      playButtonRef,
      compactPlayButtonRef
    ];

    const cleanupFunctions: (() => void)[] = [];

    buttons.forEach(button => {
      if (button) {
        const handleEnter = () => playbackButtonHover.enter(button);
        const handleLeave = () => playbackButtonHover.leave(button);

        button.addEventListener('mouseenter', handleEnter);
        button.addEventListener('mouseleave', handleLeave);

        cleanupFunctions.push(() => {
          button.removeEventListener('mouseenter', handleEnter);
          button.removeEventListener('mouseleave', handleLeave);
        });
      }
    });

    onCleanup(() => {
      cleanupFunctions.forEach(cleanup => cleanup());
    });
  });

  const getPlayButtonStyles = () => {
    const isCurrentlyPlaying = isPlaying();
    return {
      background: isCurrentlyPlaying 
        ? 'linear-gradient(145deg, #1a4a1a, #2a5a2a)' 
        : 'linear-gradient(145deg, #2a2a2a, #1a1a1a)',
      border: isCurrentlyPlaying 
        ? `3px solid ${NEON_COLORS.green}` 
        : `3px solid ${NEON_COLORS.green}66`,
      color: isCurrentlyPlaying ? NEON_COLORS.green : '#ffffff',
      boxShadow: isCurrentlyPlaying 
        ? `0 0 30px ${NEON_COLORS.green}CC, inset 0 0 20px ${NEON_COLORS.green}1A` 
        : (props.playerReady() ? 'none' : '0 0 0 2px rgba(128, 128, 128, 0.3)'),
      textShadow: isCurrentlyPlaying 
        ? `0 0 10px ${NEON_COLORS.green}CC` 
        : 'none'
    };
  };

  const handlePlayButtonHover = (element: HTMLElement, enter: boolean) => {
    if (!props.playerReady() || isPlaying()) return;

    if (enter) {
      element.style.borderColor = NEON_COLORS.green;
      element.style.boxShadow = `0 0 25px ${NEON_COLORS.green}99`;
      element.style.color = NEON_COLORS.green;
      element.style.textShadow = `0 0 10px ${NEON_COLORS.green}CC`;
    } else {
      Object.assign(element.style, getPlayButtonStyles());
    }
  };

  return (
    <div class={props.isCompact() ? 'flex items-center gap-1 sm:gap-2' : 'mx-2 mb-4'}>
      <Show when={!props.isCompact()}>
        {/* Desktop Controls Container */}
        <div 
          class="p-4 rounded-lg"
          style={PLAYER_STYLES.createNeonPanel('pink')}
        >
          {/* Progress Bar - Non-YouTube only */}
          <Show when={props.currentTime && props.duration}>
            <div class="w-full mb-4">
              <div class="flex items-center gap-3 text-xs font-mono">
                <span style={{
                  color: NEON_COLORS.cyan,
                  textShadow: `0 0 4px ${NEON_COLORS.cyan}99`
                }}>
                  {formatTime(props.currentTime?.() || 0)}
                </span>
                <div 
                  class="flex-1 h-2 rounded-full overflow-hidden"
                  style={PLAYER_STYLES.progressContainer}
                >
                  <div 
                    class="h-full transition-all duration-200"
                    style={{
                      ...PLAYER_STYLES.progressBar,
                      width: `${((props.currentTime?.() || 0) / (props.duration?.() || 1)) * 100}%`
                    }}
                  />
                </div>
                <span style={{
                  color: NEON_COLORS.cyan,
                  textShadow: `0 0 4px ${NEON_COLORS.cyan}99`
                }}>
                  {formatTime(props.duration?.() || 0)}
                </span>
              </div>
            </div>
          </Show>

          {/* Main Control Buttons */}
          <div class="flex items-center justify-center gap-4 mb-4">
            {/* Main Play Button */}
            <button
              ref={playButtonRef!}
              onClick={props.onTogglePlay}
              class="w-16 h-16 rounded-full flex items-center justify-center text-2xl transition-all duration-300"
              style={getPlayButtonStyles()}
              disabled={!props.playerReady()}
              onMouseEnter={(e) => handlePlayButtonHover(e.currentTarget, true)}
              onMouseLeave={(e) => handlePlayButtonHover(e.currentTarget, false)}
            >
              <i class={`fas ${isPlaying() ? 'fa-pause' : 'fa-play'}`}></i>
            </button>
          </div>
          
          {/* Player Status Display */}
          <div class="text-center">
            <div 
              class="inline-block px-4 py-2 font-mono text-sm rounded"
              style={{
                background: '#000000',
                color: props.playerReady() ? (isPlaying() ? STATE_COLORS.playing : STATE_COLORS.paused) : STATE_COLORS.loading,
                border: '2px solid rgba(0, 0, 0, 0.8)',
                textShadow: `0 0 8px ${props.playerReady() ? (isPlaying() ? STATE_COLORS.playing : STATE_COLORS.paused) : STATE_COLORS.loading}CC`,
                fontFamily: PLAYER_CONSTANTS.fontFamily,
                letterSpacing: '0.1em',
                boxShadow: 'inset 0 0 10px rgba(0, 0, 0, 0.8)'
              }}
            >
              {props.playerReady() ? 
                (isPlaying() ? '▶ PLAYING' : '⏸ PAUSED') : 
                '⏳ LOADING...'
              }
            </div>
          </div>
        </div>
      </Show>

      <Show when={props.isCompact()}>
        {/* Compact Controls */}
        <div class="flex items-center gap-2 flex-wrap">
          {/* Compact Play Button */}
          <button
            ref={compactPlayButtonRef!}
            onClick={props.onTogglePlay}
            class="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center text-sm sm:text-lg transition-all duration-300"
            style={{
              ...getPlayButtonStyles(),
              minHeight: PLAYER_CONSTANTS.minButtonHeight
            }}
            disabled={!props.playerReady()}
            onMouseEnter={(e) => handlePlayButtonHover(e.currentTarget, true)}
            onMouseLeave={(e) => handlePlayButtonHover(e.currentTarget, false)}
          >
            <i class={`fas ${isPlaying() ? 'fa-pause' : 'fa-play'}`}></i>
          </button>
        </div>
      </Show>
    </div>
  );
};

export default PlayerControls;