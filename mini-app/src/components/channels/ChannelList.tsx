import { Component, For, createSignal } from 'solid-js';
import ChannelRow, { ChannelRowProps } from './ChannelRow';
import RetroWindow from '../common/RetroWindow';
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

  return (
    <RetroWindow
      title="Music Channels"
      icon={<div class="title-icon"></div>}
      variant="3d"
      showMinimize={true}
      showMaximize={true}
      showClose={true}
      showThemeToggle={true}
      onClose={props.onClose}
      onMinimize={props.onMinimize}
      onMaximize={props.onMaximize}
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
