import { Component, createSignal, For, Show, createResource, onMount, onCleanup } from 'solid-js';
import { useParams, useNavigate } from '@solidjs/router';
import MobileNavigation from '../components/layout/MobileNavigation/MobileNavigation';
import AddTrackModal from '../components/library/AddTrackModal';
import RetroWindow from '../components/common/RetroWindow';
import { setCurrentTrack, setIsPlaying, Track, currentTrack, isPlaying } from '../stores/playerStore';
import { fetchChannelFeed, fetchChannelDetails } from '../services/api';
import './channelViewPage.css';

// Format time ago helper
const formatTimeAgo = (timestamp: string) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) return 'now';
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return `${Math.floor(diffDays / 30)}m ago`;
};

// Play track function
const playTrack = (track: Track) => {
  setCurrentTrack(track);
  setIsPlaying(true);
};

const ChannelViewPage: Component = () => {
  const params = useParams();
  const navigate = useNavigate();
  const channelId = () => params.id;

  // Fetch channel details and feed from API
  const [channelData] = createResource(channelId, fetchChannelDetails);
  const [feedData] = createResource(channelId, (id) => fetchChannelFeed(id, { limit: 50 }));

  // Modal state
  const [showAddTrackModal, setShowAddTrackModal] = createSignal(false);

  // Sort state
  const [sortOption, setSortOption] = createSignal('Recent');
  const [showSortMenu, setShowSortMenu] = createSignal(false);

  // Add track handler
  const handleAddTrack = () => {
    setShowAddTrackModal(true);
  };

  // Track submission
  const handleTrackSubmit = async (data: { songUrl: string; comment: string }) => {
    console.log('Track submitted to channel:', data);
    setShowAddTrackModal(false);
  };

  // Play all tracks
  const handlePlayAll = () => {
    if (feedData()?.threads && feedData()!.threads.length > 0) {
      const firstTrack = feedData()!.threads[0];
      if (firstTrack.music && firstTrack.music[0]) {
        playTrack({
          id: firstTrack.music[0].id,
          title: firstTrack.music[0].title,
          artist: firstTrack.music[0].artist,
          thumbnail: firstTrack.music[0].thumbnail,
          source: firstTrack.music[0].platform,
          url: firstTrack.music[0].url,
          sourceId: firstTrack.music[0].platformId
        });
      }
    }
  };

  // Sort dropdown handlers
  const toggleSortMenu = () => {
    setShowSortMenu(!showSortMenu());
  };

  const selectSortOption = (option: string) => {
    setSortOption(option);
    setShowSortMenu(false);
  };

  // Close handler for window
  const handleClose = () => {
    navigate('/channels');
  };

  // Track play handler
  const handleTrackPlay = (track: any) => {
    const isCurrentTrack = currentTrack()?.id === track.id;
    const isTrackPlaying = isCurrentTrack && isPlaying();

    if (isTrackPlaying) {
      setIsPlaying(false);
    } else {
      playTrack(track);
    }
  };

  // Close dropdown when clicking outside
  onMount(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.dropdown')) {
        setShowSortMenu(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    onCleanup(() => document.removeEventListener('click', handleClickOutside));
  });

  return (
    <div class="channel-view-page">
      <div class="channel-view-container">
        <RetroWindow
          title={`${channelData()?.name || 'Channel'} - Channel Library`}
          icon={<span class="title-icon">📁</span>}
          variant="3d"
          showMinimize={true}
          showMaximize={true}
          showClose={true}
          onClose={handleClose}
          contentPadding="0"
          footer={
            <div class="status-bar">
              <div class="status-item">
                <div class="status-indicator">●</div>
                <span>Online</span>
              </div>
              <div class="status-item">
                <span>{feedData()?.threads?.length || 0} tracks loaded</span>
              </div>
            </div>
          }
        >
          <div class="content">
            <Show when={channelData.loading || feedData.loading}>
              <div style={{ padding: '2rem', 'text-align': 'center', color: '#000080' }}>
                <div>Loading channel...</div>
              </div>
            </Show>

            <Show when={channelData.error || feedData.error}>
              <div style={{ padding: '2rem', 'text-align': 'center', color: '#ff0000' }}>
                <div>Error loading channel</div>
              </div>
            </Show>

            <Show when={!channelData.loading && !feedData.loading && channelData() && feedData()}>
              {/* Channel Header Card */}
              <div class="channel-header">
                <div class="channel-main">
                  <div class="channel-image-container">
                    <div class="channel-image">
                      <Show when={channelData()?.imageUrl} fallback={<span>🎸</span>}>
                        <img src={channelData()!.imageUrl} alt={channelData()!.name} />
                      </Show>
                    </div>
                  </div>
                  <div class="channel-details">
                    <div class="channel-name">{channelData()!.name}</div>
                    <div class="channel-description">
                      {channelData()!.description || 'Channel description'}
                    </div>
                    <div class="channel-stats">
                      <div class="stat-item">
                        <span class="number">{feedData()!.threads?.length || 0}</span> tracks
                      </div>
                      <div class="stat-item">
                        <span class="number">{channelData()!.stats?.memberCount || 0}</span> members
                      </div>
                      <div class="stat-item">
                        Updated <span class="number">2h</span> ago
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Bar */}
              <div class="action-bar">
                <div class="primary-actions">
                  <button class="action-button primary" onClick={handlePlayAll}>
                    <span class="icon">▶</span>
                    <span>Play All</span>
                  </button>
                  <button class="action-button" onClick={handleAddTrack}>
                    <span class="icon">➕</span>
                    <span>Add Track</span>
                  </button>
                </div>
                <div class="sort-control">
                  <span class="sort-label">Sort:</span>
                  <div class="dropdown">
                    <button class="dropdown-button" onClick={toggleSortMenu}>
                      {sortOption()}
                    </button>
                    <div class={`dropdown-menu ${showSortMenu() ? 'active' : ''}`}>
                      <div
                        class={`dropdown-item ${sortOption() === 'Recent' ? 'selected' : ''}`}
                        onClick={() => selectSortOption('Recent')}
                      >
                        Recent
                      </div>
                      <div
                        class={`dropdown-item ${sortOption() === 'Popular' ? 'selected' : ''}`}
                        onClick={() => selectSortOption('Popular')}
                      >
                        Popular
                      </div>
                      <div
                        class={`dropdown-item ${sortOption() === 'A-Z' ? 'selected' : ''}`}
                        onClick={() => selectSortOption('A-Z')}
                      >
                        A-Z
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Track Feed */}
              <div class="track-feed">
                <div class="feed-header">
                  <span class="icon">💿</span>
                  <span>Channel Tracks</span>
                </div>

                <Show when={feedData()!.threads && feedData()!.threads.length > 0}>
                  <For each={feedData()!.threads}>
                    {(thread) => {
                      const track = thread.music && thread.music[0] ? thread.music[0] : null;
                      const isCurrentTrack = () => track && currentTrack()?.id === track.id;
                      const isTrackPlaying = () => isCurrentTrack() && isPlaying();

                      return (
                        <div class="activity-card">
                          {/* Navy header bar */}
                          <div class="activity-header">
                            <div class="user-info">
                              <Show when={thread.author.pfpUrl} fallback={
                                <div class="user-avatar-fallback">{thread.author.username.charAt(0).toUpperCase()}</div>
                              }>
                                <img src={thread.author.pfpUrl} alt={thread.author.username} class="user-avatar" />
                              </Show>
                              <span class="username">{thread.author.username}</span>
                            </div>
                            <span class="timestamp">{formatTimeAgo(thread.timestamp)}</span>
                          </div>

                          {/* Track content */}
                          <Show when={track}>
                            <div class="track-content">
                              <div class="thumbnail">
                                <Show when={track!.thumbnail} fallback={<span>🎵</span>}>
                                  <img src={track!.thumbnail} alt={track!.title} />
                                </Show>
                              </div>
                              <div class="track-info">
                                <div class="track-title">{track!.title}</div>
                                <div class="track-artist">{track!.artist}</div>
                                <div class="track-meta">via {track!.platform}</div>
                              </div>
                              <button
                                class="play-button"
                                onClick={() => handleTrackPlay({
                                  id: track!.id,
                                  title: track!.title,
                                  artist: track!.artist,
                                  thumbnail: track!.thumbnail,
                                  source: track!.platform,
                                  url: track!.url,
                                  sourceId: track!.platformId
                                })}
                              >
                                {isTrackPlaying() ? '⏸' : '▶'}
                              </button>
                            </div>
                          </Show>

                          {/* Comment if present */}
                          <Show when={thread.text && thread.text.trim()}>
                            <div class="comment-box">
                              {thread.text}
                            </div>
                          </Show>

                          {/* Stats row */}
                          <div class="stats-row">
                            <div class="stat-box">
                              <span>♥</span>
                              <span class="count">{thread.stats.likes || 0}</span>
                            </div>
                            <div class="stat-box">
                              <span>💬</span>
                              <span class="count">{thread.stats.replies || 0}</span>
                            </div>
                            <div class="stat-box">
                              <span>🔄</span>
                              <span class="count">{thread.stats.recasts || 0}</span>
                            </div>
                          </div>
                        </div>
                      );
                    }}
                  </For>
                </Show>

                <Show when={!feedData()!.threads || feedData()!.threads.length === 0}>
                  <div class="empty-state">
                    <div class="icon">💿</div>
                    <div class="message">
                      <p>No tracks in this channel yet.</p>
                      <p>Be the first to add one!</p>
                    </div>
                  </div>
                </Show>
              </div>
            </Show>
          </div>
        </RetroWindow>
      </div>

      {/* Bottom Navigation (preserved for app consistency) */}
      <MobileNavigation class="pb-safe" />

      {/* Add Track Modal */}
      <AddTrackModal
        isOpen={showAddTrackModal()}
        onClose={() => setShowAddTrackModal(false)}
        onSubmit={handleTrackSubmit}
        title="Add Track to Channel"
      />
    </div>
  );
};

export default ChannelViewPage;
