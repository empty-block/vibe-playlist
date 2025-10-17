import { Component, onMount, createMemo, createResource, Show } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import ChannelList from '../components/channels/ChannelList';
import MobileNavigation from '../components/layout/MobileNavigation/MobileNavigation';
import { fetchChannels } from '../services/api';
import anime from 'animejs';
import './channelsPage.css';

const ChannelsPage: Component = () => {
  const navigate = useNavigate();

  // Fetch channels from API
  const [channelsData] = createResource(fetchChannels);

  // Transform API data to component format
  const channels = createMemo(() => {
    const data = channelsData();
    if (!data || !data.channels) return [];

    return data.channels.map(ch => ({
      id: ch.id,
      name: ch.name.toLowerCase().replace(/\s+/g, '_'),
      topic: ch.description || '',
      messageCount: ch.stats?.threadCount || 0,
      colorHex: ch.colorHex,
      threadId: ch.id // Using channel ID as threadId for now
    }));
  });

  // Handle channel click - navigate to channel view with channel ID
  const handleChannelClick = (channelId: string) => {
    console.log(`Navigating to channel: ${channelId}`);
    navigate(`/channels/${channelId}`);
  };

  // Entrance animation on mount
  onMount(() => {
    const rows = document.querySelectorAll('.channel-row-group');
    anime({
      targets: rows,
      opacity: [0, 1],
      translateX: [-20, 0],
      delay: anime.stagger(30),
      duration: 400,
      easing: 'easeOutQuad'
    });
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
          {/* Channel list */}
          <ChannelList
            channels={channels()}
            onChannelClick={handleChannelClick}
          />
        </Show>
      </main>

      {/* Bottom Navigation */}
      <MobileNavigation class="pb-safe" />
    </div>
  );
};

export default ChannelsPage;
