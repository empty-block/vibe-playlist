import { Component, createSignal, Show, JSX, createEffect } from 'solid-js';
import WindowsFrame from './WindowsFrame';
import Sidebar from './Sidebar/Sidebar';
import MobileNavigation from './MobileNavigation';
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
    <div class="w-full h-full relative overflow-hidden" style="background: linear-gradient(135deg, #04caf4 0%, #00f92a 100%); position: fixed; top: 0; left: 0;">
      {/* TV Static overlay */}
      <div class="tv-static fixed inset-0 pointer-events-none opacity-5"></div>
      
      {/* Desktop Sidebar */}
      <Sidebar />
      
      {/* Mobile Navigation */}
      <MobileNavigation />
      
      {/* Main window */}
      <WindowsFrame onCloseClick={() => setShowTerminal(true)}>
        {/* Main Content */}
        <div 
          class="main-content flex flex-col h-full overflow-hidden"
          classList={{ 'has-player': !!currentTrack() }}
        >
          <div class="flex-1 overflow-y-auto pb-20 md:pb-4">
            {props.children}
          </div>
          
          {/* Player - Always bottom */}
          <Show when={currentTrack()}>
            <MediaPlayer />
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