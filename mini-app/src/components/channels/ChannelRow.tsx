import { Component } from 'solid-js';
import './channelRow.css';

export interface ChannelRowProps {
  id: string;
  name: string;
  topic: string;
  messageCount: number;
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

  return (
    <>
      {/* Prompt prefix */}
      <span class="channel-cell channel-prefix" onClick={handleClick}>&gt;</span>

      {/* Channel name */}
      <span
        class="channel-cell channel-name"
        onClick={handleClick}
        role="button"
        tabindex="0"
        aria-label={`Channel ${props.name}: ${props.topic}. ${props.messageCount} messages.`}
        onKeyDown={handleKeyDown}
      >
        {props.name}
      </span>

      {/* Message count */}
      <span class="channel-cell channel-count" onClick={handleClick}>{props.messageCount}</span>

      {/* Topic/description */}
      <span class="channel-cell channel-topic" onClick={handleClick}>"{props.topic}"</span>
    </>
  );
};

export default ChannelRow;
