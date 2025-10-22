# ChannelFilterBar Component Structure

## Visual Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│                      CHANNEL FILTER BAR                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌─────────────────────  SORT SECTION  ──────────────────────────┐  │
│  │                                                                 │  │
│  │  ┏━━━━━━━━━┓  ┏━━━━━━━━━━━━━━┓  ┏━━━━━━━━━━━━━━┓  ┏━━━━━━━━━┓ │  │
│  │  ┃ RECENT  ┃  ┃ POPULAR (24H) ┃  ┃ POPULAR (7D) ┃  ┃ALL-TIME ┃ │  │
│  │  ┗━━━━━━━━━┛  ┗━━━━━━━━━━━━━━┛  ┗━━━━━━━━━━━━━━┛  ┗━━━━━━━━━┛ │  │
│  │   [Cyan]      [Magenta]          [Green]           [Yellow]    │  │
│  └─────────────────────────────────────────────────────────────────┘  │
│                                                                       │
│  ┌────────────────────  FILTER SECTION  ──────────────────────────┐  │
│  │                                                                 │  │
│  │  ┏━━━━━━━━━━━━━━━┓  ┏━━━━━━━━━━━━━━━━━┓  ┏━━━━━━━━━━━━━━━┓   │  │
│  │  ┃ Quality: All  ┃  ┃ Source: All   ▼ ┃  ┃ Genre: All  ▼ ┃   │  │
│  │  ┗━━━━━━━━━━━━━━━┛  ┗━━━━━━━━━━━━━━━━━┛  ┗━━━━━━━━━━━━━━━┛   │  │
│  │                      [Pink]              [Pink]                 │  │
│  └─────────────────────────────────────────────────────────────────┘  │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

## Dropdown Expanded View

```
┏━━━━━━━━━━━━━━━━━┓
┃ Source: 2 ▲     ┃  ← Active filter button
┗━━━━━━━━━━━━━━━━━┛
        ▼
┌─────────────────────┐
│ Music Sources Clear │  ← Dropdown header with clear button
├─────────────────────┤
│ ☑ Spotify           │  ← Checked option
│ ☑ YouTube           │
│ ☐ Apple Music       │  ← Unchecked option
│ ☐ SoundCloud        │
│ ☐ Bandcamp          │
└─────────────────────┘
```

## Component Tree

```
ChannelFilterBar
├── .channel-filter-bar (container)
│   │
│   ├── .filter-section.filter-section--sort (Sort Buttons)
│   │   ├── button.filter-btn.filter-btn--sort[data-sort="recent"]
│   │   ├── button.filter-btn.filter-btn--sort[data-sort="popular_24h"]
│   │   ├── button.filter-btn.filter-btn--sort[data-sort="popular_7d"]
│   │   └── button.filter-btn.filter-btn--sort[data-sort="all_time"]
│   │
│   └── .filter-section.filter-section--filters (Filter Controls)
│       │
│       ├── .filter-dropdown (Quality)
│       │   └── button.filter-btn.filter-btn--filter
│       │       ├── span.filter-label ("Quality:")
│       │       └── span.filter-value ("All" / "3+ likes")
│       │
│       ├── .filter-dropdown (Source)
│       │   ├── button.filter-btn.filter-btn--filter
│       │   │   ├── span.filter-label ("Source:")
│       │   │   ├── span.filter-value ("All" / "2 selected")
│       │   │   └── span.filter-chevron ("▼" / "▲")
│       │   │
│       │   └── .filter-dropdown-menu (when open)
│       │       ├── .filter-dropdown-header
│       │       │   ├── span.filter-dropdown-title
│       │       │   └── button.filter-clear-btn
│       │       │
│       │       └── .filter-dropdown-options
│       │           └── label.filter-option (repeated)
│       │               ├── input[type="checkbox"]
│       │               └── span.filter-option-label
│       │
│       └── .filter-dropdown (Genre)
│           ├── button.filter-btn.filter-btn--filter
│           └── .filter-dropdown-menu (same structure as Source)
```

## State Flow Diagram

```
┌──────────────────┐
│  User Interaction│
└────────┬─────────┘
         │
         ├─ Click Sort Button
         │    ↓
         │  onSortChange(newSort)
         │    ↓
         │  Parent updates activeSort
         │    ↓
         │  Component re-renders with new active state
         │
         ├─ Click Quality Button
         │    ↓
         │  onQualityFilterChange(0 or 3)
         │    ↓
         │  Parent updates qualityFilter
         │    ↓
         │  Component re-renders with new state
         │
         ├─ Click Source/Genre Dropdown
         │    ↓
         │  toggleDropdown()
         │    ↓
         │  Local state updates (sourceDropdownOpen)
         │    ↓
         │  Dropdown menu appears with animation
         │
         └─ Toggle Checkbox in Dropdown
              ↓
            handleSourceToggle(platform) / handleGenreToggle(genre)
              ↓
            Calculate new array (add/remove item)
              ↓
            onMusicSourcesChange(newArray) / onGenresChange(newArray)
              ↓
            Parent updates musicSources/genres
              ↓
            Component re-renders with updated selections
```

## CSS Class Naming Convention

### BEM-Style Structure
```
.channel-filter-bar               # Block
  .filter-section                 # Element
    .filter-section--sort         # Modifier
    .filter-section--filters      # Modifier

  .filter-btn                     # Element
    .filter-btn--sort             # Modifier
    .filter-btn--filter           # Modifier
    .filter-btn--active           # State modifier

  .filter-dropdown                # Element
    .filter-dropdown-menu         # Sub-element
    .filter-dropdown-header       # Sub-element
    .filter-dropdown-options      # Sub-element

  .filter-option                  # Element
    .filter-option-label          # Sub-element
```

