import { Component, createSignal, createMemo, onMount, Show } from 'solid-js';
import { useSearchParams } from '@solidjs/router';
import { pageEnter, float, glitch } from '../utils/animations';
import anime from 'animejs';
import CreateChatInterface from '../components/chat/CreateChatInterface';
import SongInputForm from '../components/common/SongInputForm';
import PlaylistSelector, { PlaylistDestination } from '../components/playlist/PlaylistSelector';
import PlaylistCreateForm from '../components/playlist/PlaylistCreateForm';
import { PlaylistSortOption, PlaylistFilter } from '../components/playlist/PlaylistSearchFilter';

export type PlaylistType = 'personal' | 'collaborative' | 'ai_curated';

const SharePage: Component = () => {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = createSignal<'ai' | 'quick' | 'create'>('ai');
  const [songUrl, setSongUrl] = createSignal('');
  const [comment, setComment] = createSignal('');
  const [selectedPlaylists, setSelectedPlaylists] = createSignal<string[]>(['my_jams']);

  let pageRef: HTMLDivElement;
  let titleRef: HTMLHeadingElement;
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
        setSelectedPlaylists([mappedPlaylist]);
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

    // AnimatedButton components now handle their own animations

    // TextInput components now handle their own focus animations

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
                'border-bottom': '2px solid white'
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
                'border-bottom': '2px solid white'
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
                'border-bottom': '2px solid white'
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
            <SongInputForm
              onSubmit={(data) => {
                setSongUrl(data.songUrl);
                setComment(data.comment);
                // Auto-submit if playlists are selected
                if (selectedPlaylists().length > 0) {
                  handleShare();
                }
              }}
              submitLabel="Create the Vibes! 🎵"
              disabled={selectedPlaylists().length === 0}
            />
            
            <PlaylistSelector
              allPlaylists={allPlaylistDestinations}
              filteredPlaylists={filteredPlaylists()}
              selectedPlaylists={selectedPlaylists()}
              onSelectionChange={setSelectedPlaylists}
              searchValue={playlistSearch()}
              onSearchChange={setPlaylistSearch}
              filterValue={playlistFilter()}
              onFilterChange={setPlaylistFilter}
              sortValue={playlistSort()}
              onSortChange={setPlaylistSort}
              onClearFilters={() => {
                setPlaylistSearch('');
                setPlaylistFilter('all');
                setPlaylistSort('recent');
              }}
            />
          </Show>

          {/* Create Playlist Tab */}
          <Show when={activeTab() === 'create'}>
            <PlaylistCreateForm
              onCreatePlaylist={(name, type) => {
                console.log('Creating new playlist:', name, type);
                // Here you'd integrate with your backend to create the playlist
                
                // Show success message
                alert(`✨ Playlist "${name}" created!`);
                
                // Create mock playlist entry (in real app this would come from backend)
                const newPlaylistId = `playlist_${Date.now()}`;
                
                // Auto-redirect to Quick Add tab and pre-select the new playlist
                setActiveTab('quick');
                setSelectedPlaylists([newPlaylistId]);
                
                // Note: In real app, you'd add the new playlist to allPlaylistDestinations
                // For now, we'll just select the default playlist as a demo
                setTimeout(() => {
                  alert(`Switched to Quick Add! The new playlist would be pre-selected here.`);
                }, 500);
              }}
            />
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