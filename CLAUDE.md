# JAMZY - AI Agent Documentation Index

## 📚 Core Documentation

All detailed documentation is in the `/context/` directory:

- **[PROJECT-OVERVIEW.md](./context/PROJECT-OVERVIEW.md)** - Product vision, philosophy, and goals
- **[TECHNICAL-ARCHITECTURE.md](./context/TECHNICAL-ARCHITECTURE.md)** - Tech stack and system design
- **[DEV-GUIDE.md](./context/DEV-GUIDE.md)** - Development setup, troubleshooting, and critical quirks
- **[DESIGN-GUIDELINES.md](./context/DESIGN-GUIDELINES.md)** - UI/UX standards, animations, and component patterns

## 🚀 Quick Start for AI Agents

1. **Read PROJECT-OVERVIEW.md first** to understand what Jamzy is (social music discovery on Farcaster)
2. **Check DEV-GUIDE.md** for critical development issues (especially YouTube/Spotify conflicts)
3. **Reference DESIGN-GUIDELINES.md** for UI patterns and component usage
4. **Review TECHNICAL-ARCHITECTURE.md** for stack details (Bun, SolidJS, Vite, anime.js)

## ⚠️ Most Critical Issue

**YouTube vs Spotify Origin Conflict**: YouTube requires `localhost`, Spotify requires `127.0.0.1` or HTTPS. Solution: Use Cloudflare Tunnel for development. See DEV-GUIDE.md for details.

## 🛠 Key Commands

```bash
bun run dev       # Start dev server (localhost:3001)
bun run build     # Production build
bun run typecheck # TypeScript validation
```

## 📁 Project Structure

```
/context/          # All detailed documentation
/src/components/   # Feature-based component organization
/src/stores/       # State management (SolidJS signals)
/src/utils/        # Utilities including animations.ts
```

## 🎯 Common Tasks Quick Reference
- **Add new component**: `/src/components/[feature]/`
- **Modify animations**: `/src/utils/animations.ts`
- **Update state management**: `/src/stores/`
- **Style changes**: Follow DESIGN-GUIDELINES.md retro aesthetic


---
*This file serves as an index. All detailed information is in the `/context/` directory files.*