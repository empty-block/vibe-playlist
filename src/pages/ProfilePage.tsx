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
  songsCount: number;
  songsLiked: number;
  playlistsCreated: number;
  sharedTracks: Track[];
  likedTracks: Track[];
  repliedTracks: Track[];
}

const ProfilePage: Component = () => {
  const params = useParams();
  const [currentTab, setCurrentTab] = createSignal<'playlists' | 'added' | 'liked' | 'replied'>('added');
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
        songsCount: 23,
        songsLiked: 42,
        playlistsCreated: 3,
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
        songsCount: 47,
        songsLiked: 89,
        playlistsCreated: 5,
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
      songsCount: 0,
      songsLiked: 0,
      playlistsCreated: 0,
      sharedTracks: [],
      likedTracks: [],
      repliedTracks: []
    };
  };
  
  const userProfile = () => getUserProfile(username());

  const getCurrentTracks = createMemo(() => {
    let tracks;
    switch (currentTab()) {
      case 'playlists':
        // TODO: Return user's created playlists
        tracks = [];
        break;
      case 'added': 
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
      case 'playlists': return `Playlists Created by ${userProfile().username}`;
      case 'added': return `Songs Added by ${userProfile().username}`;
      case 'liked': return `Tracks Liked by ${userProfile().username}`;
      case 'replied': return `Tracks Replied to by ${userProfile().username}`;
      default: return '';
    }
  };

  const handleTabChange = (tab: 'playlists' | 'added' | 'liked' | 'replied') => {
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
    <div 
      ref={pageRef!} 
      class="min-h-screen p-8 pb-20" 
      style={{ 
        opacity: '0',
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0a0a0a 100%)'
      }}
    >
      {/* PROFILE HEADER - Terminal Database Entry */}
      <div 
        class="profile-section relative p-8 mb-8 rounded-xl overflow-hidden"
        style={{ 
          opacity: '0',
          background: 'linear-gradient(145deg, #0a0a0a, #1a1a1a)',
          border: '1px solid rgba(249, 6, 214, 0.3)',
          'box-shadow': 'inset 0 0 20px rgba(0, 0, 0, 0.6)'
        }}
      >
        {/* Scan lines effect */}
        <div 
          class="absolute inset-0 pointer-events-none opacity-5"
          style={{
            background: `repeating-linear-gradient(
              0deg,
              transparent 0px,
              transparent 3px,
              rgba(249, 6, 214, 0.08) 4px,
              rgba(249, 6, 214, 0.08) 5px
            )`
          }}
        />
        
        {/* Status indicator */}
        <div class="flex items-center gap-2 mb-6">
          <div 
            class="w-2 h-2 rounded-full animate-pulse"
            style={{
              background: '#00f92a',
              'box-shadow': '0 0 6px rgba(0, 249, 42, 0.6)'
            }}
          />
          <span 
            class="text-xs font-mono uppercase tracking-widest"
            style={{
              color: '#04caf4',
              'text-shadow': '0 0 3px rgba(4, 202, 244, 0.5)',
              'font-family': 'Courier New, monospace'
            }}
          >
            USER PROFILE ACTIVE
          </span>
        </div>
        
        <div class="flex items-start gap-8">
          {/* Avatar with neon glow */}
          <div 
            class="profile-avatar text-7xl p-4 rounded-lg"
            style={{
              background: 'rgba(249, 6, 214, 0.1)',
              border: '2px solid rgba(249, 6, 214, 0.4)',
              'box-shadow': '0 0 20px rgba(249, 6, 214, 0.3)'
            }}
          >
            {userProfile().avatar}
          </div>
          
          <div class="flex-1">
            {/* Username with neon text */}
            <h2 
              class="font-mono font-bold text-4xl mb-3"
              style={{
                color: '#f906d6',
                'text-shadow': '0 0 8px rgba(249, 6, 214, 0.7)',
                'font-family': 'Courier New, monospace',
                'letter-spacing': '0.05em'
              }}
            >
              {userProfile().username}
            </h2>
            
            {/* Bio with terminal styling */}
            <p 
              class="font-mono text-sm mb-6"
              style={{
                color: 'rgba(255, 255, 255, 0.8)',
                'font-family': 'Courier New, monospace'
              }}
            >
              {userProfile().bio}
            </p>
            
            {/* Stats Grid - Terminal Readouts */}
            <div class="grid grid-cols-3 gap-6 mb-6">
              <div 
                class="p-3 rounded"
                style={{
                  background: 'rgba(0, 249, 42, 0.1)',
                  border: '1px solid rgba(0, 249, 42, 0.3)'
                }}
              >
                <div 
                  class="stat-number font-mono font-bold text-2xl"
                  style={{
                    color: '#00f92a',
                    'text-shadow': '0 0 5px rgba(0, 249, 42, 0.6)',
                    'font-family': 'Courier New, monospace'
                  }}
                >
                  {userProfile().songsCount}
                </div>
                <div 
                  class="text-xs font-mono uppercase"
                  style={{
                    color: 'rgba(0, 249, 42, 0.7)',
                    'font-family': 'Courier New, monospace'
                  }}
                >
                  SONGS ADDED
                </div>
              </div>
              
              <div 
                class="p-3 rounded"
                style={{
                  background: 'rgba(4, 202, 244, 0.1)',
                  border: '1px solid rgba(4, 202, 244, 0.3)'
                }}
              >
                <div 
                  class="stat-number font-mono font-bold text-2xl"
                  style={{
                    color: '#04caf4',
                    'text-shadow': '0 0 5px rgba(4, 202, 244, 0.6)',
                    'font-family': 'Courier New, monospace'
                  }}
                >
                  {userProfile().songsLiked}
                </div>
                <div 
                  class="text-xs font-mono uppercase"
                  style={{
                    color: 'rgba(4, 202, 244, 0.7)',
                    'font-family': 'Courier New, monospace'
                  }}
                >
                  SONGS LIKED
                </div>
              </div>
              
              <div 
                class="p-3 rounded"
                style={{
                  background: 'rgba(255, 155, 0, 0.1)',
                  border: '1px solid rgba(255, 155, 0, 0.3)'
                }}
              >
                <div 
                  class="stat-number font-mono font-bold text-2xl"
                  style={{
                    color: '#ff9b00',
                    'text-shadow': '0 0 5px rgba(255, 155, 0, 0.6)',
                    'font-family': 'Courier New, monospace'
                  }}
                >
                  {userProfile().playlistsCreated}
                </div>
                <div 
                  class="text-xs font-mono uppercase"
                  style={{
                    color: 'rgba(255, 155, 0, 0.7)',
                    'font-family': 'Courier New, monospace'
                  }}
                >
                  PLAYLISTS
                </div>
              </div>
            </div>
            
            {/* Follow button for other users */}
            <Show when={!isCurrentUser()}>
              <button 
                class="px-6 py-3 font-mono font-bold text-sm uppercase tracking-wide transition-all duration-300 rounded"
                style={{
                  background: 'linear-gradient(145deg, #2a2a2a, #1a1a1a)',
                  border: '2px solid rgba(0, 249, 42, 0.4)',
                  color: '#00f92a',
                  'font-family': 'Courier New, monospace',
                  'text-shadow': '0 0 5px rgba(0, 249, 42, 0.4)'
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
                <i class="fas fa-user-plus mr-2"></i>FOLLOW USER
              </button>
            </Show>
          </div>
        </div>
      </div>

      {/* USER LIBRARY TABS - Terminal Interface */}
      <div 
        class="profile-section relative mb-6 rounded-xl overflow-hidden"
        style={{ 
          opacity: '0',
          background: 'linear-gradient(145deg, #0a0a0a, #1a1a1a)',
          border: '1px solid rgba(4, 202, 244, 0.3)',
          'box-shadow': 'inset 0 0 15px rgba(0, 0, 0, 0.8)'
        }}
      >
        {/* Scan lines for tabs */}
        <div 
          class="absolute inset-0 pointer-events-none opacity-3"
          style={{
            background: `repeating-linear-gradient(
              0deg,
              transparent 0px,
              transparent 2px,
              rgba(4, 202, 244, 0.05) 3px,
              rgba(4, 202, 244, 0.05) 4px
            )`
          }}
        />
        
        <div class="flex">
          <button
            class={`relative px-6 py-4 font-mono font-bold text-sm uppercase tracking-wide transition-all duration-300 flex-1`}
            style={{
              background: currentTab() === 'playlists' 
                ? 'rgba(249, 6, 214, 0.15)' 
                : 'transparent',
              'border-right': '1px solid rgba(4, 202, 244, 0.2)',
              'border-bottom': currentTab() === 'playlists' 
                ? '2px solid #f906d6' 
                : '2px solid transparent',
              color: currentTab() === 'playlists' ? '#f906d6' : 'rgba(255, 255, 255, 0.6)',
              'text-shadow': currentTab() === 'playlists' ? '0 0 5px rgba(249, 6, 214, 0.6)' : 'none',
              'font-family': 'Courier New, monospace'
            }}
            onClick={() => handleTabChange('playlists')}
            onMouseEnter={(e) => {
              if (currentTab() !== 'playlists') {
                e.currentTarget.style.background = 'rgba(249, 6, 214, 0.08)';
                e.currentTarget.style.color = '#f906d6';
              }
            }}
            onMouseLeave={(e) => {
              if (currentTab() !== 'playlists') {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)';
              }
            }}
          >
            <i class="fas fa-list mr-2"></i>PLAYLISTS ({userProfile().playlistsCreated})
          </button>
          
          <button
            class={`relative px-6 py-4 font-mono font-bold text-sm uppercase tracking-wide transition-all duration-300 flex-1`}
            style={{
              background: currentTab() === 'added' 
                ? 'rgba(0, 249, 42, 0.15)' 
                : 'transparent',
              'border-right': '1px solid rgba(4, 202, 244, 0.2)',
              'border-bottom': currentTab() === 'added' 
                ? '2px solid #00f92a' 
                : '2px solid transparent',
              color: currentTab() === 'added' ? '#00f92a' : 'rgba(255, 255, 255, 0.6)',
              'text-shadow': currentTab() === 'added' ? '0 0 5px rgba(0, 249, 42, 0.6)' : 'none',
              'font-family': 'Courier New, monospace'
            }}
            onClick={() => handleTabChange('added')}
            onMouseEnter={(e) => {
              if (currentTab() !== 'added') {
                e.currentTarget.style.background = 'rgba(0, 249, 42, 0.08)';
                e.currentTarget.style.color = '#00f92a';
              }
            }}
            onMouseLeave={(e) => {
              if (currentTab() !== 'added') {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)';
              }
            }}
          >
            <i class="fas fa-music mr-2"></i>SONGS ADDED ({userProfile().sharedTracks.length})
          </button>
          
          <button
            class={`relative px-6 py-4 font-mono font-bold text-sm uppercase tracking-wide transition-all duration-300 flex-1`}
            style={{
              background: currentTab() === 'liked' 
                ? 'rgba(4, 202, 244, 0.15)' 
                : 'transparent',
              'border-right': '1px solid rgba(4, 202, 244, 0.2)',
              'border-bottom': currentTab() === 'liked' 
                ? '2px solid #04caf4' 
                : '2px solid transparent',
              color: currentTab() === 'liked' ? '#04caf4' : 'rgba(255, 255, 255, 0.6)',
              'text-shadow': currentTab() === 'liked' ? '0 0 5px rgba(4, 202, 244, 0.6)' : 'none',
              'font-family': 'Courier New, monospace'
            }}
            onClick={() => handleTabChange('liked')}
            onMouseEnter={(e) => {
              if (currentTab() !== 'liked') {
                e.currentTarget.style.background = 'rgba(4, 202, 244, 0.08)';
                e.currentTarget.style.color = '#04caf4';
              }
            }}
            onMouseLeave={(e) => {
              if (currentTab() !== 'liked') {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)';
              }
            }}
          >
            <i class="fas fa-heart mr-2"></i>LIKED ({userProfile().likedTracks.length})
          </button>
          
          <button
            class={`relative px-6 py-4 font-mono font-bold text-sm uppercase tracking-wide transition-all duration-300 flex-1`}
            style={{
              background: currentTab() === 'replied' 
                ? 'rgba(255, 155, 0, 0.15)' 
                : 'transparent',
              'border-bottom': currentTab() === 'replied' 
                ? '2px solid #ff9b00' 
                : '2px solid transparent',
              color: currentTab() === 'replied' ? '#ff9b00' : 'rgba(255, 255, 255, 0.6)',
              'text-shadow': currentTab() === 'replied' ? '0 0 5px rgba(255, 155, 0, 0.6)' : 'none',
              'font-family': 'Courier New, monospace'
            }}
            onClick={() => handleTabChange('replied')}
            onMouseEnter={(e) => {
              if (currentTab() !== 'replied') {
                e.currentTarget.style.background = 'rgba(255, 155, 0, 0.08)';
                e.currentTarget.style.color = '#ff9b00';
              }
            }}
            onMouseLeave={(e) => {
              if (currentTab() !== 'replied') {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)';
              }
            }}
          >
            <i class="fas fa-comment mr-2"></i>REPLIED ({userProfile().repliedTracks.length})
          </button>
        </div>
      </div>

      {/* TAB CONTENT - Terminal Data Display */}
      <div 
        class="profile-section relative p-6 rounded-xl overflow-hidden"
        style={{ 
          opacity: '0',
          background: 'linear-gradient(145deg, #0a0a0a, #1a1a1a)',
          border: '1px solid rgba(4, 202, 244, 0.2)',
          'box-shadow': 'inset 0 0 15px rgba(0, 0, 0, 0.8)'
        }}
      >
        {/* Content Header */}
        <div class="flex items-center justify-between mb-6">
          <h3 
            class="font-mono font-bold text-lg"
            style={{
              color: '#04caf4',
              'text-shadow': '0 0 5px rgba(4, 202, 244, 0.6)',
              'font-family': 'Courier New, monospace',
              'letter-spacing': '0.05em'
            }}
          >
            {getTabTitle()}
          </h3>
          <div class="flex items-center gap-3">
            <span 
              class="text-xs font-mono uppercase"
              style={{
                color: 'rgba(4, 202, 244, 0.7)',
                'font-family': 'Courier New, monospace'
              }}
            >
              SORT BY:
            </span>
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
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#04caf4';
                e.currentTarget.style.boxShadow = '0 0 10px rgba(4, 202, 244, 0.4)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'rgba(4, 202, 244, 0.4)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <option value="recent">RECENT</option>
              <option value="likes">LIKES</option>
              <option value="comments">COMMENTS</option>
            </select>
          </div>
        </div>
        
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
              <i class="fas fa-database text-4xl mb-4" style={{ color: 'rgba(4, 202, 244, 0.3)' }}></i>
              <p class="font-mono uppercase text-sm">NO DATA IN THIS CATEGORY</p>
            </div>
          }
        >
          <div class="space-y-4">
            <For each={getCurrentTracks()}>
              {(track) => (
                <div 
                  class="track-item relative p-4 rounded transition-all duration-300 cursor-pointer"
                  style={{ 
                    opacity: '0',
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
                        <Show when={currentTab() === 'replied'}>
                          <span style={{ color: '#ff9b00' }}>• REPLIED</span>
                        </Show>
                        <Show when={currentTab() === 'liked'}>
                          <span style={{ color: '#04caf4' }}>• LIKED</span>
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
    </div>
  );
};

export default ProfilePage;