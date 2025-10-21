import { Component, createSignal, For, Show, createResource, onMount, onCleanup } from 'solid-js';
import { useParams, A, useNavigate } from '@solidjs/router';
import MobileNavigation from '../components/layout/MobileNavigation/MobileNavigation';
import AddTrackModal from '../components/library/AddTrackModal';
import { TrackCard } from '../components/common/TrackCard/NEW';
import { setCurrentTrack, setIsPlaying, Track, currentTrack, isPlaying } from '../stores/playerStore';
import { fetchChannelFeed, fetchChannelDetails } from '../services/api';
import './channelViewWin95.css';

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

  // Username click handler
  const handleUsernameClick = (fid: string, e: MouseEvent) => {
    e.stopPropagation();
    navigate(`/profile/${fid}`);
  };

  // Close dropdown when clicking outside
  onMount(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.win95-dropdown')) {
        setShowSortMenu(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    onCleanup(() => document.removeEventListener('click', handleClickOutside));
  });

  return (
    <div class="channel-view-page">
      <div class="channel-view-container">
        <div class="win95-window">
          {/* Title Bar */}
          <div class="win95-title-bar">
            <div class="win95-title-left">
              <span class="win95-title-icon">📁</span>
              <span>{channelData()?.name || 'Channel'} - Channel Library</span>
            </div>
            <div class="win95-window-controls">
              <button class="win95-control-btn">_</button>
              <button class="win95-control-btn">□</button>
              <A href="/channels" class="win95-control-btn" style={{ "text-decoration": "none", color: "inherit" }}>×</A>
            </div>
          </div>

          {/* Content Area */}
          <div class="win95-content">
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
              <div class="win95-channel-header">
                <div class="win95-channel-main">
                  <div class="win95-channel-image-container">
                    <div class="win95-channel-image">
                      <Show when={channelData()?.imageUrl} fallback={<span>🎸</span>}>
                        <img src={channelData()!.imageUrl} alt={channelData()!.name} />
                      </Show>
                    </div>
                  </div>
                  <div class="win95-channel-details">
                    <div class="win95-channel-name">{channelData()!.name}</div>
                    <div class="win95-channel-description">
                      {channelData()!.description || 'Channel description'}
                    </div>
                    <div class="win95-channel-stats">
                      <div class="win95-stat-item">
                        <span class="number">{feedData()!.threads?.length || 0}</span> tracks
                      </div>
                      <div class="win95-stat-item">
                        <span class="number">{channelData()!.stats?.memberCount || 0}</span> members
                      </div>
                      <div class="win95-stat-item">
                        Updated <span class="number">2h</span> ago
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Bar */}
              <div class="win95-action-bar">
                <div class="win95-primary-actions">
                  <button class="win95-action-button primary" onClick={handlePlayAll}>
                    <span class="icon">▶</span>
                    <span>Play All</span>
                  </button>
                  <button class="win95-action-button" onClick={handleAddTrack}>
                    <span class="icon">➕</span>
                    <span>Add Track</span>
                  </button>
                </div>
                <div class="win95-sort-control">
                  <span class="win95-sort-label">Sort:</span>
                  <div class="win95-dropdown">
                    <button class="win95-dropdown-button" onClick={toggleSortMenu}>
                      {sortOption()}
                    </button>
                    <div class={`win95-dropdown-menu ${showSortMenu() ? 'active' : ''}`}>
                      <div
                        class={`win95-dropdown-item ${sortOption() === 'Recent' ? 'selected' : ''}`}
                        onClick={() => selectSortOption('Recent')}
                      >
                        Recent
                      </div>
                      <div
                        class={`win95-dropdown-item ${sortOption() === 'Popular' ? 'selected' : ''}`}
                        onClick={() => selectSortOption('Popular')}
                      >
                        Popular
                      </div>
                      <div
                        class={`win95-dropdown-item ${sortOption() === 'A-Z' ? 'selected' : ''}`}
                        onClick={() => selectSortOption('A-Z')}
                      >
                        A-Z
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Track Feed */}
              <div class="win95-track-feed">
                <div class="win95-feed-header">
                  <span class="icon">💿</span>
                  <span>Channel Tracks</span>
                </div>

                <Show when={feedData()!.threads && feedData()!.threads.length > 0}>
                  <For each={feedData()!.threads}>
                    {(thread) => {
                      const track = thread.music && thread.music[0] ? thread.music[0] : null;

                      return (
                        <Show when={track}>
                          <TrackCard
                            author={thread.author}
                            track={track!}
                            text={thread.text}
                            timestamp={thread.timestamp}
                            stats={thread.stats}
                            onPlay={handleTrackPlay}
                            onUsernameClick={handleUsernameClick}
                          />
                        </Show>
                      );
                    }}
                  </For>
                </Show>

                <Show when={!feedData()!.threads || feedData()!.threads.length === 0}>
                  <div class="win95-empty-state">
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

          {/* Status Bar */}
          <div class="win95-status-bar">
            <div class="win95-status-item">
              <div class="win95-status-indicator">●</div>
              <span>Online</span>
            </div>
            <div class="win95-status-item">
              <span>{feedData()?.threads?.length || 0} tracks loaded</span>
            </div>
          </div>
        </div>
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
