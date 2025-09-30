import { Component, onMount, For, Show } from 'solid-js';
import { currentUser } from '../../stores/authStore';
import { staggeredFadeIn, typewriter, shimmer } from '../../utils/animations';
import type { HomePageData } from './HomePage';
import NetworkSelector from '../../components/network/NetworkSelector';
import { selectedNetwork, setSelectedNetwork } from '../../stores/networkStore';

// Sub-components
import { WelcomeTerminal } from './components/WelcomeTerminal';
import { RecentlyPlayedSection } from './components/RecentlyPlayedSection';
import { FavoriteNetworksSection } from './components/FavoriteNetworksSection';
import { NewTracksSection } from './components/NewTracksSection';
import { TopConnectionsSection } from './components/TopConnectionsSection';

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
      {/* Terminal Header */}
      <div class="content-section header-section mb-6">
        <div class="bg-[#0d0d0d] border-2 border-[#04caf4]/30 rounded-lg overflow-visible">
          {/* Terminal Title Bar */}
          <div class="bg-[rgba(4,202,244,0.02)] border-b border-[#04caf4]/20 px-4 py-3">
            <div class="flex items-center justify-between">
              {/* Left section: Status and Title */}
              <div class="flex items-center gap-4">
                <div class="flex items-center gap-2">
                  <div class="w-2 h-2 bg-[#00f92a] rounded-full animate-pulse"></div>
                  <span class="text-[10px] text-[#00f92a] font-mono tracking-wider">ONLINE</span>
                </div>
                <div class="text-[#04caf4] font-mono text-sm font-bold tracking-wider" style="text-shadow: 0 0 10px rgba(4, 202, 244, 0.5);">
                  [JAMZY::HOME]
                </div>
              </div>
              
              {/* Center section: Network Selector */}
              <div class="flex-shrink-0">
                <NetworkSelector 
                  selectedNetwork={selectedNetwork()}
                  onNetworkChange={(networkId) => setSelectedNetwork(networkId)}
                  compact={true}
                />
              </div>
              
              {/* Right section: Add Track Button */}
              <div class="flex items-center">
                <button class="bg-[#00f92a]/20 border border-[#00f92a]/40 px-3 py-1 hover:bg-[#00f92a]/30 transition-all group">
                  <span class="text-[#00f92a] font-mono text-xs font-bold">+ ADD_TRACK</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

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
        <div class="content-section recently-played-theme">
          <RecentlyPlayedSection 
            tracks={props.data.recentlyPlayed}
            loading={props.loading}
          />
        </div>

        {/* Favorite Networks */}
        <div class="content-section networks-theme">
          <FavoriteNetworksSection 
            networks={props.data.favoriteNetworks}
            loading={props.loading}
          />
        </div>

        {/* New Tracks */}
        <div class="content-section new-tracks-theme">
          <NewTracksSection 
            tracks={props.data.recentlyPlayed}
            loading={props.loading}
          />
        </div>

        {/* Top Connections */}
        <div class="content-section connections-theme">
          <TopConnectionsSection 
            connections={props.data.topConnections}
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