import { Component, For, JSX } from 'solid-js';
import ChannelRow, { ChannelRowProps } from './ChannelRow';
import './channelList.css';

export interface ChannelListProps {
  channels: (Omit<ChannelRowProps, 'onClick'> & { threadId: string })[];
  onChannelClick: (channelId: string, threadId: string) => void;
}

const ChannelList: Component<ChannelListProps> = (props) => {
  return (
    <div class="channel-list-container">
      {/* Top border with header */}
      <div class="channel-list-header">
        <span class="channel-list-border-top">
          ╭─── CHANNELS ──[ 🎵 {props.channels.length} TOTAL ]
        </span>
        <span class="channel-list-border-top-end">╮</span>
      </div>

      {/* Column labels */}
      <div class="channel-list-labels">
        <span class="label-prefix">#</span>
        <span class="label-name">NAME</span>
        <span class="label-count">MSGS</span>
        <span class="label-topic">TOPIC</span>
      </div>

      {/* Channel rows */}
      <div class="channel-list-content" role="list" aria-label="Available channels">
        <For each={props.channels}>
          {(channel) => (
            <div class="channel-row-group">
              <ChannelRow
                id={channel.id}
                name={channel.name}
                topic={channel.topic}
                messageCount={channel.messageCount}
                onClick={() => props.onChannelClick(channel.id, channel.threadId)}
              />
            </div>
          )}
        </For>
      </div>

      {/* Bottom border */}
      <div class="channel-list-footer">
        <span class="channel-list-border-bottom">╰</span>
        <span class="channel-list-border-bottom-line">─────────────────────────────────────────────────────────────</span>
        <span class="channel-list-border-bottom-end">╯</span>
      </div>
    </div>
  );
};

export default ChannelList;
