import { Component, createSignal, Show, JSX, createEffect } from 'solid-js';
import WindowsFrame from './WindowsFrame';
import Sidebar from './Sidebar/Sidebar';
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

  return (
    <div class="h-screen relative overflow-hidden" style="background: linear-gradient(135deg, #04caf4 0%, #00f92a 100%);">
      {/* TV Static overlay */}
      <div class="tv-static fixed inset-0 pointer-events-none opacity-5"></div>
      
      {/* Main window */}
      <WindowsFrame onCloseClick={() => setShowTerminal(true)}>
        <div class="layout-container">
          {/* Desktop Sidebar - Hidden on mobile */}
          <Sidebar class="desktop-sidebar" />
          
          {/* Main Content - Responsive padding */}
          <div class="main-content">
            <div class="content-scroll">
              {props.children}
            </div>
            
            {/* Player - Always above mobile nav */}
            <Show when={currentTrack()}>
              <MediaPlayer />
            </Show>
          </div>
          
          {/* Mobile Navigation - Hidden on desktop */}
          <MobileNav class="mobile-navigation" />
        </div>
      </WindowsFrame>
      
      {/* Terminal */}
      <Show when={showTerminal()}>
        <Terminal onClose={() => setShowTerminal(false)} />
      </Show>
    </div>
  );
}
  );
};

export default Layout;