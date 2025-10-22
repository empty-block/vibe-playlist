import { Component } from 'solid-js';
import './channelSortBar.css';

export type ChannelSortOption = 'hot' | 'active' | 'a-z';

export interface ChannelSortBarProps {
  currentSort: ChannelSortOption;
  onSortChange: (sort: ChannelSortOption) => void;
}

const ChannelSortBar: Component<ChannelSortBarProps> = (props) => {
  const sortOptions = [
    { value: 'hot' as const, label: 'HOT' },
    { value: 'active' as const, label: 'ACTIVE' },
    { value: 'a-z' as const, label: 'A-Z' }
  ];

  return (
    <div class="channel-sort-bar">
      {sortOptions.map((option) => (
        <button
          class={`channel-sort-button ${props.currentSort === option.value ? 'channel-sort-button--active' : ''}`}
          data-sort={option.value}
          onClick={() => props.onSortChange(option.value)}
          aria-label={`Sort by ${option.label}`}
          aria-pressed={props.currentSort === option.value}
          role="tab"
          aria-selected={props.currentSort === option.value}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};

export default ChannelSortBar;
