import { Component, Show } from 'solid-js';

interface CollapsibleTreeItemProps {
  id: string;
  label: string;
  icon?: string;
  count?: number;
  isExpanded: boolean;
  isActive: boolean;
  hasChildren: boolean;
  depth?: number;
  onClick: () => void;
  onToggle?: () => void;
  onKeyDown?: (event: KeyboardEvent) => void;
}

const CollapsibleTreeItem: Component<CollapsibleTreeItemProps> = (props) => {
  const depth = props.depth || 0;
  const indentLevel = depth * 16; // 16px per level

  const handleKeyDown = (event: KeyboardEvent) => {
    if (props.onKeyDown) {
      props.onKeyDown(event);
      return;
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      props.onClick();
    } else if (event.key === 'ArrowRight' && props.hasChildren && !props.isExpanded && props.onToggle) {
      event.preventDefault();
      props.onToggle();
    } else if (event.key === 'ArrowLeft' && props.hasChildren && props.isExpanded && props.onToggle) {
      event.preventDefault();
      props.onToggle();
    }
  };

  const handleClick = () => {
    if (props.hasChildren && props.onToggle) {
      props.onToggle();
    } else {
      props.onClick();
    }
  };

  return (
    <div
      class={`collapsible-tree-item ${props.isActive ? 'active' : ''} ${props.hasChildren ? 'has-children' : ''}`}
      style={`padding-left: ${indentLevel}px;`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="treeitem"
      aria-expanded={props.hasChildren ? props.isExpanded : undefined}
      aria-selected={props.isActive}
      aria-label={props.label}
      tabIndex={0}
    >
      <div class="item-content">
        {/* Expand/Collapse Icon */}
        <Show when={props.hasChildren}>
          <span class={`expand-icon ${props.isExpanded ? 'expanded' : ''}`}>
            {props.isExpanded ? '▼' : '►'}
          </span>
        </Show>
        
        {/* Item Icon */}
        <Show when={props.icon}>
          <span class="item-icon">{props.icon}</span>
        </Show>
        
        {/* Item Label */}
        <span class="item-label">{props.label}</span>
        
        {/* Item Count */}
        <Show when={props.count !== undefined}>
          <span class="item-count">({props.count})</span>
        </Show>
      </div>
    </div>
  );
};

export default CollapsibleTreeItem;