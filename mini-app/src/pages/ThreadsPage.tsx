import { Component, createSignal, For } from 'solid-js';
import { A } from '@solidjs/router';
import { ThreadCard } from '../components/common/TrackCard/NEW';
import MobileNavigation from '../components/layout/MobileNavigation/MobileNavigation';
import { setCurrentTrack, setIsPlaying, Track } from '../stores/playerStore';
import { mockThreads, Thread } from '../data/mockThreads';

// Placeholder functions for track actions
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
  const [sortBy, setSortBy] = createSignal<'recent' | 'popular'>('recent');
  const [threads] = createSignal<Thread[]>(mockThreads);

  const handleUsernameClick = (username: string) => {
    window.location.href = `/user/${username}`;
  };

  const handleArtistClick = (artist: string) => {
    console.log('Filter by artist:', artist);
    // TODO: Implement artist filtering or navigation
  };

  return (
    <div style={{
      display: 'flex',
      'flex-direction': 'column',
      height: '100vh',
      background: 'var(--dark-bg)',
      color: 'var(--light-text)'
    }}>
      {/* Header with Sort */}
      <div style={{
        position: 'sticky',
        top: 0,
        'z-index': 10,
        background: 'var(--darker-bg)',
        'border-bottom': '1px solid rgba(59, 0, 253, 0.3)',
        padding: 'var(--space-4)'
      }}>
        <div style={{
          display: 'flex',
          'align-items': 'center',
          'justify-content': 'space-between'
        }}>
          <h1 style={{
            margin: 0,
            'font-size': 'var(--text-xl)',
            color: 'var(--neon-cyan)',
            'font-family': 'var(--font-display)'
          }}>
            Threads
          </h1>

          {/* Sort Buttons */}
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <button
              onClick={() => setSortBy('recent')}
              class="interactive"
              style={{
                padding: '8px 16px',
                'border-radius': '4px',
                border: 'none',
                background: sortBy() === 'recent'
                  ? 'var(--neon-blue)'
                  : 'rgba(255, 255, 255, 0.1)',
                color: 'var(--light-text)',
                cursor: 'pointer',
                'font-family': 'var(--font-display)',
                'font-size': 'var(--text-sm)'
              }}
            >
              Recent
            </button>
            <button
              onClick={() => setSortBy('popular')}
              class="interactive"
              style={{
                padding: '8px 16px',
                'border-radius': '4px',
                border: 'none',
                background: sortBy() === 'popular'
                  ? 'var(--neon-blue)'
                  : 'rgba(255, 255, 255, 0.1)',
                color: 'var(--light-text)',
                cursor: 'pointer',
                'font-family': 'var(--font-display)',
                'font-size': 'var(--text-sm)'
              }}
            >
              Popular
            </button>
          </div>
        </div>
      </div>

      {/* Scrollable Threads List */}
      <div style={{
        flex: 1,
        'overflow-y': 'auto',
        padding: 'var(--space-4)',
        'padding-bottom': '120px' // Space for bottom nav + player
      }}>
        <For each={threads()}>
          {(thread) => (
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
          )}
        </For>
      </div>

      {/* Bottom Navigation */}
      <MobileNavigation class="pb-safe" />
    </div>
  );
};

export default ThreadsPage;
