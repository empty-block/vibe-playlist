import { Component } from 'solid-js';
import './channelCard.css';

interface ChannelCardProps {
  channelId: string;
  channelName: string;
  channelDescription: string;
}

const ChannelCard: Component<ChannelCardProps> = (props) => {
  return (
    <article
      class="channel-card"
      role="article"
      aria-label={`Channel ${props.channelName}: ${props.channelDescription}`}
    >
      {/* Channel name with hash */}
      <div class="channel-card-header">
        <span class="channel-hash">#</span>
        <h3 class="channel-name">{props.channelName}</h3>
      </div>

      {/* Channel description */}
      <div class="channel-card-body">
        <p class="channel-description">{props.channelDescription}</p>
      </div>
    </article>
  );
};

export default ChannelCard;
