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

**Frontend Development:**
```bash
bun run dev       # Start dev server (localhost:3001)
bun run build     # Production build
bun run typecheck # TypeScript validation
```

**Python Data Processing:**
```bash
cd data/pipelines
python -m flow    # Run data pipelines
pip install -r requirements.txt  # Install Python deps
```

## 📁 Ultra-Clean Project Structure

```
/frontend/        # All frontend code + build artifacts
  /src/           # Source code (components, stores, utils)
  /node_modules/  # Dependencies
  /dist/          # Build output
/backend/         # All backend APIs (TypeScript)
  /api/           # Main REST API endpoints
  /analytics/     # Analytics service  
  /server.ts      # Main server file
/data/            # Python data processing
  /pipelines/     # Data import and processing flows
  /lib/           # Python utilities
/database/        # Database migrations and functions
/shared/          # Types shared between frontend/backend
/docs/            # All documentation and guides
```

## 🎯 Common Tasks Quick Reference
- **Add new component**: `/frontend/src/components/[feature]/`
- **Modify animations**: `/frontend/src/utils/animations.ts`
- **Update state management**: `/frontend/src/stores/`
- **Style changes**: Follow docs/DESIGN-GUIDELINES.md retro aesthetic
- **Add data pipeline**: `/data/pipelines/`
- **Update database schema**: `/database/migrations/`
- **Python utilities**: `/data/lib/`
- **Add API endpoint**: `/backend/api/`


---
*This file serves as an index. All detailed information is in the `/docs/` directory files.*