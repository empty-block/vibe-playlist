import { Component, createSignal, createMemo, For, onMount } from 'solid-js';
import { A } from '@solidjs/router';
import { ThreadCard } from '../components/common/TrackCard/NEW';
import { ThreadFilterBar } from '../components/threads/ThreadFilterBar';
import MobileNavigation from '../components/layout/MobileNavigation/MobileNavigation';
import { setCurrentTrack, setIsPlaying, Track } from '../stores/playerStore';
import { mockThreads, Thread } from '../data/mockThreads';
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

  const handleUsernameClick = (username: string) => {
    window.location.href = `/user/${username}`;
  };

  const handleArtistClick = (artist: string) => {
    console.log('Filter by artist:', artist);
    // TODO: Implement artist filtering or navigation
  };

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
              <ThreadCard
                threadId={thread.id}
                threadText={thread.initialPost.text}
                creatorUsername={thread.initialPost.author.username}
                creatorAvatar={thread.initialPost.author.pfpUrl}
                timestamp={thread.initialPost.timestamp}
                replyCount={thread.replyCount}
                likeCount={thread.likeCount}
                starterTrack={thread.initialPost.track ? {
                  id: thread.initialPost.track.id,
                  title: thread.initialPost.track.title,
                  artist: thread.initialPost.track.artist,
                  albumArt: thread.initialPost.track.thumbnail,
                  source: thread.initialPost.track.source
                } : undefined}
                onCardClick={() => window.location.href = `/thread/${thread.id}`}
                onUsernameClick={() => handleUsernameClick(thread.initialPost.author.username)}
                onArtistClick={() => thread.initialPost.track && handleArtistClick(thread.initialPost.track.artist)}
              />
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
