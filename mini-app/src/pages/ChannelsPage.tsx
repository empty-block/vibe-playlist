import { Component, onMount, createSignal, createMemo } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import ChannelList from '../components/channels/ChannelList';
import { ChannelRowProps } from '../components/channels/ChannelRow';
import ChannelSortBar, { ChannelSortOption } from '../components/channels/ChannelSortBar';
import MobileNavigation from '../components/layout/MobileNavigation/MobileNavigation';
import TerminalHeader from '../components/layout/Header/TerminalHeader';
import anime from 'animejs';
import './channelsPage.css';

// Mock channel data with real thread IDs from the database
const mockChannels: Array<Omit<ChannelRowProps, 'onClick'> & { threadId: string }> = [
  {
    id: 'hip-hop',
    name: 'hip_hop_heads',
    topic: 'Golden era hip-hop discussion',
    messageCount: 127,
    threadId: '0x5e409db1c9c408fbbb55d7a826c1fe4aeeee12af' // Kendrick Lamar - peekaboo
  },
  {
    id: 'vaporwave',
    name: 'vaporwave_sanctuary',
    topic: 'A E S T H E T I C vibes only',
    messageCount: 43,
    threadId: '0x1d8678db5a109e9de1493af22c7da33504790509' // Vaporwave is my favorite drug
  },
  {
    id: 'techno',
    name: 'techno_basement',
    topic: '4/4 forever, minimal & deep',
    messageCount: 89,
    threadId: '0x20370455a238179cb84f011f55c193d61ad2c8da' // Fontaines D.C. - Jackie Down The Line
  },
  {
    id: 'indie',
    name: 'indie_bedroom_recordings',
    topic: 'Lo-fi bedroom pop & indie gems',
    messageCount: 34,
    threadId: '0x258aefc5623eeecabb612986a952caaaa9ed1627' // Beach House - Myth
  },
  {
    id: 'jazz',
    name: 'jazz_after_midnight',
    topic: 'Standards, bebop, and beyond',
    messageCount: 12,
    threadId: '0x47c6f3e442df2cc543aced92d489615742a2cae1' // Bill Withers - Lovely Day
  },
  {
    id: 'punk',
    name: 'punk_basement',
    topic: 'Hardcore and punk rock',
    messageCount: 67,
    threadId: '0x2b0f7e9fae5eda9b1c705d1c0102b4d9a460f475' // Agnostic Front - Gotta Go
  },
  {
    id: 'grunge',
    name: '90s_grunge',
    topic: 'Nirvana, Soundgarden & more',
    messageCount: 23,
    threadId: '0x8aad646247e054f2da86ec9df397a1782a1fa111' // Nirvana MTV Unplugged
  },
  {
    id: 'radio',
    name: 'radiohead_heads',
    topic: 'In Rainbows and beyond',
    messageCount: 156,
    threadId: '0x07413a6d41afd63789e8820d1e99da1e0afcc83f' // Radiohead - Live at Bonnaroo
  },
  {
    id: 'electronic',
    name: 'electronic_dreams',
    topic: 'IDM, ambient, and experimental',
    messageCount: 78,
    threadId: '0x3f8a7b2c9d5e6f1a8b3c4d5e6f7a8b9c0d1e2f3a' // Aphex Twin vibes
  },
  {
    id: 'metal',
    name: 'metal_mosh_pit',
    topic: 'From doom to death metal',
    messageCount: 91,
    threadId: '0x4a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b' // Heavy riffs only
  },
  {
    id: 'soul',
    name: 'soul_records',
    topic: 'Classic soul and R&B',
    messageCount: 56,
    threadId: '0x5b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c' // Motown and beyond
  },
  {
    id: 'disco',
    name: 'disco_fever',
    topic: 'Boogie nights and funk',
    messageCount: 38,
    threadId: '0x6c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d' // Saturday night vibes
  },
  {
    id: 'folk',
    name: 'folk_acoustic',
    topic: 'Singer-songwriter stories',
    messageCount: 29,
    threadId: '0x7d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e' // Campfire sessions
  },
  {
    id: 'experimental',
    name: 'experimental_lab',
    topic: 'Avant-garde and noise',
    messageCount: 15,
    threadId: '0x8e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f' // Sound exploration
  },
  {
    id: 'reggae',
    name: 'reggae_roots',
    topic: 'Roots, dub, and dancehall',
    messageCount: 47,
    threadId: '0x9f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a' // Island vibes
  },
  {
    id: 'classical',
    name: 'classical_chamber',
    topic: 'From Bach to contemporary',
    messageCount: 18,
    threadId: '0x0a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b' // Orchestral beauty
  },
  {
    id: 'house',
    name: 'house_music',
    topic: 'Deep house and garage',
    messageCount: 103,
    threadId: '0x1b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c' // Four on the floor
  },
  {
    id: 'blues',
    name: 'blues_corner',
    topic: 'Delta blues and Chicago sound',
    messageCount: 31,
    threadId: '0x2c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d' // 12-bar classics
  }
];

const ChannelsPage: Component = () => {
  const navigate = useNavigate();
  const [currentSort, setCurrentSort] = createSignal<ChannelSortOption>('hot');

  // Sort channels based on current sort option
  const sortedChannels = createMemo(() => {
    const channels = [...mockChannels];

    switch (currentSort()) {
      case 'hot':
        // Sort by message count (most active first)
        return channels.sort((a, b) => b.messageCount - a.messageCount);

      case 'active':
        // For now, reverse order (in real app, would sort by last activity timestamp)
        return channels.reverse();

      case 'a-z':
        return channels.sort((a, b) => a.name.localeCompare(b.name));

      default:
        return channels;
    }
  });

  // Handle channel click - navigate to channel view
  const handleChannelClick = (channelId: string, threadId: string) => {
    console.log(`Navigating to channel: ${channelId}, thread: ${threadId}`);

    // Find the channel data to pass to ChannelViewPage
    const channel = mockChannels.find(c => c.id === channelId);

    navigate(`/channel/${threadId}`, {
      state: {
        channelName: channel?.name || channelId,
        channelDescription: channel?.topic || 'Channel description'
      }
    });
  };

  // Handle sort change with fade animation
  const handleSortChange = (newSort: ChannelSortOption) => {
    const content = document.querySelector('.channel-list-content');
    if (!content) return;

    // Fade out
    anime({
      targets: content,
      opacity: [1, 0],
      duration: 150,
      easing: 'easeOutQuad',
      complete: () => {
        // Update sort
        setCurrentSort(newSort);

        // Fade in
        anime({
          targets: content,
          opacity: [0, 1],
          duration: 200,
          easing: 'easeInQuad'
        });
      }
    });
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
      {/* Terminal Header */}
      <TerminalHeader
        title="JAMZY::CHANNEL_BROWSER"
        path="~/channels"
        command="list --all"
        statusInfo={`CHANNELS: ${mockChannels.length}`}
        borderColor="magenta"
        class="channels-terminal-header"
      >
        <h1 class="channels-title">Channels</h1>
      </TerminalHeader>

      {/* Main content */}
      <main class="channels-main" role="main">
        {/* Sort bar */}
        <ChannelSortBar
          currentSort={currentSort()}
          onSortChange={handleSortChange}
        />

        {/* Channel list */}
        <ChannelList
          channels={sortedChannels()}
          onChannelClick={handleChannelClick}
        />
      </main>

      {/* Bottom Navigation */}
      <MobileNavigation class="pb-safe" />
    </div>
  );
};

export default ChannelsPage;
