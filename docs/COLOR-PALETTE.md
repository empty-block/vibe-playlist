# JAMZY Color Palette & Design System

**Last Updated:** 2025-10-23
**Version:** 2.0 - Post-Redesign Color Review

## Philosophy

JAMZY uses a dual-theme approach that balances **retro nostalgia** with **modern playfulness**:

- **Light Mode**: Windows 95 aesthetic with classic grays, whites, and navy blue
- **Dark Mode**: Cyberpunk terminal aesthetic with neon green, pure blacks, and vibrant neon accents

Both themes prioritize **readability, accessibility (WCAG 2.1 AA)**, and a cohesive **90s-inspired neon color palette** for interactive elements.

---

## Core Neon Palette (90s Inspired)

These colors are used across **both themes** for accents, interactive states, and branding:

| Color | Hex | Usage | Notes |
|-------|-----|-------|-------|
| **Neon Blue** | `#3b00fd` | Primary brand color, headers, titles | Deep violet-blue |
| **Neon Green** | `#00f92a` | Success states, play buttons, primary CTAs | Bright lime green |
| **Neon Cyan** | `#04caf4` | Links, info badges, secondary accents | Bright aqua/teal |
| **Neon Pink** | `#f906d6` | Artist names, warnings, metadata | Bright magenta |
| **Neon Yellow** | `#d1f60a` | Attention, notifications, highlights | Bright yellow-green |

### Color Constants Location
- TypeScript: `/mini-app/src/components/player/styles/neonTheme.ts`
- Export: `NEON_COLORS` object

---

## Light Theme (Windows 95 Style)

### Background Colors
| Variable | Hex | Usage |
|----------|-----|-------|
| `--bg-page` | `#008080` | Page background (cyan teal) |
| `--bg-window` | `#C0C0C8` | Window/container background (Win95 gray) |
| `--bg-card` | `#FFFFFF` | Card background (white) |
| `--bg-panel` | `#C0C0C8` | Panel background (Win95 gray) |
| `--bg-lcd` | `#000000` | LCD display background (black) |

### Border Colors (3D Win95 Effect)
| Variable | Hex | Usage |
|----------|-----|-------|
| `--border-raised-light` | `#FFFFFF` | Top/left borders (raised) |
| `--border-raised-dark` | `#000000` | Bottom/right borders (raised) |
| `--border-sunken-light` | `#000000` | Top/left borders (sunken/pressed) |
| `--border-sunken-dark` | `#FFFFFF` | Bottom/right borders (sunken/pressed) |
| `--border-accent` | `#808080` | General borders (medium gray) |

### Text Colors
| Variable | Hex | Usage |
|----------|-----|-------|
| `--text-primary` | `#000000` | Primary text (black) |
| `--text-secondary` | `#808080` | Secondary text (gray) |
| `--text-tertiary` | `#A0A0A0` | Tertiary text (light gray) |
| `--text-lcd` | `#00FF00` | LCD/terminal text (neon green) |
| `--text-lcd-secondary` | `#00FFFF` | LCD secondary text (cyan) |

### Accent Colors
| Variable | Hex | Usage |
|----------|-----|-------|
| `--accent-primary` | `#000080` | Primary accent (Win95 navy blue) |
| `--accent-secondary` | `#00FFFF` | Secondary accent (cyan) |
| `--accent-tertiary` | `#FF00FF` | Tertiary accent (magenta) |

### Interactive States
| Variable | Hex | Usage |
|----------|-----|-------|
| `--hover-bg` | `#E0E0E8` | Hover background (light gray) |
| `--active-bg` | `#A0A0A8` | Active/pressed background (medium gray) |
| `--focus-outline` | `#000080` | Focus outline (navy blue) |

### Shadows
| Variable | Value | Usage |
|----------|-------|-------|
| `--shadow-subtle` | `rgba(0, 0, 0, 0.1)` | Subtle shadow |
| `--shadow-medium` | `rgba(0, 0, 0, 0.2)` | Medium shadow |
| `--shadow-strong` | `rgba(0, 0, 0, 0.3)` | Strong shadow |
| `--glow-accent` | `transparent` | No glow in light mode |

