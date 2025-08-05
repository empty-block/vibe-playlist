import { Component, createSignal, For, Show } from 'solid-js';
import { Track } from '../stores/playlistStore';

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
  const [currentTab, setCurrentTab] = createSignal<'shared' | 'liked' | 'replied'>('shared');
  
  // Mock user profile data - in real app this would come from a store/API
  const userProfile: UserProfile = {
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
        videoId: 'XFkzRNyygfk',
        thumbnail: 'https://img.youtube.com/vi/XFkzRNyygfk/mqdefault.jpg',
        addedBy: 'radiohead_stan',
        userAvatar: '👁️',
        timestamp: '8 min ago',
        comment: 'Before OK Computer, there was this masterpiece. Still hits different.',
        likes: 29,
        replies: 12,
        recasts: 15
      },
      {
        id: '4',
        title: 'Midnight City',
        artist: 'M83',
        duration: '4:03',
        videoId: 'dX3k_QDnzHE',
        thumbnail: 'https://img.youtube.com/vi/dX3k_QDnzHE/mqdefault.jpg',
        addedBy: 'night_owl',
        userAvatar: '🌃',
        timestamp: '1 hour ago',
        comment: 'Perfect for late night drives 🌙',
        likes: 28,
        replies: 6,
        recasts: 10
      }
    ],
    repliedTracks: [
      {
        id: '5',
        title: 'Blue Monday',
        artist: 'New Order',
        duration: '7:29',
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
  };

  const getCurrentTracks = () => {
    switch (currentTab()) {
      case 'shared': return userProfile.sharedTracks;
      case 'liked': return userProfile.likedTracks;
      case 'replied': return userProfile.repliedTracks;
      default: return [];
    }
  };

  const getTabTitle = () => {
    switch (currentTab()) {
      case 'shared': return `Songs Added by ${userProfile.username}`;
      case 'liked': return `Tracks Liked by ${userProfile.username}`;
      case 'replied': return `Tracks Replied to by ${userProfile.username}`;
      default: return '';
    }
  };

  return (
    <div class="p-8 pb-20">
      {/* Profile Header */}
      <div class="win95-panel p-6 mb-6">
        <div class="flex items-center gap-6">
          <div class="text-6xl">{userProfile.avatar}</div>
          <div class="flex-1">
            <h2 class="text-3xl font-bold text-black mb-2">{userProfile.username}</h2>
            <p class="text-gray-600 mb-4">{userProfile.bio}</p>
            <div class="flex gap-6">
              <div class="text-center">
                <div class="text-2xl font-bold text-black">{userProfile.songsCount}</div>
                <div class="text-sm text-gray-600">Songs Added</div>
              </div>
              <div class="text-center">
                <div class="text-2xl font-bold text-black">{userProfile.joinDate}</div>
                <div class="text-sm text-gray-600">Member Since</div>
              </div>
            </div>
          </div>
          <div class="flex gap-2">
            <button class="win95-button px-4 py-2 font-bold">
              <i class="fas fa-user-plus mr-2"></i>Follow
            </button>
            <button class="win95-button px-4 py-2">
              <i class="fas fa-share mr-2"></i>Share
            </button>
          </div>
        </div>
      </div>
      
      {/* Top Artists */}
      <div class="win95-panel p-6 mb-6">
        <h3 class="text-xl font-bold text-black mb-4">
          <i class="fas fa-trophy text-yellow-500 mr-2"></i>Top Artists
        </h3>
        <div class="flex gap-6">
          <For each={userProfile.topArtists}>
            {(artist) => (
              <div class="win95-button p-4 text-center cursor-pointer hover:bg-gray-100">
                <div class="text-2xl mb-2">{artist.medal}</div>
                <h4 class="font-bold text-black">{artist.name}</h4>
                <p class="text-sm text-gray-600">{artist.plays.toLocaleString()} plays</p>
              </div>
            )}
          </For>
        </div>
      </div>
      
      {/* Profile Tabs */}
      <div class="win95-panel p-0 mb-6">
        <div class="flex border-b-2 border-gray-400">
          <button
            class={`px-4 py-2 border-r border-gray-400 text-black font-bold ${
              currentTab() === 'shared' ? 'bg-blue-200' : 'hover:bg-gray-100'
            }`}
            onClick={() => setCurrentTab('shared')}
          >
            <i class="fas fa-music mr-2"></i>Songs Shared ({userProfile.sharedTracks.length})
          </button>
          <button
            class={`px-4 py-2 border-r border-gray-400 text-black ${
              currentTab() === 'liked' ? 'bg-blue-200 font-bold' : 'hover:bg-gray-100'
            }`}
            onClick={() => setCurrentTab('liked')}
          >
            <i class="fas fa-heart mr-2"></i>Liked Tracks ({userProfile.likedTracks.length})
          </button>
          <button
            class={`px-4 py-2 text-black ${
              currentTab() === 'replied' ? 'bg-blue-200 font-bold' : 'hover:bg-gray-100'
            }`}
            onClick={() => setCurrentTab('replied')}
          >
            <i class="fas fa-comment mr-2"></i>Replied To ({userProfile.repliedTracks.length})
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div class="win95-panel p-6">
        <h3 class="text-xl font-bold text-black mb-4">{getTabTitle()}</h3>
        
        <Show when={getCurrentTracks().length > 0} fallback={
          <div class="text-center py-8 text-gray-500">
            <i class="fas fa-music text-4xl mb-4"></i>
            <p>No tracks in this category yet.</p>
          </div>
        }>
          <div class="space-y-4">
            <For each={getCurrentTracks()}>
              {(track) => (
                <div class="win95-button p-4 hover:bg-gray-100 cursor-pointer">
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
                        <button class="win95-button px-3 py-1 text-sm">
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