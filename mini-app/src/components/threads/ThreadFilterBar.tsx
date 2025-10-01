import { Component, For } from 'solid-js';
import './ThreadFilterBar.css';

interface FilterOption {
  value: string;
  label: string;
}

interface Props {
  filters: FilterOption[];
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

export const ThreadFilterBar: Component<Props> = (props) => {
  return (
    <div class="filter-bar" role="tablist">
      <For each={props.filters}>
        {(filter) => (
          <button
            class={`filter-btn ${props.activeFilter === filter.value ? 'filter-btn--active' : ''}`}
            data-filter={filter.value}
            role="tab"
            aria-selected={props.activeFilter === filter.value}
            onClick={() => props.onFilterChange(filter.value)}
          >
            {filter.label}
          </button>
        )}
      </For>
    </div>
  );
};
