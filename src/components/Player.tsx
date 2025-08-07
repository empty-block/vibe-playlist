import { Component, Show, JSX } from 'solid-js';
import { currentTrack, isPlaying, setIsPlaying } from '../stores/playlistStore';

interface PlayerProps {
  isCompact?: () => boolean;
  mediaComponent: JSX.Element;
  onTogglePlay: () => void;
  playerReady: () => boolean;
}

const Player: Component<PlayerProps> = (props) => {
  const isCompact = () => props.isCompact?.() ?? false;

  return (
    <Show when={currentTrack()}>
      <div class={`h-full bg-gray-200 ${isCompact() ? 'flex items-center px-2 sm:px-4 gap-2 sm:gap-4' : 'flex flex-col'} relative`}>
        
        {/* Desktop Header - Only show when not compact */}
        <Show when={!isCompact()}>
          <div class="windows-titlebar p-2 flex justify-between items-center">
            <span><i class="fas fa-play-circle mr-2"></i>Now Playing</span>
            <div class="flex gap-1">
              <button class="win95-button w-6 h-4 text-xs font-bold text-black">_</button>
              <button class="win95-button w-6 h-4 text-xs font-bold text-black">×</button>
            </div>
          </div>
        </Show>

        <div class={`${isCompact() ? 'contents' : 'flex-1 p-4 flex flex-col overflow-y-auto'}`}>
          
          {/* Media Player Area - Source-specific component */}
          <div class={`${isCompact() ? 'flex-shrink-0' : 'win95-panel p-2 mb-4'} relative`}>
            {props.mediaComponent}
          </div>
          
          {/* Track Info - Shared across all sources */}
          <div class={`${isCompact() ? 'flex-1 min-w-0' : 'mb-4'}`}>
            <h3 class={`font-bold text-black leading-tight ${isCompact() ? 'text-xs sm:text-sm truncate' : 'text-lg mb-1'}`}>
              {currentTrack()?.title}
            </h3>
            <p class={`text-gray-600 truncate ${isCompact() ? 'text-xs' : 'mb-2'}`}>{currentTrack()?.artist}</p>
            <p class={`text-gray-500 ${isCompact() ? 'text-xs truncate hidden sm:block' : 'text-sm mb-3'}`}>
              Added by {currentTrack()?.userAvatar} {currentTrack()?.addedBy}
            </p>
            
            {/* Song Comment - Only show on desktop, moved up for prominence */}
            <Show when={!isCompact()}>
              <div class="p-3 bg-blue-50 rounded border-l-4 border-blue-400 mb-4">
                <p class="text-sm text-gray-700 italic font-medium">
                  "{currentTrack()?.comment}"
                </p>
                <p class="text-xs text-gray-500 mt-1">
                  {currentTrack()?.timestamp}
                </p>
              </div>
            </Show>
          </div>
          
          {/* Play Controls - Shared across all sources */}
          <div class={`${isCompact() ? 'flex items-center gap-1 sm:gap-2' : 'mb-4'}`}>
            <Show when={!isCompact()}>
              <div class="flex justify-center mb-3">
                <button 
                  onClick={props.onTogglePlay}
                  class="win95-button w-16 h-16 flex items-center justify-center text-2xl"
                  disabled={!props.playerReady()}
                >
                  <i class={`fas ${isPlaying() ? 'fa-pause' : 'fa-play'}`}></i>
                </button>
              </div>
              
              {/* Player Status */}
              <div class="text-center">
                <div class="lcd-text inline-block px-3 py-1 text-sm">
                  {props.playerReady() ? 
                    (isPlaying() ? '▶ PLAYING' : '⏸ PAUSED') : 
                    '⏳ LOADING...'
                  }
                </div>
              </div>
            </Show>

            <Show when={isCompact()}>
              <button 
                onClick={props.onTogglePlay}
                class="win95-button w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-sm sm:text-lg"
                disabled={!props.playerReady()}
              >
                <i class={`fas ${isPlaying() ? 'fa-pause' : 'fa-play'}`}></i>
              </button>
            </Show>
          </div>
          
          {/* Track Stats - Shared across all sources */}
          <div class={`${isCompact() ? 'hidden sm:flex items-center gap-3 text-xs text-gray-600' : 'mt-4 pt-4 border-t border-gray-400'}`}>
            <Show when={!isCompact()}>
              <div class="flex justify-between text-sm text-gray-600">
                <span><i class="fas fa-heart text-red-500"></i> {currentTrack()?.likes}</span>
                <span><i class="fas fa-comment"></i> {currentTrack()?.replies}</span>
                <span><i class="fas fa-retweet"></i> {currentTrack()?.recasts}</span>
              </div>
            </Show>
            <Show when={isCompact()}>
              <span><i class="fas fa-heart text-red-500"></i> {currentTrack()?.likes}</span>
              <span><i class="fas fa-comment"></i> {currentTrack()?.replies}</span>
            </Show>
          </div>

          {/* Desktop-only sections */}
          <Show when={!isCompact()}>
            {/* Track Actions - Shared across all sources */}
            <div class="flex gap-2 mt-4">
              <button class="win95-button flex-1 py-1 text-xs">
                <i class="fas fa-heart mr-1"></i>Like
              </button>
              <button class="win95-button flex-1 py-1 text-xs">
                <i class="fas fa-plus mr-1"></i>Add
              </button>
              <button class="win95-button flex-1 py-1 text-xs">
                <i class="fas fa-share mr-1"></i>Share
              </button>
            </div>
          </Show>
        </div>
      </div>
    </Show>
  );
};

export default Player;