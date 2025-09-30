import { Component, createSignal, For } from 'solid-js';
import { A } from '@solidjs/router';
import { RowTrackCard } from '../components/common/TrackCard/NEW';
import MobileNavigation from '../components/layout/MobileNavigation/MobileNavigation';
import { setCurrentTrack, setIsPlaying, Track } from '../stores/playerStore';
import { mockThreads } from '../data/mockThreads';

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
            <A href={`/thread/${thread.id}`} style={{ 'text-decoration': 'none' }}>
              {thread.initialPost.track && (
                <div style={{ 'margin-bottom': 'var(--space-4)' }}>
                  <RowTrackCard
                    track={thread.initialPost.track}
                    onPlay={playTrack}
                    onLike={likeTrack}
                    onReply={replyToTrack}
                    showComment={true}
                  />
                </div>
              )}
            </A>
          )}
        </For>
      </div>

      {/* Bottom Navigation */}
      <MobileNavigation class="pb-safe" />
    </div>
  );
};

export default ThreadsPage;
