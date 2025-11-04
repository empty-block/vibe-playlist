import { Component, createSignal, For, createResource, createMemo, createEffect, onMount } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import MobileNavigation from '../components/layout/MobileNavigation/MobileNavigation';
import RetroWindow from '../components/common/RetroWindow';
import { TrackCard } from '../components/common/TrackCard/NEW';
import { ChannelFilterBar } from '../components/channels/ChannelFilterBar';
import { Track, playTrackFromFeed } from '../stores/playerStore';
import { fetchHomeFeed } from '../services/api';
import { useInfiniteScroll } from '../utils/useInfiniteScroll';
import type { ChannelFeedSortOption, MusicPlatform } from '../../../shared/types/channels';
import './channelViewPage.css'; // Import shared track card styles
import './homePage.css';

// Fisher-Yates shuffle algorithm for randomizing array
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

const HomePage: Component = () => {
  const navigate = useNavigate();

  // Filter and sort state
  const [activeSort, setActiveSort] = createSignal<ChannelFeedSortOption>('recent');
  const [qualityFilter, setQualityFilter] = createSignal<number>(0); // Default to show all posts
  const [musicSources, setMusicSources] = createSignal<MusicPlatform[]>([]);
  const [genres, setGenres] = createSignal<string[]>([]);
  const [shuffleSeed, setShuffleSeed] = createSignal<number>(0);
  const [filterDialogOpen, setFilterDialogOpen] = createSignal(false);

  // Pagination state
  const [threads, setThreads] = createSignal<any[]>([]);
  const [cursor, setCursor] = createSignal<string | undefined>(undefined);
  const [hasMore, setHasMore] = createSignal(true);
  const [isLoading, setIsLoading] = createSignal(false);
  const [error, setError] = createSignal<Error | null>(null);
  const [initialLoad, setInitialLoad] = createSignal(true);

  // Sentinel element for infinite scroll
  const [sentinelRef, setSentinelRef] = createSignal<HTMLDivElement | undefined>(undefined);

  // Available filter options
  const availablePlatforms: MusicPlatform[] = ['spotify', 'youtube', 'apple_music', 'soundcloud', 'songlink', 'audius'];
  const availableGenres = ['hip-hop', 'electronic', 'rock', 'jazz', 'classical', 'metal', 'indie', 'folk', 'r&b', 'pop'];

  // Handle sort change with shuffle seed
  const handleSortChange = (newSort: ChannelFeedSortOption) => {
    if (newSort === 'shuffle') {
      setShuffleSeed(prev => prev + 1);
    }
    setActiveSort(newSort);
    // Reset feed when filters change
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

      console.log('[HomePage] Fetching home feed with params:', {
        limit: 50,
        cursor: currentCursor,
        sort: backendSort,
        minLikes: qualityFilter(),
        musicSources: musicSources(),
        genres: genres()
      });

      const result = await fetchHomeFeed({
        limit: 50,
        cursor: currentCursor,
        sort: backendSort,
        minLikes: qualityFilter() > 0 ? qualityFilter() : undefined,
        musicSources: musicSources().length > 0 ? musicSources() : undefined,
        genres: genres().length > 0 ? genres() : undefined
      });

      console.log('[HomePage] Received home feed data:', {
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
      console.error('[HomePage] Error loading feed:', err);
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

  // Initial load - only once on mount
  onMount(() => {
    loadFeed(true);
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

  // Apply shuffle to feed data when shuffle sort is active
  const displayedThreads = createMemo(() => {
    const currentThreads = threads();

    // Apply shuffle if active
    if (activeSort() === 'shuffle') {
      // Include shuffleSeed in dependency to trigger new shuffle
      const _ = shuffleSeed();
      return shuffleArray(currentThreads);
    }

    return currentThreads;
  });

  // Convert API thread to Track object for player
  const convertToTrack = (thread: any): Track | null => {
    if (!thread.music || thread.music.length === 0) return null;

    const musicData = thread.music[0];
    return {
      id: thread.castHash,
      title: musicData.title || 'Unknown Track',
      artist: musicData.artist || 'Unknown Artist',
      thumbnail: musicData.thumbnail || '',
      source: musicData.platform,
      sourceId: musicData.platformId,
      url: musicData.url,
      addedBy: thread.author.username,
      userFid: thread.author.fid,
      userAvatar: thread.author.pfpUrl,
      timestamp: thread.timestamp,
      comment: thread.text || '',
      likes: thread.stats.likes,
      replies: thread.stats.replies,
      recasts: thread.stats.recasts,
      duration: ''
    };
  };

  // Get all tracks for playlist context
  const getAllTracks = (): Track[] => {
    const currentThreads = displayedThreads();
    if (!currentThreads || currentThreads.length === 0) return [];

    return currentThreads
      .map((thread: any) => convertToTrack(thread))
      .filter((track): track is Track => track !== null);
  };

  // Handle track play
  const handleTrackPlay = (thread: any) => {
    const track = convertToTrack(thread);
    if (!track) return;

    const allTracks = getAllTracks();
    playTrackFromFeed(track, allTracks, 'home');
  };

  // Handle username click
  const handleUsernameClick = (fid: string, e: MouseEvent) => {
    e.stopPropagation();
    navigate(`/profile/${fid}`);
  };

  // Count active filters
  const activeFilterCount = createMemo(() => {
    let count = 0;
    if (qualityFilter() > 0) count++;
    if (musicSources().length > 0) count++;
    if (genres().length > 0) count++;
    return count;
  });

  // Get quality filter display text
  const qualityFilterText = createMemo(() => {
    const minLikes = qualityFilter();
    if (minLikes === 0) return '';
    return ` • Quality filtered (${minLikes}+ ♥)`;
  });

  return (
    <div class="home-page">
      <div class="page-window-container">
        <RetroWindow
          title="Home Feed"
          icon={
            <svg width="16" height="16" viewBox="0 0 28 28" fill="none" style="image-rendering: pixelated;">
              <path
                d="M4 12L14 3L24 12V23C24 23.5523 23.5523 24 23 24H5C4.44772 24 4 23.5523 4 23V12Z"
                stroke="currentColor"
                stroke-width="2"
                fill="none"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M10 24V15H18V24"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          }
          variant="3d"
          contentPadding="0"
          showThemeToggle={true}
        >
          <div class="channel-view-content">
            {/* Feed Section - includes filter bar so it scrolls with content */}
            <div class="feed-section">
              {/* Filter Bar */}
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
                  activeFilterCount={activeFilterCount()}
                  filterDialogOpen={filterDialogOpen()}
                  onFilterDialogOpenChange={setFilterDialogOpen}
                />
              </div>


              {isLoading() && threads().length === 0 ? (
                <div class="loading-state">Loading home feed...</div>
              ) : error() ? (
                <div class="error-state">
                  <div class="error-icon">⚠️</div>
                  <p><strong>Failed to load feed</strong></p>
                  <p class="error-details">
                    {error()?.message || 'Unknown error occurred'}
                  </p>
                  <button
                    class="retry-button"
                    onClick={() => {
                      console.log('[HomePage] User clicked retry');
                      loadFeed(true);
                    }}
                  >
                    🔄 Try Again
                  </button>
                  <p class="error-help">
                    Check your connection or refresh the page
                  </p>
                </div>
              ) : threads().length === 0 && !isLoading() ? (
                <div class="empty-state">
                  <div class="empty-icon">🏠</div>
                  <p><strong>No tracks in your home feed yet.</strong></p>
                  <p>Tracks from all channels will appear here.</p>
                  <p>Try adjusting your quality filter or visit specific channels.</p>
                </div>
              ) : (
                <>
                  <For each={displayedThreads()}>
                    {(thread: any) => (
                      <TrackCard
                        author={{
                          username: thread.author.username,
                          displayName: thread.author.displayName,
                          pfpUrl: thread.author.pfpUrl,
                          fid: thread.author.fid
                        }}
                        track={
                          thread.music?.[0]
                            ? {
                                title: thread.music[0].title,
                                artist: thread.music[0].artist,
                                thumbnail: thread.music[0].thumbnail,
                                platform: thread.music[0].platform,
                                platformId: thread.music[0].platformId,
                                url: thread.music[0].url
                              }
                            : null
                        }
                        text={thread.text}
                        timestamp={thread.timestamp}
                        channelId={thread.channelId}
                        channelName={thread.channelName}
                        stats={{
                          likes: thread.stats.likes,
                          replies: thread.stats.replies,
                          recasts: thread.stats.recasts
                        }}
                        castHash={thread.castHash}
                        onPlay={() => handleTrackPlay(thread)}
                        onUsernameClick={(e) => handleUsernameClick(thread.author.fid, e)}
                      />
                    )}
                  </For>

                  {/* Sentinel element for infinite scroll */}
                  <div ref={setSentinelRef} style={{ height: '1px' }} />

                  {/* Loading indicator when fetching more */}
                  {isLoading() && (
                    <div class="loading-more">
                      <div class="loading-spinner">⟳</div>
                      <span>Loading more tracks...</span>
                    </div>
                  )}

                  {/* End of feed message */}
                  {!hasMore() && threads().length > 0 && (
                    <div class="end-of-feed">
                      <span>🎵 You've reached the end 🎵</span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </RetroWindow>
      </div>

      {/* Bottom Navigation */}
      <MobileNavigation class="pb-safe" />
    </div>
  );
};

export default HomePage;
