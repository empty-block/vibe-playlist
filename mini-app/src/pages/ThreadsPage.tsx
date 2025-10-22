import { Component, createSignal, createMemo, For, onMount, createResource, Show } from 'solid-js';
import { A, useNavigate } from '@solidjs/router';
import { ThreadCard } from '../components/common/TrackCard/NEW';
import { ThreadFilterBar } from '../components/threads/ThreadFilterBar';
import MobileNavigation from '../components/layout/MobileNavigation/MobileNavigation';
import TerminalHeader from '../components/layout/Header/TerminalHeader';
import { setCurrentTrack, setIsPlaying, Track, playTrackFromFeed, TrackSource } from '../stores/playerStore';
import { Thread } from '../data/mockThreads';
import { sortThreads, SortType } from '../utils/threadSorting';
import { fetchThreads } from '../services/api';
import { transformApiThread } from '../types/api';
import anime from 'animejs';
import './threads.css';

const ThreadsPage: Component = () => {
  const navigate = useNavigate();
  const [sortBy, setSortBy] = createSignal<SortType>('hot');

  // Fetch threads from API
  const [threadsData] = createResource(fetchThreads);

  // Transform API response to Thread format
  const threads = createMemo(() => {
    const data = threadsData();
    if (!data) return [];
    return data.threads.map(transformApiThread);
  });

  // Sorted threads based on filter
  const sortedThreads = createMemo(() => {
    return sortThreads(threads(), sortBy());
  });

  // Convert threads to Track array for playlist context
  const getThreadTracks = (): Track[] => {
    return sortedThreads()
      .filter(thread => thread.track)
      .map(thread => thread.track!);
  };

  // Track action handlers
  const playTrack = (track: Track) => {
    const threadTracks = getThreadTracks();
    const feedId = `threads-${sortBy()}`;
    playTrackFromFeed(track, threadTracks, feedId);
  };

  const likeTrack = (track: Track) => {
    console.log('Like track:', track.title);
  };

  const replyToTrack = (track: Track) => {
    console.log('Reply to track:', track.title);
  };

  // Filter change handler with animation
  const handleFilterChange = (newFilter: SortType) => {
    if (newFilter === sortBy()) return; // No change

    const cards = document.querySelectorAll('.thread-card-wrapper');

    // Fade out current cards
    anime({
      targets: cards,
      opacity: 0,
      translateY: -20,
      duration: 200,
      easing: 'easeInCubic',
      complete: () => {
        // Update filter
        setSortBy(newFilter);

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // Fade in new cards with stagger
        setTimeout(() => {
          const newCards = document.querySelectorAll('.thread-card-wrapper');
          anime({
            targets: newCards,
            opacity: [0, 1],
            translateY: [-20, 0],
            delay: anime.stagger(60),
            duration: 300,
            easing: 'easeOutCubic'
          });
        }, 50);
      }
    });
  };

  // Initial entrance animation
  onMount(() => {
    const cards = document.querySelectorAll('.thread-card-wrapper');
    anime({
      targets: cards,
      opacity: [0, 1],
      translateY: [20, 0],
      delay: anime.stagger(80),
      duration: 400,
      easing: 'easeOutCubic'
    });
  });

  const handleUsernameClick = (fid: string, username: string, e: Event) => {
    e.preventDefault();
    navigate(`/profile/${fid}`);
  };

  const handleArtistClick = (artist: string) => {
    console.log('Filter by artist:', artist);
    // TODO: Implement artist filtering or navigation
  };

  return (
    <div class="threads-page">
      {/* Terminal Header */}
      <TerminalHeader
        title="JAMZY::THREAD_BROWSER"
        path="~/threads"
        command={`list --sort=${sortBy()}`}
        statusInfo={`FILTER: ${sortBy().toUpperCase()}`}
        borderColor="magenta"
        class="threads-terminal-header"
      >
        {/* Hidden title for screen readers */}
        <h1 class="threads-title">Threads</h1>
      </TerminalHeader>

      {/* Filter Bar - Above Feed */}
      <ThreadFilterBar
        filters={[
          { value: 'hot', label: 'Hot' },
          { value: 'latest', label: 'Latest' },
          { value: 'top', label: 'Top' }
        ]}
        activeFilter={sortBy()}
        onFilterChange={handleFilterChange}
      />

      {/* Scrollable Feed */}
      <main
        class="thread-feed"
        role="feed"
        aria-label="Music conversation threads"
        aria-busy={threadsData.loading}
      >
        <Show when={threadsData.loading}>
          <div style={{ padding: '2rem', 'text-align': 'center', color: 'var(--neon-cyan)' }}>
            <div>Loading threads...</div>
          </div>
        </Show>

        <Show when={threadsData.error}>
          <div style={{ padding: '2rem', 'text-align': 'center', color: 'var(--neon-red)' }}>
            <div>Error loading threads</div>
            <div style={{ 'font-size': '0.875rem', 'margin-top': '0.5rem', color: 'var(--terminal-muted)' }}>
              {threadsData.error.message}
            </div>
          </div>
        </Show>

        <Show when={!threadsData.loading && !threadsData.error}>
          <For each={sortedThreads()}>
            {(thread, index) => (
              <article
                class="thread-card-wrapper"
                role="article"
                aria-posinset={index() + 1}
                aria-setsize={sortedThreads().length}
              >
                <ThreadCard
                  threadId={thread.id}
                  threadText={thread.initialPost.text}
                  creatorUsername={thread.initialPost.author.username}
                  creatorFid={thread.initialPost.author.fid}
                  creatorAvatar={thread.initialPost.author.pfpUrl}
                  timestamp={thread.initialPost.timestamp}
                  replyCount={thread.replyCount}
                  likeCount={thread.likeCount}
                  starterTrack={thread.initialPost.track ? {
                    id: thread.initialPost.track.id,
                    title: thread.initialPost.track.title,
                    artist: thread.initialPost.track.artist,
                    albumArt: thread.initialPost.track.thumbnail,
                    source: thread.initialPost.track.source,
                    url: thread.initialPost.track.url,
                    sourceId: thread.initialPost.track.sourceId
                  } : undefined}
                  onCardClick={() => navigate(`/thread/${thread.id}`)}
                  onUsernameClick={handleUsernameClick}
                  onArtistClick={() => thread.initialPost.track && handleArtistClick(thread.initialPost.track.artist)}
                  onTrackPlay={playTrack}
                />
              </article>
            )}
          </For>
        </Show>
      </main>

      {/* Screen reader announcements */}
      <div role="status" aria-live="polite" aria-atomic="true" class="sr-only">
        {`Viewing ${sortBy()} threads. ${sortedThreads().length} threads found.`}
      </div>

      {/* Bottom Navigation */}
      <MobileNavigation class="pb-safe" />
    </div>
  );
};

export default ThreadsPage;
