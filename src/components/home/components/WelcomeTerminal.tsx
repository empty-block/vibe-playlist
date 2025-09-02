import { Component, onMount, Show } from 'solid-js';
import { typewriter, counterAnimation } from '../../../utils/animations';

interface WelcomeTerminalProps {
  username: string;
  stats: { newConnections: number; newTracks: number } | null;
  loading: boolean;
}

export const WelcomeTerminal: Component<WelcomeTerminalProps> = (props) => {
  let terminalRef!: HTMLDivElement;
  let welcomeLineRef!: HTMLDivElement;
  let connectionsCountRef!: HTMLSpanElement;
  let tracksCountRef!: HTMLSpanElement;

  onMount(() => {
    // Typewriter effect for welcome message
    if (welcomeLineRef && !props.loading) {
      setTimeout(() => {
        typewriter(
          welcomeLineRef.querySelector('.welcome-text') as HTMLElement,
          `Welcome back, @${props.username}`,
          60
        );
      }, 300);
    }

    // Counter animations for stats
    if (props.stats && !props.loading) {
      setTimeout(() => {
        if (connectionsCountRef) {
          counterAnimation(connectionsCountRef, 0, props.stats!.newConnections);
        }
        if (tracksCountRef) {
          counterAnimation(tracksCountRef, 0, props.stats!.newTracks);
        }
      }, 1000);
    }
  });

  return (
    <div ref={terminalRef} class="welcome-terminal">
      <div class="terminal-header">
        <div class="terminal-status">
          <span class="status-indicator active"></span>
          <span class="status-text">[TERMINAL::SESSION_ACTIVE]</span>
        </div>
        <div class="terminal-timestamp">
          {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
      
      <div class="terminal-content">
        <div ref={welcomeLineRef} class="terminal-line welcome-line">
          <span class="terminal-prompt">&gt;</span>
          <span class="welcome-text"></span>
        </div>
        
        <Show when={props.stats && !props.loading}>
          <div class="terminal-line stats-line">
            <span class="terminal-prompt">&gt;</span>
            <span>Your music network has grown by </span>
            <span 
              ref={connectionsCountRef} 
              class="stat-number neon-cyan"
            >
              0
            </span>
            <span> connections</span>
          </div>
          
          <div class="terminal-line stats-line">
            <span class="terminal-prompt">&gt;</span>
            <span ref={tracksCountRef} class="stat-number neon-green">0</span>
            <span> new tracks discovered since last visit</span>
          </div>
        </Show>
        
        <Show when={props.loading}>
          <div class="terminal-line loading-line">
            <span class="terminal-prompt">&gt;</span>
            <span>Synchronizing music universe</span>
            <span class="loading-dots">...</span>
          </div>
        </Show>
        
        <div class="terminal-line cursor-line">
          <span class="terminal-prompt">&gt;</span>
          <span class="cursor-blink">_</span>
        </div>
      </div>
    </div>
  );
};