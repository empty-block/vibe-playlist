import { Component, For, createSignal } from 'solid-js';
import ChannelRow, { ChannelRowProps } from './ChannelRow';
import './channelList.css';

export interface ChannelListProps {
  channels: (Omit<ChannelRowProps, 'onClick'> & { threadId: string })[];
  onChannelClick: (channelId: string, threadId: string) => void;
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
    <div class="win95-window">
      {/* Title Bar */}
      <div class="win95-title-bar">
        <div class="win95-title-text">
          <div class="win95-title-icon"></div>
          <span>Music Channels</span>
        </div>
        <div class="win95-window-controls">
          <button class="win95-control-btn" title="Minimize">_</button>
          <button class="win95-control-btn" title="Maximize">□</button>
          <button class="win95-control-btn" title="Close">×</button>
        </div>
      </div>

      {/* Content Area */}
      <div class="win95-content">
        {/* Channels Container - Scrollable */}
        <div class="win95-channels-container" role="list" aria-label="Available channels">
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
            <div class="win95-empty-state">
              No channels found matching your search.
            </div>
          )}
        </div>
      </div>

      {/* Search Section - Bottom */}
      <div class="win95-search-section">
        <div class="win95-search-container">
          <label class="win95-search-label" for="channelSearchInput">Find:</label>
          <div class="win95-search-input-wrapper">
            <input
              type="text"
              id="channelSearchInput"
              class="win95-search-input"
              placeholder="Search channels..."
              autocomplete="off"
              value={searchTerm()}
              onInput={(e) => setSearchTerm(e.currentTarget.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChannelList;
