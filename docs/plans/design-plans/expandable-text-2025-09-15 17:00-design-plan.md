# Expandable Text Design Plan - TASK-453
*Generated: 2025-09-15 17:00*

## Problem Analysis

### Current Implementation Issues
- **Desktop Only Solution**: Current implementation uses `RetroTooltip` with hover interaction, which is completely inaccessible on mobile devices
- **Character Limitations**: Tooltips have practical character limits and aren't suitable for paragraph-length content
- **Poor Conversation Flow**: Users cannot easily "read through" track contexts like a conversation
- **Accessibility Concerns**: Hover-only interactions exclude keyboard navigation and mobile users
- **Truncation without Indication**: Text is truncated with `...` but no clear affordance for expansion

### Current Code Structure
Located in `src/components/library/LibraryTableRow.tsx` (lines 393-429):
- Uses `isCommentTruncated()` signal to detect truncation
- Conditionally wraps truncated content in `RetroTooltip`
- Separate handling for profile mode vs library mode
- Supports both `track.comment` and `track.userInteraction.context`

### Existing Foundation
There's already an `ExpandableTableRow` component in `src/components/ui/ExpandableTableRow.tsx` that demonstrates the expandable pattern, but it:
- Only handles title and comment expansion
- Uses a separate row for expanded content
- Has terminal-style UI that might be too heavy for frequent use

## Design Solution

### Conceptual Approach
**Progressive Disclosure with Inline Expansion**: Create a lightweight, accessible solution that allows inline text expansion without breaking the table layout or conversation flow.

### Design Philosophy Alignment
- **Retro UI, Modern UX**: Use cyber-terminal aesthetics with modern accessibility patterns
- **Information Dense**: Maximize content visibility while maintaining scannability
- **Details Matter**: Subtle animations and micro-interactions that delight users
- **Natural Flow**: Enable "conversation-like" reading through track contexts

## Implementation Plan

### 1. New Component: `ExpandableText`

Create a reusable component at `src/components/ui/ExpandableText.tsx`:

```typescript
interface ExpandableTextProps {
  text: string;
  maxLength?: number;        // Default: 80
  className?: string;
  expandedClassName?: string;
  showToggle?: boolean;      // Default: true
  animationDuration?: number; // Default: 200ms
}
```

**Key Features:**
- **Smart Truncation**: Respect word boundaries, don't cut mid-word
- **Clear Affordances**: Visual indicators for expandable text
- **Smooth Transitions**: Height animations using anime.js v3.2.1
- **Keyboard Accessible**: Full keyboard navigation support
- **Mobile Optimized**: Touch-friendly targets and interactions

### 2. Visual Design Specifications

#### Collapsed State
```css
/* Truncated text with subtle gradient fade */
.expandable-text-collapsed {
  position: relative;
  line-height: 1.4;
  font-family: var(--font-monospace);
  font-size: var(--text-sm); /* 14px */
  color: var(--light-text);
  overflow: hidden;
}

/* Gradient fade-out effect */
.expandable-text-collapsed::after {
  content: '';
  position: absolute;
  bottom: 0;
  right: 0;
  width: 60px;
  height: 100%;
  background: linear-gradient(90deg, transparent, var(--dark-bg));
  pointer-events: none;
}
```

#### Expand Button
```css
.expand-button {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1); /* 4px */
  margin-left: var(--space-2); /* 8px */
  padding: var(--space-1) var(--space-2);
  border: 1px solid var(--neon-cyan);
  background: transparent;
  color: var(--neon-cyan);
  font-size: var(--text-xs); /* 12px */
  font-family: var(--font-monospace);
  border-radius: 2px; /* Sharp corners for retro feel */
  cursor: pointer;
  transition: all 200ms ease;
  min-height: 24px; /* Touch-friendly */
}

.expand-button:hover {
  background: rgba(4, 202, 244, 0.1);
  box-shadow: 0 0 8px rgba(4, 202, 244, 0.3);
  transform: translateY(-1px);
}

.expand-button:focus {
  outline: 2px solid var(--neon-cyan);
  outline-offset: 2px;
}
```

#### Expanded State
```css
.expandable-text-expanded {
  font-family: var(--font-monospace);
  font-size: var(--text-sm);
  color: var(--light-text);
  line-height: 1.5;
  padding: var(--space-3) 0; /* 12px vertical */
  background: rgba(4, 202, 244, 0.02);
  border-left: 2px solid var(--neon-cyan);
  padding-left: var(--space-3);
  margin-left: -var(--space-3);
  border-radius: 0 4px 4px 0;
}
```

