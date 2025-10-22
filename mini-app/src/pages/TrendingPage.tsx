import { Component, createSignal, For, onMount } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import MobileNavigation from '../components/layout/MobileNavigation/MobileNavigation';
import RetroWindow from '../components/common/RetroWindow';
import { tracks, contributors, isLoading, error, lastUpdated, loadTrendingData } from '../stores/trendingStore';
import { setCurrentTrack, setIsPlaying } from '../stores/playerStore';
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

  const handleUsernameClick = (fid: string, e: MouseEvent) => {
    e.stopPropagation();
    navigate(`/profile/${fid}`);
  };

  return (
    <div class="trending-page">
      <div class="page-window-container">
        {/* Trending Tracks Window */}
        <RetroWindow
          title="TRENDING TRACKS - Last 24 Hours"
          icon={<div class="title-icon">⚡</div>}
          variant="3d"
          showMinimize={true}
          showMaximize={true}
          onMinimize={() => setWindow1Minimized(!window1Minimized())}
          onMaximize={() => setWindow1Maximized(!window1Maximized())}
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
                          Shared by {(track as any).submittedBy.map((user: any, idx: number) => (
                            <>
                              <span
                                class="submitted-username"
                                onClick={(e) => handleUsernameClick(user.fid, e)}
                              >
                                @{user.username}
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
