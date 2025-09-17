import { Component, createSignal, onMount } from 'solid-js';
import { useParams, useNavigate } from '@solidjs/router';
import { pageEnter, staggeredFadeIn } from '../utils/animations';
import { LibraryLayout } from '../components/library';
import { PersonalTrack, PersonalFilterType } from '../types/library';
import AddButton from '../components/common/AddButton';
import { currentUser } from '../stores/authStore';

const ProfilePage: Component = () => {
  const params = useParams();
  const navigate = useNavigate();
  const [tracks, setTracks] = createSignal<PersonalTrack[]>([]);
  const [isLoading, setIsLoading] = createSignal(true);
  const [currentFilter, setCurrentFilter] = createSignal<PersonalFilterType>('all');
  let pageRef: HTMLDivElement | undefined;
  
  // Get user data from auth store, with fallback stats
  const user = currentUser();
  const userWithStats = {
    ...user,
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

    // Remove slow page animations - content loads immediately
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
        
        {/* ZEN CYBERPUNK IDENTITY CARD HEADER */}
        <div class="me-section mb-8">
          <div 
            class="relative p-8 mb-8 bg-[#0d0d0d] border-2 border-[#04caf4]/30 overflow-hidden"
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
                class="w-20 h-20 flex items-center justify-center bg-[#04caf4]/10 border-2 border-[#04caf4] relative overflow-hidden"
                style="box-shadow: 0 0 20px rgba(4, 202, 244, 0.3);"
              >
                <img 
                  src={userWithStats.avatar}
                  alt={userWithStats.displayName}
                  class="w-full h-full object-cover"
                />
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
                  MY_LIBRARY
                </h2>
                
                {/* Terminal status line */}
                <div class="text-[#04caf4]/70 text-xs font-mono mt-2" style="font-family: 'JetBrains Mono', monospace;">
                  STATUS: ONLINE • ACCESS_LEVEL: ADMIN • CONN: SECURE
                </div>
              </div>

              {/* Action Button (simplified) */}
              <AddButton onClick={() => navigate('/curate')} class="px-6 py-3 bg-[#00f92a]/10 border-2 border-[#00f92a] text-[#00f92a] text-xs font-mono font-bold uppercase tracking-wider transition-all duration-300 hover:bg-[#00f92a]/20">
                <i class="fas fa-plus mr-2"></i>
                ADD_TRACK
              </AddButton>
            </div>

            {/* Scan line keyframes */}
            <style>{`
              @keyframes scan {
                0% { transform: translateY(0px); }
                100% { transform: translateY(400px); }
              }
            `}</style>
          </div>
        </div>

        {/* Personal Music Library */}
        <div class="me-section personal-library-section">
          <LibraryLayout 
            mode="profile"
            userId={userWithStats.username}
            personalTracks={tracks()}
            personalLoading={isLoading()}
            personalFilter={currentFilter()}
            onPersonalFilterChange={handleFilterChange}
            onAddMusic={() => navigate('/curate')}
          />
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;