### 3. Animation Specifications

#### Height Expansion Animation
```typescript
// In src/utils/animations.ts
export const expandText = {
  enter: (element: HTMLElement, targetHeight: number) => {
    element.style.height = '0px';
    element.style.overflow = 'hidden';
    element.style.transition = 'none';
    
    anime({
      targets: element,
      height: `${targetHeight}px`,
      opacity: [0, 1],
      duration: 200,
      easing: 'easeOutQuart',
      complete: () => {
        element.style.height = 'auto';
        element.style.overflow = 'visible';
      }
    });
  },
  
  leave: (element: HTMLElement) => {
    const currentHeight = element.offsetHeight;
    element.style.height = `${currentHeight}px`;
    element.style.overflow = 'hidden';
    
    anime({
      targets: element,
      height: '0px',
      opacity: [1, 0],
      duration: 200,
      easing: 'easeInQuart',
      complete: () => {
        element.style.height = '';
        element.style.overflow = '';
      }
    });
  }
};
```

#### Button Icon Rotation
```typescript
export const rotateExpandIcon = {
  expand: (element: HTMLElement) => {
    anime({
      targets: element,
      rotate: '180deg',
      duration: 200,
      easing: 'easeOutQuart'
    });
  },
  
  collapse: (element: HTMLElement) => {
    anime({
      targets: element,
      rotate: '0deg',
      duration: 200,
      easing: 'easeOutQuart'
    });
  }
};
```

### 4. Component Implementation Structure

```typescript
// src/components/ui/ExpandableText.tsx
import { Component, createSignal, Show, onMount, createEffect } from 'solid-js';
import { expandText, rotateExpandIcon } from '../../utils/animations';

const ExpandableText: Component<ExpandableTextProps> = (props) => {
  const [isExpanded, setIsExpanded] = createSignal(false);
  const [needsTruncation, setNeedsTruncation] = createSignal(false);
  
  let textRef: HTMLDivElement;
  let expandedRef: HTMLDivElement;
  let iconRef: HTMLSpanElement;
  
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
    
    if (newState) {
      // Expanding
      expandText.enter(expandedRef, expandedRef.scrollHeight);
      rotateExpandIcon.expand(iconRef);
    } else {
      // Collapsing
      expandText.leave(expandedRef);
      rotateExpandIcon.collapse(iconRef);
    }
    
    setIsExpanded(newState);
  };
  
  // Rest of component implementation...
};
```

### 5. Integration with LibraryTableRow

#### Replace Current Implementation
In `src/components/library/LibraryTableRow.tsx`, replace the tooltip-based solution (lines 393-429) with:

```typescript
import ExpandableText from '../ui/ExpandableText';

// In the context column render:
<td class="retro-grid-cell hidden lg:table-cell">
  <Show when={!(isProfileMode() && isPersonalTrack(props.track))} fallback={
    isPersonalTrack(props.track) && props.track.userInteraction.context ? (
      <ExpandableText 
        text={props.track.userInteraction.context}
        maxLength={80}
        className="text-sm text-white/60 font-mono"
        expandedClassName="text-sm text-white/80 font-mono"
      />
    ) : (
      <span class="text-gray-500 italic">No comment</span>
    )
  }>
    <ExpandableText 
      text={props.track.comment || 'No comment'}
      maxLength={80}
      className="text-sm text-white/60 font-mono"
      expandedClassName="text-sm text-white/80 font-mono"
    />
  </Show>
</td>
```

### 6. Mobile Considerations

#### Touch Interactions
- **Minimum Touch Target**: 44px minimum for expand buttons
- **Visual Feedback**: Immediate visual response on touch
- **Gesture Support**: Consider swipe gestures for future enhancement

#### Mobile Card Layout Enhancement
For the mobile card layout (if exists), provide expanded text support:

```typescript
// Mobile-specific expandable text with larger touch targets
<ExpandableText 
  text={track.comment}
  maxLength={60} // Shorter for mobile
  className="text-sm text-white/60 font-mono"
  expandedClassName="text-sm text-white/80 font-mono leading-relaxed"
/>
```

### 7. Accessibility Implementation

#### Keyboard Navigation
```typescript
const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    toggleExpansion();
  }
  if (e.key === 'Escape' && isExpanded()) {
    setIsExpanded(false);
    expandText.leave(expandedRef);
    rotateExpandIcon.collapse(iconRef);
  }
};
```

