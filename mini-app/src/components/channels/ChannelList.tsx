import { Component, For, createSignal } from 'solid-js';
import ChannelRow, { ChannelRowProps } from './ChannelRow';
import RetroWindow from '../common/RetroWindow';
import { theme, toggleTheme } from '../../stores/themeStore';
import './channelList.css';

export interface ChannelListProps {
  channels: (Omit<ChannelRowProps, 'onClick'> & { threadId: string })[];
  onChannelClick: (channelId: string, threadId: string) => void;
  onClose?: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
}

const ChannelList: Component<ChannelListProps> = (props) => {
  const [searchTerm, setSearchTerm] = createSignal('');

  // Filter channels based on search term
  const filteredChannels = () => {
    const term = searchTerm().toLowerCase().trim();
    if (!term) return props.channels;

    return props.channels.filter(channel =>
      channel.name.toLowerCase().includes(term) ||
      channel.topic.toLowerCase().includes(term)
    );
  };

  // Menu items for hamburger dropdown
  const menuItems = [
    {
      label: () => `Theme: ${theme() === 'light' ? 'Light' : 'Dark'}`,
      icon: () => theme() === 'light' ? '☀️' : '🌙',
      onClick: () => toggleTheme()
    },
    {
      label: 'Feedback',
      icon: '💬',
      onClick: () => alert('Feedback form coming soon! For now, please share your thoughts in the /jamzy channel.')
    }
  ];

  return (
    <RetroWindow
      title="Music Channels"
      icon={
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="image-rendering: pixelated;">
          <path d="M3 5 L3 3 L10 3 L11 5 L21 5 L21 19 L3 19 Z" />
        </svg>
      }
      variant="3d"
      showMenu={true}
      menuItems={menuItems}
      contentPadding="0"
      footer={
        <div class="search-section">
          <div class="search-container">
            <label class="search-label" for="channelSearchInput">Find:</label>
            <div class="search-input-wrapper">
              <input
                type="text"
                id="channelSearchInput"
                class="search-input"
                placeholder="Search channels..."
                autocomplete="off"
                value={searchTerm()}
                onInput={(e) => setSearchTerm(e.currentTarget.value)}
              />
            </div>
          </div>
        </div>
      }
    >
      {/* Channels Container - Scrollable */}
      <div class="channels-container" role="list" aria-label="Available channels">
        <For each={filteredChannels()}>
          {(channel, index) => (
            <ChannelRow
              id={channel.id}
              name={channel.name}
              topic={channel.topic}
              messageCount={channel.messageCount}
              colorHex={channel.colorHex}
              iconUrl={channel.iconUrl}
              isEven={index() % 2 === 1}
              onClick={() => props.onChannelClick(channel.id, channel.threadId)}
            />
          )}
        </For>
        {filteredChannels().length === 0 && searchTerm() !== '' && (
          <div class="empty-state">
            No channels found matching your search.
          </div>
        )}
      </div>
    </RetroWindow>
  );
};

export default ChannelList;
