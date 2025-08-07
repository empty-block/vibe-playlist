import { Component, createSignal, createMemo, For } from 'solid-js';

export type PlaylistType = 'personal' | 'collaborative' | 'ai_curated';

interface PlaylistDestination {
  id: string;
  name: string;
  type: PlaylistType;
  icon: string;
  description: string;
  memberCount?: number;
  isDefault?: boolean;
}

export type PlaylistSortOption = 'recent' | 'popular' | 'alphabetical';
export type PlaylistFilter = 'all' | 'personal' | 'collaborative' | 'ai_curated';

const SharePage: Component = () => {
  const [songUrl, setSongUrl] = createSignal('');
  const [comment, setComment] = createSignal('');
  const [selectedPlaylist, setSelectedPlaylist] = createSignal<string>('my_jams');
  const [showNewPlaylistForm, setShowNewPlaylistForm] = createSignal(false);
  const [newPlaylistName, setNewPlaylistName] = createSignal('');
  const [newPlaylistType, setNewPlaylistType] = createSignal<PlaylistType>('collaborative');
  
  // Playlist selection controls
  const [playlistSearch, setPlaylistSearch] = createSignal('');
  const [playlistFilter, setPlaylistFilter] = createSignal<PlaylistFilter>('all');
  const [playlistSort, setPlaylistSort] = createSignal<PlaylistSortOption>('recent');

  // Mock playlist destinations - in real app this would come from your Farcaster backend
  const allPlaylistDestinations: PlaylistDestination[] = [
    {
      id: 'my_jams',
      name: 'My Jams',
      type: 'personal',
      icon: '🎵',
      description: 'Your personal playlist feed on Farcaster',
      isDefault: true
    },
    {
      id: 'friday_bangers',
      name: 'Friday Bangers',
      type: 'collaborative',
      icon: '🎉',
      description: 'Weekend vibes with the squad',
      memberCount: 12
    },
    {
      id: 'chill_study',
      name: 'Chill Study Sessions',
      type: 'collaborative',
      icon: '📚',
      description: 'Lo-fi & ambient tracks for focus',
      memberCount: 8
    },
    {
      id: 'workout_pump',
      name: 'Workout Pump',
      type: 'collaborative',
      icon: '💪',
      description: 'High energy tracks for the gym',
      memberCount: 23
    },
    {
      id: 'indie_discoveries',
      name: 'Indie Discoveries',
      type: 'collaborative',
      icon: '🎨',
      description: 'Hidden gems and underground hits',
      memberCount: 5
    },
    {
      id: 'road_trip_classics',
      name: 'Road Trip Classics',
      type: 'collaborative',
      icon: '🚗',
      description: 'Perfect tracks for long drives',
      memberCount: 15
    },
    {
      id: 'late_night_feels',
      name: 'Late Night Feels',
      type: 'collaborative',
      icon: '🌙',
      description: 'Moody tracks for 2am vibes',
      memberCount: 7
    },
    {
      id: 'ai_discover_weekly',
      name: 'AI Discover Weekly',
      type: 'ai_curated',
      icon: '🤖',
      description: 'AI-curated tracks based on your taste graph',
    },
    {
      id: 'ai_genre_fusion',
      name: 'AI Genre Fusion',
      type: 'ai_curated',
      icon: '🎛️',
      description: 'Unexpected genre combinations that work',
    },
    {
      id: 'throwback_thursdays',
      name: 'Throwback Thursdays',
      type: 'collaborative',
      icon: '⏰',
      description: 'Nostalgic hits that bring back memories',
      memberCount: 18
    }
  ];

  // Filtered and sorted playlists based on search, filter, and sort
  const filteredPlaylists = createMemo(() => {
    let playlists = [...allPlaylistDestinations];
    
    // Filter by search query
    const search = playlistSearch().toLowerCase();
    if (search) {
      playlists = playlists.filter(playlist => 
        playlist.name.toLowerCase().includes(search) ||
        playlist.description.toLowerCase().includes(search)
      );
    }
    
    // Filter by type
    const filter = playlistFilter();
    if (filter !== 'all') {
      playlists = playlists.filter(playlist => playlist.type === filter);
    }
    
    // Sort playlists
    const sort = playlistSort();
    playlists.sort((a, b) => {
      switch (sort) {
        case 'alphabetical':
          return a.name.localeCompare(b.name);
        case 'popular':
          const aMembers = a.memberCount || 0;
          const bMembers = b.memberCount || 0;
          return bMembers - aMembers;
        case 'recent':
        default:
          // Default order (most recent/relevant first)
          // In real app, you'd sort by recent activity timestamp
          if (a.isDefault) return -1;
          if (b.isDefault) return 1;
          return 0;
      }
    });
    
    return playlists;
  });

  // Quick access - recently used or favorited playlists
  const quickAccessPlaylists = createMemo(() => {
    return allPlaylistDestinations.filter(p => 
      p.isDefault || (p.memberCount && p.memberCount > 10)
    ).slice(0, 3);
  });

  const handleShare = () => {
    if (!songUrl().trim()) return;
    
    const selectedDest = allPlaylistDestinations.find(p => p.id === selectedPlaylist());
    console.log('Sharing song:', songUrl());
    console.log('To playlist:', selectedDest?.name);
    console.log('With comment:', comment());
    
    // Here you'd integrate with your Farcaster backend
    // For now, just show success state
    alert(`🎵 Song shared to "${selectedDest?.name}"!`);
    
    // Reset form
    setSongUrl('');
    setComment('');
  };

  const handleCreatePlaylist = () => {
    if (!newPlaylistName().trim()) return;
    
    console.log('Creating new playlist:', newPlaylistName(), newPlaylistType());
    // Here you'd integrate with your backend to create the playlist
    alert(`✨ Playlist "${newPlaylistName()}" created!`);
    
    // Reset and hide form
    setNewPlaylistName('');
    setShowNewPlaylistForm(false);
  };

  const getPlaylistTypeLabel = (type: PlaylistType) => {
    switch (type) {
      case 'personal': return '👤 Personal';
      case 'collaborative': return '👥 Collaborative';
      case 'ai_curated': return '🤖 AI Curated';
    }
  };

  return (
    <div class="p-4">
      <div class="win95-panel h-full p-6 overflow-y-auto">
        <div class="max-w-2xl mx-auto">
          {/* Header */}
          <div class="mb-8 text-center">
            <h1 class="text-3xl font-bold text-black mb-2">
              🎵 Create Your Vibes
            </h1>
            <p class="text-gray-600">
              Add tracks to your jams or collaborative playlists
            </p>
          </div>

          {/* Song Input Section */}
          <div class="win95-panel mb-6 p-4">
            <h2 class="text-xl font-bold text-black mb-4 flex items-center gap-2">
              <i class="fas fa-music"></i>
              What's the track?
            </h2>
            
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-bold text-black mb-1">
                  Song URL (YouTube, Spotify, SoundCloud, etc.)
                </label>
                <input
                  type="text"
                  placeholder="https://youtu.be/dQw4w9WgXcQ or https://open.spotify.com/track/..."
                  value={songUrl()}
                  onInput={(e) => setSongUrl(e.currentTarget.value)}
                  class="w-full px-3 py-2 text-sm border-2 border-gray-400 bg-white"
                />
              </div>
              
              <div>
                <label class="block text-sm font-bold text-black mb-1">
                  Your take (optional)
                </label>
                <textarea
                  placeholder="This song hits different... 🔥"
                  value={comment()}
                  onInput={(e) => setComment(e.currentTarget.value)}
                  class="w-full px-3 py-2 text-sm resize-none border-2 border-gray-400 bg-white"
                  rows="3"
                />
              </div>
            </div>
          </div>

          {/* Playlist Destination Section */}
          <div class="win95-panel mb-6 p-4">
            <h2 class="text-xl font-bold text-black mb-4 flex items-center gap-2">
              <i class="fas fa-list"></i>
              Where to add it?
            </h2>

            {/* Quick Access */}
            <div class="mb-4">
              <h3 class="text-sm font-bold text-black mb-2 flex items-center gap-1">
                <i class="fas fa-star text-yellow-500"></i>
                Quick Access
              </h3>
              <div class="flex gap-2 flex-wrap">
                <For each={quickAccessPlaylists()}>
                  {(playlist) => (
                    <button
                      onClick={() => setSelectedPlaylist(playlist.id)}
                      class="win95-button px-3 py-1 text-sm flex items-center gap-2"
                      classList={{
                        'bg-blue-100': selectedPlaylist() === playlist.id
                      }}
                    >
                      <span class="text-lg">{playlist.icon}</span>
                      {playlist.name}
                    </button>
                  )}
                </For>
              </div>
            </div>

            {/* Search and Filter Controls */}
            <div class="mb-4 p-3 win95-panel">
              <div class="flex items-center justify-between mb-3">
                <div class="text-sm text-gray-600">
                  {filteredPlaylists().length} of {allPlaylistDestinations.length} playlists
                </div>
                {(playlistSearch() || playlistFilter() !== 'all' || playlistSort() !== 'recent') && (
                  <button
                    onClick={() => {
                      setPlaylistSearch('');
                      setPlaylistFilter('all');
                      setPlaylistSort('recent');
                    }}
                    class="win95-button px-2 py-1 text-xs whitespace-nowrap"
                  >
                    <i class="fas fa-times mr-1"></i>
                    <span class="hidden sm:inline">Clear Filters</span>
                    <span class="sm:hidden">Clear</span>
                  </button>
                )}
              </div>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Search */}
                <div>
                  <label class="block text-xs font-bold text-black mb-1">Search playlists</label>
                  <input
                    type="text"
                    placeholder="Find playlists..."
                    value={playlistSearch()}
                    onInput={(e) => setPlaylistSearch(e.currentTarget.value)}
                    class="w-full px-2 py-1 text-sm border-2 border-gray-400 bg-white"
                  />
                </div>
                
                {/* Filter */}
                <div>
                  <label class="block text-xs font-bold text-black mb-1">Filter by type</label>
                  <select
                    value={playlistFilter()}
                    onChange={(e) => setPlaylistFilter(e.currentTarget.value as PlaylistFilter)}
                    class="win95-panel w-full px-2 py-1 text-sm font-bold text-black"
                  >
                    <option value="all">All Types</option>
                    <option value="personal">👤 Personal</option>
                    <option value="collaborative">👥 Collaborative</option>
                    <option value="ai_curated">🤖 AI Curated</option>
                  </select>
                </div>
                
                {/* Sort */}
                <div>
                  <label class="block text-xs font-bold text-black mb-1">Sort by</label>
                  <select
                    value={playlistSort()}
                    onChange={(e) => setPlaylistSort(e.currentTarget.value as PlaylistSortOption)}
                    class="win95-panel w-full px-2 py-1 text-sm font-bold text-black"
                  >
                    <option value="recent">📅 Recent</option>
                    <option value="popular">🔥 Popular</option>
                    <option value="alphabetical">🔤 A-Z</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Playlist List */}
            <div class="space-y-2 mb-4 max-h-64 overflow-y-auto">
              {filteredPlaylists().length === 0 ? (
                <div class="text-center py-4 text-gray-500">
                  <i class="fas fa-search text-2xl mb-2"></i>
                  <p>No playlists found matching your criteria</p>
                </div>
              ) : (
                <For each={filteredPlaylists()}>
                  {(playlist) => (
                    <label class="flex items-center gap-3 p-3 win95-panel hover:bg-gray-100 cursor-pointer">
                      <input
                        type="radio"
                        name="playlist"
                        value={playlist.id}
                        checked={selectedPlaylist() === playlist.id}
                        onChange={(e) => setSelectedPlaylist(e.currentTarget.value)}
                        class="text-blue-600"
                      />
                      <div class="flex items-center gap-3 flex-1">
                        <span class="text-2xl">{playlist.icon}</span>
                        <div class="flex-1">
                          <div class="font-bold text-black flex items-center gap-2">
                            {playlist.name}
                            {playlist.isDefault && (
                              <span class="text-xs bg-blue-600 text-white px-1 rounded">DEFAULT</span>
                            )}
                          </div>
                          <div class="text-sm text-gray-600 flex items-center gap-2">
                            <span>{getPlaylistTypeLabel(playlist.type)}</span>
                            {playlist.memberCount && (
                              <span>• {playlist.memberCount} members</span>
                            )}
                          </div>
                          <div class="text-sm text-gray-500">{playlist.description}</div>
                        </div>
                      </div>
                    </label>
                  )}
                </For>
              )}
            </div>

            {/* Create New Playlist Button */}
            <div class="border-t-2 pt-3">
              {!showNewPlaylistForm() ? (
                <button
                  onClick={() => setShowNewPlaylistForm(true)}
                  class="win95-button px-4 py-2 text-sm font-bold w-full"
                >
                  <i class="fas fa-plus mr-2"></i>
                  Create New Playlist
                </button>
              ) : (
                <div class="win95-panel p-3 space-y-3">
                  <input
                    type="text"
                    placeholder="Playlist name (e.g., 'Sunday Chill Vibes')"
                    value={newPlaylistName()}
                    onInput={(e) => setNewPlaylistName(e.currentTarget.value)}
                    class="w-full px-3 py-2 text-sm border-2 border-gray-400 bg-white"
                  />
                  
                  <select
                    value={newPlaylistType()}
                    onChange={(e) => setNewPlaylistType(e.currentTarget.value as PlaylistType)}
                    class="win95-panel w-full px-3 py-2 text-sm font-bold text-black"
                  >
                    <option value="collaborative">👥 Collaborative - Others can add songs</option>
                    <option value="personal">👤 Personal - Only you can add songs</option>
                  </select>
                  
                  <div class="flex gap-2">
                    <button
                      onClick={handleCreatePlaylist}
                      class="win95-button px-4 py-2 text-sm font-bold flex-1"
                    >
                      ✨ Create
                    </button>
                    <button
                      onClick={() => {
                        setShowNewPlaylistForm(false);
                        setNewPlaylistName('');
                      }}
                      class="win95-button px-4 py-2 text-sm font-bold"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Share Button */}
          <div class="text-center">
            <button
              onClick={handleShare}
              disabled={!songUrl().trim()}
              class="win95-button px-8 py-3 text-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed"
              classList={{
                'hover:bg-green-100': songUrl().trim(),
                'cursor-not-allowed opacity-50': !songUrl().trim()
              }}
            >
              <i class="fas fa-plus mr-2"></i>
              Create the Vibes! 🎵
            </button>
          </div>

          {/* Quick Tips */}
          <div class="win95-panel mt-8 p-4 bg-yellow-50">
            <h3 class="font-bold text-black mb-2 flex items-center gap-2">
              <i class="fas fa-lightbulb text-yellow-600"></i>
              Pro Tips
            </h3>
            <ul class="text-sm text-gray-700 space-y-1">
              <li>• <strong>Personal:</strong> Songs go to your Farcaster feed as "Your Jams"</li>
              <li>• <strong>Collaborative:</strong> Anyone can add songs, perfect for group vibes</li>
              <li>• <strong>AI Curated:</strong> Let our algorithms find perfect additions</li>
              <li>• Pro tip: Add a comment to spark conversations! 💬</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SharePage;