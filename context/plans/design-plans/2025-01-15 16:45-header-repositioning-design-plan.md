# Header Repositioning Design Plan
*Created: 2025-01-15 16:45*

## Quick Analysis of Current Issues

### Current Problems
1. **ADD_TRACK Button**: Located in sidebar footer, feels awkward and disconnected
2. **Footer Status Text**: Contains "ONLINE●NET: EXTENDED • TRACKS: 24" which is cramped
3. **"ONLINE" Text**: User indicates this is just for show and messing up the layout

### User's Proposed Solution
1. **Move ADD_TRACK button to header area** (sidebar header or library header)
2. **Move status text to sidebar footer** with simplified "NET: EXTENDED • TRACKS: 24" format
3. **Remove "ONLINE" text** completely as it's decorative only

## Design Decision: Header Approach

### Option 1: Sidebar Header (CHOSEN)
- **Pros**: Natural location for primary action, always visible when sidebar is open
- **Cons**: Limited space on mobile
- **Implementation**: Add to existing sidebar header alongside title

### Option 2: Library Header 
- **Pros**: More space, central to main content
- **Cons**: Less discoverable, not always visible

**Decision**: **Sidebar Header** - Makes the ADD_TRACK button more prominent and accessible as a primary action.

## Implementation Plan

### Phase 1: Move ADD_TRACK to Sidebar Header
**File**: `src/components/library/winamp-layout/WinampSidebar.tsx`

**Current Sidebar Header Structure** (lines 188-204):
```jsx
<div class="winamp-sidebar-header">
  <div class="sidebar-title">
    <span class="title-icon">🎵</span>
    <span class="title-text">LIBRARY</span>
  </div>
  {/* Mobile close button */}
</div>
```

**New Structure**:
```jsx
<div class="winamp-sidebar-header">
  <div class="sidebar-title">
    <span class="title-icon">🎵</span>
    <span class="title-text">LIBRARY</span>
  </div>
  
  {/* ADD_TRACK Button */}
  <button 
    class="header-add-track-btn"
    onClick={() => navigate('/add')}
    aria-label="Add new track"
  >
    <span class="add-icon">[</span>
    <span class="add-text">+ ADD</span>
    <span class="add-icon">]</span>
  </button>
  
  {/* Mobile close button */}
</div>
```

### Phase 2: Update Sidebar Footer with Status Info
**Remove**: Current ADD_TRACK button from footer
**Add**: Simplified status info "NET: EXTENDED • TRACKS: 24"

**New Footer Structure**:
```jsx
<div class="winamp-sidebar-footer">
  <div class="footer-status">
    <span class="network-status">
      NET: {selectedNetwork().toUpperCase()} • TRACKS: {allTracks().length}
    </span>
  </div>
</div>
```

### Phase 3: Remove "ONLINE" from Main Footer
**File**: `src/components/library/winamp-layout/WinampMainContent.tsx`
**Action**: Remove entire ONLINE status indicator and first separator

**Current** (lines 267-271):
```jsx
<div class="status-indicator online">
  <div class="status-dot"></div>
  <span class="status-label">ONLINE</span>
</div>
<div class="status-separator">•</div>
```

**New**: Remove completely, start directly with network info

## CSS Styling Requirements

### Header ADD_TRACK Button
```css
.header-add-track-btn {
  padding: 4px 8px;
  background: rgba(13, 13, 13, 0.9);
  border: 1px solid rgba(4, 202, 244, 0.4);
  border-radius: 3px;
  color: #00f92a;
  font-family: var(--font-mono);
  font-size: 9px;
  font-weight: bold;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.2s ease;
}

.header-add-track-btn:hover {
  border-color: rgba(0, 249, 42, 0.6);
  color: #00ff41;
  box-shadow: 0 0 8px rgba(0, 249, 42, 0.3);
}
```

### Footer Status Text
```css
.footer-status {
  display: flex;
  justify-content: center;
  padding: var(--space-2);
}

.network-status {
  font-family: var(--font-mono);
  font-size: 10px;
  color: rgba(4, 202, 244, 0.8);
  letter-spacing: 0.5px;
  text-transform: uppercase;
}
```

### Sidebar Header Layout Update
```css
.winamp-sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-3) var(--space-4);
}

.sidebar-title {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}
```

## Benefits of This Approach

1. **Better UX**: ADD_TRACK button in header is more discoverable and accessible
2. **Cleaner Footer**: Main footer has more space with just "NET: EXTENDED • TRACKS: 24"
3. **Simplified Sidebar Footer**: Shows contextual info without crowding
4. **Consistent Actions**: Primary actions (ADD_TRACK) in header, status info in footer
5. **Mobile Friendly**: Compact header button works well on small screens

## Implementation Notes

- Keep button text short ("+ ADD" instead of "+ ADD_TRACK") for header space
- Maintain terminal aesthetic with monospace font and neon colors
- Ensure keyboard accessibility for header button
- Test responsive behavior on mobile sizes
- Preserve all existing functionality and click handlers

## Success Criteria

✅ **ADD_TRACK Button**: Moved to sidebar header, easily discoverable
✅ **Sidebar Footer**: Shows "NET: EXTENDED • TRACKS: 24" format
✅ **Main Footer**: Simplified without "ONLINE" text clutter  
✅ **Visual Hierarchy**: Clear separation of actions vs status info
✅ **Mobile Compatibility**: Compact design works on all screen sizes