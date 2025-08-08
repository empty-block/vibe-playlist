import { Component, JSX } from 'solid-js';

interface WindowsFrameProps {
  children: JSX.Element;
  onCloseClick: () => void;
}

const WindowsFrame: Component<WindowsFrameProps> = (props) => {
  return (
    <div class="win95-panel m-4 h-[calc(100vh-2rem)] flex flex-col">
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