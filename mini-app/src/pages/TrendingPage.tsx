import { Component, createSignal, For, onMount } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import MobileNavigation from '../components/layout/MobileNavigation/MobileNavigation';
import RetroWindow from '../components/common/RetroWindow';
import { tracks, contributors, isLoading, error, lastUpdated, loadTrendingData } from '../stores/trendingStore';
import { setCurrentTrack, setIsPlaying, Track, playTrackFromFeed, TrackSource } from '../stores/playerStore';
import { theme, toggleTheme } from '../stores/themeStore';
import { formatRelativeTime } from '../utils/time';
import './trendingPage.css';

const TrendingPage: Component = () => {
  const navigate = useNavigate();

  // Window state management
  const [window1Minimized, setWindow1Minimized] = createSignal(false);
  const [window1Maximized, setWindow1Maximized] = createSignal(false);

  // Load trending data on mount
  onMount(() => {
    loadTrendingData();
  });

  // Format the last updated timestamp
  const updatedTimeAgo = () => {
    const updated = lastUpdated();
    return updated ? formatRelativeTime(updated.toISOString()) : 'just now';
  };

  // Convert trending tracks to Track array for playlist context
  const getTrendingTracks = (): Track[] => {
    return tracks().map(track => ({
      id: track.id,
      title: track.title,
      artist: track.artist,
      thumbnail: track.thumbnail,
      source: track.platform as TrackSource,
      sourceId: track.platformId,
      url: track.url,
      addedBy: track.sharedBy?.username || 'Unknown',
      userFid: track.sharedBy?.fid || '',
      userAvatar: track.sharedBy?.pfpUrl || '',
      timestamp: track.timestamp || new Date().toISOString(),
      comment: '',
      likes: 0,
      replies: 0,
      recasts: 0,
      duration: '',
    } as Track));
  };

  // Play track function with proper playlist context
  const playTrack = (track: any) => {
    const trackObj: Track = {
      id: track.id,
      title: track.title,
      artist: track.artist,
      thumbnail: track.thumbnail,
      source: track.platform as TrackSource,
      sourceId: track.platformId,
      url: track.url,
      addedBy: track.sharedBy?.username || 'Unknown',
      userFid: track.sharedBy?.fid || '',
      userAvatar: track.sharedBy?.pfpUrl || '',
      timestamp: track.timestamp || new Date().toISOString(),
      comment: '',
      likes: 0,
      replies: 0,
      recasts: 0,
      duration: '',
    };

    const feedTracks = getTrendingTracks();
    playTrackFromFeed(trackObj, feedTracks, 'trending');
  };

  // Event handlers
  const handleTrackClick = (track: any) => {
    playTrack(track);
  };

  const handleUsernameClick = (fid: string, e: MouseEvent) => {
    e.stopPropagation();
    navigate(`/profile/${fid}`);
  };

  // Menu items for hamburger dropdown
  const menuItems = [
    {
      label: () => `Theme: ${theme() === 'light' ? 'Light' : 'Dark'}`,
      icon: () => theme() === 'light' ? '☀️' : '🌙',
      onClick: () => toggleTheme()
    },
    {
      label: 'Feedback',
      icon: '💬',
      onClick: () => alert('Feedback form coming soon! For now, please share your thoughts in the /jamzy channel.')
    }
  ];

  return (
    <div class="trending-page">
      <div class="page-window-container">
        {/* Trending Tracks Window */}
        <RetroWindow
          title="Trending Tracks - Last 24 Hours"
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="image-rendering: pixelated;">
              {/* Lightning bolt - classic zigzag shape */}
              <path d="M14 2 L6 13 L11 13 L10 22 L18 11 L13 11 Z" />
            </svg>
          }
          variant="3d"
          showMenu={true}
          menuItems={menuItems}
          contentPadding="0"
          footer={
            <div class="status-bar">
              <span class="status-bar-section">{tracks().length} tracks</span>
              <span class="status-bar-section">Updated: {updatedTimeAgo()}</span>
            </div>
          }
        >
          <div class="window-content-inner" classList={{ minimized: window1Minimized() }}>
            <div class="section-header">
              <div class="section-title">Hot Right Now</div>
            </div>

            {isLoading() && tracks().length === 0 ? (
              <div class="loading-state">
                Loading trending tracks...
              </div>
            ) : error() ? (
              <div class="error-state">
                Error: {error()}
              </div>
            ) : tracks().length === 0 ? (
              <div class="empty-state">
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
                        <img src={track.thumbnail} alt={track.title} />
                      ) : (
                        '🎵'
                      )}
                    </div>
                    <div class="track-info">
                      <div class="track-title">{track.title}</div>
                      <div class="track-artist">{track.artist}</div>
                      {(track as any).submittedBy && (track as any).submittedBy.length > 0 && (
                        <div class="track-submitted">
                          shared by {(track as any).submittedBy.map((user: any, idx: number) => (
                            <>
                              <span
                                class="submitted-username"
                                onClick={(e) => handleUsernameClick(user.fid, e)}
                              >
                                {user.username}
                              </span>
                              {idx < (track as any).submittedBy.length - 1 && ', '}
                            </>
                          ))}
                        </div>
                      )}
                    </div>
                    <div class="track-stats">
                      {track.rank <= 3 && <span class="fire-icon">🔥</span>}
                    </div>
                  </div>
                )}
              </For>
            )}
          </div>
        </RetroWindow>
      </div>

      {/* Bottom Navigation */}
      <MobileNavigation class="pb-safe" />
    </div>
  );
};

export default TrendingPage;