---

## Dark Theme (Cyberpunk Terminal Style)

### Background Colors
| Variable | Hex | Usage |
|----------|-----|-------|
| `--bg-page` | `#008080` | Page background (cyan teal - same as light) |
| `--bg-window` | `#000000` | Window/container background (pure black) |
| `--bg-card` | `#1a1a1a` | Card background (dark gray) |
| `--bg-panel` | `#1a1a1a` | Panel background (dark gray) |
| `--bg-lcd` | `#000000` | LCD display background (black) |

### Border Colors (Neon Green Terminal Style)
| Variable | Hex | Usage |
|----------|-----|-------|
| `--border-raised-light` | `#00ff00` | Top/left borders (neon green) |
| `--border-raised-dark` | `#003300` | Bottom/right borders (dark green) |
| `--border-sunken-light` | `#003300` | Top/left borders (dark green) |
| `--border-sunken-dark` | `#00ff00` | Bottom/right borders (neon green) |
| `--border-accent` | `#00ff00` | General borders (neon green) |

### Text Colors
| Variable | Hex | Usage |
|----------|-----|-------|
| `--text-primary` | `#FFFFFF` | Primary text (white) |
| `--text-secondary` | `#888888` | Secondary text (gray) |
| `--text-tertiary` | `#666666` | Tertiary text (darker gray) |
| `--text-lcd` | `#00FF00` | LCD/terminal text (neon green - same) |
| `--text-lcd-secondary` | `#00FFFF` | LCD secondary text (cyan - same) |

### Accent Colors
| Variable | Hex | Usage |
|----------|-----|-------|
| `--accent-primary` | `#00ff00` | Primary accent (neon green) |
| `--accent-secondary` | `#00FFFF` | Secondary accent (cyan - same) |
| `--accent-tertiary` | `#E010E0` | Tertiary accent (bright magenta) |

### Interactive States
| Variable | Hex | Usage |
|----------|-----|-------|
| `--hover-bg` | `#222222` | Hover background (dark gray) |
| `--active-bg` | `#002200` | Active/pressed background (dark green) |
| `--focus-outline` | `#00ff00` | Focus outline (neon green) |

### Shadows & Glows
| Variable | Value | Usage |
|----------|-------|-------|
| `--shadow-subtle` | `rgba(0, 255, 0, 0.1)` | Subtle green glow |
| `--shadow-medium` | `rgba(0, 255, 0, 0.2)` | Medium green glow |
| `--shadow-strong` | `rgba(0, 255, 0, 0.3)` | Strong green glow |
| `--glow-accent` | `rgba(0, 255, 0, 0.3)` | Neon green glow effect |

---

## Gradient Definitions

### Page Backgrounds
Currently using a **shared gradient** across both themes:
```css
background: linear-gradient(135deg, #00f92a 0%, #04caf4 100%);
```
- **Green to Cyan** gradient (neon green → neon cyan)
- Applied to `<body>` element

### Component Gradients

#### Title Bar Gradients
**Current (Light Mode):**
```css
linear-gradient(90deg, #000080, #1084D0)
```
- Navy blue to light blue

**Current (Dark Mode):**
```css
linear-gradient(90deg, #001a00, #003300)
```
- Very dark green to dark green

#### Profile Header Gradient (Light)
```css
linear-gradient(135deg, #000080 0%, #1084d0 100%)
```
- Navy blue to light blue (matches title bar)

#### Avatar Fallback Gradient
```css
linear-gradient(135deg, #ff00ff, #00ffff)
```
- Magenta to cyan

#### Player Progress Bar
```css
linear-gradient(90deg, #00FF00, #00CC00)
```
- Bright green to darker green

#### Player Visualizer
```css
linear-gradient(to top, #00FF00, #00FF00 60%, #FFFF00 60%, #FFFF00 85%, #FF0000 85%)
```
- Green → Yellow → Red (audio level indicator)

