import { Component, createSignal, For, onMount } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import MobileNavigation from '../components/layout/MobileNavigation/MobileNavigation';
import { tracks, contributors, isLoading, error, lastUpdated, loadTrendingData } from '../stores/trendingStore';
import { setCurrentTrack, setIsPlaying } from '../stores/playerStore';
import { formatRelativeTime } from '../utils/time';
import './trendingPageWin95.css';

const TrendingPage: Component = () => {
  const navigate = useNavigate();

  // Window state management
  const [window1Minimized, setWindow1Minimized] = createSignal(false);
  const [window2Minimized, setWindow2Minimized] = createSignal(false);
  const [window1Maximized, setWindow1Maximized] = createSignal(false);
  const [window2Maximized, setWindow2Maximized] = createSignal(false);

  // Load trending data on mount
  onMount(() => {
    loadTrendingData();
  });

  // Calculate total tracks from contributors
  const totalTracks = () => contributors().reduce((sum, c) => sum + c.trackCount, 0);

  // Format the last updated timestamp
  const updatedTimeAgo = () => {
    const updated = lastUpdated();
    return updated ? formatRelativeTime(updated.toISOString()) : 'just now';
  };

  // Play track function
  const playTrack = (track: any) => {
    setCurrentTrack({
      id: track.id,
      title: track.title,
      artist: track.artist,
      thumbnail: track.thumbnail,
      source: track.platform,
      url: track.url,
      sourceId: track.platformId
    });
    setIsPlaying(true);
  };

  // Event handlers
  const handleTrackClick = (track: any) => {
    playTrack(track);
  };

  const handleContributorClick = (contributor: any) => {
    navigate(`/profile/${contributor.fid}`);
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
                <span class="title-subtitle">- Last 7 Days</span>
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

              {isLoading() && tracks().length === 0 ? (
                <div style="padding: 20px; text-align: center; color: #666;">
                  Loading trending tracks...
                </div>
              ) : error() ? (
                <div style="padding: 20px; text-align: center; color: #ff6b6b;">
                  Error: {error()}
                </div>
              ) : tracks().length === 0 ? (
                <div style="padding: 20px; text-align: center; color: #666;">
                  No trending tracks yet
                </div>
              ) : (
                <For each={tracks()}>
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
                      <div class="track-thumbnail">
                        {track.thumbnail ? (
                          <img src={track.thumbnail} alt={track.title} style="width: 40px; height: 40px; object-fit: cover; border-radius: 2px;" />
                        ) : (
                          '🎵'
                        )}
                      </div>
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
              )}
            </div>
          </div>

          <div class="status-bar">
            <span class="status-bar-section">{tracks().length} tracks</span>
            <span class="status-bar-section">Updated: {updatedTimeAgo()}</span>
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
                <span class="title-subtitle">- Last 7 Days</span>
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

              {isLoading() && contributors().length === 0 ? (
                <div style="padding: 20px; text-align: center; color: #666;">
                  Loading contributors...
                </div>
              ) : error() ? (
                <div style="padding: 20px; text-align: center; color: #ff6b6b;">
                  Error: {error()}
                </div>
              ) : contributors().length === 0 ? (
                <div style="padding: 20px; text-align: center; color: #666;">
                  No contributors yet
                </div>
              ) : (
                <For each={contributors()}>
                  {(contributor) => (
                    <div
                      class="contributor-item"
                      onClick={() => handleContributorClick(contributor)}
                    >
                      <div class="contributor-rank">{contributor.rank}</div>
                      <div class="contributor-avatar">
                        {contributor.avatar ? (
                          <img src={contributor.avatar} alt={contributor.username} style="width: 40px; height: 40px; object-fit: cover; border-radius: 50%;" />
                        ) : (
                          contributor.username.substring(0, 2).toUpperCase()
                        )}
                      </div>
                      <div class="contributor-info">
                        <div class="contributor-username">@{contributor.username}</div>
                        <div class="contributor-fid">FID: {contributor.fid}</div>
                      </div>
                      <div>
                        <div class="contributor-count">{contributor.trackCount}</div>
                        <div class="contributor-label">tracks</div>
                      </div>
                    </div>
                  )}
                </For>
              )}
            </div>
          </div>

          <div class="status-bar">
            <span class="status-bar-section">{contributors().length} users</span>
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
