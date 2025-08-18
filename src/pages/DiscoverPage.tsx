import { Component, createSignal, onMount } from 'solid-js';
import { setCurrentTrack, playlists, setCurrentPlaylistId, setIsPlaying, playlistTracks } from '../stores/playlistStore';
import DiscoveryBar from '../components/common/DiscoveryBar';
import { pageEnter, staggeredFadeIn, buttonHover, magnetic, playButtonPulse } from '../utils/animations';

const DiscoverPage: Component = () => {
  const [searchQuery, setSearchQuery] = createSignal('');
  let pageRef: HTMLDivElement;

  onMount(() => {
    // Page entrance animation
    if (pageRef) {
      pageEnter(pageRef);
    }
    
    // Animate sections with staggered fade-in
    setTimeout(() => {
      const sections = pageRef?.querySelectorAll('.discover-section');
      if (sections) {
        staggeredFadeIn(sections);
      }
      
      // Add magnetic effect to user cards
      const userCards = pageRef?.querySelectorAll('.user-card');
      userCards?.forEach(card => magnetic(card as HTMLElement, 15));
      
      // Add magnetic effect to artist cards
      const artistCards = pageRef?.querySelectorAll('.artist-card');
      artistCards?.forEach(card => magnetic(card as HTMLElement, 10));
    }, 300);
  });

  const playHiddenGem = (title: string, artist: string, videoId: string) => {
    const track = {
      id: videoId,
      title,
      artist,
      duration: '4:03',
      videoId,
      thumbnail: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
      addedBy: 'music_bot',
      userAvatar: '🤖',
      timestamp: 'just now',
      comment: 'Discovered via Hidden Gems feature',
      likes: 0,
      replies: 0,
      recasts: 0
    };
    setCurrentTrack(track);
  };

  const followUser = (username: string) => {
    // Mock follow functionality - in real app would update user's following list
    alert(`Now following ${username}! 🎵`);
  };

  const showUserProfile = (username: string) => {
    // Navigate to profile page - in real app would load specific user's profile
    window.location.hash = '#profile';
  };

  const handlePlayClick = (e: MouseEvent, title: string, artist: string, videoId: string) => {
    const button = e.currentTarget as HTMLElement;
    playButtonPulse(button);
    setTimeout(() => playHiddenGem(title, artist, videoId), 200);
  };

  const handleButtonHover = (e: MouseEvent) => {
    const button = e.currentTarget as HTMLElement;
    buttonHover.enter(button);
  };

  const handleButtonLeave = (e: MouseEvent) => {
    const button = e.currentTarget as HTMLElement;
    buttonHover.leave(button);
  };

  const handlePlaylistChange = (playlistId: string) => {
    console.log('Switching to playlist from discover page:', playlistId);
    setCurrentPlaylistId(playlistId);
    
    // Navigate to home page to see the playlist (but don't auto-play)
    window.location.hash = '#home';
  };

  return (
    <div ref={pageRef!} class="p-8" style={{ opacity: '0' }}>
      <div class="p-6 mb-4">
        <div class="text-center">
          <h2 class="text-2xl font-bold text-black mb-2">
            <i class="fas fa-compass text-blue-600 mr-2"></i>Discover New Music
          </h2>
          <p class="text-gray-700">Multiple ways to discover your next favorite track</p>
        </div>
      </div>

      {/* Search Bar - Full Width Row */}
      <div class="flex items-center gap-2 mb-6">
        <input
          type="text"
          placeholder="Search playlists, artists, content..."
          value={searchQuery()}
          onInput={(e) => setSearchQuery(e.currentTarget.value)}
          class="win95-panel px-3 py-2 text-sm flex-1"
        />
        <button class="win95-button px-3 py-2">
          <i class="fas fa-search text-sm"></i>
        </button>
      </div>

      {/* Discover New Playlists - Featured Section */}
      <div class="discover-section p-6 mb-8" style={{ opacity: '0' }}>
        <div class="mb-6">
          <h3 class="text-2xl font-bold text-black mb-2">
            <i class="fas fa-list-music text-blue-600 mr-2"></i>Discover New Playlists
          </h3>
          <p class="text-gray-600">Curated playlists tailored to your music taste</p>
        </div>
        
        <DiscoveryBar
          playlists={Object.values(playlists)}
          onPlaylistClick={handlePlaylistChange}
        />
        
      </div>
      
      {/* Discover Similar Users */}
      <div class="discover-section p-6 mb-6" style={{ opacity: '0' }}>
        <h3 class="text-xl font-bold text-black mb-4">
          <i class="fas fa-users text-blue-600 mr-2"></i>Discover Similar Users
        </h3>
        <p class="text-sm text-gray-600 mb-4">Find users with similar music taste to yours</p>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div class="user-card win95-panel p-4 hover:bg-gray-50 cursor-pointer" onClick={() => showUserProfile('grunge_kid_92')}>
            <div class="flex items-center gap-3 mb-3">
              <div class="text-2xl">🎸</div>
              <div>
                <div class="font-bold text-black">grunge_kid_92</div>
                <div class="text-sm text-gray-600">85% match</div>
              </div>
            </div>
            <div class="text-sm text-gray-700">Loves: Nirvana, Pearl Jam, Soundgarden</div>
          </div>
          
          <div class="user-card win95-panel p-4 hover:bg-gray-50 cursor-pointer" onClick={() => showUserProfile('synth_lover_85')}>
            <div class="flex items-center gap-3 mb-3">
              <div class="text-2xl">🎹</div>
              <div>
                <div class="font-bold text-black">synth_lover_85</div>
                <div class="text-sm text-gray-600">78% match</div>
              </div>
            </div>
            <div class="text-sm text-gray-700">Loves: New Order, Depeche Mode, A-ha</div>
          </div>
          
          <div class="user-card win95-panel p-4 hover:bg-gray-50 cursor-pointer" onClick={() => showUserProfile('indie_explorer')}>
            <div class="flex items-center gap-3 mb-3">
              <div class="text-2xl">💎</div>
              <div>
                <div class="font-bold text-black">indie_explorer</div>
                <div class="text-sm text-gray-600">72% match</div>
              </div>
            </div>
            <div class="text-sm text-gray-700">Loves: Postal Service, Bon Iver, Arcade Fire</div>
          </div>
        </div>
      </div>

      {/* Discover Curators */}
      <div class="discover-section p-6 mb-6" style={{ opacity: '0' }}>
        <h3 class="text-xl font-bold text-black mb-4">
          <i class="fas fa-crown text-yellow-600 mr-2"></i>Discover Top Curators
        </h3>
        <p class="text-sm text-gray-600 mb-4">Music experts who consistently share amazing tracks</p>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="user-card win95-panel p-4 hover:bg-gray-50 cursor-pointer" onClick={() => showUserProfile('grunge_master_93')}>
            <div class="flex items-center gap-3 mb-3">
              <div class="text-3xl">🎸</div>
              <div class="flex-1">
                <div class="font-bold text-black">grunge_master_93</div>
                <div class="text-sm text-gray-600">⭐ Elite Curator</div>
                <div class="text-xs text-gray-500 mt-1">2.3k followers • 156 tracks shared</div>
              </div>
            </div>
            <div class="text-sm text-gray-700">"Seattle sound specialist. Deep cuts and hidden gems from the grunge era."</div>
          </div>
          
          <div class="user-card win95-panel p-4 hover:bg-gray-50 cursor-pointer" onClick={() => showUserProfile('vinyl_archaeologist')}>
            <div class="flex items-center gap-3 mb-3">
              <div class="text-3xl">💿</div>
              <div class="flex-1">
                <div class="font-bold text-black">vinyl_archaeologist</div>
                <div class="text-sm text-gray-600">🏆 Master Curator</div>
                <div class="text-xs text-gray-500 mt-1">4.1k followers • 287 tracks shared</div>
              </div>
            </div>
            <div class="text-sm text-gray-700">"Digging up rare pressings and forgotten classics. Vinyl-first approach to curation."</div>
          </div>
          
          <div class="user-card win95-panel p-4 hover:bg-gray-50 cursor-pointer" onClick={() => showUserProfile('synth_prophet_85')}>
            <div class="flex items-center gap-3 mb-3">
              <div class="text-3xl">🌈</div>
              <div class="flex-1">
                <div class="font-bold text-black">synth_prophet_85</div>
                <div class="text-sm text-gray-600">⭐ Elite Curator</div>
                <div class="text-xs text-gray-500 mt-1">1.8k followers • 203 tracks shared</div>
              </div>
            </div>
            <div class="text-sm text-gray-700">"80s synthwave evangelist. Neon dreams and electronic nostalgia curator."</div>
          </div>
          
          <div class="user-card win95-panel p-4 hover:bg-gray-50 cursor-pointer" onClick={() => showUserProfile('underground_oracle')}>
            <div class="flex items-center gap-3 mb-3">
              <div class="text-3xl">🔮</div>
              <div class="flex-1">
                <div class="font-bold text-black">underground_oracle</div>
                <div class="text-sm text-gray-600">🏆 Master Curator</div>
                <div class="text-xs text-gray-500 mt-1">3.7k followers • 412 tracks shared</div>
              </div>
            </div>
            <div class="text-sm text-gray-700">"Your guide to the musical underground. Discovering tomorrow's classics today."</div>
          </div>
        </div>
      </div>

      {/* Hidden Gems */}
      <div class="discover-section p-6 mb-6" style={{ opacity: '0' }}>
        <h3 class="text-xl font-bold text-black mb-4">
          <i class="fas fa-gem text-blue-600 mr-2"></i>Hidden Gems
        </h3>
        <p class="text-sm text-gray-600 mb-4">Underrated tracks from your favorite artists</p>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="artist-card win95-panel p-4 hover:bg-gray-50 cursor-pointer"
               onClick={() => playHiddenGem('Frances Farmer Will Have Her Revenge on Seattle', 'Nirvana', 'P8lHLqOUvFY')}>
            <div class="flex items-center gap-3">
              <img src="https://img.youtube.com/vi/P8lHLqOUvFY/mqdefault.jpg" class="w-16 h-12 object-cover rounded" />
              <div class="flex-1">
                <h4 class="font-bold text-black text-sm">Frances Farmer Will Have Her Revenge on Seattle</h4>
                <p class="text-sm text-gray-600">Nirvana • Deep cut</p>
                <div class="text-xs text-gray-500 mt-1">💎 Only 12% of fans know this one</div>
              </div>
            </div>
          </div>
          
          <div class="artist-card win95-panel p-4 hover:bg-gray-50 cursor-pointer"
               onClick={() => playHiddenGem('Bizarre Love Triangle', 'New Order', 'A8JNL6bwmls')}>
            <div class="flex items-center gap-3">
              <img src="https://img.youtube.com/vi/A8JNL6bwmls/mqdefault.jpg" class="w-16 h-12 object-cover rounded" />
              <div class="flex-1">
                <h4 class="font-bold text-black text-sm">Bizarre Love Triangle</h4>
                <p class="text-sm text-gray-600">New Order • Rare find</p>
                <div class="text-xs text-gray-500 mt-1">💎 Synthwave classic</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Discover Artists */}
      <div class="discover-section p-6 mb-6" style={{ opacity: '0' }}>
        <h3 class="text-xl font-bold text-black mb-4">
          <i class="fas fa-microphone text-indigo-600 mr-2"></i>Discover Artists
        </h3>
        <p class="text-sm text-gray-600 mb-4">Explore new artists based on your taste</p>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div class="artist-card win95-panel p-4 hover:bg-gray-50 cursor-pointer">
            <div class="flex items-center gap-3 mb-3">
              <img 
                src="https://via.placeholder.com/60x60.png?text=PJ" 
                alt="Pearl Jam"
                class="w-14 h-14 rounded-full object-cover border-2 border-gray-300"
              />
              <div>
                <div class="font-bold text-black">Pearl Jam</div>
                <div class="text-sm text-gray-600">Grunge • 92% match</div>
                <div class="text-xs text-gray-500">Based on your love for Nirvana</div>
              </div>
            </div>
          </div>
          
          <div class="artist-card win95-panel p-4 hover:bg-gray-50 cursor-pointer">
            <div class="flex items-center gap-3 mb-3">
              <img 
                src="https://via.placeholder.com/60x60.png?text=SG" 
                alt="Soundgarden"
                class="w-14 h-14 rounded-full object-cover border-2 border-gray-300"
              />
              <div>
                <div class="font-bold text-black">Soundgarden</div>
                <div class="text-sm text-gray-600">Alternative • 88% match</div>
                <div class="text-xs text-gray-500">Similar grunge energy</div>
              </div>
            </div>
          </div>
          
          <div class="artist-card win95-panel p-4 hover:bg-gray-50 cursor-pointer">
            <div class="flex items-center gap-3 mb-3">
              <img 
                src="https://via.placeholder.com/60x60.png?text=DM" 
                alt="Depeche Mode"
                class="w-14 h-14 rounded-full object-cover border-2 border-gray-300"
              />
              <div>
                <div class="font-bold text-black">Depeche Mode</div>
                <div class="text-sm text-gray-600">Synthwave • 85% match</div>
                <div class="text-xs text-gray-500">Based on your synthwave interests</div>
              </div>
            </div>
          </div>
          
          <div class="artist-card win95-panel p-4 hover:bg-gray-50 cursor-pointer">
            <div class="flex items-center gap-3 mb-3">
              <img 
                src="https://via.placeholder.com/60x60.png?text=RH" 
                alt="Radiohead"
                class="w-14 h-14 rounded-full object-cover border-2 border-gray-300"
              />
              <div>
                <div class="font-bold text-black">Radiohead</div>
                <div class="text-sm text-gray-600">Alternative • 82% match</div>
                <div class="text-xs text-gray-500">Experimental rock vibes</div>
              </div>
            </div>
          </div>
          
          <div class="artist-card win95-panel p-4 hover:bg-gray-50 cursor-pointer">
            <div class="flex items-center gap-3 mb-3">
              <img 
                src="https://via.placeholder.com/60x60.png?text=SP" 
                alt="Smashing Pumpkins"
                class="w-14 h-14 rounded-full object-cover border-2 border-gray-300"
              />
              <div>
                <div class="font-bold text-black">Smashing Pumpkins</div>
                <div class="text-sm text-gray-600">Alternative • 79% match</div>
                <div class="text-xs text-gray-500">90s alternative rock</div>
              </div>
            </div>
          </div>
          
          <div class="artist-card win95-panel p-4 hover:bg-gray-50 cursor-pointer">
            <div class="flex items-center gap-3 mb-3">
              <img 
                src="https://via.placeholder.com/60x60.png?text=PS" 
                alt="Postal Service"
                class="w-14 h-14 rounded-full object-cover border-2 border-gray-300"
              />
              <div>
                <div class="font-bold text-black">The Postal Service</div>
                <div class="text-sm text-gray-600">Indie Electronic • 76% match</div>
                <div class="text-xs text-gray-500">Electronic indie fusion</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiscoverPage;