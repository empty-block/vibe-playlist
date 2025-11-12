import { Component, createSignal, Show, onMount, onCleanup } from 'solid-js';
import anime from 'animejs';
import { expandText, rotateExpandIcon } from '../../utils/animations';
import { stripUrls } from '../../utils/textUtils';
import './ExpandableText.css';

interface ExpandableTextProps {
  text: string;
  maxLength?: number;        // Default: 80
  className?: string;
  expandedClassName?: string;
  showToggle?: boolean;      // Default: true
  animationDuration?: number; // Default: 200ms
}

const ExpandableText: Component<ExpandableTextProps> = (props) => {
  const [isExpanded, setIsExpanded] = createSignal(false);
  const [needsTruncation, setNeedsTruncation] = createSignal(false);
  
  let textRef: HTMLDivElement;
  let expandedRef: HTMLDivElement;
  let expandIconRef: HTMLSpanElement;
  let collapseIconRef: HTMLSpanElement;
  
  const maxLength = () => props.maxLength || 80;
  const showToggle = () => props.showToggle !== false;
  
  // Smart truncation logic
  const truncateText = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    
    // Find last space before maxLength
    let cutPoint = text.lastIndexOf(' ', maxLength);
    if (cutPoint === -1) cutPoint = maxLength;
    
    return text.substring(0, cutPoint);
  };
  
  const toggleExpansion = () => {
    const newState = !isExpanded();
    setIsExpanded(newState);
    
    // Simple toggle without complex animations for now
    console.log('Toggling expansion:', newState);
  };
  
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleExpansion();
    }
    if (e.key === 'Escape' && isExpanded()) {
      setIsExpanded(false);
      expandText.leave(expandedRef);
      if (expandIconRef) rotateExpandIcon.collapse(expandIconRef);
    }
  };
  
  // Check if truncation is needed when component mounts
  // Use displayText (after URL stripping) to determine truncation
  onMount(() => {
    const textAfterStripping = stripUrls(props.text);
    if (textAfterStripping.length > maxLength()) {
      setNeedsTruncation(true);
    }
  });
  
  // Animation cleanup
  onCleanup(() => {
    if (expandedRef) {
      anime.remove(expandedRef);
    }
    if (expandIconRef) {
      anime.remove(expandIconRef);
    }
    if (collapseIconRef) {
      anime.remove(collapseIconRef);
    }
  });
  
  // Strip URLs from text for display while preserving original in database
  const displayText = () => stripUrls(props.text);
  const truncatedDisplayText = () => truncateText(displayText(), maxLength());

  return (
    <div class="expandable-text">
      {/* Collapsed state */}
      <Show when={!isExpanded()}>
        <div
          ref={textRef}
          class={`expandable-text-collapsed ${props.className || ''} ${needsTruncation() ? 'clickable' : ''}`}
          onClick={needsTruncation() ? toggleExpansion : undefined}
          style={{ cursor: needsTruncation() ? 'pointer' : 'default' }}
        >
          {needsTruncation() ? truncatedDisplayText() : displayText()}
          <Show when={needsTruncation() && showToggle()}>
            <button
              onClick={(e) => { e.stopPropagation(); toggleExpansion(); }}
              onKeyDown={handleKeyDown}
              aria-expanded={isExpanded()}
              aria-label="Expand to read full text"
              class="expand-icon-button"
            >
              <span ref={expandIconRef} aria-hidden="true">▼</span>
            </button>
          </Show>
        </div>
      </Show>
      
      {/* Expanded state */}
      <Show when={isExpanded()}>
        <div
          ref={expandedRef}
          class={`expandable-text-expanded ${props.expandedClassName || props.className || ''} clickable`}
          aria-live="polite"
          aria-atomic="true"
          onClick={toggleExpansion}
          style={{ cursor: 'pointer' }}
        >
          {displayText()}
          <Show when={showToggle()}>
            <button
              onClick={(e) => { e.stopPropagation(); toggleExpansion(); }}
              onKeyDown={handleKeyDown}
              aria-expanded={isExpanded()}
              aria-label="Collapse full text"
              class="expand-icon-button"
            >
              <span ref={collapseIconRef} aria-hidden="true">▲</span>
            </button>
          </Show>
        </div>
      </Show>
    </div>
  );
};

export default ExpandableText;