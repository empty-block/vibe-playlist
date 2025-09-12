# Winamp Library Design Refinement & Artist/Genre Sections - Design Plan

**Task**: LINEAR TASK-426: "Refine Winamp Library Design & Add Artist/Genre Sections"  
**Date**: January 15, 2025 17:15  
**Status**: Ready for Implementation  

## Design Analysis

### Current Implementation Assessment

Based on analysis of the current Winamp library layout (`/src/components/library/winamp-layout/`), the implementation successfully captures the retro Winamp aesthetic with:

**Strengths:**
- Accurate Winamp-inspired sidebar with collapsible tree structure
- Proper neon color palette (--neon-cyan, --neon-green, etc.)
- Clean table-based track listing
- Responsive mobile/desktop layouts
- Authentic monospace typography

**Issues Identified:**
1. **Visual Alignment Problems**: Inconsistent spacing and alignment in track rows
2. **Missing Artist/Genre Browse**: No dedicated sections for browsing by artist or genre
3. **Limited Discovery Flow**: Users can only browse tracks linearly
4. **Hierarchy Unclear**: Artist and genre information buried in table columns

### Reference Analysis

**Classic Winamp Library** (from reference image):
- Two-panel layout: left sidebar + main content
- Upper panels show Artist and Album lists with counts
- Lower panel shows track details in table format
- Clear visual separation between browse sections and track data
- Compact, information-dense interface

## Design Solution

### Phase 1: Visual Alignment Refinements

**Track Table Improvements:**
- Fix column alignment inconsistencies
- Standardize padding: 8px vertical, 12px horizontal for all cells
- Ensure play button column width: exactly 48px
- Artist/track titles: left-aligned with consistent 4px icon spacing
- Numerical columns (likes, replies): right-aligned for scanability
- Platform icons: centered in 32px column

**Typography Consistency:**
- Track titles: --text-sm (14px), --light-text color
- Artist names: --text-sm (14px), --neon-cyan color
- Metadata (counts, times): --text-xs (12px), --muted-text color
- All text using --font-mono for data consistency

### Phase 2: Artist/Genre Browse Sections

**Layout Architecture:**
```
┌─ SIDEBAR ─┐ ┌─────── MAIN CONTENT ───────┐
│  Library  │ │ ┌─ Artists ─┐ ┌─ Genres ─┐ │
│  Networks │ │ │  Classic  │ │  Grunge  │ │ 
│  Social   │ │ │  Rock (8) │ │  Metal   │ │
│           │ │ └───────────┘ └──────────┘ │
└───────────┘ │ ┌─── TRACK LISTING ──────┐ │
              │ │ 01 ▶ Black Pearl Jam  │ │
              │ │ 02 ▶ Alive Pearl Jam  │ │
              │ └─────────────────────────┘ │
              └─────────────────────────────┘
```

**Artist Section Specifications:**
- Position: Above track table, left side
- Dimensions: 280px width × 200px height
- Scrollable list of artists with track counts
- Format: "Artist Name (count)" e.g., "Pearl Jam (12)"
- Click interaction: filters track list to selected artist
- Visual state: selected artist gets --neon-orange highlighting

**Genre Section Specifications:**
- Position: Above track table, right side  
- Dimensions: 280px width × 200px height
- Scrollable list of genres derived from track metadata
- Format: "Genre Name (count)" e.g., "Grunge (24)"
- Click interaction: filters track list to selected genre
- Visual state: selected genre gets --neon-orange highlighting

### Phase 3: Enhanced Browse Experience

**Filter State Management:**
- Support combined artist + genre filtering
- Clear filter buttons with visual feedback
- "All Artists" and "All Genres" options at top of each list
- URL state persistence for bookmarking filtered views

**Visual Hierarchy:**
- Browse sections use --darker-bg background
- 2px --neon-cyan border around each section
- Section headers: "ARTISTS" and "GENRES" in --font-mono, --neon-cyan
- Subtle scroll indicators using neon accent colors

## Technical Implementation Specifications

### Component Architecture

**New Components Required:**
1. `ArtistBrowseSection.tsx` - Artist listing and selection
2. `GenreBrowseSection.tsx` - Genre listing and selection  
3. `BrowseSectionsContainer.tsx` - Layout container for both sections
4. `FilterChips.tsx` - Active filter display and management

**Enhanced Components:**
- `WinampMainContent.tsx` - Add browse sections above table
- `WinampLibraryLayout.tsx` - State management for filters
- Update CSS in `winamp-library.css` for new layout

### Data Flow