#### Top 3 Ranking Badge
```css
linear-gradient(45deg, #FFD700, #FFA500)
```
- Gold to orange

#### Neon Container Backgrounds
```css
linear-gradient(145deg, #0a0a0a, #1a1a1a)
```
- Deep blacks (for dark mode cards)

### Recommended Gradient Updates

To better align with the neon 90s palette, consider these alternatives:

**Option 1: Dark Blue to Cyan**
```css
background: linear-gradient(135deg, #3b00fd 0%, #04caf4 100%);
```

**Option 2: Neon Blue to Neon Green**
```css
background: linear-gradient(135deg, #3b00fd 0%, #00f92a 100%);
```

**Option 3: Dark Blue to Light Blue with Green accent**
```css
background: linear-gradient(135deg, #3b00fd 0%, #04caf4 50%, #00f92a 100%);
```

---

## Opacity Scale

Standardized opacity values for consistency:

| Level | Hex Suffix | Percentage | Usage |
|-------|------------|------------|-------|
| Subtle | `1A` | 10% | Very light overlays |
| Light | `33` | 20% | Subtle backgrounds |
| Medium | `66` | 40% | Borders, dividers |
| Strong | `99` | 60% | Hover states |
| Intense | `CC` | 80% | Active states |

**Example:** `#04caf466` = Cyan at 40% opacity

---

## Platform-Specific Colors

These colors are **hard-coded** to match platform branding:

| Platform | Hex | Usage |
|----------|-----|-------|
| YouTube | `#FF0000` | YouTube badge background |
| Spotify | `#1DB954` | Spotify badge background |
| SoundCloud | `#FF5500` | SoundCloud badge background |
| Bandcamp | `#1DA0C3` | Bandcamp badge background |

These should remain consistent but ensure they have sufficient contrast in both themes.

---

## State-Based Color Mappings

| State | Color | Hex | Usage |
|-------|-------|-----|-------|
| Loading | Yellow | `#d1f60a` | Loading indicators |
| Playing | Green | `#00f92a` | Active play state |
| Paused | Cyan | `#04caf4` | Paused state |
| Error | Pink | `#f906d6` | Error messages |
| Inactive | Gray | `#666666` | Disabled/inactive elements |

---

## Component-Specific Color Guidelines

### Track Cards
- **Border (default):** `rgba(4, 202, 244, 0.3)` (cyan, 30% opacity)
- **Border (current track):** `rgba(0, 249, 42, 0.6)` (green, 60% opacity)
- **Track title:** Use `var(--text-primary)` (theme-aware)
- **Artist name:** Use `var(--accent-tertiary)` or neon pink `#f906d6`
- **Platform badges:** Platform-specific colors (see above)
- **Play button background:** Consider using `var(--accent-primary)` or neon green

### Player Bar
- **Time display:** Neon green `#00FF00`
- **Track title/subtitle:** Neon green or cyan
- **Shared by text:** Cyan `#00FFFF`
- **Source badge:** Magenta background with black text
- **Control buttons:** Use `var(--accent-secondary)` (cyan)
- **Progress bar:** Green gradient (see above)

### Profile Page
- **Header gradient:** Should use neon palette (blue to cyan recommended)
- **Avatar fallback:** Magenta to cyan gradient
- **Username:** White with text shadow
- **Bio/stats:** Green or cyan text
- **Activity cards:** Use `var(--bg-card)` with `var(--border-accent)` borders
- **Filter buttons (active):** Use `var(--accent-primary)` background

### Trending Page
- **Rank badges (top 3):** Gold to orange gradient
- **Track title:** Use `var(--text-primary)` (currently broken in dark mode - shows black)
- **Stats text:** Use `var(--text-secondary)`
- **Status bar:** Use `var(--bg-panel)` with `var(--border-accent)` border

