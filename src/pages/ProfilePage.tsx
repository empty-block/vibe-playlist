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
  const [activityFilter, setActivityFilter] = createSignal<'shared' | 'liked' | 'replied'>('shared');
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
    
    // Filter tracks based on activity filter instead of old filter logic
    switch (activityFilter()) {
      case 'shared':
        tracks = profile.sharedTracks;
        break;
      case 'replied':
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

  const handleActivityChange = (activity: 'shared' | 'liked' | 'replied') => {
    setActivityFilter(activity);
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
      handleActivityChange(activityFilter());
    }, 1000);
  };

  return (
    <div 
      ref={pageRef!} 
      class="min-h-screen bg-black relative overflow-hidden"
    >
      {/* Cyberpunk Grid Background */}
      <div class="absolute inset-0 opacity-20">
        <div class="absolute inset-0" style="background-image: repeating-linear-gradient(0deg, transparent, transparent 30px, rgba(4, 202, 244, 0.1) 30px, rgba(4, 202, 244, 0.1) 32px);"></div>
        <div class="absolute inset-0" style="background-image: repeating-linear-gradient(90deg, transparent, transparent 30px, rgba(4, 202, 244, 0.1) 30px, rgba(4, 202, 244, 0.1) 32px);"></div>
      </div>

      <div class="relative z-10 max-w-[1400px] mx-auto p-8">
        
        {/* Show loading state while profile is loading */}
        <Show 
          when={userProfile()}
          fallback={
            <div 
              class="profile-section relative p-8 mb-8 bg-[#0d0d0d] border-2 border-[#04caf4]/30 overflow-hidden"
              style="box-shadow: inset 0 0 30px rgba(4, 202, 244, 0.1);"
            >
              <div class="flex items-center justify-center py-12">
                <div 
                  class="text-center text-[#04caf4]/50 font-mono"
                  style="font-family: 'JetBrains Mono', monospace;"
                >
                  <i class="fas fa-spinner fa-spin text-4xl mb-4 text-[#04caf4]/70"></i>
                  <p class="text-xs uppercase tracking-wider">LOADING PROFILE...</p>
                </div>
              </div>
            </div>
          }
        >
          {/* ZEN CYBERPUNK IDENTITY CARD HEADER */}
          <div 
            class="profile-section relative p-8 mb-8 bg-[#0d0d0d] border-2 border-[#04caf4]/30 overflow-hidden"
            style="box-shadow: inset 0 0 30px rgba(4, 202, 244, 0.1);"
          >
            {/* Terminal Header */}
            <div class="flex items-center justify-between mb-6">
              <div class="text-[#04caf4] text-xs uppercase tracking-wider font-mono" style="font-family: 'JetBrains Mono', monospace;">
                [IDENTITY_VERIFICATION]
              </div>
              <div class="flex items-center gap-3">
                <div class="w-2 h-2 bg-[#00f92a] animate-pulse"></div>
                <span class="text-[#00f92a] text-xs font-mono">AUTHENTICATED</span>
              </div>
            </div>

            {/* Scan Line Animation */}
            <div class="absolute inset-0 pointer-events-none">
              <div 
                class="w-full h-[1px] bg-gradient-to-r from-transparent via-[#04caf4] to-transparent opacity-60 animate-pulse"
                style="animation: scan 3s linear infinite; transform: translateY(0);"
              ></div>
            </div>

            {/* Identity Card Content */}
            <div class="flex items-center gap-6">
              {/* Large Profile Avatar */}
              <div 
                class="profile-avatar w-20 h-20 flex items-center justify-center text-6xl bg-[#04caf4]/10 border-2 border-[#04caf4] relative"
                style="box-shadow: 0 0 20px rgba(4, 202, 244, 0.3);"
              >
                {userProfile()!.avatar}
                {/* Corner accents */}
                <div class="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-[#04caf4]"></div>
                <div class="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-[#04caf4]"></div>
              </div>
              
              {/* Username Display */}
              <div class="flex-1">
                <h2 
                  class="text-2xl font-mono font-bold tracking-wider uppercase text-[#04caf4] mb-1"
                  style="font-family: 'JetBrains Mono', monospace; text-shadow: 0 0 10px rgba(4, 202, 244, 0.5);"
                >
                  {isCurrentUser() ? 'MY_LIBRARY' : `${userProfile()!.username.toUpperCase()}_LIBRARY`}
                </h2>
                
                {/* Terminal status line */}
                <div class="text-[#04caf4]/70 text-xs font-mono mt-2" style="font-family: 'JetBrains Mono', monospace;">
                  STATUS: ONLINE • ACCESS_LEVEL: {isCurrentUser() ? 'ADMIN' : 'GUEST'} • CONN: SECURE
                </div>
              </div>

              {/* Action Button (simplified) */}
              <Show when={isCurrentUser()}>
                <button 
                  onClick={() => setShowShareInterface(!showShareInterface())}
                  class="px-6 py-3 bg-[#00f92a]/10 border-2 border-[#00f92a] text-[#00f92a] text-xs font-mono font-bold uppercase tracking-wider transition-all duration-300 hover:bg-[#00f92a]/20"
                  style="font-family: 'JetBrains Mono', monospace; box-shadow: 0 0 10px rgba(0, 249, 42, 0.3);"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 249, 42, 0.6)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = '0 0 10px rgba(0, 249, 42, 0.3)';
                  }}
                >
                  <i class={`fas fa-${showShareInterface() ? 'times' : 'plus'} mr-2`}></i>
                  {showShareInterface() ? 'CANCEL' : 'ADD_TRACK'}
                </button>
              </Show>
            </div>
          </div>

          {/* SHARE INTERFACE - Only for own library */}
          <Show when={isCurrentUser() && showShareInterface()}>
            <div 
              class="profile-section relative p-6 mb-8 bg-[#0d0d0d] border-2 border-[#00f92a]/40 overflow-hidden"
              style="box-shadow: 0 0 30px rgba(0, 249, 42, 0.3);"
            >
              <div class="space-y-4">
                <textarea
                  ref={shareTextareaRef!}
                  value={shareText()}
                  onInput={(e) => setShareText(e.currentTarget.value)}
                  placeholder="What are you listening to? Share a thought, mood, or just drop a track..."
                  class="w-full bg-transparent text-white placeholder-gray-500 resize-none outline-none font-mono text-sm"
                  rows="3"
                  style="font-family: 'JetBrains Mono', monospace;"
                />
                
                <div class="flex gap-3">
                  <input
                    type="text"
                    value={trackUrl()}
                    onInput={(e) => setTrackUrl(e.currentTarget.value)}
                    placeholder="Paste track URL (YouTube, Spotify, SoundCloud)"
                    class="flex-1 bg-black/50 text-white px-3 py-2 border border-gray-700 focus:border-green-500 outline-none font-mono text-xs"
                    style="font-family: 'JetBrains Mono', monospace;"
                  />
                  
                  <button
                    onClick={handleQuickShare}
                    disabled={(!shareText().trim() && !trackUrl().trim()) || isSharing()}
                    class="px-6 py-2 bg-gradient-to-r from-[#00f92a] to-[#04caf4] text-black font-mono font-bold text-xs uppercase transition-all duration-300 disabled:opacity-50"
                    style="font-family: 'JetBrains Mono', monospace;"
                  >
                    {isSharing() ? 'ADDING...' : 'ADD_TO_LIBRARY'}
                  </button>
                </div>
              </div>
            </div>
          </Show>

          {/* TERMINAL FILTERS SECTION */}
          <div 
            class="profile-section relative mb-8 p-6 bg-[#0d0d0d] border-2 border-[#04caf4]/20 overflow-x-auto"
            style="box-shadow: inset 0 0 15px rgba(0, 0, 0, 0.8);"
          >
            <div class="flex items-center justify-between gap-6 min-w-max">
              {/* Activity Filter (New) */}
              <div class="flex items-center gap-2">
                <label class="text-[#f906d6] text-xs font-mono uppercase tracking-wider" style="font-family: 'JetBrains Mono', monospace;">
                  ACTIVITY:
                </label>
                <select
                  value={activityFilter()}
                  onChange={(e) => handleActivityChange(e.currentTarget.value as 'shared' | 'liked' | 'replied')}
                  class="px-3 py-2 bg-[#f906d6]/10 border border-[#f906d6] text-[#f906d6] text-xs font-mono uppercase tracking-wider focus:outline-none"
                  style="font-family: 'JetBrains Mono', monospace;"
                >
                  <option value="shared">SHARED</option>
                  <option value="liked">LIKED</option>
                  <option value="replied">REPLIED</option>
                </select>
              </div>
              
              {/* Sort Filter */}
              <div class="flex items-center gap-2">
                <label class="text-[#04caf4] text-xs font-mono uppercase tracking-wider" style="font-family: 'JetBrains Mono', monospace;">
                  SORT:
                </label>
                <select
                  value={sortBy()}
                  onChange={(e) => setSortBy(e.currentTarget.value as SortOption)}
                  class="px-3 py-2 bg-[#04caf4]/10 border border-[#04caf4] text-[#04caf4] text-xs font-mono uppercase tracking-wider focus:outline-none"
                  style="font-family: 'JetBrains Mono', monospace;"
                >
                  <option value="recent">RECENT</option>
                  <option value="likes">POPULAR</option>
                  <option value="comments">ACTIVE</option>
                </select>
              </div>
            </div>
          </div>

          {/* TRACK LIST */}
          <div 
            class="profile-section relative p-6 bg-[#0d0d0d] border-2 border-[#04caf4]/20 overflow-hidden"
            style="box-shadow: inset 0 0 15px rgba(0, 0, 0, 0.8);"
          >        
            <Show 
              when={getCurrentTracks().length > 0} 
              fallback={
                <div 
                  class="text-center py-12 text-[#04caf4]/50 font-mono"
                  style="font-family: 'JetBrains Mono', monospace;"
                >
                  <Show 
                    when={isCurrentUser() && activityFilter() === 'shared'}
                    fallback={
                      <>
                        <i class="fas fa-music text-4xl mb-4 text-[#04caf4]/30"></i>
                        <p class="text-sm uppercase tracking-wider mb-2">NO TRACKS IN THIS ACTIVITY</p>
                        <p class="text-xs opacity-60">Try a different activity filter</p>
                      </>
                    }
                  >
                    <i class="fas fa-plus-circle text-4xl mb-4 text-[#00f92a]/30"></i>
                    <p class="text-sm uppercase tracking-wider mb-2">YOUR LIBRARY IS EMPTY</p>
                    <p class="text-xs opacity-60 mb-4">Start building your music library</p>
                    <button
                      onClick={() => setShowShareInterface(true)}
                      class="px-6 py-2 bg-gradient-to-r from-[#00f92a] to-[#04caf4] text-black font-mono font-bold text-xs uppercase tracking-wider transition-all duration-300"
                      style="font-family: 'JetBrains Mono', monospace;"
                    >
                      ADD_YOUR_FIRST_TRACK
                    </button>
                  </Show>
                </div>
              }
            >
              <div class="space-y-4">
                <For each={getCurrentTracks()}>
                  {(track) => (
                    <div 
                      class="track-item relative p-4 bg-[#04caf4]/5 border border-[#04caf4]/20 transition-all duration-300 cursor-pointer hover:bg-[#04caf4]/10 hover:border-[#04caf4]/40 hover:translate-x-1"
                      style="box-shadow: 0 0 10px rgba(4, 202, 244, 0.1);"
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow = '0 0 15px rgba(4, 202, 244, 0.2)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = '0 0 10px rgba(4, 202, 244, 0.1)';
                      }}
                    >
                      <div class="flex items-start gap-4">
                        {/* Thumbnail with neon border */}
                        <div 
                          class="relative overflow-hidden border border-[#00f92a]/30"
                          style="box-shadow: 0 0 10px rgba(0, 249, 42, 0.2);"
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
                                class="font-mono font-bold text-base mb-1 text-[#00f92a]"
                                style="font-family: 'JetBrains Mono', monospace; text-shadow: 0 0 3px rgba(0, 249, 42, 0.4);"
                              >
                                {track.title}
                              </h3>
                              <p 
                                class="font-mono text-xs text-white/60"
                                style="font-family: 'JetBrains Mono', monospace;"
                              >
                                {track.artist} • {track.duration}
                              </p>
                            </div>
                            <button 
                              class="px-4 py-2 bg-[#2a2a2a] border border-[#00f92a]/40 text-[#00f92a] font-mono font-bold text-xs uppercase transition-all duration-300 hover:border-[#00f92a] hover:shadow-md"
                              style="font-family: 'JetBrains Mono', monospace; box-shadow: 0 0 5px rgba(0, 249, 42, 0.3);"
                              onMouseEnter={(e) => {
                                e.currentTarget.style.boxShadow = '0 0 15px rgba(0, 249, 42, 0.6)';
                                e.currentTarget.style.textShadow = '0 0 5px rgba(0, 249, 42, 0.8)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.boxShadow = '0 0 5px rgba(0, 249, 42, 0.3)';
                                e.currentTarget.style.textShadow = 'none';
                              }}
                            >
                              <i class="fas fa-play mr-1"></i>PLAY
                            </button>
                          </div>
                          
                          {/* Metadata */}
                          <div 
                            class="flex items-center gap-3 text-xs mb-3 text-[#04caf4]/60 font-mono"
                            style="font-family: 'JetBrains Mono', monospace;"
                          >
                            <span class="flex items-center gap-1">
                              <span class="text-base">{track.userAvatar}</span>
                              {track.addedBy}
                            </span>
                            <span>•</span>
                            <span>{track.timestamp}</span>
                            <Show when={activityFilter() === 'replied'}>
                              <span class="text-[#f906d6]">• CONVERSATION</span>
                            </Show>
                            <Show when={activityFilter() === 'liked'}>
                              <span class="text-[#04caf4]">• LIKED</span>
                            </Show>
                            <Show when={activityFilter() === 'shared'}>
                              <span class="text-[#00f92a]">• SHARED</span>
                            </Show>
                          </div>
                          
                          {/* Comment */}
                          <p 
                            class="font-mono text-sm mb-3 text-white/70"
                            style="font-family: 'JetBrains Mono', monospace;"
                          >
                            {track.comment}
                          </p>
                          
                          {/* Interaction Stats */}
                          <div class="flex gap-6 text-xs font-mono" style="font-family: 'JetBrains Mono', monospace;">
                            <span 
                              class="flex items-center gap-2 text-[#f906d6]"
                              style="text-shadow: 0 0 3px rgba(249, 6, 214, 0.4);"
                            >
                              <i class="fas fa-heart"></i>
                              {track.likes}
                            </span>
                            <span 
                              class="flex items-center gap-2 text-[#04caf4]"
                              style="text-shadow: 0 0 3px rgba(4, 202, 244, 0.4);"
                            >
                              <i class="fas fa-comment"></i>
                              {track.replies}
                            </span>
                            <span 
                              class="flex items-center gap-2 text-[#00f92a]"
                              style="text-shadow: 0 0 3px rgba(0, 249, 42, 0.4);"
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

      <style>{`
        @keyframes scan {
          0% { transform: translateY(0px); }
          100% { transform: translateY(400px); }
        }
      `}</style>
    </div>
  );
};

export default ProfilePage;