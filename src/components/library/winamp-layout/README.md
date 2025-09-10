# Winamp Library Layout

This directory contains the implementation of the Winamp-inspired library redesign as specified in the design plan.

## Architecture

The Winamp library layout implements a dual-panel interface with:
- **Left Sidebar**: Hierarchical tree navigation (280px width on desktop)
- **Right Main Content**: Search, filters, and track table (flexible width)

## Components

### Core Layout
- **`WinampLibraryLayout.tsx`**: Main wrapper component that orchestrates the layout
- **`WinampSidebar.tsx`**: Left sidebar with tree navigation
- **`WinampMainContent.tsx`**: Right panel with search, filters, and table
- **`WinampSidebarSection.tsx`**: Individual expandable sections in sidebar
- **`MobileSidebarToggle.tsx`**: Hamburger menu for mobile

### Supporting Components
- **`CollapsibleTreeItem.tsx`**: Reusable tree navigation item
- **`types.ts`**: TypeScript type definitions
- **`index.ts`**: Component exports
- **`README.md`**: This documentation

### Styling
- **`winamp-library.css`**: Complete CSS implementation following design plan specs

## State Management

Uses `winampSidebarStore.ts` for:
- Active section tracking
- Expand/collapse states
- Mobile sidebar visibility
- Filter application

## Responsive Design

### Desktop (1024px+)
- Full two-panel layout
- Fixed 280px sidebar
- Table view in main content

### Tablet (768-1023px)
- Collapsible sidebar overlay
- Hamburger menu toggle
- Table view maintained

### Mobile (320-767px)
- Full-screen sidebar overlay
- Card-based track layout
- Touch-optimized interactions

## Navigation Structure

```
► Local Library
  ├── All Tracks
  ├── Recently Added
  ├── Most Played
  └── Liked

► Collections  
  ├── Playlists
  ├── By Genre
  └── By User

► Social (Library mode only)
  ├── My Activity
  ├── Following
  └── Discover
```

## Integration

The layout wraps the existing `LibraryTable` component and maintains all existing functionality:
- Search and filtering
- Pagination
- Profile mode support
- Mobile responsiveness
- Accessibility features

## Design Principles

Follows Jamzy's retro-cyberpunk aesthetic:
- Neon color palette (#04caf4, #00f92a, #ff9b00)
- Terminal-style typography (JetBrains Mono)
- Angular borders with subtle glow effects
- Dark backgrounds with neon accents

## Accessibility

Implements WCAG 2.1 AA compliance:
- ARIA tree navigation roles
- Keyboard navigation support
- Focus management
- Screen reader compatibility