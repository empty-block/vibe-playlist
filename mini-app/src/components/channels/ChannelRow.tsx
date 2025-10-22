import { Component } from 'solid-js';
import './channelRow.css';

export interface ChannelRowProps {
  id: string;
  name: string;
  topic: string;
  messageCount: number;
  colorHex?: string;
  isEven?: boolean;
  onClick: () => void;
}

const ChannelRow: Component<ChannelRowProps> = (props) => {
  const handleClick = (e: MouseEvent) => {
    props.onClick();
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      props.onClick();
    }
  };

  // Generate emoji icon based on channel name
  const getChannelEmoji = () => {
    const name = props.name.toLowerCase();
    if (name.includes('hip') || name.includes('hop') || name.includes('rap')) return '🎤';
    if (name.includes('electronic') || name.includes('edm') || name.includes('techno')) return '🎹';
    if (name.includes('rock') || name.includes('metal')) return '🎸';
    if (name.includes('jazz')) return '🎺';
    if (name.includes('indie')) return '🎵';
    if (name.includes('soul') || name.includes('r&b') || name.includes('rnb')) return '🎶';
    if (name.includes('pop')) return '⭐';
    if (name.includes('classical') || name.includes('orchestra')) return '🎻';
    if (name.includes('punk')) return '🤘';
    if (name.includes('folk') || name.includes('country')) return '🎻';
    if (name.includes('disco')) return '🕺';
    if (name.includes('reggae')) return '🌴';
    if (name.includes('house')) return '🏠';
    if (name.includes('blues')) return '🎷';
    return '🎵';
  };

  // Get gradient class based on channel ID for variety
  const getGradientClass = () => {
    const index = Math.abs(props.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % 8 + 1;
    return `gradient-${index}`;
  };

  return (
    <div
      class={`channel-item ${props.isEven ? 'even' : ''}`}
      onClick={handleClick}
      role="button"
      tabindex="0"
      aria-label={`Channel ${props.name}: ${props.topic}. ${props.messageCount} messages.`}
      onKeyDown={handleKeyDown}
    >
      {/* Channel Image - 40x40 */}
      <div class={`channel-image ${getGradientClass()}`}>
        {getChannelEmoji()}
      </div>

      {/* Channel Info */}
      <div class="channel-info">
        {/* Channel Header - Name + Badge */}
        <div class="channel-header">
          <span class="channel-name">{props.name}</span>
          <span class="user-badge">{props.messageCount} users</span>
        </div>

        {/* Channel Description */}
        <div class="channel-description">{props.topic}</div>
      </div>
    </div>
  );
};

export default ChannelRow;
