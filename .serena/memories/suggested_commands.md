# JAMZY Development Commands

## Core Development
- `bun run dev` - Start development server (localhost:3001)
- `bun run build` - Build for production
- `bun run preview` - Preview production build
- `bun run typecheck` - TypeScript type checking

## With Spotify Testing (requires HTTPS)
```bash
# Terminal 1: Start dev server
bun run dev

# Terminal 2: Start Cloudflare tunnel
cloudflared tunnel --url http://localhost:3001
```

## Package Management
- `bun add <package>` - Add dependency
- `bun install` - Install dependencies
- `bun remove <package>` - Remove dependency

## System Commands (Darwin)
- `find . -name "*.tsx" | head -10` - Find TypeScript files
- `grep -r "someText" src/` - Search in source files
- `ls -la` - List files with details
- `git status` - Check git status