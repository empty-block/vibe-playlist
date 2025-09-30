import { Component, For, Show, onMount } from 'solid-js';
import { staggeredFadeIn, buttonHover } from '../../../utils/animations';
import type { Network } from '../HomePage';

interface FavoriteNetworksSectionProps {
  networks: Network[];
  loading: boolean;
}

export const FavoriteNetworksSection: Component<FavoriteNetworksSectionProps> = (props) => {
  let sectionRef!: HTMLDivElement;
  let networksGridRef!: HTMLDivElement;

  onMount(() => {
    if (networksGridRef && !props.loading) {
      const networkItems = networksGridRef.querySelectorAll('.network-badge');
      staggeredFadeIn(networkItems);
    }
  });

  const handleNetworkClick = (network: Network) => {
    console.log('Filtering by network:', network.name);
    // TODO: Navigate to library with network filter
  };

  return (
    <div ref={sectionRef} class="favorite-networks-section">
      <div class="section-header">
        <h3 class="section-title">
          <span class="title-bracket">[</span>
          NETWORKS
          <span class="title-bracket">]</span>
        </h3>
        <div class="section-subtitle">Your music communities</div>
      </div>

      <Show 
        when={!props.loading && props.networks.length > 0}
        fallback={
          <div class="loading-grid">
            <For each={Array(3).fill(0)}>
              {() => (
                <div class="network-skeleton">
                  <div class="skeleton-avatar"></div>
                  <div class="skeleton-info">
                    <div class="skeleton-name"></div>
                    <div class="skeleton-count"></div>
                  </div>
                </div>
              )}
            </For>
          </div>
        }
      >
        <div ref={networksGridRef} class="networks-grid">
          <For each={props.networks}>
            {(network) => (
              <div 
                class={`network-badge ${network.isNew ? 'new-network' : ''}`}
                onClick={() => handleNetworkClick(network)}
              >
                <div class="network-avatar">
                  <img src={network.avatar} alt={`${network.name} avatar`} />
                  <div class={`activity-indicator ${network.isActive ? 'active' : 'quiet'}`}>
                    <div class="indicator-dot"></div>
                  </div>
                </div>
                
                <div class="network-info">
                  <div class="network-name">{network.name}</div>
                  <div class="network-count">
                    {network.userCount.toLocaleString()} members
                  </div>
                </div>
                
                {network.isNew && <div class="new-badge">NEW</div>}
              </div>
            )}
          </For>
        </div>
      </Show>

      <div class="section-footer">
        <button class="discover-button">
          <span class="terminal-prompt">&gt;</span>
          <span>DISCOVER_NETWORKS</span>
        </button>
      </div>
    </div>
  );
};