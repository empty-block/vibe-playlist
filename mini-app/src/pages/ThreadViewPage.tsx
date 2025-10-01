import { Component, createSignal, For, createMemo } from 'solid-js';
import { useParams, A } from '@solidjs/router';
import { RowTrackCard, ThreadCard } from '../components/common/TrackCard/NEW';
import MobileNavigation from '../components/layout/MobileNavigation/MobileNavigation';
import { setCurrentTrack, setIsPlaying, Track } from '../stores/playerStore';
import { getThreadById, mockThreads } from '../data/mockThreads';

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

const ThreadViewPage: Component = () => {
  const params = useParams();
  const thread = createMemo(() => getThreadById(params.id) || mockThreads[0]);

  return (
    <div style={{
      display: 'flex',
      'flex-direction': 'column',
      height: '100vh',
      background: 'var(--dark-bg)',
      color: 'var(--light-text)'
    }}>
      {/* Header with Back Button */}
      <div style={{
        position: 'sticky',
        top: 0,
        'z-index': 10,
        background: 'var(--darker-bg)',
        'border-bottom': '1px solid rgba(59, 0, 253, 0.3)',
        padding: 'var(--space-4)'
      }}>
        <div style={{ display: 'flex', 'align-items': 'center', gap: 'var(--space-4)' }}>
          <A
            href="/"
            style={{
              color: 'var(--neon-cyan)',
              'text-decoration': 'none',
              'font-size': 'var(--text-xl)'
            }}
          >
            ←
          </A>
          <h1 style={{
            margin: 0,
            'font-size': 'var(--text-xl)',
            color: 'var(--neon-cyan)',
            'font-family': 'var(--font-display)'
          }}>
            Thread
          </h1>
        </div>
      </div>

      {/* Scrollable Thread Content */}
      <div style={{
        flex: 1,
        'overflow-y': 'auto',
        padding: 'var(--space-4)',
        'padding-bottom': '120px' // Space for bottom nav + player
      }}>
        {/* Thread Starter - Prominent Display */}
        <div style={{ 'margin-bottom': 'var(--space-6)' }}>
          <ThreadCard
            threadId={thread().id}
            threadText={thread().initialPost.text}
            creatorUsername={thread().initialPost.author.username}
            creatorAvatar={thread().initialPost.author.pfpUrl}
            timestamp={thread().initialPost.timestamp}
            replyCount={thread().replyCount}
            likeCount={thread().likeCount}
            starterTrack={thread().initialPost.track ? {
              id: thread().initialPost.track.id,
              title: thread().initialPost.track.title,
              artist: thread().initialPost.track.artist,
              albumArt: thread().initialPost.track.thumbnail,
              source: thread().initialPost.track.source
            } : undefined}
            // No onCardClick - we're already on the thread detail page
          />
        </div>

        {/* Replies Section */}
        {thread().replies.length > 0 && (
          <>
            <h2 style={{
              'margin-top': 0,
              'margin-bottom': 'var(--space-4)',
              'font-size': 'var(--text-lg)',
              color: 'var(--neon-pink)',
              'font-family': 'var(--font-display)'
            }}>
              Replies ({thread().replies.length})
            </h2>

            <div style={{ display: 'flex', 'flex-direction': 'column', gap: 'var(--space-4)' }}>
              <For each={thread().replies}>
                {(reply) => (
                  <RowTrackCard
                    track={reply.track}
                    onPlay={playTrack}
                    onLike={likeTrack}
                    onReply={replyToTrack}
                    showComment={true}
                  />
                )}
              </For>
            </div>
          </>
        )}
      </div>

      {/* Bottom Navigation */}
      <MobileNavigation class="pb-safe" />
    </div>
  );
};

export default ThreadViewPage;
