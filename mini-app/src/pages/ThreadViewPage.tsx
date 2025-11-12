import { Component, createSignal, For, createMemo, Show, createResource } from 'solid-js';
import { useParams, useNavigate, A } from '@solidjs/router';
import { ThreadCard } from '../components/common/TrackCard/NEW';
import MobileNavigation from '../components/layout/MobileNavigation/MobileNavigation';
import TerminalHeader from '../components/layout/Header/TerminalHeader';
import ThreadActionsBar from '../components/thread/ThreadActionsBar';
import AddTrackModal from '../components/library/AddTrackModal';
import { setCurrentTrack, setIsPlaying, Track, playTrackWithAuthCheck } from '../stores/playerStore';
import { fetchThread } from '../services/api';
import { transformApiThreadDetail } from '../types/api';
import './threadView.css';

const ThreadViewPage: Component = () => {
  const params = useParams();
  const navigate = useNavigate();

  // Fetch thread from API
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

  // Convert thread + replies to Track array for playlist context
  const getThreadTracks = (): Track[] => {
    const currentThread = thread();
    if (!currentThread) return [];

    const tracks: Track[] = [];

    // Add root track
    if (currentThread.track) {
      tracks.push(currentThread.track);
    }

    // Add reply tracks
    if (currentThread.replies) {
      currentThread.replies.forEach(reply => {
        if (reply.track) {
          tracks.push(reply.track);
        }
      });
    }

    return tracks;
  };

  // Track action handlers
  const playTrack = (track: Track) => {
    const threadTracks = getThreadTracks();
    const feedId = `thread-${params.id}`;
    playTrackWithAuthCheck(track, threadTracks, feedId);
  };

  const likeTrack = (track: Track) => {
    console.log('Like track:', track.title);
  };

  const replyToTrack = (track: Track) => {
    console.log('Reply to track:', track.title);
  };

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
    try {
      // Import SDK dynamically
      const { default: sdk } = await import('@farcaster/miniapp-sdk');

      // Open native Farcaster composer with pre-filled reply
      const result = await sdk.actions.composeCast({
        text: data.comment || '',
        embeds: data.songUrl ? [data.songUrl] : [],
        parent: params.id // Reply to this thread's root cast
      });

      console.log('[ThreadViewPage] Reply compose result:', result);

      if (result?.cast) {
        // User posted the reply successfully
        console.log('[ThreadViewPage] Reply posted with hash:', result.cast.hash);

        // TODO: Optionally refresh thread to show new reply
        // Could call fetchThread again or wait for backend sync
      }

      // Close modal
      setShowAddReplyModal(false);
    } catch (error) {
      console.error('[ThreadViewPage] Failed to compose reply:', error);
      // Keep modal open on error so user can retry
    }
  };

  // Username click handler
  const handleUsernameClick = (fid: string, username: string, e: Event) => {
    e.stopPropagation();
    navigate(`/profile/${fid}`);
  };

  return (
    <div class="thread-view-page">
      {/* Terminal Header */}
      <TerminalHeader
        title="JAMZY::THREAD_VIEW"
        path={`~/threads/${params.id.slice(-4)}`}
        command="cat thread"
        statusInfo={`ID: #${params.id.slice(-4)}`}
        borderColor="cyan"
        class="thread-view-header"
        additionalContent={
          <A href="/" class="thread-view-back-btn">
            <span>[</span>
            <span>← BACK</span>
            <span>]</span>
          </A>
        }
      />

      {/* Scrollable Thread Content */}
      <div class="thread-view-content">
        <Show when={threadData.loading}>
          <div style={{ padding: '2rem', 'text-align': 'center', color: 'var(--neon-cyan)' }}>
            <div>Loading thread...</div>
          </div>
        </Show>

        <Show when={threadData.error}>
          <div style={{ padding: '2rem', 'text-align': 'center', color: 'var(--neon-red)' }}>
            <div>Error loading thread</div>
            <div style={{ 'font-size': '0.875rem', 'margin-top': '0.5rem', color: 'var(--terminal-muted)' }}>
              {threadData.error.message}
            </div>
          </div>
        </Show>

        <Show when={!threadData.loading && !threadData.error && thread()}>
          {/* Thread Root Post - Prominent Display */}
          <div class="thread-root-wrapper">
            <ThreadCard
              threadId={thread()!.id}
              threadText={thread()!.initialPost.text}
              creatorUsername={thread()!.initialPost.author.username}
              creatorFid={thread()!.initialPost.author.fid}
              creatorAvatar={thread()!.initialPost.author.pfpUrl}
              timestamp={thread()!.initialPost.timestamp}
              replyCount={thread()!.replyCount}
              likeCount={thread()!.likeCount}
              starterTrack={thread()!.initialPost.track ? {
                id: thread()!.initialPost.track.id,
                title: thread()!.initialPost.track.title,
                artist: thread()!.initialPost.track.artist,
                albumArt: thread()!.initialPost.track.thumbnail,
                source: thread()!.initialPost.track.source,
                url: thread()!.initialPost.track.url,
                sourceId: thread()!.initialPost.track.sourceId
              } : undefined}
              onTrackPlay={playTrack}
              onUsernameClick={handleUsernameClick}
            />
          </div>

          {/* Action Bar - Right after root post */}
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
              <span style={{ color: 'var(--neon-cyan)' }}>REPLIES</span>
              <span> [</span>
              <span class="reply-count">{thread()!.replies.length}</span>
              <span>]</span>
              <span style={{ 'margin-left': 'auto' }}>─┤</span>
            </div>

            <div class="replies-list">
              <For each={thread()!.replies}>
                {(reply, index) => (
                  <div class="thread-reply-wrapper">
                    <ThreadCard
                      threadId={reply.castHash}
                      threadText={reply.text}
                      creatorUsername={reply.author.username}
                      creatorFid={reply.author.fid}
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
                      onUsernameClick={handleUsernameClick}
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
        title="Add Reply to Thread"
      />
    </div>
  );
};

export default ThreadViewPage;