**Artist/Genre Extraction:**
```typescript
const extractArtistsFromTracks = (tracks: PersonalTrack[]) => {
  const artistMap = new Map<string, number>();
  tracks.forEach(track => {
    const count = artistMap.get(track.artist) || 0;
    artistMap.set(track.artist, count + 1);
  });
  return Array.from(artistMap.entries())
    .map(([artist, count]) => ({ name: artist, count }))
    .sort((a, b) => b.count - a.count);
};
```

**State Management:**
```typescript
interface LibraryFilters {
  selectedArtist: string | null;
  selectedGenre: string | null;
  searchQuery: string;
  personalFilter: PersonalFilterType;
}
```

### CSS Specifications

**Browse Sections Layout:**
```css
.browse-sections-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-4);
  padding: var(--space-4) var(--space-6);
  background: var(--content-bg);
  border-bottom: 1px solid var(--content-border);
}

.browse-section {
  background: var(--darker-bg);
  border: 2px solid var(--sidebar-border);
  border-radius: 0; /* Sharp corners for retro feel */
  height: 200px;
  display: flex;
  flex-direction: column;
}

.browse-section-header {
  padding: var(--space-2) var(--space-3);
  background: rgba(4, 202, 244, 0.1);
  border-bottom: 1px solid var(--sidebar-border);
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  font-weight: bold;
  color: var(--neon-cyan);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.browse-section-content {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-2);
}

.browse-item {
  padding: var(--space-2) var(--space-3);
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  color: var(--light-text);
  cursor: pointer;
  border-left: 3px solid transparent;
  transition: all 200ms ease;
}

.browse-item:hover {
  background: rgba(4, 202, 244, 0.1);
  border-left-color: var(--neon-cyan);
  transform: translateX(2px);
}

.browse-item.selected {
  background: rgba(255, 155, 0, 0.15);
  border-left-color: var(--neon-orange);
  color: var(--neon-orange);
  box-shadow: 0 0 8px rgba(255, 155, 0, 0.3);
}

.browse-item-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.browse-item-name {
  flex: 1;
  text-align: left;
}

.browse-item-count {
  font-size: var(--text-xs);
  opacity: 0.7;
  color: var(--neon-cyan);
}
```

### Mobile Responsive Considerations

**Breakpoint Behavior:**
- `< 768px`: Stack browse sections vertically, reduce height to 150px each
- `< 640px`: Hide browse sections, show filter chips instead
- Mobile navigation: Swipe gestures between artists/genres/tracks

**Touch Interactions:**
- Minimum 44px touch targets for all browse items
- Pull-to-refresh on browse sections
- Long press for artist/genre context menus

## Implementation Steps

### Step 1: Visual Alignment Fixes (2-3 hours)
1. Update `winamp-library.css` table styles for consistent spacing
2. Fix column widths and alignment in `WinampMainContent.tsx`
3. Test responsive behavior across breakpoints

### Step 2: Data Layer Enhancement (2-3 hours)
1. Add artist/genre extraction utilities
2. Enhance state management in `WinampLibraryLayout.tsx`
3. Update filter functions for combined filtering

### Step 3: Browse Sections Implementation (4-5 hours)
1. Create `ArtistBrowseSection.tsx` and `GenreBrowseSection.tsx`
2. Build `BrowseSectionsContainer.tsx` layout component
3. Integrate with existing `WinampMainContent.tsx`

### Step 4: Interactive Filtering (2-3 hours)
1. Implement click handlers for artist/genre selection
2. Add filter state visualization and clear functions
3. Test filter combinations and edge cases

### Step 5: Polish & Testing (1-2 hours)
1. Add loading states for browse sections
2. Implement scroll indicators and empty states
3. Cross-browser and device testing

## Success Metrics

**Visual Quality:**
- Pixel-perfect alignment in track table rows
- Consistent spacing matching 8px grid system
- Smooth hover states and transitions

**Functionality:**
- Artist/genre filtering reduces track list correctly
- Combined filters work as expected (AND logic)
- Clear filter functions work properly

**Performance:**
- Browse sections render in <100ms
- Filtering operations complete in <50ms
- No layout shifts during interactions

## Design System Compliance

**Colors**: All elements use defined neon palette variables
**Typography**: Consistent use of --font-mono for data sections
**Spacing**: Strict adherence to 8px base unit system
**Interactions**: Hover effects follow established patterns
**Accessibility**: Proper ARIA labels and keyboard navigation

This design plan maintains Jamzy's retro cyberpunk aesthetic while significantly improving the library browsing experience, bringing it closer to the classic Winamp interface while adding modern UX enhancements.