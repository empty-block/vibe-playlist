import { Component, createSignal, For, Show, createResource, onMount, onCleanup, createEffect, createMemo } from 'solid-js';
import { useParams, useNavigate } from '@solidjs/router';
import MobileNavigation from '../components/layout/MobileNavigation/MobileNavigation';
import AddTrackModal from '../components/library/AddTrackModal';
import RetroWindow from '../components/common/RetroWindow';
import { TrackCard } from '../components/common/TrackCard/NEW';
import { ChannelFilterBar } from '../components/channels/ChannelFilterBar';
import { setCurrentTrack, setIsPlaying, Track, currentTrack, isPlaying } from '../stores/playerStore';
import { fetchChannelFeed, fetchChannelDetails } from '../services/api';
import type { ChannelFeedSortOption, MusicPlatform } from '../../../shared/types/channels';
import './channelViewPage.css';

// Fisher-Yates shuffle algorithm for randomizing array
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

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

  // Fetch channel details
  const [channelData] = createResource(channelId, fetchChannelDetails);

  // Modal state
  const [showAddTrackModal, setShowAddTrackModal] = createSignal(false);

  // Filter and sort state
  const [activeSort, setActiveSort] = createSignal<ChannelFeedSortOption>('recent');
  const [qualityFilter, setQualityFilter] = createSignal<number>(0); // 0 = all, 3 = 3+ likes
  const [musicSources, setMusicSources] = createSignal<MusicPlatform[]>([]);
  const [genres, setGenres] = createSignal<string[]>([]);
  const [shuffleSeed, setShuffleSeed] = createSignal<number>(0); // Increment to trigger new shuffle
  const [filterDialogOpen, setFilterDialogOpen] = createSignal(false); // Filter dialog state

  // Available filter options (these would ideally come from the API)
  const availablePlatforms: MusicPlatform[] = ['spotify', 'youtube', 'apple_music', 'soundcloud', 'songlink', 'audius'];
  const availableGenres = ['hip-hop', 'electronic', 'rock', 'jazz', 'classical', 'metal', 'indie', 'folk', 'r&b', 'pop'];

  // Handle sort change with shuffle seed
  const handleSortChange = (newSort: ChannelFeedSortOption) => {
    console.log('[ChannelViewPage] handleSortChange called:', newSort);
    if (newSort === 'shuffle') {
      // Increment shuffle seed to trigger new random order
      setShuffleSeed(prev => prev + 1);
    }
    setActiveSort(newSort);
  };

  // Fetch feed with filters - recreate resource when filters change
  const [feedData] = createResource(
    () => ({
      channelId: channelId(),
      sort: activeSort(),
      minLikes: qualityFilter(),
      musicSources: musicSources(),
      genres: genres()
    }),
    async (params) => {
      console.log('[ChannelViewPage] Fetching feed with params:', params);

      // Convert 'shuffle' to 'recent' for backend (shuffle happens client-side)
      const backendSort = params.sort === 'shuffle' ? 'recent' : params.sort;

      return fetchChannelFeed(params.channelId, {
        limit: 50,
        sort: backendSort,
        minLikes: params.minLikes > 0 ? params.minLikes : undefined,
        musicSources: params.musicSources.length > 0 ? params.musicSources : undefined,
        genres: params.genres.length > 0 ? params.genres : undefined
      });
    }
  );

  // Apply shuffle to feed data when shuffle sort is active
  const displayedFeed = createMemo(() => {
    const data = feedData();
    if (!data || !data.threads) {
      console.log('[ChannelViewPage] No feed data yet');
      return data;
    }

    console.log('[ChannelViewPage] Feed data received:', {
      threadCount: data.threads.length,
      firstThreadHash: data.threads[0]?.castHash,
      firstThreadLikes: data.threads[0]?.stats.likes,
      activeSort: activeSort()
    });

    // If shuffle is active, randomize the feed order
    // shuffleSeed ensures we get a new order each time shuffle is clicked
    if (activeSort() === 'shuffle') {
      // Access shuffleSeed to make this reactive
      const seed = shuffleSeed();
      console.log('[ChannelViewPage] Shuffling with seed:', seed);
      return {
        ...data,
        threads: shuffleArray(data.threads)
      };
    }

    return data;
  });

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
    if (displayedFeed()?.threads && displayedFeed()!.threads.length > 0) {
      const firstTrack = displayedFeed()!.threads[0];
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

  // Username click handler
  const handleUsernameClick = (fid: string, e: MouseEvent) => {
    e.stopPropagation();
    navigate(`/profile/${fid}`);
  };


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
                <span>{displayedFeed()?.threads?.length || 0} tracks loaded</span>
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

            <Show when={!channelData.loading && !feedData.loading && channelData() && displayedFeed()}>
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
                        <span class="number">{displayedFeed()!.threads?.length || 0}</span> tracks
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

              {/* Action Bar with Filters */}
              <div class="action-bar">
                <button class="action-button" onClick={handleAddTrack}>
                  <span class="icon">➕</span>
                  <span>Add Track</span>
                </button>

                <ChannelFilterBar
                  activeSort={activeSort()}
                  onSortChange={handleSortChange}
                  qualityFilter={qualityFilter()}
                  onQualityFilterChange={setQualityFilter}
                  musicSources={musicSources()}
                  onMusicSourcesChange={setMusicSources}
                  genres={genres()}
                  onGenresChange={setGenres}
                  availablePlatforms={availablePlatforms}
                  availableGenres={availableGenres}
                  filterDialogOpen={filterDialogOpen()}
                  onFilterDialogOpenChange={setFilterDialogOpen}
                />
              </div>

              {/* Track Feed */}
              <div class="track-feed">
                <div class="feed-header">
                  <span class="icon">💿</span>
                  <span>Channel Tracks</span>
                </div>

                <Show when={displayedFeed()!.threads && displayedFeed()!.threads.length > 0}>
                  <For each={displayedFeed()!.threads}>
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

                <Show when={!displayedFeed()!.threads || displayedFeed()!.threads.length === 0}>
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
