import { Component, createSignal, createMemo, For, onMount, Show } from 'solid-js';
import { useSearchParams } from '@solidjs/router';
import { pageEnter, typewriter, float, glitch, magnetic } from '../utils/animations';
import anime from 'animejs';
import CreateChatInterface from '../components/CreateChatInterface';

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
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = createSignal<'ai' | 'quick' | 'create'>('ai');
  const [songUrl, setSongUrl] = createSignal('');
  const [comment, setComment] = createSignal('');
  const [selectedPlaylist, setSelectedPlaylist] = createSignal<string>('my_jams');
  const [selectedPlaylists, setSelectedPlaylists] = createSignal<string[]>(['my_jams']);
  const [showNewPlaylistForm, setShowNewPlaylistForm] = createSignal(false);
  const [newPlaylistName, setNewPlaylistName] = createSignal('');
  const [newPlaylistType, setNewPlaylistType] = createSignal<PlaylistType>('collaborative');

  let pageRef: HTMLDivElement;
  let titleRef: HTMLHeadingElement;
  let submitButtonRef: HTMLButtonElement;
  let songInputRef: HTMLInputElement;
  let playlistSectionRef: HTMLDivElement;
  let tipsRef: HTMLDivElement;

  // Set the selected playlist from URL parameter if provided
  onMount(() => {
    const preSelectedPlaylist = searchParams.playlist;
    if (preSelectedPlaylist) {
      // Map the playlist IDs from playlistStore to SharePage format
      const playlistIdMapping: Record<string, string> = {
        '90s_hits': 'friday_bangers',
        '80s_synthwave': 'chill_study', 
        'chill_vibes': 'chill_study',
        'party_bangers': 'friday_bangers',
        'indie_gems': 'indie_discoveries',
        'hip_hop_classics': 'workout_pump'
      };
      
      const mappedPlaylist = playlistIdMapping[preSelectedPlaylist] || preSelectedPlaylist;
      const playlistExists = allPlaylistDestinations.find(p => p.id === mappedPlaylist);
      
      if (playlistExists) {
        setSelectedPlaylist(mappedPlaylist);
      }
    }

    // Add page animations
    if (pageRef) {
      pageEnter(pageRef);
    }

    if (titleRef) {
      // Float the music note
      float(titleRef);
      
      // Add glitch effect on click
      titleRef.addEventListener('click', () => {
        glitch(titleRef);
      });
    }

    if (submitButtonRef) {
      magnetic(submitButtonRef, 25);
    }

    // Add subtle animations to other interactive elements
    if (songInputRef) {
      songInputRef.addEventListener('focus', () => {
        anime({
          targets: songInputRef,
          scale: 1.02,
          boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
          duration: 200,
          easing: 'easeOutQuad'
        });
      });

      songInputRef.addEventListener('blur', () => {
        anime({
          targets: songInputRef,
          scale: 1,
          boxShadow: '0 0 0 0px rgba(59, 130, 246, 0)',
          duration: 200,
          easing: 'easeOutQuad'
        });
      });
    }

    // Animate sections with delayed entrance
    if (playlistSectionRef) {
      anime({
        targets: playlistSectionRef,
        opacity: [0, 1],
        translateY: [20, 0],
        duration: 500,
        delay: 300,
        easing: 'easeOutCubic'
      });
    }

    if (tipsRef) {
      anime({
        targets: tipsRef,
        opacity: [0, 1],
        translateY: [20, 0],
        duration: 500,
        delay: 600,
        easing: 'easeOutCubic'
      });
    }
  });
  
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


  const handleShare = () => {
    if (!songUrl().trim()) return;
    if (selectedPlaylists().length === 0) {
      alert('Please select at least one playlist!');
      return;
    }
    
    const selectedDests = allPlaylistDestinations.filter(p => selectedPlaylists().includes(p.id));
    console.log('Sharing song:', songUrl());
    console.log('To playlists:', selectedDests.map(d => d.name).join(', '));
    console.log('With comment:', comment());
    
    // Here you'd integrate with your Farcaster backend
    // For now, just show success state
    const playlistNames = selectedDests.map(d => d.name).join(', ');
    alert(`🎵 Song shared to ${selectedDests.length} playlist(s): ${playlistNames}!`);
    
    // Reset form
    setSongUrl('');
    setComment('');
    setSelectedPlaylists(['my_jams']); // Reset to default
  };

  const handleCreatePlaylist = () => {
    if (!newPlaylistName().trim()) return;
    
    console.log('Creating new playlist:', newPlaylistName(), newPlaylistType());
    // Here you'd integrate with your backend to create the playlist
    const playlistName = newPlaylistName();
    
    // Show success message
    alert(`✨ Playlist "${playlistName}" created!`);
    
    // Create mock playlist entry (in real app this would come from backend)
    const newPlaylistId = `playlist_${Date.now()}`;
    
    // Reset form
    setNewPlaylistName('');
    setShowNewPlaylistForm(false);
    
    // Auto-redirect to Quick Add tab and pre-select the new playlist
    setActiveTab('quick');
    setSelectedPlaylists([newPlaylistId]);
    
    // Note: In real app, you'd add the new playlist to allPlaylistDestinations
    // For now, we'll just select the default playlist as a demo
    setTimeout(() => {
      alert(`Switched to Quick Add! The new playlist would be pre-selected here.`);
    }, 500);
  };

  const getPlaylistTypeLabel = (type: PlaylistType) => {
    switch (type) {
      case 'personal': return '👤 Personal';
      case 'collaborative': return '👥 Collaborative';
      case 'ai_curated': return '🤖 AI Curated';
    }
  };

  return (
    <div ref={pageRef!} class="p-4 h-full overflow-y-auto">
        <div class="max-w-2xl mx-auto">
          {/* Header */}
          <div class="mb-8 text-center">
            <h1 ref={titleRef!} class="text-3xl font-bold text-black mb-2 cursor-pointer hover:text-purple-600 transition-colors">
              🎵 Create Your Vibes
            </h1>
            <p class="text-gray-600">
              Add tracks to your jams or collaborative playlists
            </p>
          </div>

          {/* Tab Navigation */}
          <div class="flex mb-6 border-b-2 border-gray-300">
            <button
              onClick={() => setActiveTab('ai')}
              class={`flex-1 px-4 py-3 font-bold text-sm transition-all ${
                activeTab() === 'ai' 
                  ? 'bg-white border-t-2 border-l-2 border-r-2 border-gray-300 -mb-0.5 z-10' 
                  : 'bg-gray-100 border-b-2 border-gray-300'
              }`}
              style={activeTab() === 'ai' ? {
                borderBottom: '2px solid white'
              } : {}}
            >
              <i class="fas fa-robot mr-2"></i>
              💬 AI Assistant
            </button>
            <button
              onClick={() => setActiveTab('quick')}
              class={`flex-1 px-4 py-3 font-bold text-sm transition-all ${
                activeTab() === 'quick' 
                  ? 'bg-white border-t-2 border-l-2 border-r-2 border-gray-300 -mb-0.5 z-10' 
                  : 'bg-gray-100 border-b-2 border-gray-300'
              }`}
              style={activeTab() === 'quick' ? {
                borderBottom: '2px solid white'
              } : {}}
            >
              <i class="fas fa-bolt mr-2"></i>
              ⚡ Quick Add
            </button>
            <button
              onClick={() => setActiveTab('create')}
              class={`flex-1 px-4 py-3 font-bold text-sm transition-all ${
                activeTab() === 'create' 
                  ? 'bg-white border-t-2 border-l-2 border-r-2 border-gray-300 -mb-0.5 z-10' 
                  : 'bg-gray-100 border-b-2 border-gray-300'
              }`}
              style={activeTab() === 'create' ? {
                borderBottom: '2px solid white'
              } : {}}
            >
              <i class="fas fa-plus mr-2"></i>
              ✨ Create Playlist
            </button>
          </div>

          {/* AI Chat Tab */}
          <Show when={activeTab() === 'ai'}>
            <div class="win95-panel mb-6" style="height: 500px;">
              <CreateChatInterface
                onCreatePlaylist={(name, type) => {
                  console.log('Creating playlist:', name, type);
                  alert(`✨ Playlist "${name}" created!`);
                }}
                onAddTrack={(url, playlistId, comment) => {
                  console.log('Adding track:', url, 'to', playlistId);
                  alert(`🎵 Track added to playlist!`);
                }}
              />
            </div>
          </Show>

          {/* Quick Add Tab */}
          <Show when={activeTab() === 'quick'}>
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
                  ref={songInputRef!}
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
          <div ref={playlistSectionRef!} class="win95-panel mb-6 p-4">
            <h2 class="text-xl font-bold text-black mb-4 flex items-center gap-2">
              <i class="fas fa-list"></i>
              Where to add it?
            </h2>

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
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
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
            <div class="mb-2 flex items-center justify-between">
              <span class="text-sm font-bold text-black">
                Select playlists ({selectedPlaylists().length} selected)
              </span>
              <button
                onClick={() => {
                  if (selectedPlaylists().length === filteredPlaylists().length) {
                    setSelectedPlaylists([]);
                  } else {
                    setSelectedPlaylists(filteredPlaylists().map(p => p.id));
                  }
                }}
                class="win95-button px-2 py-1 text-xs"
              >
                {selectedPlaylists().length === filteredPlaylists().length ? 'Deselect All' : 'Select All'}
              </button>
            </div>
            <div class="space-y-2 mb-4 max-h-64 overflow-y-auto">
              {filteredPlaylists().length === 0 ? (
                <div class="text-center py-4 text-gray-500">
                  <i class="fas fa-search text-2xl mb-2"></i>
                  <p>No playlists found matching your criteria</p>
                </div>
              ) : (
                <For each={filteredPlaylists()}>
                  {(playlist) => (
                    <label class="flex items-center gap-3 p-3 win95-panel hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        value={playlist.id}
                        checked={selectedPlaylists().includes(playlist.id)}
                        onChange={(e) => {
                          const id = e.currentTarget.value;
                          if (e.currentTarget.checked) {
                            setSelectedPlaylists(prev => [...prev, id]);
                          } else {
                            setSelectedPlaylists(prev => prev.filter(p => p !== id));
                          }
                        }}
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

          </div>

            {/* Share Button */}
            <div class="text-center">
            <button
              ref={submitButtonRef!}
              onClick={handleShare}
              disabled={!songUrl().trim() || selectedPlaylists().length === 0}
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
          </Show>

          {/* Create Playlist Tab */}
          <Show when={activeTab() === 'create'}>
            <div class="win95-panel mb-6 p-6">
              <h2 class="text-xl font-bold text-black mb-4 flex items-center gap-2">
                <i class="fas fa-plus"></i>
                Create New Playlist
              </h2>
              
              <div class="space-y-4 max-w-md">
                <div>
                  <label class="block text-sm font-bold text-black mb-1">
                    Playlist Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., 'Sunday Chill Vibes' or 'Workout Bangers'"
                    value={newPlaylistName()}
                    onInput={(e) => setNewPlaylistName(e.currentTarget.value)}
                    class="w-full px-3 py-2 text-sm border-2 border-gray-400 bg-white"
                  />
                </div>
                
                <div>
                  <label class="block text-sm font-bold text-black mb-1">
                    Playlist Type
                  </label>
                  <select
                    value={newPlaylistType()}
                    onChange={(e) => setNewPlaylistType(e.currentTarget.value as PlaylistType)}
                    class="win95-panel w-full px-3 py-2 text-sm font-bold text-black"
                  >
                    <option value="collaborative">👥 Collaborative - Others can add songs</option>
                    <option value="personal">👤 Personal - Only you can add songs</option>
                  </select>
                </div>
                
                <div class="win95-panel p-3 bg-blue-50">
                  <div class="text-xs text-gray-600">
                    <i class="fas fa-info-circle mr-1 text-blue-600"></i>
                    <strong>Collaborative:</strong> Anyone can add tracks, perfect for group playlists<br/>
                    <strong>Personal:</strong> Only you control what gets added
                  </div>
                </div>
                
                <button
                  onClick={handleCreatePlaylist}
                  disabled={!newPlaylistName().trim()}
                  class="win95-button px-6 py-3 text-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed w-full"
                  classList={{
                    'hover:bg-green-100': newPlaylistName().trim(),
                    'cursor-not-allowed opacity-50': !newPlaylistName().trim()
                  }}
                  style={newPlaylistName().trim() ? {
                    background: 'linear-gradient(135deg, #00f92a 0%, #04caf4 100%)'
                  } : {}}
                >
                  <i class="fas fa-plus mr-2"></i>
                  Create Playlist! ✨
                </button>
              </div>
            </div>
          </Show>

          {/* Quick Tips */}
          <div ref={tipsRef!} class="win95-panel mt-8 p-4 bg-yellow-50" style="opacity: 0;">
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
  );
};

export default SharePage;