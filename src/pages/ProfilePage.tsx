import { Component, createSignal, For, Show, createMemo, onMount } from 'solid-js';
import { useParams } from '@solidjs/router';
import { Track } from '../stores/playlistStore';
import { currentUser } from '../stores/authStore';
import { pageEnter, staggeredFadeIn, buttonHover, slideIn, float, magnetic, counterAnimation } from '../utils/animations';

export type SortOption = 'recent' | 'likes' | 'comments';

interface UserProfile {
  username: string;
  avatar: string;
  bio: string;
  joinDate: string;
  songsCount: number;
  topArtists: Array<{ name: string; plays: number; medal?: '🥇' | '🥈' | '🥉' }>;
  sharedTracks: Track[];
  likedTracks: Track[];
  repliedTracks: Track[];
}

const ProfilePage: Component = () => {
  const params = useParams();
  const [currentTab, setCurrentTab] = createSignal<'shared' | 'liked' | 'replied'>('shared');
  const [sortBy, setSortBy] = createSignal<SortOption>('recent');
  let pageRef: HTMLDivElement;

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
      
      // Add magnetic effect to top artist medals
      const medals = pageRef?.querySelectorAll('.artist-medal');
      medals?.forEach(medal => magnetic(medal as HTMLElement, 10));
      
      // Animate sections
      const sections = pageRef?.querySelectorAll('.profile-section');
      if (sections) {
        staggeredFadeIn(sections);
      }
    }, 300);
  });
  
  // Get the username from URL params, or use current user if none specified
  const username = () => params.username || currentUser().username;
  const isCurrentUser = () => !params.username || params.username === currentUser().username;
  
  // Mock user profile data - in real app this would come from a store/API
  const getUserProfile = (username: string): UserProfile => {
    // If it's the current user, return their profile
    if (username === currentUser().username) {
      return {
        username: currentUser().username,
        avatar: currentUser().avatar,
        bio: 'Music lover • JAMZY enthusiast • Always discovering new tracks',
        joinDate: 'January 1995',
        songsCount: 23,
        topArtists: [
          { name: 'Radiohead', plays: 892, medal: '🥇' },
          { name: 'Nirvana', plays: 567, medal: '🥈' },
          { name: 'Pearl Jam', plays: 423, medal: '🥉' }
        ],
        sharedTracks: [
          {
            id: '1',
            title: 'Fake Plastic Trees',
            artist: 'Radiohead',
            duration: '4:50',
            source: 'youtube',
            sourceId: 'n5h0qHwNrHk',
            videoId: 'n5h0qHwNrHk',
            thumbnail: 'https://img.youtube.com/vi/n5h0qHwNrHk/mqdefault.jpg',
            addedBy: currentUser().username,
            userAvatar: currentUser().avatar,
            timestamp: '1 hour ago',
            comment: 'This song hits different every time I listen to it.',
            likes: 15,
            replies: 4,
            recasts: 7
          }
        ],
        likedTracks: [],
        repliedTracks: []
      };
    }
    
    // Mock profiles for other users
    const mockProfiles: Record<string, UserProfile> = {
      'grunge_kid_92': {
        username: 'grunge_kid_92',
        avatar: '🎸',
        bio: 'Seattle sound specialist • 90s grunge enthusiast • Vinyl collector',
        joinDate: 'March 1995',
        songsCount: 47,
        topArtists: [
          { name: 'Nirvana', plays: 1247, medal: '🥇' },
          { name: 'Pearl Jam', plays: 892, medal: '🥈' },
          { name: 'Soundgarden', plays: 654, medal: '🥉' }
        ],
        sharedTracks: [
          {
            id: '1',
            title: 'Smells Like Teen Spirit',
            artist: 'Nirvana',
            duration: '5:01',
            source: 'youtube',
            sourceId: 'hTWKbfoikeg',
            videoId: 'hTWKbfoikeg',
            thumbnail: 'https://img.youtube.com/vi/hTWKbfoikeg/mqdefault.jpg',
            addedBy: 'grunge_kid_92',
            userAvatar: '🎸',
            timestamp: '2 min ago',
            comment: 'This song changed everything for me in high school. Peak 90s energy! 🔥',
            likes: 25,
            replies: 8,
            recasts: 12
          },
          {
            id: '2',
            title: 'Black',
            artist: 'Pearl Jam',
            duration: '5:43',
            source: 'youtube',
            sourceId: 'cs-XZ_dN4Hc',
            videoId: 'cs-XZ_dN4Hc',
            thumbnail: 'https://img.youtube.com/vi/cs-XZ_dN4Hc/mqdefault.jpg',
            addedBy: 'grunge_kid_92',
            userAvatar: '🎸',
            timestamp: '1 day ago',
            comment: 'Eddie Vedder\'s voice on this track... pure emotion. Seattle forever.',
            likes: 36,
            replies: 11,
            recasts: 18
          }
        ],
        likedTracks: [
          {
            id: '3',
            title: 'Creep',
            artist: 'Radiohead',
            duration: '3:58',
            source: 'youtube',
            sourceId: 'XFkzRNyygfk',
            videoId: 'XFkzRNyygfk',
            thumbnail: 'https://img.youtube.com/vi/XFkzRNyygfk/mqdefault.jpg',
            addedBy: 'radiohead_stan',
            userAvatar: '👁️',
            timestamp: '8 min ago',
            comment: 'Before OK Computer, there was this masterpiece. Still hits different.',
            likes: 29,
            replies: 12,
            recasts: 15
          }
        ],
        repliedTracks: [
          {
            id: '4',
            title: 'Blue Monday',
            artist: 'New Order',
            duration: '7:29',
            source: 'youtube',
            sourceId: 'FYH8DsU2WCk',
            videoId: 'FYH8DsU2WCk',
            thumbnail: 'https://img.youtube.com/vi/FYH8DsU2WCk/mqdefault.jpg',
            addedBy: 'synth_master',
            userAvatar: '🎹',
            timestamp: '3 min ago',
            comment: 'The bassline that launched a thousand dancefloors',
            likes: 42,
            replies: 7,
            recasts: 15
          }
        ]
      }
    };
    
    return mockProfiles[username] || {
      username,
      avatar: '👤',
      bio: 'Music enthusiast on JAMZY',
      joinDate: 'Recently',
      songsCount: 0,
      topArtists: [],
      sharedTracks: [],
      likedTracks: [],
      repliedTracks: []
    };
  };
  
  const userProfile = () => getUserProfile(username());

  const getCurrentTracks = createMemo(() => {
    let tracks;
    switch (currentTab()) {
      case 'shared': 
        tracks = userProfile().sharedTracks;
        break;
      case 'liked': 
        tracks = userProfile().likedTracks;
        break;
      case 'replied': 
        tracks = userProfile().repliedTracks;
        break;
      default: 
        tracks = [];
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

  const getTabTitle = () => {
    switch (currentTab()) {
      case 'shared': return `Songs Added by ${userProfile().username}`;
      case 'liked': return `Tracks Liked by ${userProfile().username}`;
      case 'replied': return `Tracks Replied to by ${userProfile().username}`;
      default: return '';
    }
  };

  const handleTabChange = (tab: 'shared' | 'liked' | 'replied') => {
    setCurrentTab(tab);
    // Animate track items when switching tabs
    setTimeout(() => {
      const trackItems = pageRef?.querySelectorAll('.track-item');
      if (trackItems) {
        staggeredFadeIn(trackItems);
      }
    }, 100);
  };

  const handleButtonHover = (e: MouseEvent) => {
    const button = e.currentTarget as HTMLElement;
    buttonHover.enter(button);
  };

  const handleButtonLeave = (e: MouseEvent) => {
    const button = e.currentTarget as HTMLElement;
    buttonHover.leave(button);
  };

  return (
    <div ref={pageRef!} class="p-8 pb-20" style={{ opacity: '0' }}>
      {/* Profile Header */}
      <div class="profile-section win95-panel p-6 mb-6" style={{ opacity: '0' }}>
        <div class="flex items-center gap-6">
          <div class="profile-avatar text-6xl">{userProfile().avatar}</div>
          <div class="flex-1">
            <h2 class="text-3xl font-bold text-black mb-2">{userProfile().username}</h2>
            <p class="text-gray-600 mb-4">{userProfile().bio}</p>
            <div class="flex gap-6">
              <div class="text-center">
                <div class="stat-number text-2xl font-bold text-black">{userProfile().songsCount}</div>
                <div class="text-sm text-gray-600">Songs Added</div>
              </div>
              <div class="text-center">
                <div class="text-2xl font-bold text-black">{userProfile().joinDate}</div>
                <div class="text-sm text-gray-600">Member Since</div>
              </div>
            </div>
            <div class="flex gap-2 mt-4">
              <Show when={!isCurrentUser()}>
                <button 
                  class="win95-button px-4 py-2 font-bold"
                  onMouseEnter={handleButtonHover}
                  onMouseLeave={handleButtonLeave}
                >
                  <i class="fas fa-user-plus mr-2"></i>Follow
                </button>
              </Show>
              <button 
                class="win95-button px-4 py-2"
                onMouseEnter={handleButtonHover}
                onMouseLeave={handleButtonLeave}
              >
                <i class="fas fa-share mr-2"></i>Share
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Top Artists Section */}
      <Show when={userProfile().topArtists.length > 0}>
        <div class="profile-section win95-panel p-6 mb-6" style={{ opacity: '0' }}>
          <h3 class="text-lg font-bold text-black mb-4 flex items-center">
            <i class="fas fa-trophy text-yellow-500 mr-2"></i>Top Artists
          </h3>
          <div class="flex gap-4">
            <For each={userProfile().topArtists}>
              {(artist) => (
                <div class="artist-medal win95-button p-4 text-center cursor-pointer hover:bg-gray-50 min-w-[140px]">
                  <div class="text-3xl mb-3">{artist.medal}</div>
                  <h4 class="font-bold text-black text-sm mb-1">{artist.name}</h4>
                  <p class="text-xs text-gray-600">{artist.plays.toLocaleString()} plays</p>
                </div>
              )}
            </For>
          </div>
        </div>
      </Show>
      
      {/* Profile Tabs */}
      <div class="profile-section win95-panel p-0 mb-6" style={{ opacity: '0' }}>
        <div class="flex border-b-2 border-gray-300">
          <button
            class={`px-4 py-2 border-r border-gray-400 text-black font-bold ${
              currentTab() === 'shared' ? 'bg-blue-200' : 'hover:bg-gray-50'
            }`}
            onClick={() => handleTabChange('shared')}
            onMouseEnter={handleButtonHover}
            onMouseLeave={handleButtonLeave}
          >
            <i class="fas fa-music mr-2"></i>Songs Shared ({userProfile().sharedTracks.length})
          </button>
          <button
            class={`px-4 py-2 border-r border-gray-400 text-black ${
              currentTab() === 'liked' ? 'bg-blue-200 font-bold' : 'hover:bg-gray-50'
            }`}
            onClick={() => handleTabChange('liked')}
            onMouseEnter={handleButtonHover}
            onMouseLeave={handleButtonLeave}
          >
            <i class="fas fa-heart mr-2"></i>Liked Tracks ({userProfile().likedTracks.length})
          </button>
          <button
            class={`px-4 py-2 text-black ${
              currentTab() === 'replied' ? 'bg-blue-200 font-bold' : 'hover:bg-gray-50'
            }`}
            onClick={() => handleTabChange('replied')}
            onMouseEnter={handleButtonHover}
            onMouseLeave={handleButtonLeave}
          >
            <i class="fas fa-comment mr-2"></i>Replied To ({userProfile().repliedTracks.length})
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div class="profile-section win95-panel p-6" style={{ opacity: '0' }}>
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-xl font-bold text-black">{getTabTitle()}</h3>
          <div class="flex items-center gap-2">
            <span class="text-sm font-bold text-black">Sort by:</span>
            <select
              value={sortBy()}
              onChange={(e) => setSortBy(e.currentTarget.value as SortOption)}
              class="win95-panel px-2 py-1 text-sm font-bold text-black"
              title="Sort tracks"
            >
              <option value="recent">📅 Most Recent</option>
              <option value="likes">❤️ Most Liked</option>
              <option value="comments">💬 Most Comments</option>
            </select>
          </div>
        </div>
        
        <Show when={getCurrentTracks().length > 0} fallback={
          <div class="text-center py-8 text-gray-500">
            <i class="fas fa-music text-4xl mb-4"></i>
            <p>No tracks in this category yet.</p>
          </div>
        }>
          <div class="space-y-4">
            <For each={getCurrentTracks()}>
              {(track) => (
                <div class="track-item win95-button p-4 hover:bg-gray-50 cursor-pointer" style={{ opacity: '0' }}>
                  <div class="flex items-start gap-4">
                    <img 
                      src={track.thumbnail} 
                      alt={track.title}
                      class="w-20 h-20 object-cover rounded"
                    />
                    
                    <div class="flex-1">
                      <div class="flex justify-between items-start mb-2">
                        <div>
                          <h3 class="font-bold text-black">{track.title}</h3>
                          <p class="text-sm text-gray-600">{track.artist} • {track.duration}</p>
                        </div>
                        <button 
                          class="win95-button px-3 py-1 text-sm"
                          onMouseEnter={handleButtonHover}
                          onMouseLeave={handleButtonLeave}
                        >
                          <i class="fas fa-play mr-1"></i>Play
                        </button>
                      </div>
                      
                      <div class="flex items-center gap-3 text-xs text-gray-500 mb-2">
                        <span class="flex items-center gap-1">
                          <span class="text-lg">{track.userAvatar}</span>
                          {track.addedBy}
                        </span>
                        <span>•</span>
                        <span>{track.timestamp}</span>
                        <Show when={currentTab() === 'replied'}>
                          <span>• replied</span>
                        </Show>
                        <Show when={currentTab() === 'liked'}>
                          <span>• liked</span>
                        </Show>
                      </div>
                      
                      <p class="text-sm text-gray-700 mb-3">{track.comment}</p>
                      
                      <div class="flex gap-4 text-sm">
                        <span class="flex items-center gap-1">
                          <i class="fas fa-heart text-red-500"></i>
                          <span>{track.likes}</span>
                        </span>
                        <span class="flex items-center gap-1">
                          <i class="fas fa-comment"></i>
                          <span>{track.replies}</span>
                        </span>
                        <span class="flex items-center gap-1">
                          <i class="fas fa-retweet"></i>
                          <span>{track.recasts}</span>
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
    </div>
  );
};

export default ProfilePage;