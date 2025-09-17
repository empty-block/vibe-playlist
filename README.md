# 🎵 Jamzy - Social Music Through Playlists

Jamzy reimagines music sharing by treating **playlists as the fundamental unit** of musical expression. Built on Farcaster's social infrastructure with a nostalgic Windows 95 aesthetic, it turns every music interaction into playlist creation.

## 🎯 The Big Idea: Everything is a Playlist

**Rethinking Music Sharing**: Instead of posting individual tracks to feeds, users create playlist entries. Your profile becomes your personal "Jams" playlist, collaborative playlists become group spaces, and AI algorithms curate discovery playlists.

**Playlists = Farcaster Threads**: Under the hood, every playlist is actually a Farcaster thread:
- When someone creates a playlist, they're starting a new thread
- The first post might contain both the playlist intro AND initial tracks (e.g., "Here are my favorite 90s hits" + songs)
- Each song added is a reply to that thread
- Anyone can contribute by replying with their song suggestions
- The playlist title can be user-provided or AI-generated from thread content

**Three Playlist Types**:
- **👤 Personal**: Your musical identity (e.g., "Alex's Jams") 
- **👥 Collaborative**: Group music curation with friends
- **🤖 AI Curated**: Algorithm-driven discovery based on taste graphs

This unified approach simplifies the mental model - users always think "where should this song go?" rather than complex social media posting concepts.

## ✨ Key Features

### 🎵 Universal Music Support
- **Multi-Platform**: YouTube, Spotify Premium, SoundCloud support
- **Seamless Switching**: Songs play regardless of source
- **Cross-Platform Playlists**: Mix tracks from any streaming service

### 🤖 Smart Playlist Management
- **Scalable Selection**: Search, filter, and sort through hundreds of playlists
- **Quick Access**: One-click sharing to favorite playlists
- **Real-time Sorting**: Sort feeds by recent, likes, or comments
- **Collaborative Tools**: Easy playlist creation and member management

### 🌐 Farcaster Integration
- **Social Backend**: Built on decentralized social protocol
- **Thread-Based Playlists**: Each playlist is a Farcaster thread where songs are replies
- **Existing Communities**: Leverages your Farcaster network
- **No Account Creation**: Use your existing Farcaster identity
- **Native Social Features**: Likes, recasts, and replies work just like Farcaster

### 🎨 Nostalgic Design
- **Neon 90s Colors**: Vibrant high-contrast palette inspired by 1990s design
- **Modern Responsiveness**: Works beautifully on all devices
- **Smooth Animations**: Subtle anime.js effects enhance the retro experience

#### Color Palette
Our neon 90s color scheme creates an authentic retro atmosphere:
- **🔵 Neon Blue** `#3b00fd` - Primary brand color for main actions
- **🟢 Neon Green** `#00f92a` - Success states and play buttons
- **🔷 Neon Cyan** `#04caf4` - Interactive elements and highlights  
- **🩷 Neon Pink** `#f906d6` - Accent colors and warnings
- **💛 Neon Yellow** `#d1f60a` - Notifications and attention grabbers

## 🤖 AI-as-Assistant Philosophy

Jamzy's AI features are designed to **enhance human creativity, not replace it**. Our approach positions AI as a supportive assistant that helps users express their musical vision more naturally and efficiently.

### Core Principles
- **Human-Driven Curation**: Users maintain creative control over their playlists
- **AI Suggests, Users Decide**: The AI provides options and explanations; users make the final choices
- **Natural Language Interface**: Conversational UI eliminates manual searching and data entry
- **Creative Enhancement**: AI helps users discover and organize music they wouldn't find otherwise
- **Transparent Reasoning**: AI suggestions include explanations for why tracks were recommended

### Implementation Examples
- **Playlist Discovery**: Instead of complex search forms, users chat naturally ("I want some Frank Ocean vibes for late night coding")
- **Smart Suggestions**: AI recommends tracks with reasoning ("This song has that same ethereal quality you love")
- **Assisted Organization**: AI helps categorize and title playlists based on user preferences
- **Discovery Enhancement**: AI finds similar artists and tracks to expand user's musical horizons

This philosophy ensures that technology serves creativity rather than constraining it, making music discovery feel like collaboration with a knowledgeable friend rather than interaction with a search algorithm.

## 🛠️ For Developers

### ✨ Ultra-Clean Repository Structure
Perfectly organized with clear single-word directories:

```
vibes-playlist/
├── frontend/              # All frontend code + build artifacts
│   ├── src/              # Source code (components, stores, pages)
│   ├── node_modules/     # Dependencies (where they belong)
│   ├── dist/             # Build output
│   └── index.html        # App entry point
├── backend/              # All backend APIs (TypeScript)
│   ├── api/              # Main REST API endpoints  
│   ├── analytics/        # Analytics service
│   └── server.ts         # Main server file
├── data/                 # Python data processing
│   ├── pipelines/        # Data import and processing flows
│   ├── lib/             # Python utilities
│   └── test_algorithms/  # Algorithm testing
├── database/             # Database migrations and functions
├── shared/               # TypeScript types (used by frontend + backend)
└── docs/                 # All documentation and guides
```

### Quick Start - Frontend
```bash
# Clone the repo
git clone https://github.com/your-org/vibes-playlist.git
cd vibes-playlist

# Install TypeScript dependencies (requires Bun)
bun install

# Set up environment
cp .env.example .env
# Add your Spotify Client ID to .env

# Start development server
bun run dev
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
