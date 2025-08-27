import { Component, createSignal, onMount } from 'solid-js';
import { useParams, useNavigate } from '@solidjs/router';
import { pageEnter, staggeredFadeIn } from '../utils/animations';
import PersonalLibraryTable, { PersonalTrack, PersonalFilterType } from '../components/library/PersonalLibraryTable';
import AddButton from '../components/shared/AddButton';

const MePage: Component = () => {
  const params = useParams();
  const navigate = useNavigate();
  const [tracks, setTracks] = createSignal<PersonalTrack[]>([]);
  const [isLoading, setIsLoading] = createSignal(true);
  const [currentFilter, setCurrentFilter] = createSignal<PersonalFilterType>('all');
  let pageRef: HTMLDivElement | undefined;
  
  // Simulated user data - in real app would come from authStore
  const currentUser = {
    username: params.username || 'jamzy_user',
    displayName: 'Music Curator',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jamzy',
    followers: 156,
    following: 89,
    curationScore: 92,
    joinDate: 'Member since 2024'
  };

  onMount(async () => {
    setIsLoading(true);
    try {
      // Simulate loading personal tracks with interaction data
      const mockPersonalTracks: PersonalTrack[] = [
        {
          id: 'personal-1',
          title: 'Midnight City',
          artist: 'M83',
          duration: '4:01',
          source: 'youtube',
          sourceId: 'dX3k_QDnzHE',
          thumbnail: 'https://i.ytimg.com/vi/dX3k_QDnzHE/maxresdefault.jpg',
          addedBy: 'jamzy_user',
          userAvatar: '🎵',
          comment: 'Perfect late night driving music',
          timestamp: '2024-01-15T10:30:00Z',
          likes: 15,
          replies: 3,
          recasts: 2,
          userInteraction: {
            type: 'shared',
            timestamp: '2024-01-15T10:30:00Z',
            context: 'Perfect late night driving music',
            socialStats: { likes: 15, replies: 3, recasts: 2 }
          }
        },
        {
          id: 'personal-2',
          title: 'Strobe',
          artist: 'Deadmau5',
          duration: '10:36',
          source: 'spotify',
          sourceId: '0ScQDVgElQS5JhwFZ8Nglx',
          thumbnail: 'https://i.ytimg.com/vi/tKi9Z-f6qX4/maxresdefault.jpg',
          addedBy: 'techno_lover',
          userAvatar: '🎧',
          comment: 'Build up is insane',
          timestamp: '2024-01-12T15:20:00Z',
          likes: 28,
          replies: 7,
          recasts: 4,
          userInteraction: {
            type: 'liked',
            timestamp: '2024-01-12T16:45:00Z',
            context: 'This is amazing!'
          }
        },
        {
          id: 'personal-3',
          title: 'Resonance',
          artist: 'HOME',
          duration: '3:32',
          source: 'youtube',
          sourceId: '8GW6sLrK40k',
          thumbnail: 'https://i.ytimg.com/vi/8GW6sLrK40k/maxresdefault.jpg',
          addedBy: 'synthwave_fan',
          userAvatar: '🌆',
          comment: 'Classic synthwave vibes',
          timestamp: '2024-01-10T20:15:00Z',
          likes: 42,
          replies: 12,
          recasts: 8,
          userInteraction: {
            type: 'conversation',
            timestamp: '2024-01-10T21:00:00Z',
            context: 'Reminds me of those 80s cyberpunk movies'
          }
        },
        {
          id: 'personal-4',
          title: 'Innerbloom',
          artist: 'RÜFÜS DU SOL',
          duration: '9:36',
          source: 'spotify',
          sourceId: '5W8EwHCpzoT4w4RhU2FjNP',
          thumbnail: 'https://i.ytimg.com/vi/Tx9zMFodNtA/maxresdefault.jpg',
          addedBy: 'jamzy_user',
          userAvatar: '🎵',
          comment: 'Festival memories',
          timestamp: '2024-01-08T14:00:00Z',
          likes: 67,
          replies: 18,
          recasts: 8,
          userInteraction: {
            type: 'shared',
            timestamp: '2024-01-08T14:00:00Z',
            context: 'Festival memories',
            socialStats: { likes: 67, replies: 18, recasts: 8 }
          }
        },
        {
          id: 'personal-5',
          title: 'Flashing Lights',
          artist: 'Kanye West',
          duration: '3:57',
          source: 'spotify',
          sourceId: '23E4p7wlel1GGIIbyTEELw',
          thumbnail: 'https://i.ytimg.com/vi/ila-hAUXR5U/maxresdefault.jpg',
          addedBy: 'hip_hop_head',
          userAvatar: '🎤',
          comment: 'Graduation era was peak',
          timestamp: '2024-01-05T18:30:00Z',
          likes: 35,
          replies: 8,
          recasts: 5,
          userInteraction: {
            type: 'conversation',
            timestamp: '2024-01-05T19:15:00Z',
            context: 'Dwele\'s vocals on this are incredible'
          }
        }
      ];

      setTracks(mockPersonalTracks);
    } catch (error) {
      console.error('Failed to load user tracks:', error);
    } finally {
      setIsLoading(false);
    }

    // Apply animations
    if (pageRef) {
      pageEnter(pageRef);
      
      setTimeout(() => {
        const sections = pageRef!.querySelectorAll('.me-section');
        if (sections) {
          staggeredFadeIn(sections);
        }
      }, 300);
    }
  });

  // Calculate personal stats
  const getPersonalStats = () => {
    const allTracks = tracks();
    return {
      shared: allTracks.filter(t => t.userInteraction.type === 'shared').length,
      liked: allTracks.filter(t => t.userInteraction.type === 'liked').length,
      conversations: allTracks.filter(t => t.userInteraction.type === 'conversation').length,
      totalEngagement: allTracks.reduce((sum, track) => {
        if (track.userInteraction.type === 'shared' && track.userInteraction.socialStats) {
          return sum + track.userInteraction.socialStats.likes + track.userInteraction.socialStats.replies;
        }
        return sum;
      }, 0)
    };
  };

  const stats = getPersonalStats();

  const handleFilterChange = (filter: PersonalFilterType) => {
    setCurrentFilter(filter);
  };

  // Handle clicking on profile stats to filter
  const handleStatClick = (filter: PersonalFilterType) => {
    setCurrentFilter(filter);
    // Scroll to library
    const librarySection = document.querySelector('.personal-library-section');
    librarySection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div ref={pageRef} class="min-h-screen bg-gradient-to-br from-black via-slate-900 to-slate-800 p-4">
      <div class="max-w-7xl mx-auto">
        
        {/* Unified Terminal Profile Interface */}
        <div class="me-section mb-8">
          {/* Single Terminal Window */}
          <div class="terminal-window bg-gradient-to-b from-slate-900/60 to-black/60 border-2 border-pink-400/30 rounded-xl p-6">
            

            {/* Profile Section */}
            <div class="flex items-center gap-6 mb-6">
              
              {/* Profile Avatar */}
              <div class="relative">
                <img 
                  src={currentUser.avatar}
                  alt={currentUser.displayName}
                  class="w-20 h-20 rounded-full border-3 border-pink-400/60 shadow-2xl shadow-pink-400/20"
                />
              </div>

              {/* Profile Details */}
              <div class="flex-1">
                <h1 class="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400 mb-1">
                  {currentUser.displayName}
                </h1>
                <p class="text-white/60 font-mono text-sm mb-3">@{currentUser.username}</p>
                <div class="text-xs text-white/40 font-mono">{currentUser.joinDate}</div>
              </div>
            </div>

            {/* Terminal Command & Stats Output */}
            <div class="font-mono text-sm space-y-2">
              {/* Command Prompt */}
              <div class="text-white/70">
                <span class="text-pink-400">jamzy@{currentUser.username}</span>
                <span class="text-white/60">:~/music_library$ </span>
                <span class="text-green-400">ls -la --stats personal_tracks/</span>
              </div>
              
              {/* Stats Output */}
              <div class="text-xs space-y-1 pl-4 border-l-2 border-pink-400/30 ml-4">
                <div class="flex items-center justify-between flex-wrap gap-3">
                  <div class="flex items-center gap-3 sm:gap-6 flex-wrap">
                    <span 
                      class="text-green-400 cursor-pointer hover:text-green-300 transition-colors whitespace-nowrap" 
                      onClick={() => handleStatClick('all')}
                      title="View all tracks"
                    >
                      📊 {tracks().length} <span class="hidden sm:inline">total_tracks</span><span class="sm:hidden">tracks</span>
                    </span>
                    <span 
                      class="text-blue-400 cursor-pointer hover:text-blue-300 transition-colors whitespace-nowrap hidden sm:inline"
                      onClick={() => handleStatClick('conversations')}
                      title="Filter conversations"
                    >
                      💬 {stats.conversations} conversations
                    </span>
                    <span 
                      class="text-purple-400 cursor-pointer hover:text-purple-300 transition-colors whitespace-nowrap"
                      onClick={() => handleStatClick('shared')}
                      title="Filter shared tracks"
                    >
                      🎵 {stats.shared} <span class="hidden sm:inline">shared_tracks</span><span class="sm:hidden">shared</span>
                    </span>
                    <span 
                      class="text-cyan-400 cursor-pointer hover:text-cyan-300 transition-colors whitespace-nowrap"
                      onClick={() => handleStatClick('liked')}
                      title="Filter liked tracks"
                    >
                      ❤️ {stats.liked} <span class="hidden sm:inline">liked_tracks</span><span class="sm:hidden">liked</span>
                    </span>
                  </div>
                  
                  <AddButton onClick={() => navigate('/curate')} class="px-3 py-1.5 text-xs flex-shrink-0 whitespace-nowrap">
                    <span class="hidden sm:inline">+ Add Music</span>
                    <span class="sm:hidden text-base">+</span>
                  </AddButton>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Personal Music Library */}
        <div class="me-section personal-library-section">
          <PersonalLibraryTable 
            userId={currentUser.username}
            tracks={tracks()}
            isLoading={isLoading()}
            currentFilter={currentFilter()}
            onFilterChange={handleFilterChange}
            onAddMusic={() => navigate('/curate')}
          />
        </div>
      </div>
    </div>
  );
};

export default MePage;