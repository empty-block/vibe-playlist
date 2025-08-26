import { Component, createSignal, For, Show, createMemo, onMount, createResource } from 'solid-js';
import { useParams } from '@solidjs/router';
import { Track } from '../stores/playlistStore';
import { currentUser } from '../stores/authStore';
import { pageEnter, staggeredFadeIn, buttonHover, slideIn, float, magnetic, counterAnimation } from '../utils/animations';
import { mockDataService, getUserByUsername } from '../data/mockData';

export type SortOption = 'recent' | 'likes' | 'comments';
export type FilterOption = 'shared' | 'conversations' | 'liked';

interface UserProfile {
  username: string;
  avatar: string;
  bio: string;
  songsCount: number;
  songsLiked: number;
  playlistsCreated: number;
  sharedTracks: Track[];
  likedTracks: Track[];
  repliedTracks: Track[];
}

const ProfilePage: Component = () => {
  const params = useParams();
  const [activeFilter, setActiveFilter] = createSignal<FilterOption>('shared');
  const [sortBy, setSortBy] = createSignal<SortOption>('recent');
  const [showShareInterface, setShowShareInterface] = createSignal(false);
  const [shareText, setShareText] = createSignal('');
  const [trackUrl, setTrackUrl] = createSignal('');
  const [isSharing, setIsSharing] = createSignal(false);
  let pageRef: HTMLDivElement;
  let shareTextareaRef: HTMLTextAreaElement;

  // Get the username from URL params, or use current user if none specified
  const username = () => params.username || currentUser().username;
  const isCurrentUser = () => !params.username || params.username === currentUser().username;
  
  // Get user profile data from centralized mock service using createResource
  const getUserProfile = async (username: string): Promise<UserProfile> => {
    try {
      // Get user data from our centralized service
      const user = await mockDataService.getUserByUsername(username);
      if (!user) {
        return {
          username,
          avatar: '👤',
          bio: 'Music enthusiast on JAMZY',
          songsCount: 0,
          songsLiked: 0,
          playlistsCreated: 0,
          sharedTracks: [],
          likedTracks: [],
          repliedTracks: []
        };
      }

      // Get user's tracks
      const userTracks = await mockDataService.getTracksByUser(username);
      
      // Split tracks into different categories for a more realistic profile
      // In a real app, this would be based on actual user interactions
      const sharedTracks = userTracks; // All their submissions
      
      // Get some tracks from other users that this user might have "liked"
      const allTracks = await mockDataService.getAllTracks();
      const otherUsersTracks = allTracks.filter(track => track.addedBy !== username);
      
      // Mock some liked tracks (tracks from other users they engaged with)
      const likedTracks = otherUsersTracks
        .sort(() => 0.5 - Math.random()) // Random shuffle
        .slice(0, Math.min(5, Math.floor(userTracks.length * 0.5))); // Up to 5 liked tracks
      
      // Mock some conversation tracks (tracks they replied to)
      const repliedTracks = otherUsersTracks
        .filter(track => !likedTracks.includes(track)) // Don't duplicate with liked
        .sort(() => 0.5 - Math.random()) // Random shuffle  
        .slice(0, Math.min(3, Math.floor(userTracks.length * 0.3))); // Up to 3 conversation tracks
      
      // Get user's playlists to count them
      const allPlaylists = await mockDataService.getPlaylists();
      const userPlaylists = allPlaylists.filter(p => p.createdBy === username);

      const profile = {
        username: user.username,
        avatar: user.avatar,
        bio: user.bio,
        songsCount: sharedTracks.length + likedTracks.length + repliedTracks.length, // Actual total track count
        songsLiked: likedTracks.length,
        playlistsCreated: userPlaylists.length,
        sharedTracks,
        likedTracks,
        repliedTracks
      };

      return profile;
    } catch (error) {
      console.error('Failed to load user profile:', error);
      return {
        username,
        avatar: '👤',
        bio: 'Music enthusiast on JAMZY',
        songsCount: 0,
        songsLiked: 0,
        playlistsCreated: 0,
        sharedTracks: [],
        likedTracks: [],
        repliedTracks: []
      };
    }
  };
  
  // Use createResource for proper async data loading in SolidJS
  const [userProfile] = createResource(username, getUserProfile);

  // Handle animations after component mounts
  onMount(() => {
    // Page entrance animation
    if (pageRef) {
      pageEnter(pageRef);
    }
    
    setTimeout(() => {
      // Animate profile avatar with floating effect
      const avatar = pageRef?.querySelector('.profile-avatar');
      if (avatar) {
        float(avatar as HTMLElement);
      }
      
      // Animate stats with counter animation
      const statsNumbers = pageRef?.querySelectorAll('.stat-number');
      statsNumbers?.forEach((stat, index) => {
        const targetNumber = parseInt(stat.textContent || '0');
        if (targetNumber > 0) {
          setTimeout(() => {
            counterAnimation(stat as HTMLElement, 0, targetNumber);
          }, index * 200);
        }
      });
      
      // Animate sections
      const sections = pageRef?.querySelectorAll('.profile-section');
      if (sections) {
        staggeredFadeIn(sections);
      }
    }, 300);
  });

  const getCurrentTracks = createMemo(() => {
    // Don't process tracks until profile is loaded
    const profile = userProfile();
    if (!profile) {
      return [];
    }

    let tracks: Track[] = [];
    
    // Filter tracks based on active filter
    switch (activeFilter()) {
      case 'shared':
        tracks = profile.sharedTracks;
        break;
      case 'conversations':
        tracks = profile.repliedTracks;
        break;
      case 'liked':
        tracks = profile.likedTracks;
        break;
    }

    // Sort tracks based on selected option
    const sortOption = sortBy();
    const sortedTracks = [...tracks].sort((a, b) => {
      switch (sortOption) {
        case 'recent':
          // Parse timestamp for sorting (assuming "X min ago" format)
          const getTimestamp = (timestamp: string) => {
            const match = timestamp.match(/(\d+)\s*(min|hour|day)/);
            if (!match) return 0;
            const value = parseInt(match[1]);
            const unit = match[2];
            if (unit === 'min') return value;
            if (unit === 'hour') return value * 60;
            if (unit === 'day') return value * 1440;
            return 0;
          };
          return getTimestamp(a.timestamp) - getTimestamp(b.timestamp);
        
        case 'likes':
          return b.likes - a.likes;
        
        case 'comments':
          return b.replies - a.replies;
        
        default:
          return 0;
      }
    });
    
    return sortedTracks;
  });

  const handleFilterChange = (filter: FilterOption) => {
    setActiveFilter(filter);
    // Animate track items when switching filters
    setTimeout(() => {
      const trackItems = pageRef?.querySelectorAll('.track-item');
      if (trackItems) {
        staggeredFadeIn(trackItems);
      }
    }, 100);
  };

  const handleQuickShare = async () => {
    if (!shareText().trim() && !trackUrl().trim()) return;
    
    setIsSharing(true);
    
    // Extract track ID from URL if provided
    const extractTrackId = (text: string): string => {
      const youtubeMatch = text.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
      if (youtubeMatch) return youtubeMatch[1];
      
      const spotifyMatch = text.match(/spotify\.com\/track\/([^?\s]+)/);
      if (spotifyMatch) return spotifyMatch[1];
      
      return 'demo-track-id';
    };
    
    // Simulate adding to library
    const newTrack: Track = {
      id: Date.now().toString(),
      title: 'New Track',
      artist: 'Artist',
      duration: '3:45',
      source: 'youtube' as const,
      sourceId: trackUrl() ? extractTrackId(trackUrl()) : 'demo-id',
      videoId: trackUrl() ? extractTrackId(trackUrl()) : 'demo-id',
      thumbnail: 'https://img.youtube.com/vi/demo-id/mqdefault.jpg',
      addedBy: currentUser().username,
      userAvatar: currentUser().avatar,
      timestamp: 'just now',
      comment: shareText(),
      likes: 0,
      replies: 0,
      recasts: 0
    };
    
    console.log('Adding track to library:', newTrack);
    
    // Reset form and close interface
    setTimeout(() => {
      setShareText('');
      setTrackUrl('');
      setShowShareInterface(false);
      setIsSharing(false);
      
      // Refresh the tracks list
      handleFilterChange(activeFilter());
    }, 1000);
  };

  return (
    <div 
      ref={pageRef!} 
      class="min-h-screen p-8 pb-20" 
      style={{ 
        opacity: '1',
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0a0a0a 100%)'
      }}
    >
      {/* Show loading state while profile is loading */}
      <Show 
        when={userProfile()}
        fallback={
          <div 
            class="profile-section relative p-6 mb-6 rounded-xl overflow-hidden"
            style={{ 
              opacity: '1',
              background: 'linear-gradient(145deg, #0a0a0a, #1a1a1a)',
              border: '1px solid rgba(249, 6, 214, 0.3)',
              'box-shadow': 'inset 0 0 20px rgba(0, 0, 0, 0.6)'
            }}
          >
            <div class="flex items-center justify-center py-12">
              <div 
                class="text-center"
                style={{
                  color: 'rgba(4, 202, 244, 0.5)',
                  'font-family': 'Courier New, monospace'
                }}
              >
                <i class="fas fa-spinner fa-spin text-4xl mb-4" style={{ color: 'rgba(4, 202, 244, 0.7)' }}></i>
                <p class="font-mono uppercase text-sm">LOADING PROFILE...</p>
              </div>
            </div>
          </div>
        }
      >
        {/* SIMPLIFIED PROFILE HEADER */}
        <div 
          class="profile-section relative p-6 mb-6 rounded-xl overflow-hidden"
          style={{ 
            opacity: '1',
            background: 'linear-gradient(145deg, #0a0a0a, #1a1a1a)',
            border: '1px solid rgba(249, 6, 214, 0.3)',
            'box-shadow': 'inset 0 0 20px rgba(0, 0, 0, 0.6)'
          }}
        >
          <div class="flex items-center gap-6">
            {/* Compact Avatar */}
            <div 
              class="profile-avatar text-5xl p-3 rounded-lg"
              style={{
                background: 'rgba(249, 6, 214, 0.1)',
                border: '2px solid rgba(249, 6, 214, 0.4)',
                'box-shadow': '0 0 20px rgba(249, 6, 214, 0.3)'
              }}
            >
              {userProfile()!.avatar}
            </div>
            
            <div class="flex-1">
              <div class="flex items-center justify-between">
                <div>
                  {/* Username with library label */}
                  <h2 
                    class="font-mono font-bold text-2xl mb-1"
                    style={{
                      color: '#f906d6',
                      'text-shadow': '0 0 8px rgba(249, 6, 214, 0.7)',
                      'font-family': 'Courier New, monospace'
                    }}
                  >
                    {isCurrentUser() ? 'My Library' : `${userProfile()!.username}'s Library`}
                  </h2>
                  
                  {/* Compact bio */}
                  <p 
                    class="font-mono text-sm"
                    style={{
                      color: 'rgba(255, 255, 255, 0.7)',
                      'font-family': 'Courier New, monospace'
                    }}
                  >
                    {userProfile()!.bio}
                  </p>
                </div>
                
                {/* Compact stats */}
                <div class="flex items-center gap-4 mt-3">
                  <span class="font-mono text-xs" style={{ color: '#00f92a' }}>
                    <span class="font-bold">{userProfile()!.songsCount}</span> tracks
                  </span>
                  <span class="font-mono text-xs" style={{ color: '#04caf4' }}>
                    <span class="font-bold">{userProfile()!.repliedTracks.length}</span> conversations
                  </span>
                  <span class="font-mono text-xs" style={{ color: '#ff9b00' }}>
                    <span class="font-bold">{userProfile()!.playlistsCreated}</span> collections
                  </span>
                </div>
              </div>
              
              {/* Action buttons */}
              <div class="flex items-center gap-2">
                <Show when={isCurrentUser()}>
                  <button 
                    onClick={() => setShowShareInterface(!showShareInterface())}
                    class="px-4 py-2 font-mono font-bold text-xs uppercase transition-all duration-300 rounded"
                    style={{
                      background: showShareInterface() ? 'rgba(0, 249, 42, 0.2)' : 'linear-gradient(145deg, #2a2a2a, #1a1a1a)',
                      border: '2px solid rgba(0, 249, 42, 0.4)',
                      color: '#00f92a',
                      'font-family': 'Courier New, monospace'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#00f92a';
                      e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 249, 42, 0.8)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(0, 249, 42, 0.4)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <i class={`fas fa-${showShareInterface() ? 'times' : 'plus'} mr-2`}></i>
                    {showShareInterface() ? 'CANCEL' : 'ADD TRACK'}
                  </button>
                </Show>
                
                <Show when={!isCurrentUser()}>
                  <button 
                    class="px-4 py-2 font-mono font-bold text-xs uppercase transition-all duration-300 rounded"
                    style={{
                      background: 'linear-gradient(145deg, #2a2a2a, #1a1a1a)',
                      border: '2px solid rgba(0, 249, 42, 0.4)',
                      color: '#00f92a',
                      'font-family': 'Courier New, monospace'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#00f92a';
                      e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 249, 42, 0.8)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(0, 249, 42, 0.4)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <i class="fas fa-user-plus mr-2"></i>FOLLOW
                  </button>
                </Show>
              </div>
            </div>
          </div>
        </div>

        {/* SHARE INTERFACE - Only for own library */}
        <Show when={isCurrentUser() && showShareInterface()}>
          <div 
            class="profile-section relative p-6 mb-6 rounded-xl overflow-hidden"
            style={{ 
              opacity: '1',
              background: 'linear-gradient(145deg, #0a0a0a, #1a1a1a)',
              border: '2px solid rgba(0, 249, 42, 0.4)',
              'box-shadow': '0 0 30px rgba(0, 249, 42, 0.3)'
            }}
          >
            <div class="space-y-4">
              <textarea
                ref={shareTextareaRef!}
                value={shareText()}
                onInput={(e) => setShareText(e.currentTarget.value)}
                placeholder="What are you listening to? Share a thought, mood, or just drop a track..."
                class="w-full bg-transparent text-white placeholder-gray-500 resize-none outline-none font-mono text-sm"
                rows="3"
                style={{ 'font-family': 'Courier New, monospace' }}
              />
              
              <div class="flex gap-3">
                <input
                  type="text"
                  value={trackUrl()}
                  onInput={(e) => setTrackUrl(e.currentTarget.value)}
                  placeholder="Paste track URL (YouTube, Spotify, SoundCloud)"
                  class="flex-1 bg-black/50 text-white px-3 py-2 rounded border border-gray-700 focus:border-green-500 outline-none font-mono text-xs"
                  style={{ 'font-family': 'Courier New, monospace' }}
                />
                
                <button
                  onClick={handleQuickShare}
                  disabled={(!shareText().trim() && !trackUrl().trim()) || isSharing()}
                  class="px-6 py-2 font-mono font-bold text-xs uppercase transition-all duration-300 rounded disabled:opacity-50"
                  style={{
                    background: 'linear-gradient(135deg, #00f92a 0%, #04caf4 100%)',
                    color: 'black',
                    'font-family': 'Courier New, monospace'
                  }}
                >
                  {isSharing() ? 'ADDING...' : 'ADD TO LIBRARY'}
                </button>
              </div>
            </div>
          </div>
        </Show>

        {/* FILTER BAR - Mobile-friendly horizontal scroll */}
        <div 
          class="profile-section relative mb-6 p-4 rounded-xl overflow-x-auto"
          style={{ 
            opacity: '1',
            background: 'linear-gradient(145deg, #0a0a0a, #1a1a1a)',
            border: '1px solid rgba(4, 202, 244, 0.3)',
            'box-shadow': 'inset 0 0 15px rgba(0, 0, 0, 0.8)'
          }}
        >
          <div class="flex items-center justify-between gap-4 min-w-max">
            <div class="flex gap-2">
              <button
                onClick={() => handleFilterChange('shared')}
                class="px-4 py-2 font-mono text-xs uppercase transition-all duration-300 rounded whitespace-nowrap"
                style={{
                  background: activeFilter() === 'shared' ? 'rgba(0, 249, 42, 0.2)' : 'transparent',
                  border: `1px solid ${activeFilter() === 'shared' ? '#00f92a' : 'rgba(4, 202, 244, 0.3)'}`,
                  color: activeFilter() === 'shared' ? '#00f92a' : 'rgba(255, 255, 255, 0.6)',
                  'font-family': 'Courier New, monospace'
                }}
              >
                SHARED ({userProfile()!.sharedTracks.length})
              </button>
              
              <button
                onClick={() => handleFilterChange('conversations')}
                class="px-4 py-2 font-mono text-xs uppercase transition-all duration-300 rounded whitespace-nowrap"
                style={{
                  background: activeFilter() === 'conversations' ? 'rgba(249, 6, 214, 0.2)' : 'transparent',
                  border: `1px solid ${activeFilter() === 'conversations' ? '#f906d6' : 'rgba(4, 202, 244, 0.3)'}`,
                  color: activeFilter() === 'conversations' ? '#f906d6' : 'rgba(255, 255, 255, 0.6)',
                  'font-family': 'Courier New, monospace'
                }}
              >
                CONVERSATIONS ({userProfile()!.repliedTracks.length})
              </button>
              
              <button
                onClick={() => handleFilterChange('liked')}
                class="px-4 py-2 font-mono text-xs uppercase transition-all duration-300 rounded whitespace-nowrap"
                style={{
                  background: activeFilter() === 'liked' ? 'rgba(4, 202, 244, 0.2)' : 'transparent',
                  border: `1px solid ${activeFilter() === 'liked' ? '#04caf4' : 'rgba(4, 202, 244, 0.3)'}`,
                  color: activeFilter() === 'liked' ? '#04caf4' : 'rgba(255, 255, 255, 0.6)',
                  'font-family': 'Courier New, monospace'
                }}
              >
                <i class="fas fa-heart mr-1"></i>LIKED
              </button>
            </div>
            
            <select
              value={sortBy()}
              onChange={(e) => setSortBy(e.currentTarget.value as SortOption)}
              class="px-3 py-1 font-mono text-xs rounded transition-all duration-300"
              style={{
                background: 'rgba(0, 0, 0, 0.8)',
                border: '1px solid rgba(4, 202, 244, 0.4)',
                color: '#04caf4',
                'font-family': 'Courier New, monospace'
              }}
            >
              <option value="recent">RECENT</option>
              <option value="likes">POPULAR</option>
              <option value="comments">ACTIVE</option>
            </select>
          </div>
        </div>

        {/* TRACK LIST */}
        <div 
          class="profile-section relative p-6 rounded-xl overflow-hidden"
          style={{ 
            opacity: '1',
            background: 'linear-gradient(145deg, #0a0a0a, #1a1a1a)',
            border: '1px solid rgba(4, 202, 244, 0.2)',
            'box-shadow': 'inset 0 0 15px rgba(0, 0, 0, 0.8)'
          }}
        >        
          <Show 
            when={getCurrentTracks().length > 0} 
            fallback={
              <div 
                class="text-center py-12"
                style={{
                  color: 'rgba(4, 202, 244, 0.5)',
                  'font-family': 'Courier New, monospace'
                }}
              >
                <Show 
                  when={isCurrentUser() && activeFilter() === 'shared'}
                  fallback={
                    <>
                      <i class="fas fa-music text-4xl mb-4" style={{ color: 'rgba(4, 202, 244, 0.3)' }}></i>
                      <p class="font-mono uppercase text-sm mb-2">NO TRACKS IN THIS FILTER</p>
                      <p class="font-mono text-xs opacity-60">Try a different filter or check back later</p>
                    </>
                  }
                >
                  <i class="fas fa-plus-circle text-4xl mb-4" style={{ color: 'rgba(0, 249, 42, 0.3)' }}></i>
                  <p class="font-mono uppercase text-sm mb-2">YOUR LIBRARY IS EMPTY</p>
                  <p class="font-mono text-xs opacity-60 mb-4">Start building your music library</p>
                  <button
                    onClick={() => setShowShareInterface(true)}
                    class="px-6 py-2 font-mono font-bold text-xs uppercase transition-all duration-300 rounded"
                    style={{
                      background: 'linear-gradient(135deg, #00f92a 0%, #04caf4 100%)',
                      color: 'black',
                      'font-family': 'Courier New, monospace'
                    }}
                  >
                    ADD YOUR FIRST TRACK
                  </button>
                </Show>
              </div>
            }
          >
            <div class="space-y-4">
              <For each={getCurrentTracks()}>
                {(track) => (
                  <div 
                    class="track-item relative p-4 rounded transition-all duration-300 cursor-pointer"
                    style={{ 
                      opacity: '1',
                      background: 'rgba(4, 202, 244, 0.05)',
                      border: '1px solid rgba(4, 202, 244, 0.2)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(4, 202, 244, 0.1)';
                      e.currentTarget.style.borderColor = 'rgba(4, 202, 244, 0.4)';
                      e.currentTarget.style.transform = 'translateX(4px)';
                      e.currentTarget.style.boxShadow = '0 0 15px rgba(4, 202, 244, 0.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(4, 202, 244, 0.05)';
                      e.currentTarget.style.borderColor = 'rgba(4, 202, 244, 0.2)';
                      e.currentTarget.style.transform = 'translateX(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div class="flex items-start gap-4">
                      {/* Thumbnail with neon border */}
                      <div 
                        class="relative overflow-hidden rounded"
                        style={{
                          border: '1px solid rgba(0, 249, 42, 0.3)',
                          'box-shadow': '0 0 10px rgba(0, 249, 42, 0.2)'
                        }}
                      >
                        <img 
                          src={track.thumbnail} 
                          alt={track.title}
                          class="w-20 h-20 object-cover"
                        />
                      </div>
                      
                      <div class="flex-1">
                        <div class="flex justify-between items-start mb-3">
                          <div>
                            <h3 
                              class="font-mono font-bold text-base mb-1"
                              style={{
                                color: '#00f92a',
                                'text-shadow': '0 0 3px rgba(0, 249, 42, 0.4)',
                                'font-family': 'Courier New, monospace'
                              }}
                            >
                              {track.title}
                            </h3>
                            <p 
                              class="font-mono text-xs"
                              style={{
                                color: 'rgba(255, 255, 255, 0.6)',
                                'font-family': 'Courier New, monospace'
                              }}
                            >
                              {track.artist} • {track.duration}
                            </p>
                          </div>
                          <button 
                            class="px-4 py-2 font-mono font-bold text-xs uppercase transition-all duration-300 rounded"
                            style={{
                              background: 'linear-gradient(145deg, #2a2a2a, #1a1a1a)',
                              border: '1px solid rgba(0, 249, 42, 0.4)',
                              color: '#00f92a',
                              'font-family': 'Courier New, monospace'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.borderColor = '#00f92a';
                              e.currentTarget.style.boxShadow = '0 0 15px rgba(0, 249, 42, 0.6)';
                              e.currentTarget.style.textShadow = '0 0 5px rgba(0, 249, 42, 0.8)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.borderColor = 'rgba(0, 249, 42, 0.4)';
                              e.currentTarget.style.boxShadow = 'none';
                              e.currentTarget.style.textShadow = 'none';
                            }}
                          >
                            <i class="fas fa-play mr-1"></i>PLAY
                          </button>
                        </div>
                        
                        {/* Metadata */}
                        <div 
                          class="flex items-center gap-3 text-xs mb-3"
                          style={{
                            color: 'rgba(4, 202, 244, 0.6)',
                            'font-family': 'Courier New, monospace'
                          }}
                        >
                          <span class="flex items-center gap-1">
                            <span class="text-base">{track.userAvatar}</span>
                            {track.addedBy}
                          </span>
                          <span>•</span>
                          <span>{track.timestamp}</span>
                          <Show when={track.isConversation}>
                            <span style={{ color: '#f906d6' }}>• CONVERSATION</span>
                          </Show>
                          <Show when={track.isLiked}>
                            <span style={{ color: '#04caf4' }}>• LIKED</span>
                          </Show>
                          <Show when={!track.isConversation && !track.isLiked}>
                            <span style={{ color: '#00f92a' }}>• SHARED</span>
                          </Show>
                        </div>
                        
                        {/* Comment */}
                        <p 
                          class="font-mono text-sm mb-3"
                          style={{
                            color: 'rgba(255, 255, 255, 0.7)',
                            'font-family': 'Courier New, monospace'
                          }}
                        >
                          {track.comment}
                        </p>
                        
                        {/* Interaction Stats */}
                        <div class="flex gap-6 text-xs font-mono">
                          <span 
                            class="flex items-center gap-2"
                            style={{
                              color: '#f906d6',
                              'text-shadow': '0 0 3px rgba(249, 6, 214, 0.4)',
                              'font-family': 'Courier New, monospace'
                            }}
                          >
                            <i class="fas fa-heart"></i>
                            {track.likes}
                          </span>
                          <span 
                            class="flex items-center gap-2"
                            style={{
                              color: '#04caf4',
                              'text-shadow': '0 0 3px rgba(4, 202, 244, 0.4)',
                              'font-family': 'Courier New, monospace'
                            }}
                          >
                            <i class="fas fa-comment"></i>
                            {track.replies}
                          </span>
                          <span 
                            class="flex items-center gap-2"
                            style={{
                              color: '#00f92a',
                              'text-shadow': '0 0 3px rgba(0, 249, 42, 0.4)',
                              'font-family': 'Courier New, monospace'
                            }}
                          >
                            <i class="fas fa-retweet"></i>
                            {track.recasts}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </For>
            </div>
          </Show>
        </div>
      </Show>
    </div>
  );
};

export default ProfilePage;