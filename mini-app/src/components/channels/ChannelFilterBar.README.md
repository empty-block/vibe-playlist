# ChannelFilterBar Component

A comprehensive filter and sort control for the Jamzy channel feed page. Features retro terminal aesthetics with neon colors, smooth animations, and full keyboard accessibility.

## Features

### Sort Options (4 buttons)
- **Recent** - Latest posts first (Cyan #04caf4)
- **Popular (24h)** - Most engagement in last 24 hours (Magenta #e010e0)
- **Popular (7d)** - Most engagement in last week (Green #00f92a)
- **All-time** - Highest engagement ever (Yellow #d1f60a)

### Filter Options (3 controls)
1. **Quality Filter** - Toggle button for minimum likes (All / 3+ likes)
2. **Source Filter** - Multi-select dropdown for music platforms
3. **Genre Filter** - Multi-select dropdown for music genres

## Design Philosophy

This component follows Jamzy's **retro terminal aesthetic**:

- **Sharp Corners**: Zero border-radius for authentic retro feel
- **Neon Colors**: Each sort option uses a distinct cyberpunk color
- **Terminal Typography**: JetBrains Mono with wide letter-spacing
- **Glow Effects**: Multi-layer box-shadows for neon glow on active states
- **Smooth Transitions**: 200ms cubic-bezier animations
- **Dark Background**: Semi-transparent black with colored accents

## Usage

```tsx
import { ChannelFilterBar } from './components/channels/ChannelFilterBar';
import type { ChannelFeedSortOption, MusicPlatform } from '../../shared/types/channels';

function ChannelFeedPage() {
  const [activeSort, setActiveSort] = createSignal<ChannelFeedSortOption>('recent');
  const [qualityFilter, setQualityFilter] = createSignal(0);
  const [musicSources, setMusicSources] = createSignal<MusicPlatform[]>([]);
  const [genres, setGenres] = createSignal<string[]>([]);

  return (
    <ChannelFilterBar
      // Sort
      activeSort={activeSort()}
      onSortChange={setActiveSort}

      // Filters
      qualityFilter={qualityFilter()}
      onQualityFilterChange={setQualityFilter}

      musicSources={musicSources()}
      onMusicSourcesChange={setMusicSources}

      genres={genres()}
      onGenresChange={setGenres}

      // Available options (from API)
      availablePlatforms={['spotify', 'youtube', 'soundcloud']}
      availableGenres={['Rock', 'Pop', 'Hip Hop', 'Electronic']}
    />
  );
}
```

## Props

```typescript
interface ChannelFilterBarProps {
  // Sort
  activeSort: ChannelFeedSortOption;           // Current sort selection
  onSortChange: (sort: ChannelFeedSortOption) => void;

  // Filters
  qualityFilter: number;                        // 0 = all, 3 = "3+ likes"
  onQualityFilterChange: (minLikes: number) => void;

  musicSources: MusicPlatform[];                // Empty array = all sources
  onMusicSourcesChange: (sources: MusicPlatform[]) => void;

  genres: string[];                             // Empty array = all genres
  onGenresChange: (genres: string[]) => void;

  // Available options
  availablePlatforms: MusicPlatform[];          // Platforms to show in dropdown
  availableGenres: string[];                    // Genres to show in dropdown
}
```

## Types

```typescript
// From shared/types/channels.ts
export type ChannelFeedSortOption = 'recent' | 'popular_24h' | 'popular_7d' | 'all_time';

export type MusicPlatform =
  | 'spotify'
  | 'youtube'
  | 'apple_music'
  | 'soundcloud'
  | 'songlink'
  | 'audius'
  | 'bandcamp';
```

## Responsive Behavior

### Mobile (< 375px)
- Compact button padding (8px 16px)
- Smaller font size (10px)
- Vertical stack layout
- Minimum touch targets (40px)

### Mobile (375px - 640px)
- Standard button padding (10px 20px)
- Font size 11px
- Vertical stack layout
- Touch targets (44px)

### Tablet (640px+)
- Horizontal layout: Sort buttons left, Filters right
- Increased button padding (11px 24px)
- Font size 12px

### Desktop (1024px+)
- Maximum spacing and padding
- Side margins increase to 24px
- Button padding: 12px 28px

## Accessibility

### Keyboard Navigation
- All buttons are focusable via Tab
- Sort buttons: Space/Enter to activate
- Dropdowns: Space/Enter to open/close
- Checkboxes: Space to toggle
- Focus indicators: 2px cyan outline with glow

### ARIA Labels
- Sort buttons use `role="tab"` with `aria-selected`
- Dropdowns use `aria-expanded` states
- Checkboxes use `aria-checked` states
- Clear buttons have descriptive `aria-label`

### Screen Readers
- Filter sections have semantic structure
- Dropdown menus use `role="menu"` and `role="menuitemcheckbox"`
- Active filter counts announced in button labels

## Animation Details

### Button Activation (300ms)
```css
@keyframes filter-activate {
  0%   { box-shadow: 0 0 0; transform: scale(1); }
  50%  { box-shadow: 0 0 20px currentColor; transform: scale(1.05); }
  100% { transform: scale(1); }
}
```

### Dropdown Appearance (200ms)
```css
@keyframes dropdown-appear {
  from { opacity: 0; transform: translateY(-8px); }
  to   { opacity: 1; transform: translateY(0); }
}
```

### Click Feedback
- Scale down to 0.97 on `:active`
- Brightness filter to 0.9

## Color Palette

### Sort Buttons
- **Recent**: Cyan `#04caf4` / `rgba(4, 202, 244, x)`
- **Popular 24h**: Magenta `#e010e0` / `rgba(224, 16, 224, x)`
- **Popular 7d**: Green `#00f92a` / `rgba(0, 249, 42, x)`
- **All-time**: Yellow `#d1f60a` / `rgba(209, 246, 10, x)`

### Filter Buttons
- **All Filters**: Pink `#f906d6` / `rgba(249, 6, 214, x)`

### State Opacity Values
- Inactive background: `0.08`
- Inactive border: `0.3`
- Inactive text: `0.7`
- Hover background: `0.12`
- Hover border: `0.5`
- Hover text: `0.9`
- Active background: `0.15`
- Active border: `1.0` (solid)
- Active text: `1.0` (solid)

## Performance Optimizations

- **Hardware Acceleration**: Uses `transform` for animations (GPU accelerated)
- **Efficient Transitions**: Only animates compositable properties
- **Conditional Rendering**: Dropdowns only render when open
- **No Layout Thrashing**: All animations use transform/opacity

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- CSS Grid and Flexbox required
- CSS custom properties (variables) required
- Graceful degradation for older browsers:
  - Animations disabled with `@media (prefers-reduced-motion)`
  - Custom checkbox fallback for unsupported browsers

## File Structure

```
/mini-app/src/components/channels/
├── ChannelFilterBar.tsx          # Component logic
├── ChannelFilterBar.css          # Retro neon styling
├── ChannelFilterBar.example.tsx  # Usage example
└── ChannelFilterBar.README.md    # This documentation
```

## Integration Checklist

- [ ] Import component and types
- [ ] Set up state management for sort/filters
- [ ] Connect to API refetch on filter changes
- [ ] Provide available platforms from API/config
- [ ] Provide available genres from API/data
- [ ] Handle loading states during refetch
- [ ] Test keyboard navigation
- [ ] Test mobile responsiveness
- [ ] Verify colors match Jamzy theme

## Related Components

- **ThreadFilterBar** (`/mini-app/src/components/threads/ThreadFilterBar.tsx`) - Similar pattern for thread sorting
- **ChannelSortBar** (`/mini-app/src/components/channels/ChannelSortBar.tsx`) - Channel list sorting

## Design References

- **Design Guidelines**: `/docs/DESIGN-GUIDELINES.md`
- **Neon Color System**: Lines 94-114 in DESIGN-GUIDELINES.md
- **Animation Standards**: Lines 127-176 in DESIGN-GUIDELINES.md
- **Spacing System**: Lines 226-241 in DESIGN-GUIDELINES.md

---

**Created**: October 2025
**Status**: Production Ready
**Maintainer**: Jamzy Design System
