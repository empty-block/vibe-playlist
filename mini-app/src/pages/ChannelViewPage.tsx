import { Component, createSignal, For, createMemo, Show, createResource } from 'solid-js';
import { useParams, useLocation, A } from '@solidjs/router';
import ChannelCard from '../components/channels/ChannelCard';
import { ThreadCard } from '../components/common/TrackCard/NEW';
import MobileNavigation from '../components/layout/MobileNavigation/MobileNavigation';
import TerminalHeader from '../components/layout/Header/TerminalHeader';
import ThreadActionsBar from '../components/thread/ThreadActionsBar';
import AddTrackModal from '../components/library/AddTrackModal';
import { setCurrentTrack, setIsPlaying, Track } from '../stores/playerStore';
import { fetchThread } from '../services/api';
import { transformApiThreadDetail } from '../types/api';
import './channelView.css';

// Placeholder functions for track actions
const playTrack = (track: Track) => {
  setCurrentTrack(track);
  setIsPlaying(true);
};

const ChannelViewPage: Component = () => {
  const params = useParams();
  const location = useLocation();

  // Get channel metadata from route state (passed from ChannelsPage)
  const channelName = () => (location.state as any)?.channelName || 'unknown_channel';
  const channelDescription = () => (location.state as any)?.channelDescription || 'Channel description';

  // Fetch thread data from API (using the threadId as the channel's backing thread)
  const [threadData] = createResource(() => params.id, fetchThread);

  // Transform API response to Thread format
  const thread = createMemo(() => {
    const data = threadData();
    if (!data) return null;
    return transformApiThreadDetail(data);
  });

  // Modal state
  const [showAddReplyModal, setShowAddReplyModal] = createSignal(false);

  // Like state (would come from API in production)
  const [isLiked, setIsLiked] = createSignal(false);

  // Like handler
  const handleLike = async () => {
    setIsLiked(!isLiked());
    // TODO: Call API to persist like
    console.log('Like toggled:', isLiked());
  };

  // Reply handler
  const handleAddReply = () => {
    setShowAddReplyModal(true);
  };

  // Reply submission
  const handleReplySubmit = async (data: { songUrl: string; comment: string }) => {
    // TODO: Call API to create reply
    console.log('Reply submitted:', data);

    // Close modal
    setShowAddReplyModal(false);

    // TODO: Refresh thread to show new reply
  };

  return (
    <div class="channel-view-page">
      {/* Terminal Header */}
      <TerminalHeader
        title="JAMZY::CHANNEL_VIEW"
        path={`~/channels/${channelName()}`}
        command="cat channel"
        statusInfo={`ID: #${params.id.slice(-4)}`}
        borderColor="magenta"
        class="channel-view-header"
        additionalContent={
          <A href="/" class="channel-view-back-btn">
            <span>[</span>
            <span>← BACK</span>
            <span>]</span>
          </A>
        }
      />

      {/* Scrollable Channel Content */}
      <div class="channel-view-content">
        <Show when={threadData.loading}>
          <div style={{ padding: '2rem', 'text-align': 'center', color: 'var(--neon-magenta)' }}>
            <div>Loading channel...</div>
          </div>
        </Show>

        <Show when={threadData.error}>
          <div style={{ padding: '2rem', 'text-align': 'center', color: 'var(--neon-red)' }}>
            <div>Error loading channel</div>
            <div style={{ 'font-size': '0.875rem', 'margin-top': '0.5rem', color: 'var(--terminal-muted)' }}>
              {threadData.error.message}
            </div>
          </div>
        </Show>

        <Show when={!threadData.loading && !threadData.error && thread()}>
          {/* Channel Card - Succinct header */}
          <div class="channel-header-wrapper">
            <ChannelCard
              channelId={params.id}
              channelName={channelName()}
              channelDescription={channelDescription()}
            />
          </div>

          {/* Action Bar - Right after channel card */}
          <ThreadActionsBar
            threadId={thread()!.id}
            isLiked={isLiked()}
            likeCount={thread()!.likeCount}
            onLike={handleLike}
            onAddReply={handleAddReply}
          />

          {/* Replies Section */}
          <Show when={thread()!.replies.length > 0}>
            <div class="replies-section-header">
              <span>├─</span>
              <span style={{ color: 'var(--neon-magenta)' }}>TRACKS</span>
              <span> [</span>
              <span class="reply-count">{thread()!.replies.length}</span>
              <span>]</span>
              <span style={{ 'margin-left': 'auto' }}>─┤</span>
            </div>

            <div class="replies-list">
              <For each={thread()!.replies}>
                {(reply, index) => (
                  <div class="channel-reply-wrapper">
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
        </Show>
      </div>

      {/* Bottom Navigation */}
      <MobileNavigation class="pb-safe" />

      {/* Add Reply Modal (reuse AddTrackModal) */}
      <AddTrackModal
        isOpen={showAddReplyModal()}
        onClose={() => setShowAddReplyModal(false)}
        onSubmit={handleReplySubmit}
        title="Add Track to Channel"
      />
    </div>
  );
};

export default ChannelViewPage;
