import { Component, createSignal, Show, JSX, createEffect } from 'solid-js';
import MobileNavigation from './MobileNavigation/MobileNavigation';
import CompactHeader from './CompactHeader';
import Terminal from '../terminal/Terminal';
import MediaPlayer from '../player/MediaPlayer';
import { currentTrack, isPlayerVisible } from '../../stores/playerStore';
import './HeaderBar.css';

interface LayoutProps {
  children?: JSX.Element;
}

const Layout: Component<LayoutProps> = (props) => {
  const [showTerminal, setShowTerminal] = createSignal(false);

  // Make showTerminal globally accessible for the close button
  (window as any).showTerminal = () => setShowTerminal(true);

  return (
    <div class="app-container no-sidebar">
      {/* Enhanced retro background */}
      <div class="retro-background"></div>
      
      {/* Compact Header */}
      <CompactHeader onTerminalClick={() => setShowTerminal(true)} />
      
      {/* Mobile Navigation */}
      <MobileNavigation />
      
      {/* Main Content (full width without sidebar) */}
      <main
        class="main-content full-width-layout"
        classList={{ 'has-player': isPlayerVisible() }}
        style=""
      >
        <div class="content-wrapper">
          {props.children}
        </div>
      </main>

      {/* Player - Outside main-content to avoid stacking context issues */}
      <Show when={currentTrack()}>
        <MediaPlayer />
      </Show>
      
      {/* Terminal Overlay */}
      <Show when={showTerminal()}>
        <Terminal onClose={() => setShowTerminal(false)} />
      </Show>
    </div>
  );
};

export default Layout;