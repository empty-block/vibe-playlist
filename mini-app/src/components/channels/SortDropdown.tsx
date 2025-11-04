import { Component, Show, createSignal, onMount, onCleanup } from 'solid-js';
import type { ChannelFeedSortOption } from '../../../../shared/types/channels';
import './SortDropdown.css';

interface SortDropdownProps {
  activeSort: ChannelFeedSortOption;
  onSortChange: (sort: ChannelFeedSortOption) => void;
}

const SORT_OPTIONS: Array<{
  value: Exclude<ChannelFeedSortOption, 'shuffle'>;
  label: string;
}> = [
  { value: 'recent', label: 'Recent' },
  { value: 'popular_24h', label: 'Popular 24h' },
  { value: 'popular_7d', label: 'Popular 7d' },
  { value: 'all_time', label: 'All Time' },
];

export const SortDropdown: Component<SortDropdownProps> = (props) => {
  const [isOpen, setIsOpen] = createSignal(false);
  let dropdownRef: HTMLDivElement | undefined;

  // Get label for current sort (exclude shuffle)
  const currentLabel = () => {
    if (props.activeSort === 'shuffle') return 'Recent';
    const option = SORT_OPTIONS.find(opt => opt.value === props.activeSort);
    return option?.label || 'Recent';
  };

  // Handle sort selection
  const handleSortSelect = (sort: Exclude<ChannelFeedSortOption, 'shuffle'>) => {
    props.onSortChange(sort);
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  const handleClickOutside = (e: MouseEvent) => {
    if (dropdownRef && !dropdownRef.contains(e.target as Node)) {
      setIsOpen(false);
    }
  };

  onMount(() => {
    document.addEventListener('mousedown', handleClickOutside);
  });

  onCleanup(() => {
    document.removeEventListener('mousedown', handleClickOutside);
  });

  return (
    <div class="sort-dropdown-wrapper" ref={dropdownRef}>
      <button
        class="sort-dropdown-btn"
        onClick={() => setIsOpen(!isOpen())}
        aria-label="Sort options"
        aria-expanded={isOpen()}
      >
        <span class="sort-icon">📊</span>
        <span class="sort-label">Sort: {currentLabel()}</span>
        <span class="chevron">{isOpen() ? '▲' : '▼'}</span>
      </button>

      <Show when={isOpen()}>
        <div class="sort-dropdown-menu">
          <div class="dropdown-header">
            Sort By
          </div>
          <div class="dropdown-options dropdown-options--radio">
            {SORT_OPTIONS.map((option) => (
              <label class="radio-option">
                <input
                  type="radio"
                  name="sort-dropdown"
                  checked={props.activeSort === option.value}
                  onChange={() => handleSortSelect(option.value)}
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        </div>
      </Show>
    </div>
  );
};
