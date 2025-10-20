import { Component, createSignal, For } from 'solid-js';
import MobileNavigation from '../components/layout/MobileNavigation/MobileNavigation';
import './trendingPageWin95.css';

interface TrendingTrack {
  rank: number;
  title: string;
  artist: string;
  thumbnail: string;
  shares: number;
}

interface TopContributor {
  rank: number;
  username: string;
  fid: string;
  avatar: string;
  trackCount: number;
}

const TrendingPage: Component = () => {
  // Window state management
  const [window1Minimized, setWindow1Minimized] = createSignal(false);
  const [window2Minimized, setWindow2Minimized] = createSignal(false);
  const [window1Maximized, setWindow1Maximized] = createSignal(false);
  const [window2Maximized, setWindow2Maximized] = createSignal(false);

  // Mock data for trending tracks
  const trendingTracks: TrendingTrack[] = [
    { rank: 1, title: 'Midnight Synthwave Dreams', artist: 'Neon Nights', thumbnail: '🎸', shares: 342 },
    { rank: 2, title: 'Electric Sunset Boulevard', artist: 'RetroWave Collective', thumbnail: '🎹', shares: 298 },
    { rank: 3, title: 'Cyber Love Connection', artist: 'Digital Hearts', thumbnail: '🎤', shares: 267 },
    { rank: 4, title: 'Neon Tokyo Nights', artist: 'Urban Synth', thumbnail: '🎧', shares: 234 },
    { rank: 5, title: 'Vaporwave Paradise', artist: 'Aesthetic Waves', thumbnail: '🎵', shares: 189 },
    { rank: 6, title: 'Crystal Memories \'89', artist: 'Time Machine', thumbnail: '🎶', shares: 167 },
    { rank: 7, title: 'Digital Rain Dance', artist: 'Pixel Dreams', thumbnail: '🎸', shares: 143 },
    { rank: 8, title: 'Retro Future Groove', artist: 'Synth Masters', thumbnail: '🎹', shares: 128 },
    { rank: 9, title: 'Arcade Heartbeat', artist: '8-Bit Romance', thumbnail: '🎤', shares: 115 },
    { rank: 10, title: 'Cosmic Highway Drive', artist: 'Space Cruiser', thumbnail: '🎧', shares: 98 }
  ];

  // Mock data for top contributors
  const topContributors: TopContributor[] = [
    { rank: 1, username: '@musicvibe', fid: '12847', avatar: 'MV', trackCount: 47 },
    { rank: 2, username: '@synthhunter', fid: '8493', avatar: 'SH', trackCount: 39 },
    { rank: 3, username: '@retroguru', fid: '15672', avatar: 'RG', trackCount: 34 },
    { rank: 4, username: '@neonwave', fid: '23451', avatar: 'NW', trackCount: 28 },
    { rank: 5, username: '@vapordreams', fid: '9834', avatar: 'VD', trackCount: 25 },
    { rank: 6, username: '@digitalmusic', fid: '17892', avatar: 'DM', trackCount: 22 },
    { rank: 7, username: '@electrocity', fid: '31245', avatar: 'EC', trackCount: 19 },
    { rank: 8, username: '@pixelmelody', fid: '6789', avatar: 'PM', trackCount: 17 },
    { rank: 9, username: '@cybersounds', fid: '42156', avatar: 'CS', trackCount: 15 },
    { rank: 10, username: '@arcaderave', fid: '28934', avatar: 'AR', trackCount: 13 }
  ];

  // Calculate total tracks from contributors
  const totalTracks = () => topContributors.reduce((sum, c) => sum + c.trackCount, 0);

  // Event handlers
  const handleTrackClick = (track: TrendingTrack) => {
    console.log('Track clicked:', track.title);
    // TODO: Implement track detail view
  };

  const handleContributorClick = (contributor: TopContributor) => {
    console.log('Contributor clicked:', contributor.username);
    // TODO: Implement contributor profile view
  };

  return (
    <div class="trending-page">
      <div class="dashboard">
        {/* Window 1: Trending Tracks */}
        <div
          class="window"
          classList={{ minimized: window1Minimized() }}
        >
          <div class="title-bar">
            <div class="title-text">
              <div class="title-icon">⚡</div>
              <span>
                TRENDING TRACKS
                <span class="title-subtitle">- Last 24 Hours</span>
              </span>
            </div>
            <div class="title-buttons">
              <button
                class="title-btn"
                onClick={() => setWindow1Minimized(!window1Minimized())}
                title="Minimize"
              >
                _
              </button>
              <button
                class="title-btn"
                onClick={() => setWindow1Maximized(!window1Maximized())}
                title="Maximize"
              >
                □
              </button>
            </div>
          </div>

          <div
            class="window-content"
            style={{ height: window1Maximized() ? '650px' : '500px' }}
          >
            <div class="content-inner">
              <div class="section-header">
                <div class="section-title">Hot Right Now</div>
              </div>

              <For each={trendingTracks}>
                {(track) => (
                  <div
                    class="track-item"
                    onClick={() => handleTrackClick(track)}
                  >
                    <div
                      class="track-rank"
                      classList={{ 'top-3': track.rank <= 3 }}
                    >
                      {track.rank}
                    </div>
                    <div class="track-thumbnail">{track.thumbnail}</div>
                    <div class="track-info">
                      <div class="track-title">{track.title}</div>
                      <div class="track-artist">{track.artist}</div>
                    </div>
                    <div class="track-stats">
                      <div class="track-shares">
                        {track.rank <= 3 && <span class="fire-icon">🔥</span>}
                        <span>{track.shares}</span>
                      </div>
                    </div>
                  </div>
                )}
              </For>
            </div>
          </div>

          <div class="status-bar">
            <span class="status-bar-section">{trendingTracks.length} tracks</span>
            <span class="status-bar-section">Updated: 2m ago</span>
          </div>
        </div>

        {/* Window 2: Top Contributors */}
        <div
          class="window"
          classList={{ minimized: window2Minimized() }}
        >
          <div class="title-bar">
            <div class="title-text">
              <div class="title-icon">👥</div>
              <span>
                TOP CONTRIBUTORS
                <span class="title-subtitle">- Last 24 Hours</span>
              </span>
            </div>
            <div class="title-buttons">
              <button
                class="title-btn"
                onClick={() => setWindow2Minimized(!window2Minimized())}
                title="Minimize"
              >
                _
              </button>
              <button
                class="title-btn"
                onClick={() => setWindow2Maximized(!window2Maximized())}
                title="Maximize"
              >
                □
              </button>
            </div>
          </div>

          <div
            class="window-content"
            style={{ height: window2Maximized() ? '650px' : '500px' }}
          >
            <div class="content-inner">
              <div class="section-header">
                <div class="section-title">Power Users</div>
              </div>

              <For each={topContributors}>
                {(contributor) => (
                  <div
                    class="contributor-item"
                    onClick={() => handleContributorClick(contributor)}
                  >
                    <div class="contributor-rank">{contributor.rank}</div>
                    <div class="contributor-avatar">{contributor.avatar}</div>
                    <div class="contributor-info">
                      <div class="contributor-username">{contributor.username}</div>
                      <div class="contributor-fid">FID: {contributor.fid}</div>
                    </div>
                    <div>
                      <div class="contributor-count">{contributor.trackCount}</div>
                      <div class="contributor-label">tracks</div>
                    </div>
                  </div>
                )}
              </For>
            </div>
          </div>

          <div class="status-bar">
            <span class="status-bar-section">{topContributors.length} users</span>
            <span class="status-bar-section">Total: {totalTracks()} tracks</span>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <MobileNavigation class="pb-safe" />
    </div>
  );
};

export default TrendingPage;
