import { Component, createSignal, createMemo, For, Show, onMount } from 'solid-js';
import { useParams, useNavigate } from '@solidjs/router';
import MobileNavigation from '../components/layout/MobileNavigation/MobileNavigation';
import { TrackCard } from '../components/common/TrackCard/NEW';
import { currentUser } from '../stores/authStore';
import { setCurrentTrack, setIsPlaying, Track, currentTrack, isPlaying } from '../stores/playerStore';
import {
  profileUser,
  threads,
  isLoading,
  error,
  nextCursor,
  loadUserProfile,
  loadMoreThreads
} from '../stores/profileStore';
import './profilePageWin95.css';

type FilterType = 'threads' | 'replies' | 'all';

const ProfilePage: Component = () => {
  const params = useParams();
  const navigate = useNavigate();
  const [currentFilter, setCurrentFilter] = createSignal<FilterType>('threads');

  // Get FID from route params or use current user's FID
  const userFid = () => params.fid || currentUser().fid;

  // Load profile data on mount
  onMount(() => {
    loadUserProfile(userFid());
  });

  // Get user display info
  const user = createMemo(() => {
    const profile = profileUser();
    if (profile) {
      return {
        fid: profile.user.fid,
        username: profile.user.username,
        displayName: profile.user.displayName,
        avatar: profile.user.avatar,
        bio: undefined // Will add later when we have bio in DB
      };
    }
    return currentUser(); // Fallback while loading
  });

  // Separate threads and replies from API data
  const userThreads = createMemo(() =>
    threads().filter(t => t.music && t.music.length > 0 && !t.text.startsWith('@'))
  );

  const userReplies = createMemo(() =>
    threads().filter(t => t.music && t.music.length > 0 && t.text.startsWith('@'))
  );

  // Filtered content based on current filter
  const filteredContent = createMemo(() => {
    const filter = currentFilter();

    if (filter === 'threads') {
      return userThreads();
    }

    if (filter === 'replies') {
      return userReplies();
    }

    // 'all' - combine threads and replies sorted by timestamp
    return [...userThreads(), ...userReplies()]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
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
        {/* Loading State */}
        <Show when={isLoading() && !profileUser()}>
          <div class="profile-loading">
            <div>Loading profile...</div>
          </div>
        </Show>

        {/* Error State */}
        <Show when={error()}>
          <div class="profile-error">
            <span class="empty-icon">⚠️</span>
            <p class="empty-message">{error()}</p>
          </div>
        </Show>

        {/* Profile Content */}
        <Show when={!isLoading() || profileUser()}>
          {/* Napster Buddy List Style Header */}
          <div class="profile-header">
            <Show when={user().avatar} fallback={
              <div class="profile-avatar-fallback">
                {user().displayName.charAt(0).toUpperCase()}
              </div>
            }>
              <img
                src={user().avatar}
                alt={user().displayName}
                class="profile-avatar"
              />
            </Show>
            <div class="profile-info">
              <div class="profile-username">@{user().username}</div>
              <Show when={user().bio}>
                <div class="profile-bio">{user().bio}</div>
              </Show>
              <div class="profile-stats-inline">
                <Show when={profileUser()} fallback={
                  <>
                    <div class="stat-inline">
                      <span class="number">{userThreads().length}</span> threads
                    </div>
                    <div class="stat-inline">
                      <span class="number">{userReplies().length}</span> replies
                    </div>
                  </>
                }>
                  <div class="stat-inline">
                    <span class="number">{profileUser()!.stats.tracksShared}</span> shared
                  </div>
                  <div class="stat-inline">
                    <span class="number">{profileUser()!.stats.tracksLiked}</span> liked
                  </div>
                  <div class="stat-inline">
                    <span class="number">{profileUser()!.stats.tracksReplied}</span> replies
                  </div>
                </Show>
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
              {(thread) => {
                const track = thread.music && thread.music[0] ? thread.music[0] : null;

                return (
                  <Show when={track}>
                    <TrackCard
                      author={thread.author}
                      track={track!}
                      text={thread.text}
                      timestamp={thread.timestamp}
                      stats={thread.stats}
                      onPlay={(trackData) => {
                        setCurrentTrack(trackData);
                        setIsPlaying(true);
                      }}
                      onUsernameClick={(fid, e) => {
                        e.preventDefault();
                        navigate(`/profile/${fid}`);
                      }}
                    />
                  </Show>
                );
              }}
            </For>
          </Show>

          {/* Load More Button */}
          <Show when={nextCursor()}>
            <div style="text-align: center; padding: 20px;">
              <button
                class="filter-button"
                onClick={() => loadMoreThreads()}
                disabled={isLoading()}
              >
                {isLoading() ? 'Loading...' : 'Load More'}
              </button>
            </div>
          </Show>
        </div>
        </Show>
      </div>

      {/* Bottom Navigation */}
      <MobileNavigation class="pb-safe" />
    </div>
  );
};

export default ProfilePage;
