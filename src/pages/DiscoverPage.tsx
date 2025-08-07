import { Component, createSignal } from 'solid-js';
import { setCurrentTrack } from '../stores/playlistStore';

const DiscoverPage: Component = () => {
  const [searchQuery, setSearchQuery] = createSignal('');

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

  return (
    <div class="p-8">
      <div class="win95-panel p-6 mb-6">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h2 class="text-2xl font-bold text-black mb-2">
              <i class="fas fa-compass text-blue-600 mr-2"></i>Discover New Music
            </h2>
            <p class="text-gray-700">Multiple ways to discover your next favorite track</p>
          </div>
          <div class="flex items-center gap-2">
            <input
              type="text"
              placeholder="Search playlists, artists, content..."
              value={searchQuery()}
              onInput={(e) => setSearchQuery(e.currentTarget.value)}
              class="win95-panel px-3 py-1 text-sm w-80"
            />
            <button class="win95-button px-3 py-1">
              <i class="fas fa-search"></i>
            </button>
          </div>
        </div>
      </div>
      
      {/* Discover Similar Users */}
      <div class="win95-panel p-6 mb-6">
        <h3 class="text-xl font-bold text-black mb-4">
          <i class="fas fa-users text-blue-600 mr-2"></i>Discover Similar Users
        </h3>
        <p class="text-sm text-gray-600 mb-4">Find users with similar music taste to yours</p>
        <div class="grid grid-cols-3 gap-4">
          <div class="win95-panel p-4 hover:bg-gray-100 cursor-pointer" onClick={() => showUserProfile('grunge_kid_92')}>
            <div class="flex items-center gap-3 mb-3">
              <div class="text-2xl">🎸</div>
              <div>
                <div class="font-bold text-black">grunge_kid_92</div>
                <div class="text-sm text-gray-600">85% match</div>
              </div>
            </div>
            <div class="text-sm text-gray-700 mb-3">Loves: Nirvana, Pearl Jam, Soundgarden</div>
            <button 
              class="win95-button px-3 py-1 text-xs w-full" 
              onClick={(e) => {
                e.stopPropagation();
                followUser('grunge_kid_92');
              }}
            >
              <i class="fas fa-user-plus mr-1"></i>Follow
            </button>
          </div>
          
          <div class="win95-panel p-4 hover:bg-gray-100 cursor-pointer" onClick={() => showUserProfile('synth_lover_85')}>
            <div class="flex items-center gap-3 mb-3">
              <div class="text-2xl">🎹</div>
              <div>
                <div class="font-bold text-black">synth_lover_85</div>
                <div class="text-sm text-gray-600">78% match</div>
              </div>
            </div>
            <div class="text-sm text-gray-700 mb-3">Loves: New Order, Depeche Mode, A-ha</div>
            <button 
              class="win95-button px-3 py-1 text-xs w-full"
              onClick={(e) => {
                e.stopPropagation();
                followUser('synth_lover_85');
              }}
            >
              <i class="fas fa-user-plus mr-1"></i>Follow
            </button>
          </div>
          
          <div class="win95-panel p-4 hover:bg-gray-100 cursor-pointer" onClick={() => showUserProfile('indie_explorer')}>
            <div class="flex items-center gap-3 mb-3">
              <div class="text-2xl">💎</div>
              <div>
                <div class="font-bold text-black">indie_explorer</div>
                <div class="text-sm text-gray-600">72% match</div>
              </div>
            </div>
            <div class="text-sm text-gray-700 mb-3">Loves: Postal Service, Bon Iver, Arcade Fire</div>
            <button 
              class="win95-button px-3 py-1 text-xs w-full"
              onClick={(e) => {
                e.stopPropagation();
                followUser('indie_explorer');
              }}
            >
              <i class="fas fa-user-plus mr-1"></i>Follow
            </button>
          </div>
        </div>
      </div>

      {/* Discover Curators */}
      <div class="win95-panel p-6 mb-6">
        <h3 class="text-xl font-bold text-black mb-4">
          <i class="fas fa-crown text-yellow-600 mr-2"></i>Discover Top Curators
        </h3>
        <p class="text-sm text-gray-600 mb-4">Music experts who consistently share amazing tracks</p>
        <div class="grid grid-cols-2 gap-4">
          <div class="win95-panel p-4 hover:bg-gray-100 cursor-pointer" onClick={() => showUserProfile('grunge_master_93')}>
            <div class="flex items-center gap-3 mb-3">
              <div class="text-3xl">🎸</div>
              <div class="flex-1">
                <div class="font-bold text-black">grunge_master_93</div>
                <div class="text-sm text-gray-600">⭐ Elite Curator</div>
                <div class="text-xs text-gray-500 mt-1">2.3k followers • 156 tracks shared</div>
              </div>
            </div>
            <div class="text-sm text-gray-700 mb-3">"Seattle sound specialist. Deep cuts and hidden gems from the grunge era."</div>
            <button 
              class="win95-button px-3 py-1 text-xs w-full"
              onClick={(e) => {
                e.stopPropagation();
                followUser('grunge_master_93');
              }}
            >
              <i class="fas fa-user-plus mr-1"></i>Follow Curator
            </button>
          </div>
          
          <div class="win95-panel p-4 hover:bg-gray-100 cursor-pointer" onClick={() => showUserProfile('vinyl_archaeologist')}>
            <div class="flex items-center gap-3 mb-3">
              <div class="text-3xl">💿</div>
              <div class="flex-1">
                <div class="font-bold text-black">vinyl_archaeologist</div>
                <div class="text-sm text-gray-600">🏆 Master Curator</div>
                <div class="text-xs text-gray-500 mt-1">4.1k followers • 287 tracks shared</div>
              </div>
            </div>
            <div class="text-sm text-gray-700 mb-3">"Digging up rare pressings and forgotten classics. Vinyl-first approach to curation."</div>
            <button 
              class="win95-button px-3 py-1 text-xs w-full"
              onClick={(e) => {
                e.stopPropagation();
                followUser('vinyl_archaeologist');
              }}
            >
              <i class="fas fa-user-plus mr-1"></i>Follow Curator
            </button>
          </div>
          
          <div class="win95-panel p-4 hover:bg-gray-100 cursor-pointer" onClick={() => showUserProfile('synth_prophet_85')}>
            <div class="flex items-center gap-3 mb-3">
              <div class="text-3xl">🌈</div>
              <div class="flex-1">
                <div class="font-bold text-black">synth_prophet_85</div>
                <div class="text-sm text-gray-600">⭐ Elite Curator</div>
                <div class="text-xs text-gray-500 mt-1">1.8k followers • 203 tracks shared</div>
              </div>
            </div>
            <div class="text-sm text-gray-700 mb-3">"80s synthwave evangelist. Neon dreams and electronic nostalgia curator."</div>
            <button 
              class="win95-button px-3 py-1 text-xs w-full"
              onClick={(e) => {
                e.stopPropagation();
                followUser('synth_prophet_85');
              }}
            >
              <i class="fas fa-user-plus mr-1"></i>Follow Curator
            </button>
          </div>
          
          <div class="win95-panel p-4 hover:bg-gray-100 cursor-pointer" onClick={() => showUserProfile('underground_oracle')}>
            <div class="flex items-center gap-3 mb-3">
              <div class="text-3xl">🔮</div>
              <div class="flex-1">
                <div class="font-bold text-black">underground_oracle</div>
                <div class="text-sm text-gray-600">🏆 Master Curator</div>
                <div class="text-xs text-gray-500 mt-1">3.7k followers • 412 tracks shared</div>
              </div>
            </div>
            <div class="text-sm text-gray-700 mb-3">"Your guide to the musical underground. Discovering tomorrow's classics today."</div>
            <button 
              class="win95-button px-3 py-1 text-xs w-full"
              onClick={(e) => {
                e.stopPropagation();
                followUser('underground_oracle');
              }}
            >
              <i class="fas fa-user-plus mr-1"></i>Follow Curator
            </button>
          </div>
        </div>
      </div>

      {/* Hidden Gems */}
      <div class="win95-panel p-6 mb-6">
        <h3 class="text-xl font-bold text-black mb-4">
          <i class="fas fa-gem text-blue-600 mr-2"></i>Hidden Gems
        </h3>
        <p class="text-sm text-gray-600 mb-4">Underrated tracks from your favorite artists</p>
        <div class="grid grid-cols-2 gap-4">
          <div 
            class="win95-panel p-4 hover:bg-gray-100 cursor-pointer" 
            onClick={() => playHiddenGem('Frances Farmer Will Have Her Revenge on Seattle', 'Nirvana', 'P8lHLqOUvFY')}
          >
            <div class="flex items-center gap-3">
              <img src="https://img.youtube.com/vi/P8lHLqOUvFY/mqdefault.jpg" class="w-16 h-12 object-cover rounded" />
              <div class="flex-1">
                <h4 class="font-bold text-black text-sm">Frances Farmer Will Have Her Revenge on Seattle</h4>
                <p class="text-sm text-gray-600">Nirvana • Deep cut</p>
                <div class="text-xs text-gray-500 mt-1">💎 Only 12% of fans know this one</div>
              </div>
              <button class="win95-button px-2 py-1 text-xs">
                <i class="fas fa-play"></i>
              </button>
            </div>
          </div>
          
          <div 
            class="win95-panel p-4 hover:bg-gray-100 cursor-pointer" 
            onClick={() => playHiddenGem('Bizarre Love Triangle', 'New Order', 'A8JNL6bwmls')}
          >
            <div class="flex items-center gap-3">
              <img src="https://img.youtube.com/vi/A8JNL6bwmls/mqdefault.jpg" class="w-16 h-12 object-cover rounded" />
              <div class="flex-1">
                <h4 class="font-bold text-black text-sm">Bizarre Love Triangle</h4>
                <p class="text-sm text-gray-600">New Order • Rare find</p>
                <div class="text-xs text-gray-500 mt-1">💎 Synthwave classic</div>
              </div>
              <button class="win95-button px-2 py-1 text-xs">
                <i class="fas fa-play"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Discover Artists */}
      <div class="win95-panel p-6 mb-6">
        <h3 class="text-xl font-bold text-black mb-4">
          <i class="fas fa-microphone text-indigo-600 mr-2"></i>Discover Artists
        </h3>
        <p class="text-sm text-gray-600 mb-4">Explore new artists based on your taste</p>
        <div class="grid grid-cols-3 gap-4">
          <div class="win95-panel p-4 hover:bg-gray-100 cursor-pointer">
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
            <div class="flex gap-2">
              <button class="win95-button px-2 py-1 text-xs flex-1">
                <i class="fas fa-play mr-1"></i>Play Top Tracks
              </button>
              <button class="win95-button px-2 py-1 text-xs">
                <i class="fas fa-user-plus"></i>
              </button>
            </div>
          </div>
          
          <div class="win95-panel p-4 hover:bg-gray-100 cursor-pointer">
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
            <div class="flex gap-2">
              <button class="win95-button px-2 py-1 text-xs flex-1">
                <i class="fas fa-play mr-1"></i>Play Top Tracks
              </button>
              <button class="win95-button px-2 py-1 text-xs">
                <i class="fas fa-user-plus"></i>
              </button>
            </div>
          </div>
          
          <div class="win95-panel p-4 hover:bg-gray-100 cursor-pointer">
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
            <div class="flex gap-2">
              <button class="win95-button px-2 py-1 text-xs flex-1">
                <i class="fas fa-play mr-1"></i>Play Top Tracks
              </button>
              <button class="win95-button px-2 py-1 text-xs">
                <i class="fas fa-user-plus"></i>
              </button>
            </div>
          </div>
          
          <div class="win95-panel p-4 hover:bg-gray-100 cursor-pointer">
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
            <div class="flex gap-2">
              <button class="win95-button px-2 py-1 text-xs flex-1">
                <i class="fas fa-play mr-1"></i>Play Top Tracks
              </button>
              <button class="win95-button px-2 py-1 text-xs">
                <i class="fas fa-user-plus"></i>
              </button>
            </div>
          </div>
          
          <div class="win95-panel p-4 hover:bg-gray-100 cursor-pointer">
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
            <div class="flex gap-2">
              <button class="win95-button px-2 py-1 text-xs flex-1">
                <i class="fas fa-play mr-1"></i>Play Top Tracks
              </button>
              <button class="win95-button px-2 py-1 text-xs">
                <i class="fas fa-user-plus"></i>
              </button>
            </div>
          </div>
          
          <div class="win95-panel p-4 hover:bg-gray-100 cursor-pointer">
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
            <div class="flex gap-2">
              <button class="win95-button px-2 py-1 text-xs flex-1">
                <i class="fas fa-play mr-1"></i>Play Top Tracks
              </button>
              <button class="win95-button px-2 py-1 text-xs">
                <i class="fas fa-user-plus"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiscoverPage;