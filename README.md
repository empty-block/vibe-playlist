# 🎵 VIBES 95 - Social Music Through Playlists

VIBES 95 reimagines music sharing by treating **playlists as the fundamental unit** of musical expression. Built on Farcaster's social infrastructure with a nostalgic Windows 95 aesthetic, it turns every music interaction into playlist creation.

## 🎯 The Big Idea: Everything is a Playlist

**Rethinking Music Sharing**: Instead of posting individual tracks to feeds, users create playlist entries. Your profile becomes your personal "Jams" playlist, collaborative playlists become group spaces, and AI algorithms curate discovery playlists.

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
- **Existing Communities**: Leverages your Farcaster network
- **No Account Creation**: Use your existing Farcaster identity

### 🎨 Nostalgic Design
- **Windows 95 Aesthetic**: Authentic retro UI with pixel-perfect styling
- **Familiar Interactions**: Classic buttons, panels, and navigation
- **Modern Responsiveness**: Works beautifully on all devices

## 🚀 Try It Out

**Live Demo**: [https://66403c95.vibe-playlist.pages.dev/](https://66403c95.vibe-playlist.pages.dev/)

## 🎮 How It Works

### 🏠 Browse Playlists (Home)
- **Feed Experience**: See tracks from different playlists in your network
- **Smart Sorting**: Sort by newest, most liked, or most commented
- **Search Everything**: Find tracks across all playlists instantly
- **AI Assistant**: Chat with DJ Bot for music recommendations

### ➕ Create Playlist Entries (Create Page)
- **Add Any Song**: Paste URLs from YouTube, Spotify, or SoundCloud
- **Choose Destination**: Quick access to your favorite playlists
- **Advanced Selection**: Search, filter, and sort through all your playlists
- **Add Your Take**: Include comments about why you love the track

### 👥 Playlist Types in Action
- **Personal "My Jams"**: Your musical profile/feed on Farcaster
- **Collaborative Playlists**: "Friday Bangers" with 12 friends contributing
- **AI Discovery**: Algorithm finds tracks based on your taste graph

## 🛠️ For Developers

### Quick Start
```bash
# Clone the repo
git clone https://github.com/your-org/vibes-playlist.git
cd vibes-playlist

# Install dependencies (requires Bun)
bun install

# Set up environment
cp .env.example .env
# Add your Spotify Client ID to .env

# Start development server
bun run dev
```

### Technical Architecture
- **Frontend**: SolidJS + TypeScript for reactive UI
- **Styling**: TailwindCSS with custom Win95 components
- **Audio**: YouTube IFrame API + Spotify Web Playback SDK
- **Backend**: Farcaster protocol for social features
- **Deployment**: Cloudflare Pages
- **Component System**: Reusable social components following DRY principles

### Component Architecture
The app follows a **DRY (Don't Repeat Yourself) principle** with reusable social components:

- **`SocialStats`**: Consistent likes/recasts/replies display across all contexts
- **`SocialActions`**: Reusable action buttons (like, share, reply) with multiple variants
- **`ReplyItem`**: Standardized reply formatting for desktop and mobile
- **Responsive Player**: Single component that adapts from desktop sidebar to mobile bottom bar
- **Social Modal**: Mobile-optimized overlay for full social experience in compact mode

This architecture ensures:
✅ **Consistency** - Same look/feel everywhere
✅ **Maintainability** - Change once, update everywhere  
✅ **Flexibility** - Components adapt to different contexts
✅ **Mobile-first** - Responsive design with touch-friendly interactions

### Development Notes
⚠️ **Important**: There are specific setup quirks for YouTube/Spotify integration documented in [`CLAUDE.md`](./CLAUDE.md) - essential reading for developers.

Key issues:
- YouTube embedding requires `localhost` for development
- Spotify auth requires `127.0.0.1` or HTTPS domains
- Solution: Use Cloudflare tunnel for testing both features

## 🎯 Product Vision

VIBES 95 bridges nostalgic design with modern social music concepts:

**Why Playlists?** Traditional social media treats music as disposable content. Playlists create persistent, collaborative spaces where music discoveries accumulate value over time.

**Why Farcaster?** Decentralized social infrastructure means users own their data and relationships, while developers focus on innovative UX rather than building social plumbing.

**Why Retro?** The Windows 95 aesthetic creates a unique, memorable experience that stands out in today's homogeneous design landscape while evoking the era when digital music culture began.

## 🎪 Use Cases

### Music Discovery Communities
- **Genre-focused groups** create collaborative playlists
- **AI algorithms** surface unexpected connections between tracks
- **Social proof** through likes and comments drives discovery

### Personal Music Curation
- **Your profile becomes your playlist** - musical identity on Farcaster
- **Cross-platform music** - YouTube finds, Spotify streams
- **Historical record** of your musical journey over time

### Event and Group Playlists
- **Party planning** - collaborative "Friday Bangers" playlist
- **Study groups** - shared "Focus Music" collections  
- **Road trips** - group-curated "Drive Music" playlists

## 🤝 Contributing

We welcome contributions! Whether you're interested in:
- 🎨 **Design**: Enhancing the Win95 aesthetic
- 🎵 **Music Features**: New streaming service integrations
- 🤖 **AI Curation**: Improving recommendation algorithms
- 🌐 **Farcaster Integration**: Deeper social features

See our [development setup](#-for-developers) and check [`CLAUDE.md`](./CLAUDE.md) for technical implementation details.

## 📜 License

MIT License - feel free to remix this concept for your own projects!

## 🙏 Acknowledgments

- **Windows 95** for the iconic design language that defined an era
- **Farcaster** for building decentralized social infrastructure
- **YouTube & Spotify** for making cross-platform music possible
- **The 90s music scene** for inspiring the vibe we're trying to recreate

---

*Building the future of social music with a 90s aesthetic* 🎵✨