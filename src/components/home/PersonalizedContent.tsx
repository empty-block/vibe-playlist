import { Component, onMount, For, Show } from 'solid-js';
import { currentUser } from '../../stores/authStore';
import { staggeredFadeIn, typewriter, shimmer } from '../../utils/animations';
import type { HomePageData } from './HomePage';

// Sub-components
import { WelcomeTerminal } from './components/WelcomeTerminal';
import { RecentlyPlayedSection } from './components/RecentlyPlayedSection';
import { FavoriteNetworksSection } from './components/FavoriteNetworksSection';
import { FavoriteArtistsSection } from './components/FavoriteArtistsSection';
import { DiscoverySuggestionsSection } from './components/DiscoverySuggestionsSection';

interface PersonalizedContentProps {
  data: HomePageData;
  loading: boolean;
  contentLoaded: boolean;
}

export const PersonalizedContent: Component<PersonalizedContentProps> = (props) => {
  let contentRef!: HTMLDivElement;

  onMount(() => {
    // Staggered entrance animations for content sections
    if (contentRef && props.contentLoaded) {
      const sections = contentRef.querySelectorAll('.content-section');
      staggeredFadeIn(sections);
    }
  });

  return (
    <div ref={contentRef} class="personalized-content">
      {/* Welcome Section */}
      <div class="content-section welcome-section">
        <WelcomeTerminal 
          username={currentUser().username}
          stats={props.data.discoveryStats}
          loading={props.loading}
        />
      </div>

      {/* Main Content Grid - Vertical Stack */}
      <div class="main-content-grid">
        {/* Recently Played */}
        <div class="content-section">
          <RecentlyPlayedSection 
            tracks={props.data.recentlyPlayed}
            loading={props.loading}
          />
        </div>

        {/* Favorite Networks */}
        <div class="content-section">
          <FavoriteNetworksSection 
            networks={props.data.favoriteNetworks}
            loading={props.loading}
          />
        </div>

        {/* Favorite Artists */}
        <div class="content-section">
          <FavoriteArtistsSection 
            artists={props.data.favoriteArtists}
            loading={props.loading}
          />
        </div>

        {/* Discovery Suggestions */}
        <div class="content-section">
          <DiscoverySuggestionsSection 
            suggestions={props.data.suggestions}
            loading={props.loading}
          />
        </div>
      </div>

      {/* Loading Overlay */}
      <Show when={props.loading}>
        <div class="loading-overlay">
          <div class="loading-terminal">
            <div class="loading-text">
              <span class="terminal-prompt">&gt;</span>
              <span>Loading your music universe...</span>
              <span class="cursor-blink">_</span>
            </div>
            <div class="loading-progress">
              <div class="progress-bar"></div>
            </div>
          </div>
        </div>
      </Show>
    </div>
  );
};