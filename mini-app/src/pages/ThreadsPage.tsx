import { Component, createSignal, createMemo, For, onMount } from 'solid-js';
import { A } from '@solidjs/router';
import { RowTrackCard } from '../components/common/TrackCard/NEW';
import { ThreadFilterBar } from '../components/threads/ThreadFilterBar';
import MobileNavigation from '../components/layout/MobileNavigation/MobileNavigation';
import { setCurrentTrack, setIsPlaying, Track } from '../stores/playerStore';
import { mockThreads } from '../data/mockThreads';
import { sortThreads, SortType } from '../utils/threadSorting';
import anime from 'animejs';
import './threads.css';

// Track action handlers
const playTrack = (track: Track) => {
  setCurrentTrack(track);
  setIsPlaying(true);
};

const likeTrack = (track: Track) => {
  console.log('Like track:', track.title);
};

const replyToTrack = (track: Track) => {
  console.log('Reply to track:', track.title);
};

const ThreadsPage: Component = () => {
  const [sortBy, setSortBy] = createSignal<SortType>('hot');
  const [isLoading, setIsLoading] = createSignal(false);

  // Sorted threads based on filter
  const sortedThreads = createMemo(() => {
    return sortThreads(mockThreads, sortBy());
  });

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

  return (
    <div class="threads-page">
      {/* Sticky Header */}
      <header class="threads-header" role="banner">
        <h1 class="threads-title">Threads</h1>

        <ThreadFilterBar
          filters={[
            { value: 'hot', label: 'Hot' },
            { value: 'latest', label: 'Latest' },
            { value: 'top', label: 'Top' }
          ]}
          activeFilter={sortBy()}
          onFilterChange={handleFilterChange}
        />
      </header>

      {/* Scrollable Feed */}
      <main
        class="thread-feed"
        role="feed"
        aria-label="Music conversation threads"
        aria-busy={isLoading()}
      >
        <For each={sortedThreads()}>
          {(thread, index) => (
            <article
              class="thread-card-wrapper"
              role="article"
              aria-posinset={index() + 1}
              aria-setsize={sortedThreads().length}
            >
              <A
                href={`/thread/${thread.id}`}
                style={{ 'text-decoration': 'none' }}
                aria-label={`View thread started by ${thread.initialPost.author.displayName}`}
              >
                <RowTrackCard
                  track={thread.initialPost.track}
                  onPlay={playTrack}
                  onLike={likeTrack}
                  onReply={replyToTrack}
                  showComment={true}
                />
              </A>
            </article>
          )}
        </For>
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
