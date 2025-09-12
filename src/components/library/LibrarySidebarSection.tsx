import { Component, For, Show, createSignal, onMount } from 'solid-js';
import { SidebarSection, SidebarItem } from './LibrarySidebar';

interface LibrarySidebarSectionProps {
  section: SidebarSection;
  isExpanded: boolean;
  activeItem: string;
  onToggle: () => void;
  onItemClick: (itemId: string) => void;
  onKeyDown: (event: KeyboardEvent, itemId: string) => void;
}

const LibrarySidebarSection: Component<LibrarySidebarSectionProps> = (props) => {
  const [focusedItemIndex, setFocusedItemIndex] = createSignal(-1);
  let sectionRef: HTMLDivElement | undefined;
  
  const handleSectionKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      props.onToggle();
    } else if (event.key === 'ArrowRight' && !props.isExpanded) {
      event.preventDefault();
      props.onToggle();
    } else if (event.key === 'ArrowLeft' && props.isExpanded) {
      event.preventDefault();
      props.onToggle();
    } else if (event.key === 'ArrowDown' && props.isExpanded) {
      event.preventDefault();
      // Move focus to first item in the expanded section
      const firstItem = sectionRef?.querySelector('.sidebar-item') as HTMLElement;
      if (firstItem) {
        firstItem.focus();
        setFocusedItemIndex(0);
      }
    }
  };
  
  const handleItemKeyDown = (event: KeyboardEvent, itemId: string, itemIndex: number) => {
    const items = sectionRef?.querySelectorAll('.sidebar-item') as NodeListOf<HTMLElement>;
    
    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        props.onItemClick(itemId);
        break;
        
      case 'ArrowUp':
        event.preventDefault();
        if (itemIndex === 0) {
          // Move focus back to section header
          const sectionHeader = sectionRef?.querySelector('.section-header') as HTMLElement;
          if (sectionHeader) {
            sectionHeader.focus();
            setFocusedItemIndex(-1);
          }
        } else {
          // Move to previous item
          const prevIndex = itemIndex - 1;
          if (items[prevIndex]) {
            items[prevIndex].focus();
            setFocusedItemIndex(prevIndex);
          }
        }
        break;
        
      case 'ArrowDown':
        event.preventDefault();
        if (itemIndex < items.length - 1) {
          // Move to next item
          const nextIndex = itemIndex + 1;
          if (items[nextIndex]) {
            items[nextIndex].focus();
            setFocusedItemIndex(nextIndex);
          }
        }
        // If at last item, do nothing (stay focused)
        break;
        
      case 'ArrowLeft':
        event.preventDefault();
        // Collapse section if expanded
        if (props.isExpanded) {
          props.onToggle();
          // Focus back to section header
          const sectionHeader = sectionRef?.querySelector('.section-header') as HTMLElement;
          if (sectionHeader) {
            sectionHeader.focus();
            setFocusedItemIndex(-1);
          }
        }
        break;
        
      case 'Home':
        event.preventDefault();
        // Move to first item
        if (items[0]) {
          items[0].focus();
          setFocusedItemIndex(0);
        }
        break;
        
      case 'End':
        event.preventDefault();
        // Move to last item
        const lastIndex = items.length - 1;
        if (items[lastIndex]) {
          items[lastIndex].focus();
          setFocusedItemIndex(lastIndex);
        }
        break;
    }
  };

  return (
    <div 
      ref={sectionRef!}
      class="winamp-sidebar-section" 
      role="group"
      aria-labelledby={`section-header-${props.section.id}`}
    >
      {/* Section Header */}
      <div 
        id={`section-header-${props.section.id}`}
        class={`section-header ${props.isExpanded ? 'expanded' : ''}`}
        onClick={props.onToggle}
        onKeyDown={handleSectionKeyDown}
        role="treeitem"
        aria-expanded={props.section.isExpandable ? props.isExpanded : undefined}
        aria-label={`${props.section.label} section${props.section.isExpandable ? (props.isExpanded ? ', expanded' : ', collapsed') : ''}`}
        tabIndex={0}
      >
        <div class="section-header-content">
          <span class="expand-icon">
            {props.section.isExpandable ? (props.isExpanded ? '▼' : '►') : ''}
          </span>
          <span class="section-icon">{props.section.icon}</span>
          <span class="section-label">{props.section.label}</span>
        </div>
      </div>

      {/* Section Items */}
      <Show when={props.isExpanded && props.section.children.length > 0}>
        <div class="section-items" role="group">
          <For each={props.section.children}>
            {(item: SidebarItem, index) => (
              <div
                class={`sidebar-item ${props.activeItem === item.id ? 'active' : ''}`}
                onClick={() => props.onItemClick(item.id)}
                onKeyDown={(e) => handleItemKeyDown(e, item.id, index())}
                role="treeitem"
                aria-selected={props.activeItem === item.id}
                aria-label={`${item.label}${item.count !== undefined ? ` - ${item.count} tracks` : ''}`}
                tabIndex={props.activeItem === item.id ? 0 : -1}
                data-item-id={item.id}
              >
                <div class="item-content">
                  <Show when={item.icon}>
                    <span class="item-icon">{item.icon}</span>
                  </Show>
                  <span class="item-label">{item.label}</span>
                  <Show when={item.count !== undefined}>
                    <span class="item-count">({item.count})</span>
                  </Show>
                </div>
              </div>
            )}
          </For>
        </div>
      </Show>
    </div>
  );
};

export default LibrarySidebarSection;