### Channel Cards
- **Hash symbol:** Neon magenta `#f906d6`
- **Channel name:** Neon cyan `#04caf4`
- **Description:** Muted gray `#cccccc` (light mode) or `var(--text-secondary)` (dark mode)
- **Border:** Neon magenta with glow on hover
- **Hover glow:** `rgba(224, 16, 224, 0.4)` (magenta)

### Navigation
- **All elements:** Should use CSS variables (`var(--bg-window)`, `var(--border-raised-light)`, etc.)
- **Icons:** Apply green glow in dark mode using SVG filters

---

## Accessibility Requirements

All color combinations must meet **WCAG 2.1 AA standards**:

- **Normal text (< 18px):** Minimum contrast ratio of **4.5:1**
- **Large text (≥ 18px or bold ≥ 14px):** Minimum contrast ratio of **3:1**
- **Interactive elements:** Minimum contrast ratio of **3:1** against background

### Known Accessibility Issues (To Fix)
1. **Dark theme track titles:** Black text on black background (0:1 contrast) ❌
2. **Dark blues on black:** Insufficient contrast in dark mode
3. **Gray text on gray backgrounds:** Some light theme combinations need review

---

## CSS Variable Reference

All theme variables are defined in:
- **File:** `/mini-app/src/styles/theme.css`
- **Classes:** `.theme-light` and `.theme-dark`

### Usage Example
```css
.my-component {
  background: var(--bg-card);
  color: var(--text-primary);
  border: 2px solid var(--border-accent);
}

.theme-dark .my-component:hover {
  box-shadow: 0 0 10px var(--glow-accent);
}
```

---

## Missing CSS Variables (To Add)

These variables are **referenced in components but not defined** in `theme.css`:

1. `--neon-magenta` → Should map to `#f906d6` or `#E010E0`
2. `--neon-magenta-bright` → Should be `#f906d6`
3. `--neon-cyan` → Should map to `#04caf4`
4. `--font-display` → Should map to display font (monospace or MS Sans Serif)
5. `--light-text` → Should map to `var(--text-secondary)` or `#cccccc`
6. `--muted-text` → Should map to `var(--text-tertiary)`

**Action:** Add these to `theme.css` for both light and dark themes.

---

## Hard-Coded Colors to Replace

These files have **hard-coded colors** that should use CSS variables instead:

### `/mini-app/src/styles/trackCard.css`
- `.retro-track-title` → Uses `#000000` (should use `var(--text-primary)`)
- `.retro-track-artist` → Uses `#e010e0` (should use `var(--accent-tertiary)`)

### `/mini-app/src/styles/player.css`
- Title bar gradients → Should use CSS variables or neon gradient constants
- Progress bar → Could use CSS variable for green color

### `/mini-app/src/styles/profilePage.css`
- Header gradient → Should use neon palette colors
- Avatar fallback gradient → Could use CSS variable

### `/mini-app/src/styles/channelCard.css`
- All undefined CSS variables need to be replaced with defined ones

---

## Typography

### Font Families
- **Main UI:** `'MS Sans Serif', 'Microsoft Sans Serif', sans-serif`
- **Monospace/LCD:** `'Courier New', monospace`

### Font Sizes
| Name | Value | Usage |
|------|-------|-------|
| XS | `0.75rem` (12px) | Timestamps, metadata |
| SM | `0.875rem` (14px) | Secondary text |
| Base | `1rem` (16px) | Body text |
| LG | `1.125rem` (18px) | Subheadings |
| XL | `1.25rem` (20px) | Headings |
| 2XL | `1.5rem` (24px) | Large headings |

---

## Next Steps (Implementation)

1. ✅ Create this color palette documentation
2. Add missing CSS variables to `theme.css`
3. Fix track card hard-coded colors
4. Fix dark theme readability issues (black text on black)
5. Update channel card CSS variables
6. Standardize all gradients using neon palette
7. Run accessibility audit
8. Visual consistency check across all pages

---

**File Location:** `/docs/COLOR-PALETTE.md`
**Maintained By:** Design team (Zan)
**Last Review:** 2025-10-23
