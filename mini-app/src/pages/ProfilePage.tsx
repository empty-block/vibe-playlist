import { Component, createSignal, createMemo, createEffect, For, Show, onMount } from 'solid-js';
import { useParams, useNavigate } from '@solidjs/router';
import MobileNavigation from '../components/layout/MobileNavigation/MobileNavigation';
import RetroWindow from '../components/common/RetroWindow';
import { TrackCard } from '../components/common/TrackCard/NEW';
import { ChannelFilterBar } from '../components/channels/ChannelFilterBar';
import AddTrackModal from '../components/library/AddTrackModal';
import { currentUser } from '../stores/authStore';
import { theme, toggleTheme } from '../stores/themeStore';
import { setCurrentTrack, setIsPlaying, Track, currentTrack, isPlaying, playTrackWithAuthCheck, TrackSource } from '../stores/playerStore';
import {
  profileUser,
  activity,
  isLoading,
  error,
  nextCursor,
  loadUserProfile,
  loadMoreActivity
} from '../stores/profileStore';
import { useInfiniteScroll } from '../utils/useInfiniteScroll';
import { trackProfileViewed, trackSortChanged, trackFilterToggled } from '../utils/analytics';
import type { ChannelFeedSortOption, MusicPlatform } from '../../../shared/types/channels';
import './profilePage.css';

type FilterType = 'all' | 'shared' | 'likes' | 'replies';

