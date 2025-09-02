import { Component, createSignal, Show, JSX, createEffect } from 'solid-js';
import WindowsFrame from './WindowsFrame';
import Navigation from './Navigation';
import Terminal from '../chat/Terminal';
import MediaPlayer from '../player/MediaPlayer';
import { currentTrack } from '../../stores/playlistStore';

interface LayoutProps {
  children?: JSX.Element;
}

const Layout: Component<LayoutProps> = (props) => {
  const [showTerminal, setShowTerminal] = createSignal(false);

  // Make showTerminal globally accessible for the close button
  (window as any).showTerminal = () => setShowTerminal(true);

  // Simplified layout - no responsive state needed

  return (
    <div class="h-screen relative overflow-hidden" style="background: linear-gradient(135deg, #04caf4 0%, #00f92a 100%);">
      {/* TV Static overlay */}
      <div class="tv-static fixed inset-0 pointer-events-none opacity-5"></div>
      
      {/* Main window */}
      <WindowsFrame onCloseClick={() => setShowTerminal(true)}>
        <Navigation />
        
        {/* Main Content - Takes full width */}
        <div class="flex-1 overflow-y-auto min-w-0">
          {props.children}
        </div>
        
        {/* Player - Always bottom bar */}
        <Show when={currentTrack()}>
          <MediaPlayer />
        </Show>
      </WindowsFrame>
      
      {/* Terminal */}
      <Show when={showTerminal()}>
        <Terminal onClose={() => setShowTerminal(false)} />
      </Show>
    </div>
  );
};

export default Layout;