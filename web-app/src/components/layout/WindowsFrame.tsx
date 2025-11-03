import { Component, JSX } from 'solid-js';
import { isPlayerVisible } from '../../stores/playerStore';

interface WindowsFrameProps {
  children: JSX.Element;
  onCloseClick: () => void;
}

const WindowsFrame: Component<WindowsFrameProps> = (props) => {
  // Calculate height based on player visibility
  // When player is visible, reduce available height
  const getWindowHeight = () => {
    if (isPlayerVisible()) {
      // Desktop: reduce by player height (140px) + spacing
      // Mobile: handled by parent container padding
      return 'calc(100% - 2rem)'; // Parent handles player spacing via padding
    }
    return 'calc(100% - 2rem)';
  };

  return (
    <div
      class="win95-panel m-4 flex flex-col"
      style={`height: ${getWindowHeight()};`}
      classList={{ 'has-player': isPlayerVisible() }}
    >
      {/* Title bar */}
      <div class="windows-titlebar p-2 flex justify-between items-center">
        <div class="flex items-center gap-2">
          <i class="fas fa-cassette-tape"></i>
          JAMZY - Social Music Discovery v1.0
        </div>
        <div class="flex gap-1">
          <button class="win95-button w-6 h-4 text-xs font-bold text-black">_</button>
          <button class="win95-button w-6 h-4 text-xs font-bold text-black">□</button>
          <button
            onClick={props.onCloseClick}
            class="win95-button w-6 h-4 text-xs font-bold text-black"
          >
            ×
          </button>
        </div>
      </div>

      {props.children}
    </div>
  );
};

export default WindowsFrame;