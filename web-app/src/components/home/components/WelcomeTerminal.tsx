import { Component, onMount, Show, createSignal, onCleanup } from 'solid-js';
import { typewriter, counterAnimation } from '../../../utils/animations';

interface WelcomeTerminalProps {
  username: string;
  stats: { newConnections: number; newTracks: number } | null;
  loading: boolean;
}

type TerminalMode = 'welcome' | 'stats' | 'activity' | 'time';

interface TerminalContent {
  mode: TerminalMode;
  content: string;
  duration: number;
}

export const WelcomeTerminal: Component<WelcomeTerminalProps> = (props) => {
  let terminalRef!: HTMLDivElement;
  let contentRef!: HTMLDivElement;
  let intervalId: number | undefined;
  
  const [currentMode, setCurrentMode] = createSignal<TerminalMode>('welcome');
  const [isAnimating, setIsAnimating] = createSignal(false);
  const [isPaused, setIsPaused] = createSignal(false);
  const [displayContent, setDisplayContent] = createSignal('');
  
  // Dynamic content for cycling
  const getTerminalModes = (): TerminalContent[] => [
    {
      mode: 'welcome',
      content: `Welcome back, @${props.username}`,
      duration: 3000
    },
    {
      mode: 'stats',
      content: `${props.stats?.newConnections || 0} connections • ${props.stats?.newTracks || 0} new tracks`,
      duration: 3000
    },
    {
      mode: 'activity',
      content: 'Network activity: Classic Rock +3 users',
      duration: 3000
    },
    {
      mode: 'time',
      content: `Session: 2h 15m • Last sync: just now`,
      duration: 3000
    }
  ];
  
  const cycleContent = () => {
    if (isPaused() || props.loading) return;
    
    const modes = getTerminalModes();
    const currentIndex = modes.findIndex(m => m.mode === currentMode());
    const nextIndex = (currentIndex + 1) % modes.length;
    const nextMode = modes[nextIndex];
    
    // Animate transition
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentMode(nextMode.mode);
      setDisplayContent(nextMode.content);
      setIsAnimating(false);
    }, 300);
  };

  onMount(() => {
    // Initialize content
    const initialMode = getTerminalModes()[0];
    setDisplayContent(initialMode.content);
    
    // Start cycling
    if (!props.loading) {
      intervalId = setInterval(cycleContent, 3000) as unknown as number;
    }
  });
  
  onCleanup(() => {
    if (intervalId) clearInterval(intervalId);
  });

  const handleClick = () => {
    setIsPaused(!isPaused());
    if (!isPaused() && !intervalId) {
      intervalId = setInterval(cycleContent, 3000) as unknown as number;
    }
  };

  return (
    <div 
      ref={terminalRef} 
      class="welcome-terminal"
      onClick={handleClick}
      title={isPaused() ? 'Click to resume' : 'Click to pause'}
    >
      <div class="terminal-header">
        <div class="terminal-status">
          <span class={`status-indicator ${isPaused() ? 'paused' : 'active'}`}></span>
          <span class="status-text">
            [TERMINAL::{currentMode().toUpperCase()}]
          </span>
        </div>
        <div class="terminal-timestamp">
          {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
      
      <div class="terminal-content">
        <Show 
          when={!props.loading}
          fallback={
            <div class="terminal-line loading-line">
              <span class="terminal-prompt">&gt;</span>
              <span>Syncing</span>
              <span class="loading-dots">...</span>
            </div>
          }
        >
          <div 
            ref={contentRef}
            class={`terminal-line terminal-cycling-content ${isAnimating() ? 'animating' : ''}`}
          >
            <span class="terminal-prompt">&gt;</span>
            <span class="cycling-text">{displayContent()}</span>
            <Show when={currentMode() === 'stats'}>
              <span class="status-badges">
                <Show when={props.stats?.newConnections}>
                  <span class="badge-new">NEW</span>
                </Show>
              </span>
            </Show>
          </div>
        </Show>
      </div>
    </div>
  );
};