### Data Attributes
```html
<button data-sort="recent">        <!-- Sort type identifier -->
<div data-dropdown-open="true">    <!-- Dropdown state for styling -->
```

## Responsive Breakpoints

```
Mobile Small (< 375px)
┌────────────────┐
│ ┏━━━━━━━━━━━┓  │
│ ┃  RECENT   ┃  │  Sort buttons stacked vertically
│ ┗━━━━━━━━━━━┛  │  Compact padding
│ ┏━━━━━━━━━━━┓  │
│ ┃ POPULAR   ┃  │
│ ┗━━━━━━━━━━━┛  │
│                │
│ ┏━━━━━━━━━━━┓  │
│ ┃ Quality   ┃  │  Filters stacked
│ ┗━━━━━━━━━━━┛  │
└────────────────┘

Mobile (375px - 640px)
┌─────────────────────┐
│ ┏━━━━┓ ┏━━━━━━━━┓  │  Sort buttons wrapped
│ ┃ REC ┃ ┃ POP 24H┃  │
│ ┗━━━━┛ ┗━━━━━━━━┛  │
│ ┏━━━━━━━━┓ ┏━━━━┓  │
│ ┃ POP 7D ┃ ┃ ALL ┃  │
│ ┗━━━━━━━━┛ ┗━━━━┛  │
│                     │
│ ┏━━━━━┓ ┏━━━━━━┓  │  Filters in row
│ ┃ QUAL ┃ ┃ SRC  ┃  │
│ ┗━━━━━┛ ┗━━━━━━┛  │
└─────────────────────┘

Tablet+ (640px+)
┌─────────────────────────────────────────────────┐
│ ┏━━━┓ ┏━━━━━┓ ┏━━━━━┓ ┏━━━┓  ┏━━━┓ ┏━━━┓ ┏━━━┓ │
│ ┃REC┃ ┃POP24┃ ┃POP7D┃ ┃ALL┃  ┃QUA┃ ┃SRC┃ ┃GEN┃ │
│ ┗━━━┛ ┗━━━━━┛ ┗━━━━━┛ ┗━━━┛  ┗━━━┛ ┗━━━┛ ┗━━━┛ │
│ ← Sort buttons left          Filters right →   │
└─────────────────────────────────────────────────┘
```

## Color System Map

```
Sort Buttons (4 unique colors):
├─ recent      → Cyan     #04caf4  rgb(4, 202, 244)
├─ popular_24h → Magenta  #e010e0  rgb(224, 16, 224)
├─ popular_7d  → Green    #00f92a  rgb(0, 249, 42)
└─ all_time    → Yellow   #d1f60a  rgb(209, 246, 10)

Filter Buttons (unified color):
└─ All filters → Pink     #f906d6  rgb(249, 6, 214)

Focus Outline (accessibility):
└─ Focus state → Cyan     #04caf4  (universal focus color)
```

## Event Flow Example

```typescript
// User clicks "Popular (24h)" button
┌─────────────────────────────────────────────┐
│ 1. onClick handler fires                    │
│    └─ props.onSortChange('popular_24h')     │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│ 2. Parent component receives callback       │
│    └─ setActiveSort('popular_24h')          │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│ 3. Parent triggers API refetch              │
│    └─ fetchChannelFeed({                    │
│         sort: 'popular_24h',                │
│         minLikes: qualityFilter(),          │
│         sources: musicSources(),            │
│         genres: genres()                    │
│       })                                    │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│ 4. Component re-renders                     │
│    └─ activeSort = 'popular_24h'            │
│    └─ Button shows active state             │
│         - Solid border                      │
│         - Brighter color                    │
│         - Neon glow effect                  │
│         - Activation animation              │
└─────────────────────────────────────────────┘
```

## Animation Timeline

```
Button Click → Active State
─────────────────────────────
0ms:    Click detected
        └─ transform: scale(0.97)
        └─ filter: brightness(0.9)

100ms:  Click release
        └─ transform: scale(1)
        └─ Active class added

100ms:  Animation starts (filter-activate)
        └─ box-shadow: 0 0 0

250ms:  Animation peak
        └─ transform: scale(1.05)
        └─ box-shadow: 0 0 20px currentColor

400ms:  Animation complete
        └─ transform: scale(1)
        └─ Resting active state
```

## Accessibility Features Map

```
Keyboard Navigation
├─ Tab: Move between buttons and dropdowns
├─ Shift+Tab: Move backwards
├─ Space/Enter: Activate button or toggle dropdown
├─ Arrow Keys: (Future enhancement for dropdowns)
└─ Escape: Close dropdown (Future enhancement)

Screen Reader Support
├─ role="tablist" on sort section
├─ role="tab" + aria-selected on sort buttons
├─ aria-expanded on dropdown buttons
├─ aria-checked on checkboxes
├─ aria-label on clear buttons
└─ role="menu" + role="menuitemcheckbox" on dropdowns

Focus Indicators
├─ 2px solid cyan outline
├─ 2px outline-offset
├─ 0 0 8px cyan glow
└─ Visible on all interactive elements
```

---

**Component Version**: 1.0
**Last Updated**: October 2025
**Design System**: Jamzy Retro Terminal v6
