import { Component, createSignal, createMemo, For, Show } from 'solid-js';
import { RowTrackCard } from '../components/common/TrackCard/NEW';
import MobileNavigation from '../components/layout/MobileNavigation/MobileNavigation';
import TerminalHeader from '../components/layout/Header/TerminalHeader';
import { currentUser } from '../stores/authStore';
import { setCurrentTrack, setIsPlaying, Track } from '../stores/playerStore';
import { mockThreads } from '../data/mockThreads';
import './profilePage.css';

type FilterType = 'threads' | 'replies' | 'all';

const ProfilePage: Component = () => {
  const user = currentUser();
  const [currentFilter, setCurrentFilter] = createSignal<FilterType>('all');

  // Extract user's threads and replies
  const userThreads = createMemo(() =>
    mockThreads.filter(t => t.initialPost.author.username === user.username)
  );

  const userReplies = createMemo(() =>
    mockThreads.flatMap(t =>
      t.replies.filter(r => r.author.username === user.username)
    )
  );

  // Helper to convert ThreadTrack to Track format
  const convertToTrack = (threadTrack: any, author: any): Track => ({
    id: threadTrack.id,
    title: threadTrack.title,
    artist: threadTrack.artist,
    duration: threadTrack.duration || '0:00',
    source: threadTrack.source as 'youtube' | 'spotify',
    sourceId: threadTrack.sourceId,
    thumbnail: threadTrack.thumbnail,
    addedBy: author.username,
    userAvatar: author.pfpUrl,
    timestamp: threadTrack.timestamp,
    comment: threadTrack.comment || '',
    likes: threadTrack.likes || 0,
    replies: threadTrack.replies || 0,
    recasts: threadTrack.recasts || 0
  });

  // Filtered content based on current filter
  const filteredContent = createMemo(() => {
    const filter = currentFilter();

    if (filter === 'threads') {
      return userThreads().map(t => ({
        type: 'thread' as const,
        track: convertToTrack(t.initialPost.track, t.initialPost.author),
        timestamp: t.initialPost.timestamp
      }));
    }

    if (filter === 'replies') {
      return userReplies().map(r => ({
        type: 'reply' as const,
        track: convertToTrack(r.track, r.author),
        timestamp: r.timestamp
      }));
    }

    // 'all'
    return [
      ...userThreads().map(t => ({ type: 'thread' as const, track: convertToTrack(t.initialPost.track, t.initialPost.author), timestamp: t.initialPost.timestamp })),
      ...userReplies().map(r => ({ type: 'reply' as const, track: convertToTrack(r.track, r.author), timestamp: r.timestamp }))
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  });

  // Track actions
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

  const getEmptyMessage = (filter: FilterType) => {
    switch (filter) {
      case 'threads':
        return "You haven't started any conversations yet. Share a track to create your first thread!";
      case 'replies':
        return "You haven't replied to any threads yet. Join the conversation by adding your tracks!";
      case 'all':
        return "Start exploring! Share tracks or reply to threads to build your profile.";
    }
  };

  return (
    <div class="profile-page">
      {/* Terminal Header */}
      <TerminalHeader
        title="JAMZY::USER_PROFILE"
        path={`~/users/${user.username}`}
        command="ls -la"
        statusInfo={`@${user.username}`}
        borderColor="green"
        class="profile-terminal-header"
      />

      {/* Identity Card */}
      <div class="profile-identity-card">
        <img
          class="profile-avatar"
          src={user.avatar}
          alt={`${user.displayName} profile picture`}
        />
        <div class="profile-info">
          <h1 class="profile-display-name">{user.displayName}</h1>
          <p class="profile-username-label">@{user.username}</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div class="profile-filter-tabs">
        <button
          class={`filter-tab ${currentFilter() === 'threads' ? 'filter-tab--active' : ''}`}
          onClick={() => setCurrentFilter('threads')}
        >
          Threads
        </button>
        <button
          class={`filter-tab ${currentFilter() === 'replies' ? 'filter-tab--active' : ''}`}
          onClick={() => setCurrentFilter('replies')}
        >
          Replies
        </button>
        <button
          class={`filter-tab ${currentFilter() === 'all' ? 'filter-tab--active' : ''}`}
          onClick={() => setCurrentFilter('all')}
        >
          All
        </button>
      </div>

      {/* Content */}
      <div class="profile-track-list">
        <Show when={filteredContent().length === 0}>
          <div class="profile-empty-state">
            <span class="empty-icon">🎵</span>
            <p class="empty-message">{getEmptyMessage(currentFilter())}</p>
          </div>
        </Show>

        <Show when={filteredContent().length > 0}>
          <For each={filteredContent()}>
            {(item) => (
              <div class="profile-row-card-wrapper">
                <RowTrackCard
                  track={item.track}
                  onPlay={playTrack}
                  onLike={likeTrack}
                  onReply={replyToTrack}
                  showComment={true}
                />
              </div>
            )}
          </For>
        </Show>
      </div>

      {/* Bottom Navigation */}
      <MobileNavigation class="pb-safe" />
    </div>
  );
};

export default ProfilePage;