#### Screen Reader Support
```html
<button
  onClick={toggleExpansion}
  onKeyDown={handleKeyDown}
  aria-expanded={isExpanded()}
  aria-label={isExpanded() ? 'Collapse full text' : 'Expand to read full text'}
  class="expand-button"
>
  <span ref={iconRef} aria-hidden="true">▶</span>
  <span class="sr-only">
    {isExpanded() ? 'Collapse' : 'Expand'}
  </span>
</button>
```

#### ARIA Live Region
```html
<div 
  aria-live="polite" 
  aria-atomic="true"
  class={isExpanded() ? 'expandable-text-expanded' : 'sr-only'}
>
  {isExpanded() ? props.text : ''}
</div>
```

### 8. Performance Optimizations

#### Lazy Expansion Detection
```typescript
onMount(() => {
  // Only check if truncation is needed when component mounts
  if (props.text.length > (props.maxLength || 80)) {
    setNeedsTruncation(true);
  }
});
```

#### Animation Cleanup
```typescript
onCleanup(() => {
  // Cancel any running animations
  if (expandedRef) {
    anime.remove(expandedRef);
  }
  if (iconRef) {
    anime.remove(iconRef);
  }
});
```

## Implementation Steps

### Phase 1: Core Component (2-3 hours)
1. Create `ExpandableText.tsx` component
2. Implement basic expand/collapse functionality
3. Add truncation logic and visual states
4. Test with sample data

### Phase 2: Animation & Polish (1-2 hours)
1. Add height expansion animations using anime.js
2. Implement icon rotation and micro-interactions
3. Add hover and focus states
4. Test animation performance

### Phase 3: Integration (1 hour)
1. Replace tooltip implementation in `LibraryTableRow`
2. Test with real track data
3. Verify both library and profile modes work correctly

### Phase 4: Accessibility & Mobile (1-2 hours)
1. Add full keyboard navigation support
2. Implement screen reader compatibility
3. Test on mobile devices
4. Optimize touch interactions

### Phase 5: Polish & Testing (1 hour)
1. Cross-browser testing
2. Performance verification
3. Edge case handling (very short text, extremely long text)
4. Final visual refinements

## Success Metrics

### User Experience
- ✅ Mobile users can read full track contexts
- ✅ Desktop users have improved hover-free interaction
- ✅ Text expansion feels natural and doesn't break reading flow
- ✅ Keyboard navigation works seamlessly
- ✅ Animation performance maintains 60fps

### Technical Quality
- ✅ Component is reusable across the application
- ✅ No accessibility violations (WCAG 2.1 AA)
- ✅ TypeScript types are complete and accurate
- ✅ Animation cleanup prevents memory leaks
- ✅ Works in both table and mobile card layouts

### Design Compliance
- ✅ Maintains retro cyberpunk aesthetic
- ✅ Uses design system colors and spacing
- ✅ Follows animation principles (200-300ms duration)
- ✅ Provides clear visual affordances
- ✅ Respects information density principles

## Edge Cases & Considerations

### Text Content Variations
- **Very Short Text**: Hide expand button if text doesn't need truncation
- **No Text**: Handle null/undefined gracefully with fallback message
- **HTML Content**: Strip or safely render if track comments contain markup
- **Extremely Long Text**: Consider pagination for massive text blocks (>1000 chars)

### Layout Constraints
- **Narrow Table Columns**: Ensure expand button doesn't cause overflow
- **Mobile Portrait**: Optimize for narrow screen widths
- **Accessibility Zoom**: Test at 200% zoom level for usability

### Performance Edge Cases
- **Rapid Toggle**: Debounce rapid expand/collapse actions
- **Many Rows**: Test performance with 100+ expandable text components
- **Animation Conflicts**: Ensure proper cleanup when component unmounts

## Future Enhancements

### Phase 2 Considerations
1. **Smart Preview**: Show first sentence even in collapsed state
2. **Contextual Expansion**: Expand multiple related tracks in conversation view
3. **Search Highlighting**: Highlight search terms in expanded text
4. **Copy to Clipboard**: Add utility to copy expanded text
5. **Markdown Support**: Render basic markdown in track comments

This design plan provides a comprehensive, accessible, and aesthetically aligned solution for expandable text that solves the core problems identified in TASK-453 while maintaining Jamzy's retro-futuristic design identity and modern UX standards.