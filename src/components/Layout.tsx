import { Component, createSignal, Show, JSX } from 'solid-js';
import WindowsFrame from './WindowsFrame';
import Navigation from './Navigation';
import Terminal from './Terminal';
import YouTubePlayer from './YouTubePlayer';
import SpotifyPlayer from './SpotifyPlayer';
import { currentTrack } from '../stores/playlistStore';

interface LayoutProps {
  children: JSX.Element;
}

const Layout: Component<LayoutProps> = (props) => {
  const [showTerminal, setShowTerminal] = createSignal(false);

  // Make showTerminal globally accessible for the close button
  (window as any).showTerminal = () => setShowTerminal(true);

  return (
    <div class="min-h-screen grunge-bg relative">
      {/* TV Static overlay */}
      <div class="tv-static fixed inset-0 pointer-events-none opacity-5"></div>
      
      {/* Main window */}
      <WindowsFrame onCloseClick={() => setShowTerminal(true)}>
        <Navigation />
        
        <div class="flex flex-1 overflow-hidden">
          {/* Main Content */}
          <div class="flex-1 overflow-y-auto">
            {props.children}
          </div>
          
          {/* Player Sidebar - Show appropriate player based on track source */}
          <Show 
            when={currentTrack()?.source === 'spotify'} 
            fallback={<YouTubePlayer />}
          >
            <SpotifyPlayer />
          </Show>
        </div>
      </WindowsFrame>
      
      {/* Terminal */}
      <Show when={showTerminal()}>
        <Terminal onClose={() => setShowTerminal(false)} />
      </Show>
    </div>
  );
};

export default Layout;