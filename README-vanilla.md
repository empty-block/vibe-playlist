# VIBES - Vanilla JS Music Playlist App

A retro-themed music playlist app built with pure HTML, vanilla JavaScript, and Tailwind CSS. No build tools required!

## Features
- 🎨 Multiple retro themes (Windows 95, Y2K, MySpace, etc.)
- 🎵 YouTube video integration
- 🤖 AI DJ Bot assistant
- 💬 Social feed with chat
- 📱 Drag-to-resize columns
- 💾 Local storage for preferences

## Quick Start

```bash
# Install Bun if you haven't already
curl -fsSL https://bun.sh/install | bash

# Run the server
bun run dev

# Or directly
bun run super-simple-server.ts
```

Then open http://localhost:4201 in your browser.

## Project Structure
```
vibes-playlist/
├── vibes-themes.html    # The entire app (HTML + JS + CSS)
├── super-simple-server.ts # Simple Bun server (7 lines!)
└── package.json         # Scripts and dependencies
```

## Why Vanilla JS?
- **Zero build time** - Just save and refresh
- **Instant load** - No framework overhead
- **Simple deployment** - It's one HTML file
- **Easy to understand** - No abstractions

## Customization
- Edit `vibes-themes.html` directly
- All themes are defined in the `themes` object
- Add new playlists in the `playlists` object
- Modify column widths by dragging the resize handles

## Old React/SolidJS Setup
The project originally included React/SolidJS setups. They're still here if needed:
- `bun run dev:old` - Runs the old SolidJS setup
- See `server.tsx`, `src/` for the component-based version