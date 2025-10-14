import { Component, createSignal, For, createMemo, Show, createResource } from 'solid-js';
import { useParams, useLocation, A } from '@solidjs/router';
import ChannelCard from '../components/channels/ChannelCard';
import { ThreadCard } from '../components/common/TrackCard/NEW';
import MobileNavigation from '../components/layout/MobileNavigation/MobileNavigation';
import TerminalHeader from '../components/layout/Header/TerminalHeader';
import AddTrackModal from '../components/library/AddTrackModal';
import { setCurrentTrack, setIsPlaying, Track } from '../stores/playerStore';
import { fetchChannelFeed, fetchChannelDetails } from '../services/api';
import './channelView.css';

// Placeholder functions for track actions
const playTrack = (track: Track) => {
  setCurrentTrack(track);
  setIsPlaying(true);
};

const ChannelViewPage: Component = () => {
  const params = useParams();
  const channelId = () => params.id;

  // Fetch channel details and feed from API
  const [channelData] = createResource(channelId, fetchChannelDetails);
  const [feedData] = createResource(channelId, (id) => fetchChannelFeed(id, { limit: 50 }));

  // Modal state
  const [showAddTrackModal, setShowAddTrackModal] = createSignal(false);

  // Add track handler
  const handleAddTrack = () => {
    setShowAddTrackModal(true);
  };

  // Track submission
  const handleTrackSubmit = async (data: { songUrl: string; comment: string }) => {
    // TODO: Call API to create thread in channel
    console.log('Track submitted to channel:', data);
    setShowAddTrackModal(false);
    // TODO: Refresh channel feed
  };

  return (
    <div class="channel-view-page">
      {/* Terminal Header */}
      <TerminalHeader
        title="JAMZY::CHANNEL_VIEW"
        path={`~/channels/${channelId()}`}
        command="cat channel"
        statusInfo={channelData()?.stats?.threadCount ? `THREADS: ${channelData()!.stats.threadCount}` : ''}
        borderColor="magenta"
        class="channel-view-header"
        additionalContent={
          <A href="/channels" class="channel-view-back-btn">
            <span>[</span>
            <span>← BACK</span>
            <span>]</span>
          </A>
        }
      />

      {/* Scrollable Channel Content */}
      <div class="channel-view-content">
        <Show when={channelData.loading || feedData.loading}>
          <div style={{ padding: '2rem', 'text-align': 'center', color: 'var(--neon-magenta)' }}>
            <div>Loading channel...</div>
          </div>
        </Show>

        <Show when={channelData.error || feedData.error}>
          <div style={{ padding: '2rem', 'text-align': 'center', color: 'var(--neon-red)' }}>
            <div>Error loading channel</div>
          </div>
        </Show>

        <Show when={!channelData.loading && !feedData.loading && channelData() && feedData()}>
          {/* Channel Header */}
          <div class="channel-header-wrapper">
            <ChannelCard
              channelId={channelData()!.id}
              channelName={channelData()!.name}
              channelDescription={channelData()!.description || 'Channel description'}
              stats={channelData()!.stats}
              colorHex={channelData()!.colorHex}
            />
          </div>

          {/* Add Track Button */}
          <div class="channel-actions" style={{ padding: '1rem', 'text-align': 'center' }}>
            <button
              onClick={handleAddTrack}
              class="add-track-button"
              style={{
                padding: '0.75rem 1.5rem',
                background: 'transparent',
                border: '1px solid var(--neon-magenta)',
                color: 'var(--neon-magenta)',
                cursor: 'pointer',
                'font-family': 'var(--font-mono)',
                transition: 'all 0.2s'
              }}
            >
              [+ ADD TRACK]
            </button>
          </div>

          {/* Threads Feed */}
          <Show when={feedData()!.threads && feedData()!.threads.length > 0}>
            <div class="replies-section-header">
              <span>├─</span>
              <span style={{ color: 'var(--neon-magenta)' }}>TRACKS</span>
              <span> [</span>
              <span class="reply-count">{feedData()!.threads.length}</span>
              <span>]</span>
              <span style={{ 'margin-left': 'auto' }}>─┤</span>
            </div>

            <div class="replies-list">
              <For each={feedData()!.threads}>
                {(thread) => (
                  <div class="channel-reply-wrapper">
                    <ThreadCard
                      threadId={thread.castHash}
                      threadText={thread.text}
                      creatorUsername={thread.author.username}
                      creatorAvatar={thread.author.pfpUrl}
                      timestamp={thread.timestamp}
                      replyCount={thread.stats.replies}
                      likeCount={thread.stats.likes}
                      starterTrack={thread.music && thread.music[0] ? {
                        id: thread.music[0].id,
                        title: thread.music[0].title,
                        artist: thread.music[0].artist,
                        albumArt: thread.music[0].thumbnail,
                        source: thread.music[0].platform,
                        url: thread.music[0].url,
                        sourceId: thread.music[0].platformId
                      } : undefined}
                      onTrackPlay={playTrack}
                    />
                  </div>
                )}
              </For>
            </div>
          </Show>

          <Show when={!feedData()!.threads || feedData()!.threads.length === 0}>
            <div style={{ padding: '2rem', 'text-align': 'center', color: 'var(--terminal-muted)' }}>
              <p>No tracks in this channel yet.</p>
              <p>Be the first to add one!</p>
            </div>
          </Show>
        </Show>
      </div>

      {/* Bottom Navigation */}
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