const ProfilePage: Component = () => {
  const params = useParams();
  const navigate = useNavigate();
  const [currentFilter, setCurrentFilter] = createSignal<FilterType>('all');
  const [showAddTrackModal, setShowAddTrackModal] = createSignal(false);
  const [isSubmitting, setIsSubmitting] = createSignal(false);
  const [submitError, setSubmitError] = createSignal<string | null>(null);
  const [windowMinimized, setWindowMinimized] = createSignal(false);
  const [windowMaximized, setWindowMaximized] = createSignal(false);
  const [filterDropdownOpen, setFilterDropdownOpen] = createSignal(false);

  // Sort and filter state for ChannelFilterBar
  const [activeSort, setActiveSort] = createSignal<ChannelFeedSortOption>('recent');
  const [qualityFilter, setQualityFilter] = createSignal<number>(0);
  const [musicSources, setMusicSources] = createSignal<MusicPlatform[]>([]);
  const [genres, setGenres] = createSignal<string[]>([]);
  const [filterDialogOpen, setFilterDialogOpen] = createSignal(false);

  // Available filter options
  const availablePlatforms: MusicPlatform[] = ['spotify', 'youtube', 'apple_music', 'soundcloud', 'songlink', 'audius'];
  const availableGenres = ['hip-hop', 'electronic', 'rock', 'jazz', 'classical', 'metal', 'indie', 'folk', 'r&b', 'pop'];

  // Sentinel element for infinite scroll
  let sentinelRef: HTMLDivElement | undefined;

  // Get FID from route params or use current user's FID
  const userFid = () => {
    const fid = params.fid || currentUser()?.fid || '';
    console.log('[ProfilePage] userFid computed:', {
      paramsFid: params.fid,
      currentUserFid: currentUser()?.fid,
      currentUserUsername: currentUser()?.username,
      resultFid: fid
    });
    return fid;
  };

  // Load profile data on mount, but only if we have a valid FID
  onMount(() => {
    const fid = userFid();
    if (fid) {
      loadUserProfile(fid);

      // Track profile view
      const user = profileUser();
      trackProfileViewed(fid, user?.username, 'navigation');
    } else {
      console.log('[ProfilePage] Waiting for currentUser FID to be available...');
      // Set error to show loading state or message
      // We'll use a createEffect to watch for when currentUser becomes available
    }
  });

  // Watch for when currentUser becomes available (for /profile route without FID)
  createEffect(() => {
    const fid = userFid();
    const profile = profileUser();

    // If we don't have a FID param but now have a currentUser, load the profile
    if (!params.fid && fid && !profile && !isLoading()) {
      console.log('[ProfilePage] currentUser FID now available, loading profile:', fid);
      loadUserProfile(fid);
    }
  });

  // Get user display info
  const user = createMemo(() => {
    const profile = profileUser();
    if (profile && profile.user && profile.user.username) {
      return {
        fid: profile.user.fid,
        username: profile.user.username,
        displayName: profile.user.displayName || profile.user.username || 'User',
        avatar: profile.user.avatar || null,
        bio: undefined // Will add later when we have bio in DB
      };
    }
    // Show loading state while profile is being fetched
    return {
      fid: '',
      username: 'loading',
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

    let content;
    if (filter === 'shared') {
      content = sharedTracks();
    } else if (filter === 'likes') {
      content = likedTracks();
    } else if (filter === 'replies') {
      content = repliedTracks();
    } else {
      // 'all' - all activity sorted by timestamp
      content = activity().filter(a => a.cast.music && a.cast.music.length > 0);
    }

    // Filter out songlink and apple_music tracks
    return content.filter(a => {
      if (!a.cast.music || a.cast.music.length === 0) return true;
      const platform = a.cast.music[0].platform;
      return platform !== 'songlink' && platform !== 'apple_music';
    });
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
    playTrackWithAuthCheck(track, profileTracks, feedId);
  };

  // Handle sort change
  const handleSortChange = (newSort: ChannelFeedSortOption) => {
    trackSortChanged(newSort, 'profile');
    setActiveSort(newSort);
    // Note: Profile page data is already loaded, this is just for UI state
    // If we wanted to apply actual sorting, we'd need to implement it in filteredContent
  };

  // Handle opening the add track modal
  const handleShareTrack = () => {
    setSubmitError(null);
    setShowAddTrackModal(true);
  };

  // Handle track submission using native Farcaster composer
  const handleTrackSubmit = async (data: { songUrl: string; comment: string }) => {
    const user = currentUser();
    if (!user) {
      setSubmitError('User not authenticated');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Import SDK dynamically
      const { default: sdk } = await import('@farcaster/miniapp-sdk');

      // Open native Farcaster composer with pre-filled data
      const result = await sdk.actions.composeCast({
        text: data.comment || 'Check out this track! 🎵',
        embeds: [data.songUrl],
        channelKey: 'music' // Post to music channel (jamzy channel coming soon!)
      });

      console.log('[ProfilePage] Compose cast result:', result);

      if (result?.cast) {
        // User posted the cast successfully
        console.log('[ProfilePage] Cast posted with hash:', result.cast.hash);

        // TODO: Optionally send cast hash to backend to store in DB
        // This would let us track which casts came from our app

        // Close modal
        setShowAddTrackModal(false);

        // Reload profile to show new post (may take a moment to sync)
        setTimeout(() => {
          loadUserProfile(userFid());
        }, 2000);
      } else {
        // User cancelled the cast
        console.log('[ProfilePage] User cancelled the cast');
        setSubmitError('Cast was cancelled');
      }
    } catch (error) {
      console.error('[ProfilePage] Error opening composer:', error);
      setSubmitError(error instanceof Error ? error.message : 'Failed to open cast composer');
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

  // Setup infinite scroll
  const hasMore = createMemo(() => !!nextCursor());
  useInfiniteScroll(
    () => sentinelRef,
    hasMore,
    isLoading,
    () => loadMoreActivity()
  );

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

  // Static title for the window
  const windowTitle = 'Profile';

  // Menu items for hamburger dropdown
  const menuItems = [
    {
      label: () => `Theme: ${theme() === 'light' ? 'Light' : 'Dark'}`,
      icon: () => theme() === 'light' ? '☀️' : '🌙',
      onClick: () => toggleTheme()
    },
    {
      label: 'Feedback',
      icon: '💬',
      onClick: () => alert('Feedback form coming soon! For now, please share your thoughts in the /jamzy channel.')
    }
  ];

  // Show back button when viewing someone else's profile or when there's browser history
  const showBackButton = () => {
    // Check if we have a route parameter (viewing someone else's profile)
    if (params.fid) {
      return true;
    }
    // Otherwise, check if there's browser history to go back to
    return window.history.length > 1;
  };

  // Handle back navigation
  const handleBack = () => {
    // Try to go back in browser history
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      // Fallback to home if no history
      navigate('/');
    }
  };

  return (
    <div class="profile-page">
      <div class="page-window-container">
        <RetroWindow
          title={windowTitle}
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="image-rendering: pixelated;">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 20 C4 16 7.58 13 12 13 C16.42 13 20 16 20 20 L20 22 L4 22 Z" />
            </svg>
          }
          variant="3d"
          showBack={showBackButton()}
          onBack={handleBack}
          showMenu={true}
          menuItems={menuItems}
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
              {/* Compact Profile Header - Channel-style Layout */}
              <div class="profile-header">
                <div class="profile-main">
                  <div class="profile-avatar-container">
                    <Show when={user().avatar} fallback={
                      <div class="profile-avatar-fallback">
                        {(user().displayName || 'U').charAt(0).toUpperCase()}
                      </div>
                    }>
                      <img
                        src={user().avatar}
                        alt={user().displayName}
                        class="profile-avatar"
                      />
                    </Show>
                  </div>
                  <div class="profile-info">
                    <div class="profile-username">{user().displayName || user().username}</div>
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
              </div>

              {/* Activity Filter Dropdown */}
              <div class="activity-filter-dropdown-wrapper">
                <button
                  class="activity-filter-dropdown-btn"
                  onClick={() => setFilterDropdownOpen(!filterDropdownOpen())}
                >
                  <span class="filter-icon">📤</span>
                  <span class="filter-text">
                    Showing: <span class="filter-value">
                      {currentFilter() === 'all' ? 'All Activity' :
                       currentFilter() === 'shared' ? 'Shared Tracks' :
                       currentFilter() === 'likes' ? 'Liked Tracks' : 'Replies'}
                    </span>
                    <span class="filter-count"> ({filteredContent().length})</span>
                  </span>
                  <span class="chevron">{filterDropdownOpen() ? '▲' : '▼'}</span>
                </button>

                <Show when={filterDropdownOpen()}>
                  <div class="activity-filter-dropdown-menu">
                    <button
                      class={`filter-option ${currentFilter() === 'all' ? 'active' : ''}`}
                      onClick={() => {
                        setCurrentFilter('all');
                        setFilterDropdownOpen(false);
                      }}
                    >
                      <span class="option-label">📋 All Activity</span>
                      <span class="option-count">({allCount()})</span>
                    </button>
                    <button
                      class={`filter-option ${currentFilter() === 'shared' ? 'active' : ''}`}
                      onClick={() => {
                        setCurrentFilter('shared');
                        setFilterDropdownOpen(false);
                      }}
                    >
                      <span class="option-label">📤 Shared Tracks</span>
                      <span class="option-count">({sharedCount()})</span>
                    </button>
                    <button
                      class={`filter-option ${currentFilter() === 'likes' ? 'active' : ''}`}
                      onClick={() => {
                        setCurrentFilter('likes');
                        setFilterDropdownOpen(false);
                      }}
                    >
                      <span class="option-label">♥ Liked Tracks</span>
                      <span class="option-count">({likesCount()})</span>
                    </button>
                    <button
                      class={`filter-option ${currentFilter() === 'replies' ? 'active' : ''}`}
                      onClick={() => {
                        setCurrentFilter('replies');
                        setFilterDropdownOpen(false);
                      }}
                    >
                      <span class="option-label">💬 Replies</span>
                      <span class="option-count">({repliesCount()})</span>
                    </button>
                  </div>
                </Show>
              </div>

              {/* Track Feed */}
              <div class="track-feed">

                <Show when={filteredContent().length === 0}>
                  <div class="profile-empty-state">
                    <span class="empty-icon">🎵</span>
                    <p class="empty-message">{getEmptyMessage(currentFilter())}</p>
                  </div>
                </Show>

                <Show when={filteredContent().length > 0}>
                  <For each={filteredContent()}>
                    {(activityItem, index) => {
                      const track = activityItem.cast.music && activityItem.cast.music[0] ? activityItem.cast.music[0] : null;

                      // For liked tracks, use current user's info; for shared tracks, use cast author
                      const author = activityItem.type === 'LIKED'
                        ? {
                            fid: profileData()?.fid || '',
                            username: profileData()?.username || '',
                            pfpUrl: profileData()?.pfpUrl
                          }
                        : activityItem.cast.author;

                      return (
                        <Show when={track}>
                          <TrackCard
                            author={author}
                            track={track!}
                            text={activityItem.cast.text}
                            timestamp={activityItem.cast.timestamp}
                            stats={activityItem.cast.stats}
                            castHash={activityItem.cast.castHash}
                            onPlay={(trackData) => {
                              // TrackCard now passes user info in trackData
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
                            animationDelay={Math.min(index(), 20) * 50}
                          />
                        </Show>
                      );
                    }}
                  </For>
                </Show>

                {/* Sentinel element for infinite scroll */}
                <div ref={sentinelRef} style={{ height: '1px' }} />

                {/* Loading indicator when fetching more */}
                <Show when={isLoading()}>
                  <div class="loading-more">
                    <div class="loading-spinner">⟳</div>
                    <span>Loading more activity...</span>
                  </div>
                </Show>

                {/* End of feed message */}
                <Show when={!nextCursor() && activity().length > 0}>
                  <div class="end-of-feed">
                    <span>🎵 You've reached the end 🎵</span>
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
