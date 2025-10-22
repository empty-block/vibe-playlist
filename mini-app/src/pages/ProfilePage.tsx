import { Component, createSignal, createMemo, For, Show, onMount } from 'solid-js';
import { useParams, useNavigate } from '@solidjs/router';
import MobileNavigation from '../components/layout/MobileNavigation/MobileNavigation';
import RetroWindow from '../components/common/RetroWindow';
import { TrackCard } from '../components/common/TrackCard/NEW';
import { currentUser } from '../stores/authStore';
import { setCurrentTrack, setIsPlaying, Track, currentTrack, isPlaying, playTrackFromFeed, TrackSource } from '../stores/playerStore';
import {
  profileUser,
  activity,
  isLoading,
  error,
  nextCursor,
  loadUserProfile,
  loadMoreActivity
} from '../stores/profileStore';
import './profilePage.css';

type FilterType = 'all' | 'shared' | 'likes' | 'replies';

const ProfilePage: Component = () => {
  const params = useParams();
  const navigate = useNavigate();
  const [currentFilter, setCurrentFilter] = createSignal<FilterType>('all');

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

  // Separate activity by type
  const sharedTracks = createMemo(() =>
    activity().filter(a =>
      a.type === 'AUTHORED' &&
      a.cast.music &&
      a.cast.music.length > 0 &&
      !a.cast.text.startsWith('@')
    )
  );

  const likedTracks = createMemo(() =>
    activity().filter(a =>
      a.type === 'LIKED' &&
      a.cast.music &&
      a.cast.music.length > 0
    )
  );

  const repliedTracks = createMemo(() =>
    activity().filter(a =>
      a.type === 'AUTHORED' &&
      a.cast.music &&
      a.cast.music.length > 0 &&
      a.cast.text.startsWith('@')
    )
  );

  // Filtered content based on current filter
  const filteredContent = createMemo(() => {
    const filter = currentFilter();

    if (filter === 'shared') {
      return sharedTracks();
    }

    if (filter === 'likes') {
      return likedTracks();
    }

    if (filter === 'replies') {
      return repliedTracks();
    }

    // 'all' - all activity sorted by timestamp
    return activity().filter(a => a.cast.music && a.cast.music.length > 0);
  });

  // Convert filtered activity to Track array for playlist context
  const getProfileTracks = (): Track[] => {
    return filteredContent()
      .filter(a => a.cast.music && a.cast.music[0])
      .map(a => {
        const music = a.cast.music[0];
        return {
          id: music.id,
          title: music.title,
          artist: music.artist,
          thumbnail: music.thumbnail,
          source: music.platform as TrackSource,
          sourceId: music.platformId,
          url: music.url,
          addedBy: a.cast.author.username,
          userFid: a.cast.author.fid,
          userAvatar: a.cast.author.pfpUrl,
          timestamp: a.cast.timestamp,
          comment: a.cast.text,
          likes: a.cast.stats.likes,
          replies: a.cast.stats.replies,
          recasts: a.cast.stats.recasts,
          duration: '',
        } as Track;
      });
  };

  // Track actions with proper playlist context
  const playTrack = (track: Track) => {
    const profileTracks = getProfileTracks();
    const feedId = `profile-${userFid()}-${currentFilter()}`;
    playTrackFromFeed(track, profileTracks, feedId);
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
      case 'shared':
        return "You haven't shared any tracks yet. Share a track to create your first post!";
      case 'likes':
        return "You haven't liked any tracks yet. Like tracks to save them here!";
      case 'replies':
        return "You haven't replied to any threads yet. Join the conversation by adding your tracks!";
      case 'all':
        return "Start exploring! Share tracks, like music, or reply to threads to build your profile.";
    }
  };

  // Compute counts (only items with music that will be displayed)
  const allCount = createMemo(() => activity().filter(a => a.cast.music && a.cast.music.length > 0).length);
  const sharedCount = createMemo(() => sharedTracks().length);
  const likesCount = createMemo(() => likedTracks().length);
  const repliesCount = createMemo(() => repliedTracks().length);

  const getFilterLabel = (filter: FilterType) => {
    switch (filter) {
      case 'all':
        return `📋 All (${allCount()})`;
      case 'shared':
        return `📤 Shared (${sharedCount()})`;
      case 'likes':
        return `♥ Likes (${likesCount()})`;
      case 'replies':
        return `💬 Replies (${repliesCount()})`;
    }
  };

  return (
    <div class="profile-page">
      <div class="page-window-container">
        <RetroWindow
          title={`${user().displayName} (@${user().username})`}
          icon={<div class="title-icon">👤</div>}
          variant="3d"
          showMinimize={true}
          showMaximize={true}
          showClose={true}
          onClose={() => navigate('/trending')}
          contentPadding="0"
          footer={
            <div class="status-bar">
              <span class="status-bar-section">
                {sharedCount()} shared • {likesCount()} liked • {repliesCount()} replies
              </span>
            </div>
          }
        >
          <div class="profile-content">
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
                          <span class="number">{sharedTracks().length}</span> shared
                        </div>
                        <div class="stat-inline">
                          <span class="number">{likedTracks().length}</span> liked
                        </div>
                        <div class="stat-inline">
                          <span class="number">{repliedTracks().length}</span> replies
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
                  class={`filter-button ${currentFilter() === 'all' ? 'active' : ''}`}
                  onClick={() => setCurrentFilter('all')}
                >
                  {getFilterLabel('all')}
                </button>
                <button
                  class={`filter-button ${currentFilter() === 'shared' ? 'active' : ''}`}
                  onClick={() => setCurrentFilter('shared')}
                >
                  {getFilterLabel('shared')}
                </button>
                <button
                  class={`filter-button ${currentFilter() === 'likes' ? 'active' : ''}`}
                  onClick={() => setCurrentFilter('likes')}
                >
                  {getFilterLabel('likes')}
                </button>
                <button
                  class={`filter-button ${currentFilter() === 'replies' ? 'active' : ''}`}
                  onClick={() => setCurrentFilter('replies')}
                >
                  {getFilterLabel('replies')}
                </button>
              </div>

              {/* Track Feed */}
              <div class="track-feed">
                <div class="feed-header">
                  📤 Showing: <span class="feed-type">
                    {currentFilter() === 'all' ? 'All Activity' :
                     currentFilter() === 'shared' ? 'Shared Tracks' :
                     currentFilter() === 'likes' ? 'Liked Tracks' : 'Replies'}
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
                    {(activityItem) => {
                      const track = activityItem.cast.music && activityItem.cast.music[0] ? activityItem.cast.music[0] : null;

                      return (
                        <Show when={track}>
                          <TrackCard
                            author={activityItem.cast.author}
                            track={track!}
                            text={activityItem.cast.text}
                            timestamp={activityItem.cast.timestamp}
                            stats={activityItem.cast.stats}
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
                      onClick={() => loadMoreActivity()}
                      disabled={isLoading()}
                    >
                      {isLoading() ? 'Loading...' : 'Load More'}
                    </button>
                  </div>
                </Show>
              </div>
            </Show>
          </div>
        </RetroWindow>
      </div>

      {/* Bottom Navigation */}
      <MobileNavigation class="pb-safe" />
    </div>
  );
};

export default ProfilePage;
