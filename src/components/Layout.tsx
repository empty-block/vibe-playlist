import { Component, createSignal, Show, JSX, createEffect } from 'solid-js';
import WindowsFrame from './WindowsFrame';
import Navigation from './Navigation';
import Terminal from './Terminal';
import MediaPlayer from './MediaPlayer';
import ChatBot from './ChatBot';
import { currentTrack } from '../stores/playlistStore';
import { showChat, closeChat } from '../stores/chatStore';

interface LayoutProps {
  children?: JSX.Element;
}

const Layout: Component<LayoutProps> = (props) => {
  const [showTerminal, setShowTerminal] = createSignal(false);
  const [isCompact, setIsCompact] = createSignal(window.innerWidth < 1024);
  const [forceCompact, setForceCompact] = createSignal(false); // Default to right side when screen is large

  // Make showTerminal globally accessible for the close button
  (window as any).showTerminal = () => setShowTerminal(true);

  // Handle responsive state
  createEffect(() => {
    const handleResize = () => {
      setIsCompact(window.innerWidth < 1024);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  });

  return (
    <div class="h-screen grunge-bg relative overflow-hidden">
      {/* TV Static overlay */}
      <div class="tv-static fixed inset-0 pointer-events-none opacity-5"></div>
      
      {/* Main window */}
      <WindowsFrame onCloseClick={() => setShowTerminal(true)}>
        <Navigation />
        
        <div class={`flex ${isCompact() || forceCompact() ? 'flex-col' : 'flex-row'} flex-1 overflow-hidden`}>
          {/* Chat Sidebar - Only on desktop */}
          <Show when={!isCompact() && !forceCompact()}>
            <ChatBot 
              isVisible={showChat()} 
              onToggle={closeChat}
            />
          </Show>
          
          {/* Main Content - Takes full width on compact, shares on desktop */}
          <div class="flex-1 overflow-y-auto min-w-0">
            {props.children}
          </div>
          
          {/* Player - Bottom horizontal on compact, side vertical on desktop */}
          <Show when={currentTrack()}>
            <div class={`${
              isCompact() || forceCompact()
                ? 'h-52 border-t-2 flex-shrink-0 pb-safe' 
                : 'w-80 border-l-2'
            } border-gray-300`}>
              <MediaPlayer isCompact={() => isCompact() || forceCompact()} onForceCompact={setForceCompact} />
            </div>
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