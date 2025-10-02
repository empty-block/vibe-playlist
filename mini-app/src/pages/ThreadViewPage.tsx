import { Component, createSignal, For, createMemo, Show } from 'solid-js';
import { useParams, A } from '@solidjs/router';
import { ThreadCard } from '../components/common/TrackCard/NEW';
import MobileNavigation from '../components/layout/MobileNavigation/MobileNavigation';
import { setCurrentTrack, setIsPlaying, Track } from '../stores/playerStore';
import { getThreadById, mockThreads } from '../data/mockThreads';
import './threadView.css';

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
    <div class="thread-view-page">
      {/* Terminal Header */}
      <header class="thread-view-header">
        {/* Title bar */}
        <div class="terminal-title-bar">
          <span>┌─[</span>
          <span style={{ 'font-weight': 700 }}>JAMZY::THREAD_VIEW</span>
          <span>]───────────[</span>
          <span style={{ color: 'var(--neon-yellow)' }}>ID: #{params.id.slice(-4)}</span>
          <span>]─┐</span>
        </div>

        {/* Command prompt */}
        <div class="terminal-prompt-line">
          <span class="border-v">│</span>
          <A href="/" class="thread-view-back-btn">
            <span>[</span>
            <span>← BACK</span>
            <span>]</span>
          </A>
          <span class="terminal-user">user@jamzy</span>
          <span class="terminal-colon">:</span>
          <span class="terminal-path">~/threads/{params.id.slice(-4)}</span>
          <span class="terminal-dollar">$</span>
          <span class="terminal-command">cat thread</span>
          <span style={{ 'margin-left': 'auto' }}></span>
          <span class="border-v">│</span>
        </div>

        {/* Bottom border */}
        <div style={{ color: 'var(--terminal-muted)' }}>
          <span>└────────────────────────────────────────────┘</span>
        </div>
      </header>

      {/* Scrollable Thread Content */}
      <div class="thread-view-content">
        {/* Thread Root Post - Prominent Display */}
        <div class="thread-root-wrapper">
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
              source: thread().initialPost.track.source,
              url: thread().initialPost.track.url,
              sourceId: thread().initialPost.track.sourceId
            } : undefined}
            onTrackPlay={playTrack}
          />
        </div>

        {/* Replies Section */}
        <Show when={thread().replies.length > 0}>
          <div class="replies-section-header">
            <span>├─</span>
            <span style={{ color: 'var(--neon-cyan)' }}>REPLIES</span>
            <span> [</span>
            <span class="reply-count">{thread().replies.length}</span>
            <span>]</span>
            <span style={{ 'margin-left': 'auto' }}>─┤</span>
          </div>

          <div class="replies-list">
            <For each={thread().replies}>
              {(reply, index) => (
                <div class="thread-reply-wrapper">
                  <ThreadCard
                    threadId={reply.castHash}
                    threadText={reply.text}
                    creatorUsername={reply.author.username}
                    creatorAvatar={reply.author.pfpUrl}
                    timestamp={reply.timestamp}
                    replyCount={0}
                    likeCount={reply.likes}
                    starterTrack={{
                      id: reply.track.id,
                      title: reply.track.title,
                      artist: reply.track.artist,
                      albumArt: reply.track.thumbnail,
                      source: reply.track.source,
                      url: reply.track.url,
                      sourceId: reply.track.sourceId
                    }}
                    onTrackPlay={playTrack}
                  />
                </div>
              )}
            </For>
          </div>
        </Show>
      </div>

      {/* Bottom Navigation */}
      <MobileNavigation class="pb-safe" />
    </div>
  );
};

export default ThreadViewPage;
