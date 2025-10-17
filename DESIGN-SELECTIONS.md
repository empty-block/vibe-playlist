# Windows 95 Retro Design - Selected Designs

This document tracks our final design choices for each page/component of the Jamzy mini-app redesign.

## Design Philosophy
- **Era**: Windows 95 / Napster 2000s aesthetic
- **Color Palette**: Classic gray (#C0C0C8, #D4D0C8, #000080)
- **Borders**: 3D effect with light (#FFFFFF) top/left, dark (#000000, #808080) bottom/right
- **Fonts**: Arial for UI, Courier New for data/numbers
- **Layout**: Clean, functional, nostalgic

---

## ✅ Selected Designs

### 1. Channels List Page
**Selected**: Version 2.5 - Zen Master's Choice
- **File**: `/Users/nmadd/Dropbox/code/vibes/retro-design-TASK-637/prototypes/channels_v2_5.html`
- **Key Features**:
  - 40x40px channel images (perfect balance)
  - Alternating white/gray row backgrounds (#FFFFFF / #F0F0F0)
  - User count badges with 3D raised effect
  - Single-line descriptions with ellipsis
  - Search bar at bottom
  - Blue hover state (#000080) with white text
  - No toolbar or menu bar
  - Mobile responsive
- **Why This Works**: Perfect balance of information density, visual appeal, and usability. The 40x40 images are meaningful without dominating, spacing creates good rhythm, and alternating backgrounds improve scannability.

### 2. Track Card (Universal Component)
**Selected**: AF-001
- **File**: `/Users/nmadd/Dropbox/code/vibes/retro-design-TASK-637/prototypes/activity_feed_AF-001.html`
- **Key Features**:
  - Navy blue header bar (#000080) with white username and timestamp
  - 60x60px black square thumbnail (left) + track info (center) + 60px bright green play button (right)
  - Gray background (#d4d0c8) for track content area
  - Subtle "via spotify/youtube" text in small gray font
  - White comment section with italic text, no quotes
  - Bottom stats row with inset stat boxes (Windows 95 style)
  - Bright green solid play button (#00ff00) with black border
  - Bold black borders around entire card (3px)
  - Mobile responsive
- **Why This Works**: The navy blue header creates strong visual separation between posts and feels very "Windows 95". The bright green play button is eye-catching and fun while still being retro. The layout is clean and uncluttered. The inset stat boxes maintain Windows 95 authenticity. Everything works great on mobile.
- **Usage**: This card design serves as the universal track component used in:
  - Activity Feed (feed of all recent tracks)
  - Channel Detail (feed of tracks in specific channel)
  - User Profile (feed of user's shared tracks)

---

### 3. Channel Detail / Chat View
**Selected**: CD-005
- **File**: `/Users/nmadd/Dropbox/code/vibes/retro-design-TASK-637/prototypes/channel_detail_CD-005.html`
- **Key Features**:
  - Windows 95 window chrome with gradient blue title bar
  - Gradient header (navy to bright blue) with 100x100px channel image
  - Channel stats in dark boxes with cyan/green monospace text
  - Inline action bar with "Play All" and "Add Track" buttons + sort dropdown
  - Uses AF-001 track card design for all tracks in feed
  - Navy blue header, bright green play button, inset stat boxes
  - Napster library aesthetic
  - Fully responsive
- **Why This Works**: The bold Napster library aesthetic with the gradient header and large channel image creates strong visual hierarchy. The inline action bar keeps controls accessible. Using the universal AF-001 track card ensures consistency across all views.

---

### 4. User Profile
**Selected**: UP-002
- **File**: `/Users/nmadd/Dropbox/code/vibes/retro-design-TASK-637/prototypes/user_profile_UP-002.html`
- **Key Features**:
  - Napster Buddy List style compact horizontal header
  - Gradient background (navy to bright blue)
  - 60x60px avatar with inline stats (shared, liked, replied)
  - No Follow/Message buttons (not applicable to our app)
  - Windows 95-style filter button group for switching between:
    - Shared tracks (tracks user posted)
    - Liked tracks (tracks user liked)
    - Replied to tracks (tracks user replied to)
  - Dynamic feed header that updates based on selected filter
  - Uses AF-001 track card design for feed
  - Very space-efficient, instant messenger aesthetic
  - Mobile responsive
- **Why This Works**: The compact horizontal header maximizes space for the track feed. The filter button group provides clear, Windows 95-authentic navigation between the three feed types. The Napster gradient and LED-style stats maintain the retro aesthetic while being highly functional.

---

## 🔄 Pending Design Iterations

### 5. Navigation / Menu
**Status**: Not yet designed
- Main navigation structure
- How users move between sections
- Need to design 5 variations

---

## Notes
- All designs should maintain Windows 95 authenticity
- Mobile-first approach
- Real functionality in prototypes (not just mockups)
- Use 5 parallel Zan agents for variations
- Select best after reviewing all options
