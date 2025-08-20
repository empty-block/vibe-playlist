# JAMZY - Project Overview

## Purpose
JAMZY is a retro-themed music playlist social platform built on Farcaster infrastructure. It treats playlists as the fundamental organizational unit for all music content, where every user profile acts as their personal playlist and social sharing creates playlist entries.

## Tech Stack
- **Frontend Framework**: SolidJS (uses `createSignal()`/`createEffect()`, not React hooks)
- **Build Tool**: Vite with Bun as package manager
- **Animation**: anime.js v3.2.1 (stable version, avoid v4.x)
- **Styling**: Tailwind CSS with custom Win95/retro theming
- **Backend**: Bun server with WebSocket support
- **Social Platform**: Built on Farcaster protocol for user management and social features

## Key Architecture Decisions
- **"Everything is a Playlist"**: All content exists within playlist contexts
- **Farcaster Integration**: Leverages existing social infrastructure
- **Multi-source Player**: Supports YouTube, Spotify, SoundCloud with unified interface
- **Component-based**: Feature-domain organized components (auth/, chat/, player/, etc.)

## Development Environment
- Uses Bun instead of npm for all commands (`bun run dev`, `bun add`, etc.)
- Dev server runs on localhost:3001
- Supports Cloudflare Tunnel for HTTPS testing (needed for Spotify OAuth)