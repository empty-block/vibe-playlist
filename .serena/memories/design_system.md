# JAMZY Design System

## Neon 90s Color Palette
- **Primary Blue**: #3b00fd (Deep Blue/Violet - Primary brand color)
- **Neon Green**: #00f92a (Bright Neon Green - Success, play states) 
- **Neon Cyan**: #04caf4 (Bright Cyan/Aqua - Links, info, highlights)
- **Neon Pink**: #f906d6 (Bright Neon Pink - Accent, warnings)
- **Neon Yellow**: #d1f60a (Bright Neon Yellow - Attention, notifications)

## Visual Style
- **Theme**: Retro 90s cyberpunk aesthetic with neon colors
- **Typography**: Monospace fonts (Courier New) for digital/LCD displays
- **Components**: Win95-style panels and buttons
- **Effects**: Neon glows, scan lines, gradient backgrounds, particle effects
- **Layout**: Dark backgrounds (#000, #1a1a1a) with bright accent colors

## Component Architecture
Feature-based organization:
- auth/ - Authentication components
- chat/ - AI chat interfaces
- common/ - Shared/reusable components
- layout/ - App structure & navigation
- player/ - Music playback functionality
- playlist/ - Playlist & track management
- social/ - Social interactions (SocialStats, SocialActions, ReplyItem)

## Animation System
- Centralized in `src/utils/animations.ts`
- Hardware-accelerated with `translateZ(0)`
- Key patterns: gradient hovers, magnetic effects, particle bursts, neon glows
- Always disable CSS transitions when using anime.js animations