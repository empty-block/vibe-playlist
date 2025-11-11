import { Component, onMount, createMemo, createResource, Show, createSignal, createEffect } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import ChannelList from '../components/channels/ChannelList';
import MobileNavigation from '../components/layout/MobileNavigation/MobileNavigation';
import { fetchChannels } from '../services/api';
import { staggeredFadeIn } from '../utils/animations';
import './channelsPage.css';

const ChannelsPage: Component = () => {
  const navigate = useNavigate();

  // Window state
  const [windowMinimized, setWindowMinimized] = createSignal(false);
  const [windowMaximized, setWindowMaximized] = createSignal(false);

  // Fetch channels from API
  const [channelsData] = createResource(fetchChannels);

  // Transform API data to component format
  const channels = createMemo(() => {
    const data = channelsData();
    if (!data || !data.channels) return [];

    const transformed = data.channels.map(ch => ({
      id: ch.id,
      name: ch.name.toLowerCase().replace(/\s+/g, '_'),
      topic: ch.description || '',
      messageCount: ch.stats?.threadCount || 0,
      colorHex: ch.colorHex,
      iconUrl: ch.iconUrl,
      threadId: ch.id // Using channel ID as threadId for now
    }));

    // Sort by message count in descending order (highest first)
    const sorted = transformed.sort((a, b) => b.messageCount - a.messageCount);

    console.log('[ChannelsPage] Transformed channels:', sorted.map(c => ({ name: c.name, messageCount: c.messageCount })));
    return sorted;
  });

  // Handle channel click - navigate to channel view with channel ID
  const handleChannelClick = (channelId: string) => {
    console.log(`Navigating to channel: ${channelId}`);
    navigate(`/channels/${channelId}`);
  };

  // Entrance animation - run after channels load and render
  createEffect(() => {
    // Track channels to trigger effect when they load
    const channelsList = channels();

    // Only animate if we have channels
    if (channelsList.length > 0) {
      // Small delay to ensure DOM is fully rendered
      setTimeout(() => {
        const channelItems = document.querySelectorAll('.channel-item');
        if (channelItems.length > 0) {
          staggeredFadeIn(channelItems);
        }
      }, 50);
    }
  });

  return (
    <div class="channels-page">
      {/* Main content */}
      <main class="channels-main" role="main">
        <Show when={channelsData.loading}>
          <div class="loading-state">Loading channels...</div>
        </Show>

        <Show when={channelsData.error}>
          <div class="error-state">Failed to load channels. Please try again.</div>
        </Show>

        <Show when={!channelsData.loading && !channelsData.error}>
          <div class="page-window-container">
            {/* Channel list */}
            <ChannelList
              channels={channels()}
              onChannelClick={handleChannelClick}
              onMinimize={() => setWindowMinimized(!windowMinimized())}
              onMaximize={() => setWindowMaximized(!windowMaximized())}
            />
          </div>
        </Show>
      </main>

      {/* Bottom Navigation */}
      <MobileNavigation class="pb-safe" />
    </div>
  );
};

export default ChannelsPage;
