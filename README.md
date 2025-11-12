# 🎵 Jamzy 

### Quick Start - Local Development
```bash
# Clone the repo
git clone https://github.com/your-org/vibes-playlist.git
cd vibes-playlist

# Install TypeScript dependencies (requires Bun)
bun install

# Set up environment
cp .env.example .env
# Add your Spotify Client ID and other secrets to .env

# Start development server (mini-app + backend)
bun run dev:miniapp

# Or start components separately
bun run dev:server    # Backend only
```

### Quick Start - Python Data Processing
```bash
# Install Python dependencies
pip install -r requirements.txt

# Set up environment variables for Python services
export SUPABASE_URL="your-supabase-url"
export SUPABASE_SERVICE_KEY="your-service-key"
export DUNE_API_KEY="your-dune-api-key"

# Run data pipelines
cd data/pipelines
python -m flow
```

## 🚀 Deployment to Cloudflare

Jamzy is deployed to Cloudflare's edge infrastructure for global performance and reliability.

### Quick Deploy

Use the convenient deployment scripts in the project root:

```bash
# Deploy backend only
bun run deploy:backend

# Deploy mini-app only
bun run deploy:miniapp

# Deploy both at once
bun run deploy
```

### Branch Deployment Strategy

**Important:** Backend and frontend deployments work differently:

#### Backend (Cloudflare Workers)
- **Always updates production** - there are no separate branch deployments
- Every `bun run deploy:backend` immediately updates the live API
- URL: `https://jamzy-backend.ncmaddrey.workers.dev`
- **Recommendation**: Only deploy backend from `main` branch after thorough testing

#### Frontend (Cloudflare Pages)
- **Branch-specific URLs** - each branch gets its own preview deployment
- Branch URL format: `https://[branch-name].jamzy-miniapp.pages.dev`
- Production URL: `https://jamzy-miniapp.pages.dev`
- **Recommendation**: Test on branch deployments, then promote to production

### Recommended Workflow

1. **Development**: Work on a feature branch
   ```bash
   git checkout -b my-feature-branch
   # Make changes...
   ```

2. **Test Locally**: Use local dev server
   ```bash
   bun run dev:miniapp
   ```

3. **Deploy Frontend for Testing**: Deploy mini-app to get branch preview URL
   ```bash
   bun run deploy:miniapp
   # Visit https://my-feature-branch.jamzy-miniapp.pages.dev
   ```

4. **Merge to Main**: After testing, merge your branch
   ```bash
   git checkout main
   git merge my-feature-branch
   ```

5. **Deploy Production**: Deploy both backend and frontend from `main`
   ```bash
   bun run deploy
   ```

6. **Promote to Production**: Go to Cloudflare Dashboard → Pages → jamzy-miniapp
   - Find your deployment
   - Click "..." → "Promote to production"
   - Now live at `https://jamzy-miniapp.pages.dev`

### Current Deployments

- **Backend API**: [https://jamzy-backend.ncmaddrey.workers.dev](https://jamzy-backend.ncmaddrey.workers.dev)
- **Mini-App (Production)**: [https://jamzy-miniapp.pages.dev](https://jamzy-miniapp.pages.dev)

### Detailed Documentation

For complete deployment instructions including:
- Setting environment secrets
- Cron trigger configuration
- Monitoring and debugging
- Custom domain setup
- Rollback procedures

See **[docs/CLOUDFLARE-DEPLOYMENT.md](./docs/CLOUDFLARE-DEPLOYMENT.md)**

### Technical Architecture
**Frontend Stack:**
- **Frontend**: SolidJS + TypeScript for reactive UI
- **Styling**: TailwindCSS with custom Win95 components
- **Animations**: anime.js v3.2.1 for smooth UI interactions
- **Audio**: YouTube IFrame API + Spotify Web Playback SDK
- **Backend**: Farcaster protocol for social features
- **Deployment**: Cloudflare Pages

**Data Processing Stack:**
- **Language**: Python 3.8+
- **Database**: Supabase (PostgreSQL)
- **Data Source**: Dune Analytics for Farcaster data
- **Pipeline Framework**: Prefect for workflow orchestration
- **Data Processing**: Pandas, Polars for data manipulation
- **AI Integration**: Anthropic Claude for music metadata extraction


### Database Migrations

This project uses Supabase PostgreSQL with custom migrations stored in `/database/migrations/`. Here's how to deploy them properly:

#### Prerequisites
1. Install Supabase CLI:
   ```bash
   npm install -g @supabase/cli
   ```

2. Set up your environment variables in `.env`:
   ```
   SUPABASE_URL=your-supabase-project-url
   SUPABASE_KEY=your-supabase-anon-key
   SUPABASE_DB_PASSWORD=your-database-password
   ```

#### Running Migrations

**Method 1: Direct PostgreSQL Connection (Recommended)**
```bash
# Run migrations in order using psql directly
psql "postgresql://postgres:YOUR_PASSWORD@db.PROJECT_ID.supabase.co:5432/postgres" \
  -f database/migrations/20250917000001_create_library_functions.sql

psql "postgresql://postgres:YOUR_PASSWORD@db.PROJECT_ID.supabase.co:5432/postgres" \
  -f database/migrations/20250917000002_add_library_performance_indexes.sql

psql "postgresql://postgres:YOUR_PASSWORD@db.PROJECT_ID.supabase.co:5432/postgres" \
  -f database/migrations/20250917000003_grant_function_permissions.sql
```

**Method 2: Supabase Dashboard SQL Editor**
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste each migration file content in order
4. Execute each migration one by one

#### Key Functions Deployed
- `search_music_library()` - Full-text search across entire music library (not limited to 1,000 results)
- `sort_music_library()` - Global sorting with engagement metrics (likes, replies, recasts)  
- `get_engagement_stats_batch()` - Optimized batch loading of social engagement data

#### Migration Notes
- **Timestamp Types**: Functions use `TIMESTAMP` (not `TIMESTAMPTZ`) to match existing schema
- **Edge Types**: Uses uppercase values (`LIKED`, `REPLIED`, `RECASTED`) as stored in database
- **Performance**: Includes GIN indexes for full-text search and engagement aggregation
- **Permissions**: Functions granted to both `authenticated` and `anon` roles

#### Troubleshooting
- If functions fail with type mismatches, check your table schema with `\d table_name` 
- For edge type errors, verify values with `SELECT DISTINCT edge_type FROM cast_edges`
- Performance indexes are created with `CONCURRENTLY` to avoid blocking production queries

### Development Notes
⚠️ **Important**: There are specific setup quirks for YouTube/Spotify integration documented in [`CLAUDE.md`](./CLAUDE.md) - essential reading for developers.

Key issues:
- YouTube embedding requires `localhost` for development
- Spotify auth requires `127.0.0.1` or HTTPS domains
- Solution: Use Cloudflare tunnel for testing both features


## 📜 License

MIT License - feel free to remix this concept for your own projects!
