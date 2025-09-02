import { Component, onMount } from 'solid-js';
import { toggleDemoAuth } from '../../stores/authStore';
import { staggeredFadeIn, typewriter, glitch } from '../../utils/animations';

export const SplashContent: Component = () => {
  let heroRef!: HTMLDivElement;
  let featuresRef!: HTMLDivElement;
  let titleRef!: HTMLHeadingElement;
  let taglineRef!: HTMLDivElement;

  onMount(() => {
    // Staggered entrance animations
    if (heroRef) {
      const elements = heroRef.querySelectorAll('.animate-in');
      staggeredFadeIn(elements);
    }

    // Typewriter effect for title
    if (titleRef) {
      setTimeout(() => {
        typewriter(titleRef, 'JAMZY::MUSIC_DISCOVERY_PROTOCOL', 80);
      }, 500);
    }

    // Glitch effect for tagline
    if (taglineRef) {
      setTimeout(() => {
        glitch(taglineRef);
      }, 3000);
    }
  });

  const handleDemoMode = () => {
    // For now, just authenticate the user
    toggleDemoAuth();
  };

  const handleConnectFarcaster = () => {
    // TODO: Implement real Farcaster authentication
    console.log('Connect Farcaster clicked');
    toggleDemoAuth(); // For demo purposes
  };

  return (
    <div class="splash-content">
      {/* Hero Section */}
      <div ref={heroRef} class="hero-section">
        <div class="hero-content">
          {/* Terminal Window */}
          <div class="terminal-window animate-in">
            <div class="terminal-header">
              <div class="terminal-buttons">
                <div class="terminal-button close"></div>
                <div class="terminal-button minimize"></div>
                <div class="terminal-button maximize"></div>
              </div>
              <div class="terminal-title">jamzy://discovery_protocol.exe</div>
            </div>
            <div class="terminal-body">
              <div class="terminal-line">
                <span class="terminal-prompt">C:\JAMZY&gt;</span>
                <span class="cursor-blink">_</span>
              </div>
            </div>
          </div>

          {/* Main Headlines */}
          <div class="headlines animate-in">
            <h1 ref={titleRef} class="primary-headline"></h1>
            <p class="subheadline animate-in">Where every track starts a conversation</p>
            <div ref={taglineRef} class="terminal-tagline animate-in">
              &gt; Connecting music lovers on Farcaster since 2024
            </div>
          </div>

          {/* Authentication CTAs */}
          <div class="cta-section animate-in">
            <button 
              class="cta-primary"
              onClick={handleConnectFarcaster}
            >
              <span class="terminal-prompt">&gt;</span>
              <span>CONNECT_FARCASTER</span>
              <span class="cursor-blink">_</span>
            </button>
            
            <button 
              class="cta-secondary"
              onClick={handleDemoMode}
            >
              <span class="terminal-prompt">&gt;</span>
              <span>DEMO_MODE</span>
            </button>
          </div>
        </div>
      </div>

      {/* Feature Highlights */}
      <div ref={featuresRef} class="features-section">
        <div class="features-grid">
          <div class="feature-card animate-in">
            <div class="feature-icon">[DISCOVER]</div>
            <div class="feature-content">
              <h3>Human-Curated Discovery</h3>
              <p>Find music through trusted networks of real people, not algorithms</p>
            </div>
          </div>
          
          <div class="feature-card animate-in">
            <div class="feature-icon">[COLLECT]</div>
            <div class="feature-content">
              <h3>Social Library Building</h3>
              <p>Build your library through social sharing and community curation</p>
            </div>
          </div>
          
          <div class="feature-card animate-in">
            <div class="feature-icon">[CONNECT]</div>
            <div class="feature-content">
              <h3>Music as Conversation</h3>
              <p>Every song becomes a thread, every playlist a discussion</p>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Elements */}
      <div class="floating-elements">
        <div class="floating-vinyl">♪</div>
        <div class="floating-note">♫</div>
        <div class="floating-wave">~</div>
      </div>
    </div>
  );
};