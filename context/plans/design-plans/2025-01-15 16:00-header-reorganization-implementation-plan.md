# Header Reorganization Implementation Plan
*Date: 2025-01-15 16:00*

## Overview
Complete reorganization of the library header structure to maximize screen real estate and improve information hierarchy. This plan removes the top header and redistributes functionality to the sidebar and a new library footer.

## Current State Analysis
- **Top Header**: Contains ONLINE status, [JAMZY::LIBRARY] title, Network Selector, and + ADD_TRACK button
- **Sidebar**: Has Local Library, Collections, Social sections with TRACKS_LOADED: 41 at bottom
- **Main Content**: Has title bar with search/filters and data table

## Implementation Plan

### Phase 1: Remove Top Header (LibraryPage.tsx)
**Target**: Lines 31-91 in LibraryPage.tsx containing the terminal header

**Actions**:
- Remove entire terminal header div structure 
- Remove responsive mobile/desktop header layouts
- Keep only the main content container and LibraryTable
- Gain ~80px vertical space for library content

### Phase 2: Update Sidebar (WinampSidebar.tsx)
**Target**: Replace Collections section with Networks section

**Changes**:
1. **Remove Collections Section**:
   - Remove "Collections" from getSidebarSections()
   - Remove playlists, by-genre, by-platform items

2. **Add Networks Section**:
   ```typescript
   {
     id: 'networks',
     label: 'Networks',
     icon: '🌐',
     isExpandable: true,
     children: [
       { id: 'personal', label: 'Personal', count: 0 },
       { id: 'extended', label: 'Extended', count: 0 },
       { id: 'community', label: 'Community', count: 0 },
       { id: 'discover', label: 'Discover', count: 0 },
     ]
   }
   ```

3. **Add ADD_TRACK Button to Footer**:
   - Replace simple stats footer with enhanced footer
   - Add prominent "+ ADD_TRACK" button
   - Keep track count information

### Phase 3: Add Library Content Footer (WinampMainContent.tsx)
**Target**: Add new footer section below table

**New Footer Structure**:
```typescript
<div class="library-content-footer">
  <div class="footer-status">
    <span class="status-indicator online">●</span>
    <span class="status-text">ONLINE</span>
    <span class="separator">•</span>
    <span class="network-text">NET: {selectedNetwork().name}</span>
    <span class="separator">•</span>
    <span class="tracks-text">TRACKS: {filteredTracks().length}</span>
  </div>
</div>
```

### Phase 4: Network Integration
**Target**: Integrate network switching into sidebar navigation

**Implementation**:
- Connect Networks section items to networkStore
- Add network switching logic to handleItemClick
- Update network state on sidebar navigation

## Technical Specifications

### Sidebar Networks Section
```typescript
// Add to WinampSidebar.tsx getSidebarSections()
{
  id: 'networks',
  label: 'Networks', 
  icon: '🌐',
  isExpandable: true,
  children: [
    { id: 'personal-net', label: 'Personal', count: counts.personalNetwork },
    { id: 'extended-net', label: 'Extended', count: counts.extendedNetwork },
    { id: 'community-net', label: 'Community', count: counts.communityNetwork },
    { id: 'discover-net', label: 'Discover', count: counts.discoverNetwork },
  ]
}
```

### Enhanced Sidebar Footer
```typescript
<div class="winamp-sidebar-footer">
  <div class="footer-stats">
    <span class="stats-text">TRACKS_LOADED: {allTracks().length}</span>
  </div>
  <div class="footer-actions">
    <button 
      class="add-track-btn"
      onClick={() => navigate('/add')}
    >
      <span class="add-icon">+</span>
      <span class="add-text">ADD_TRACK</span>
    </button>
  </div>
</div>
```

### Library Content Footer
```typescript
<div class="library-content-footer">
  <div class="footer-content">
    <div class="status-section">
      <div class="status-indicator online">
        <div class="status-dot"></div>
        <span class="status-label">ONLINE</span>
      </div>
      <div class="network-info">
        <span class="network-label">NET:</span>
        <span class="network-name">{selectedNetwork().name}</span>
      </div>
      <div class="track-count">
        <span class="count-label">TRACKS:</span>
        <span class="count-value">{filteredTracks().length}</span>
      </div>
    </div>
  </div>
</div>
```

## CSS Styling Requirements

### Sidebar Footer Button
```css
.add-track-btn {
  width: 100%;
  padding: 8px 12px;
  background: linear-gradient(135deg, #04caf4 0%, #f906d6 100%);
  border: 1px solid rgba(4, 202, 244, 0.3);
  border-radius: 4px;
  color: #ffffff;
  font-family: 'Courier New', monospace;
  font-size: 11px;
  font-weight: bold;
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.add-track-btn:hover {
  box-shadow: 0 0 15px rgba(4, 202, 244, 0.5);
  transform: translateY(-1px);
}
```

### Library Content Footer
```css
.library-content-footer {
  margin-top: 20px;
  padding: 12px 20px;
  background: rgba(13, 13, 13, 0.8);
  border: 1px solid rgba(4, 202, 244, 0.2);
  border-radius: 4px;
  backdrop-filter: blur(10px);
}

.footer-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.status-section {
  display: flex;
  align-items: center;
  gap: 20px;
  font-family: 'Courier New', monospace;
  font-size: 11px;
  color: #04caf4;
}

.status-indicator.online .status-dot {
  width: 6px;
  height: 6px;
  background: #00f92a;
  border-radius: 50%;
  animation: pulse 2s infinite;
}
```

## Implementation Order
1. **Remove top header** from LibraryPage.tsx
2. **Update sidebar sections** in WinampSidebar.tsx
3. **Add enhanced sidebar footer** with ADD_TRACK button
4. **Add library content footer** to WinampMainContent.tsx
5. **Add network switching logic** to sidebar handlers
6. **Style all new components** with retro terminal aesthetics

## Expected Results
- **+80px vertical space** gained from header removal
- **Cleaner information hierarchy** with status in footer
- **Natural navigation flow** with networks in sidebar
- **Prominent ADD_TRACK access** from sidebar
- **Better mobile responsiveness** with simplified layout
- **Consistent retro aesthetic** throughout interface

## Testing Requirements
- Verify all functionality preserved after reorganization
- Test network switching from sidebar navigation
- Confirm mobile responsiveness of new layout
- Validate ADD_TRACK button accessibility
- Check footer status updates correctly

This plan maintains all existing functionality while achieving the cleaner, more space-efficient design goals.