import { Component, createSignal, For, createResource, createMemo } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import MobileNavigation from '../components/layout/MobileNavigation/MobileNavigation';
import RetroWindow from '../components/common/RetroWindow';
import { TrackCard } from '../components/common/TrackCard/NEW';
import { ChannelFilterBar } from '../components/channels/ChannelFilterBar';
import { Track, playTrackFromFeed } from '../stores/playerStore';
import { fetchHomeFeed } from '../services/api';
import type { ChannelFeedSortOption, MusicPlatform } from '../../../shared/types/channels';
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

  // Available filter options
  const availablePlatforms: MusicPlatform[] = ['spotify', 'youtube', 'apple_music', 'soundcloud', 'songlink', 'audius'];
  const availableGenres = ['hip-hop', 'electronic', 'rock', 'jazz', 'classical', 'metal', 'indie', 'folk', 'r&b', 'pop'];

  // Handle sort change with shuffle seed
  const handleSortChange = (newSort: ChannelFeedSortOption) => {
    if (newSort === 'shuffle') {
      setShuffleSeed(prev => prev + 1);
    }
    setActiveSort(newSort);
  };

  // Fetch home feed with filters
  const [feedData] = createResource(
    () => ({
      sort: activeSort(),
      minLikes: qualityFilter(),
      musicSources: musicSources(),
      genres: genres()
    }),
    async (params) => {
      // Convert 'shuffle' to 'recent' for backend (shuffle happens client-side)
      const backendSort = params.sort === 'shuffle' ? 'recent' : params.sort;

      console.log('[HomePage] Fetching home feed with params:', {
        limit: 50,
        sort: backendSort,
        minLikes: params.minLikes,
        musicSources: params.musicSources,
        genres: params.genres
      });

      const result = await fetchHomeFeed({
        limit: 50,
        sort: backendSort,
        minLikes: params.minLikes > 0 ? params.minLikes : undefined,
        musicSources: params.musicSources.length > 0 ? params.musicSources : undefined,
        genres: params.genres.length > 0 ? params.genres : undefined
      });

      console.log('[HomePage] Received home feed data:', {
        threadCount: result.threads?.length || 0,
        hasNextCursor: !!result.nextCursor,
        firstThread: result.threads?.[0]
      });

      return result;
    }
  );

  // Apply shuffle to feed data when shuffle sort is active
  const displayedFeed = createMemo(() => {
    const data = feedData();
    if (!data || !data.threads) {
      return { threads: [] };
    }

    // Apply shuffle if active
    if (activeSort() === 'shuffle') {
      // Include shuffleSeed in dependency to trigger new shuffle
      const _ = shuffleSeed();
      return {
        threads: shuffleArray(data.threads),
        nextCursor: data.nextCursor
      };
    }

    return data;
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
    const feed = displayedFeed();
    if (!feed || !feed.threads) return [];

    return feed.threads
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
          title="HOME FEED"
          icon={<div class="title-icon">🏠</div>}
          variant="3d"
          contentPadding="0"
          footer={
            <div class="status-bar">
              <span class="status-bar-section">
                <div class="status-indicator">●</div>
                <span>Live</span>
              </span>
              <span class="status-bar-section">
                {displayedFeed().threads?.length || 0} tracks{qualityFilterText()}
              </span>
              <span class="status-bar-section">
                All Channels • {activeSort() === 'shuffle' ? 'Shuffled' : activeSort()}
              </span>
            </div>
          }
        >
          <div class="channel-view-content">
            {/* Home Header */}
            <div class="home-header">
              <div class="home-header-content">
                <div class="home-icon-large">🏠</div>
                <div class="home-header-text">
                  <div class="home-title">Your Home Feed</div>
                  <div class="home-description">
                    Tracks from all channels
                  </div>
                </div>
              </div>
            </div>
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

            {/* Feed Section */}
            <div class="feed-section">
              {feedData.loading && !displayedFeed().threads?.length ? (
                <div class="loading-state">Loading home feed...</div>
              ) : feedData.error ? (
                <div class="error-state">
                  <div class="error-icon">⚠️</div>
                  <p><strong>Failed to load feed</strong></p>
                  <p class="error-details">
                    {feedData.error instanceof Error ? feedData.error.message : 'Unknown error occurred'}
                  </p>
                  <button
                    class="retry-button"
                    onClick={() => {
                      console.log('[HomePage] User clicked retry');
                      feedData.refetch();
                    }}
                  >
                    🔄 Try Again
                  </button>
                  <p class="error-help">
                    Check your connection or refresh the page
                  </p>
                </div>
              ) : !displayedFeed().threads || displayedFeed().threads.length === 0 ? (
                <div class="empty-state">
                  <div class="empty-icon">🏠</div>
                  <p><strong>No tracks in your home feed yet.</strong></p>
                  <p>Tracks from all channels will appear here.</p>
                  <p>Try adjusting your quality filter or visit specific channels.</p>
                </div>
              ) : (
                <For each={displayedFeed().threads}>
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
