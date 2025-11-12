import { Component, createSignal, For, Show, createResource, onMount, onCleanup, createEffect, createMemo } from 'solid-js';
import { useParams, useNavigate } from '@solidjs/router';
import MobileNavigation from '../components/layout/MobileNavigation/MobileNavigation';
import AddTrackModal from '../components/library/AddTrackModal';
import RetroWindow from '../components/common/RetroWindow';
import { TrackCard } from '../components/common/TrackCard/NEW';
import { ChannelFilterBar } from '../components/channels/ChannelFilterBar';
import { theme, toggleTheme } from '../stores/themeStore';
import { setCurrentTrack, setIsPlaying, Track, currentTrack, isPlaying, playTrackWithAuthCheck } from '../stores/playerStore';
import { fetchChannelFeed, fetchChannelDetails } from '../services/api';
import { useInfiniteScroll } from '../utils/useInfiniteScroll';
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
  const [windowMinimized, setWindowMinimized] = createSignal(false);
  const [windowMaximized, setWindowMaximized] = createSignal(false);

  // Pagination state
  const [threads, setThreads] = createSignal<any[]>([]);
  const [cursor, setCursor] = createSignal<string | undefined>(undefined);
  const [hasMore, setHasMore] = createSignal(true);
  const [isLoading, setIsLoading] = createSignal(false);
  const [error, setError] = createSignal<Error | null>(null);
  const [initialLoad, setInitialLoad] = createSignal(true);

  // Sentinel element for infinite scroll
  const [sentinelRef, setSentinelRef] = createSignal<HTMLDivElement | undefined>(undefined);

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
    // Reset feed when sort changes
    loadFeed(true);
  };

  // Load feed data (initial or pagination)
  const loadFeed = async (reset: boolean = false) => {
    if (isLoading()) return;

    setIsLoading(true);
    setError(null);

    try {
      const currentCursor = reset ? undefined : cursor();
      const backendSort = activeSort() === 'shuffle' ? 'recent' : activeSort();

      console.log('[ChannelViewPage] Fetching feed with params:', {
        channelId: channelId(),
        limit: 50,
        cursor: currentCursor,
        sort: backendSort,
        minLikes: qualityFilter(),
        musicSources: musicSources(),
        genres: genres()
      });

      const result = await fetchChannelFeed(channelId(), {
        limit: 50,
        cursor: currentCursor,
        sort: backendSort,
        minLikes: qualityFilter() > 0 ? qualityFilter() : undefined,
        musicSources: musicSources().length > 0 ? musicSources() : undefined,
        genres: genres().length > 0 ? genres() : undefined
      });

      console.log('[ChannelViewPage] Received feed data:', {
        threadCount: result.threads?.length || 0,
        hasNextCursor: !!result.nextCursor,
        reset
      });

      if (reset) {
        setThreads(result.threads || []);
      } else {
        setThreads(prev => [...prev, ...(result.threads || [])]);
      }

      setCursor(result.nextCursor);
      setHasMore(!!result.nextCursor);
      setInitialLoad(false);
    } catch (err) {
      console.error('[ChannelViewPage] Error loading feed:', err);
      setError(err instanceof Error ? err : new Error('Failed to load feed'));
    } finally {
      setIsLoading(false);
    }
  };

  // Load more when scrolling
  const loadMore = () => {
    if (!hasMore() || isLoading()) return;
    loadFeed(false);
  };

  // Initial load when channel changes
  createEffect((prevChannelId) => {
    const currentChannelId = channelId();

    // Only load if channel actually changed (or initial mount)
    if (prevChannelId !== currentChannelId) {
      loadFeed(true);
    }

    return currentChannelId;
  });

  // Reset feed when filters change (not sort, that's handled in handleSortChange)
  createEffect((prev) => {
    const current = {
      quality: qualityFilter(),
      sources: musicSources().join(','),
      genres: genres().join(',')
    };

    // Skip initial run and only reload if filters actually changed
    if (prev && (
      prev.quality !== current.quality ||
      prev.sources !== current.sources ||
      prev.genres !== current.genres
    )) {
      loadFeed(true);
    }

    return current;
  }, { quality: 0, sources: '', genres: '' });

  // Setup infinite scroll
  useInfiniteScroll(
    sentinelRef,
    hasMore,
    isLoading,
    loadMore
  );

  // Apply shuffle to displayed threads
  const displayedThreads = createMemo(() => {
    const currentThreads = threads();

    // Apply shuffle if active
    if (activeSort() === 'shuffle') {
      const seed = shuffleSeed();
      console.log('[ChannelViewPage] Shuffling with seed:', seed);
      return shuffleArray(currentThreads);
    }

    return currentThreads;
  });

  // Convert feed data to Track array for playlist context
  const getFeedTracks = (): Track[] => {
    const currentThreads = displayedThreads();
    if (!currentThreads || currentThreads.length === 0) return [];

    return currentThreads
      .filter(thread => thread.music && thread.music[0])
      .map(thread => {
        const music = thread.music[0];
        return {
          id: music.id,
          title: music.title,
          artist: music.artist,
          thumbnail: music.thumbnail,
          source: music.platform as any,
          sourceId: music.platformId,
          url: music.url,
          addedBy: thread.author.username,
          userFid: thread.author.fid,
          userAvatar: thread.author.pfpUrl,
          timestamp: thread.timestamp,
          comment: thread.text,
          likes: thread.stats.likes,
          replies: thread.stats.replies,
          recasts: thread.stats.recasts,
          duration: '', // Not provided in feed data
        } as Track;
      });
  };

  // Play track function with proper playlist context
  const playTrack = (track: Track) => {
    const feedTracks = getFeedTracks();
    const feedId = `channel-${channelId()}`;
    playTrackWithAuthCheck(track, feedTracks, feedId);
  };

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
    const currentThreads = displayedThreads();
    if (currentThreads && currentThreads.length > 0) {
      const firstTrack = currentThreads[0];
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

  // Handle back navigation
  const handleBack = () => {
    // Try to go back in browser history
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      // Fallback to channels list if no history
      navigate('/channels');
    }
  };

  return (
    <div class="channel-view-page">
      <div class="page-window-container">
        <RetroWindow
          title={`${channelData()?.name || 'Channel'} - Channel Library`}
          icon={<span class="title-icon">📁</span>}
          variant="3d"
          showBack={true}
          onBack={handleBack}
          showMenu={true}
          menuItems={menuItems}
          contentPadding="0"
        >
          <div class="content">
            <Show when={channelData.loading || (isLoading() && threads().length === 0)}>
              <div style={{ padding: '2rem', 'text-align': 'center', color: '#000080' }}>
                <div>Loading channel...</div>
              </div>
            </Show>

            <Show when={channelData.error || error()}>
              <div style={{ padding: '2rem', 'text-align': 'center', color: '#ff0000' }}>
                <div>Error loading channel</div>
              </div>
            </Show>

            <Show when={!channelData.loading && channelData() && !error()}>
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
                        <span class="number">{channelData()!.stats?.threadCount || 0}</span> tracks
                      </div>
                      <div class="stat-item">
                        <span class="number">{channelData()!.stats?.uniqueContributors || 0}</span> members
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Bar with Filters */}
              <div class="action-bar">
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
                  showAddTrack={true}
                  onAddTrack={handleAddTrack}
                />
              </div>

              {/* Track Feed */}
              <div class="track-feed">
                <Show when={displayedThreads().length > 0}>
                  <For each={displayedThreads()}>
                    {(thread, index) => {
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
                            animationDelay={Math.min(index(), 20) * 50}
                          />
                        </Show>
                      );
                    }}
                  </For>

                  {/* Sentinel element for infinite scroll */}
                  <div ref={setSentinelRef} style={{ height: '1px' }} />

                  {/* Loading indicator when fetching more */}
                  <Show when={isLoading()}>
                    <div class="loading-more">
                      <div class="loading-spinner">⟳</div>
                      <span>Loading more tracks...</span>
                    </div>
                  </Show>

                  {/* End of feed message */}
                  <Show when={!hasMore() && threads().length > 0}>
                    <div class="end-of-feed">
                      <span>🎵 You've reached the end 🎵</span>
                    </div>
                  </Show>
                </Show>

                <Show when={threads().length === 0 && !isLoading()}>
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
