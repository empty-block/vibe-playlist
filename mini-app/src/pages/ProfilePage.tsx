import { Component, createSignal, createMemo, For, Show } from 'solid-js';
import MobileNavigation from '../components/layout/MobileNavigation/MobileNavigation';
import { currentUser } from '../stores/authStore';
import { setCurrentTrack, setIsPlaying, Track, currentTrack, isPlaying } from '../stores/playerStore';
import { mockThreads } from '../data/mockThreads';
import './profilePage.css';

type FilterType = 'threads' | 'replies' | 'all';

const ProfilePage: Component = () => {
  const user = currentUser();
  const [currentFilter, setCurrentFilter] = createSignal<FilterType>('threads');

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

  // Time ago formatter
  const formatTimeAgo = (timestamp: string): string => {
    const now = new Date();
    const then = new Date(timestamp);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
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

  const getFilterLabel = (filter: FilterType) => {
    switch (filter) {
      case 'threads':
        return `📤 Threads (${userThreads().length})`;
      case 'replies':
        return `💬 Replies (${userReplies().length})`;
      case 'all':
        return `📋 All (${userThreads().length + userReplies().length})`;
    }
  };

  return (
    <div class="profile-page">
      <div class="profile-container">
        {/* Napster Buddy List Style Header */}
        <div class="profile-header">
          <Show when={user.avatar} fallback={
            <div class="profile-avatar-fallback">
              {user.displayName.charAt(0).toUpperCase()}
            </div>
          }>
            <img
              src={user.avatar}
              alt={user.displayName}
              class="profile-avatar"
            />
          </Show>
          <div class="profile-info">
            <div class="profile-username">@{user.username}</div>
            <Show when={user.bio}>
              <div class="profile-bio">{user.bio}</div>
            </Show>
            <div class="profile-stats-inline">
              <div class="stat-inline">
                <span class="number">{userThreads().length}</span> threads
              </div>
              <div class="stat-inline">
                <span class="number">{userReplies().length}</span> replies
              </div>
              <div class="stat-inline">
                <span class="number">{userThreads().length + userReplies().length}</span> total
              </div>
            </div>
          </div>
        </div>

        {/* Feed Filter Buttons */}
        <div class="feed-filter">
          <button
            class={`filter-button ${currentFilter() === 'threads' ? 'active' : ''}`}
            onClick={() => setCurrentFilter('threads')}
          >
            {getFilterLabel('threads')}
          </button>
          <button
            class={`filter-button ${currentFilter() === 'replies' ? 'active' : ''}`}
            onClick={() => setCurrentFilter('replies')}
          >
            {getFilterLabel('replies')}
          </button>
          <button
            class={`filter-button ${currentFilter() === 'all' ? 'active' : ''}`}
            onClick={() => setCurrentFilter('all')}
          >
            {getFilterLabel('all')}
          </button>
        </div>

        {/* Track Feed */}
        <div class="track-feed">
          <div class="feed-header">
            📤 Showing: <span class="feed-type">
              {currentFilter() === 'threads' ? 'Threads' : currentFilter() === 'replies' ? 'Replies' : 'All Tracks'}
            </span> (<span class="feed-count">{filteredContent().length}</span>)
          </div>

          <Show when={filteredContent().length === 0}>
            <div class="profile-empty-state">
              <span class="empty-icon">🎵</span>
              <p class="empty-message">{getEmptyMessage(currentFilter())}</p>
            </div>
          </Show>

          <Show when={filteredContent().length > 0}>
            <For each={filteredContent()}>
              {(item) => {
                const track = item.track;
                const isTrackPlaying = () => currentTrack()?.id === track.id && isPlaying();

                return (
                  <div class="activity-card">
                    <div class="activity-header">
                      <span class="username">@{user.username}</span>
                      <span class="timestamp">{formatTimeAgo(item.timestamp)}</span>
                    </div>

                    <div class="track-content">
                      <div class="thumbnail">
                        <Show when={track.thumbnail} fallback={<span>🎵</span>}>
                          <img src={track.thumbnail} alt={track.title} />
                        </Show>
                      </div>
                      <div class="track-info">
                        <div class="track-title">{track.title}</div>
                        <div class="track-artist">{track.artist}</div>
                        <div class="track-meta">via {track.source}</div>
                      </div>
                      <button
                        class="play-button"
                        onClick={() => playTrack(track)}
                      >
                        {isTrackPlaying() ? '⏸' : '▶'}
                      </button>
                    </div>

                    <Show when={track.comment && track.comment.trim()}>
                      <div class="comment-box">{track.comment}</div>
                    </Show>

                    <div class="stats-row">
                      <div class="stat-box">
                        <span>♥</span>
                        <span class="count">{track.likes || 0}</span>
                      </div>
                      <div class="stat-box">
                        <span>💬</span>
                        <span class="count">{track.replies || 0}</span>
                      </div>
                      <div class="stat-box">
                        <span>🔄</span>
                        <span class="count">{track.recasts || 0}</span>
                      </div>
                    </div>
                  </div>
                );
              }}
            </For>
          </Show>
        </div>
      </div>

      {/* Bottom Navigation */}
      <MobileNavigation class="pb-safe" />
    </div>
  );
};

export default ProfilePage;
