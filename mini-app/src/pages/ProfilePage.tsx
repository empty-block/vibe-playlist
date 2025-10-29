import { Component, createSignal, createMemo, For, Show, onMount } from 'solid-js';
import { useParams, useNavigate } from '@solidjs/router';
import MobileNavigation from '../components/layout/MobileNavigation/MobileNavigation';
import RetroWindow from '../components/common/RetroWindow';
import { TrackCard } from '../components/common/TrackCard/NEW';
import AddTrackModal from '../components/library/AddTrackModal';
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
import { createThread } from '../services/api';
import './profilePage.css';

type FilterType = 'all' | 'shared' | 'likes' | 'replies';

const ProfilePage: Component = () => {
  const params = useParams();
  const navigate = useNavigate();
  const [currentFilter, setCurrentFilter] = createSignal<FilterType>('all');
  const [showAddTrackModal, setShowAddTrackModal] = createSignal(false);
  const [isSubmitting, setIsSubmitting] = createSignal(false);
  const [submitError, setSubmitError] = createSignal<string | null>(null);

  // Get FID from route params or use current user's FID
  const userFid = () => params.fid || currentUser()?.fid || '';

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
    // Fallback to current user while loading
    const curr = currentUser();
    return curr || {
      fid: '',
      username: 'unknown',
      displayName: 'Loading...',
      avatar: null,
      bio: undefined
    };
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

  // Handle opening the add track modal
  const handleShareTrack = () => {
    setSubmitError(null);
    setShowAddTrackModal(true);
  };

  // Handle track submission
  const handleTrackSubmit = async (data: { songUrl: string; comment: string }) => {
    const user = currentUser();
    if (!user) {
      setSubmitError('User not authenticated');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Create thread with the track
      const response = await createThread({
        text: data.comment || 'Check out this track! 🎵',
        userId: user.fid,
        trackUrls: [data.songUrl]
      });

      console.log('Track shared successfully:', response);

      // Close modal
      setShowAddTrackModal(false);

      // Reload profile to show new post
      loadUserProfile(userFid());
    } catch (error) {
      console.error('Error sharing track:', error);
      setSubmitError(error instanceof Error ? error.message : 'Failed to share track');
    } finally {
      setIsSubmitting(false);
    }
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

  // Reactive title for the window
  const windowTitle = () => {
    const u = user();
    return `${u.displayName || 'Loading...'} (@${u.username || '...'})`;
  };

  return (
    <div class="profile-page">
      <div class="page-window-container">
        <RetroWindow
          title={windowTitle()}
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

                {/* Share Track Button - Only show on current user's profile */}
                <Show when={currentUser() && userFid() === currentUser()?.fid}>
                  <button
                    class="share-track-button"
                    onClick={handleShareTrack}
                    title="Share a track"
                  >
                    <span class="button-bracket">[</span>
                    <span class="button-icon">+</span>
                    <span class="button-text">SHARE TRACK</span>
                    <span class="button-bracket">]</span>
                  </button>
                </Show>
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

                              // For YouTube tracks in WebView, don't autoplay
                              if (trackData.source !== 'youtube') {
                                setIsPlaying(true);
                              } else {
                                setIsPlaying(false);
                              }
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

      {/* Add Track Modal */}
      <AddTrackModal
        isOpen={showAddTrackModal()}
        onClose={() => setShowAddTrackModal(false)}
        onSubmit={handleTrackSubmit}
        title="Share Track to Feed"
      />

      {/* Error Display (if any) */}
      <Show when={submitError()}>
        <div class="submit-error-toast">
          {submitError()}
        </div>
      </Show>
    </div>
  );
};

export default ProfilePage;
