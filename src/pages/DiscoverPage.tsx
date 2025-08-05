import { Component } from 'solid-js';
import { setCurrentPlaylistId, setCurrentTrack } from '../stores/playlistStore';

const DiscoverPage: Component = () => {
  const switchToMoodPlaylist = (playlistId: string) => {
    setCurrentPlaylistId(playlistId);
    // Navigate back to home to see the playlist
    window.location.hash = '#home';
  };

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

  const exploreGenreBlend = (blendType: string) => {
    alert(`🎵 Exploring ${blendType} blend! This would create a custom mixed playlist.`);
  };

  return (
    <div class="p-8">
      <div class="win95-panel p-6 mb-6">
        <h2 class="text-2xl font-bold text-black mb-4">
          <i class="fas fa-compass text-blue-600 mr-2"></i>Discover New Music
        </h2>
        <p class="text-gray-700">Multiple ways to discover your next favorite track</p>
      </div>
      
      {/* Discover Similar Users */}
      <div class="win95-panel p-6 mb-6">
        <h3 class="text-xl font-bold text-black mb-4">
          <i class="fas fa-users text-purple-600 mr-2"></i>Discover Similar Users
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
          <i class="fas fa-gem text-purple-600 mr-2"></i>Hidden Gems
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
      
      {/* Mood-based Discovery */}
      <div class="win95-panel p-6 mb-6">
        <h3 class="text-xl font-bold text-black mb-4">
          <i class="fas fa-heart text-red-600 mr-2"></i>Discover by Mood
        </h3>
        <div class="grid grid-cols-3 gap-4">
          <div class="win95-panel p-4 hover:bg-gray-100 cursor-pointer" onClick={() => switchToMoodPlaylist('chill_vibes')}>
            <div class="text-4xl mb-2">😌</div>
            <h3 class="font-bold text-black">Chill & Relax</h3>
            <p class="text-sm text-gray-600">Laid-back vibes for your downtime</p>
            <button 
              class="win95-button px-3 py-1 text-xs mt-3 w-full"
              onClick={(e) => {
                e.stopPropagation();
                switchToMoodPlaylist('chill_vibes');
              }}
            >
              <i class="fas fa-play mr-1"></i>Switch to Chill Vibes
            </button>
          </div>
          
          <div class="win95-panel p-4 hover:bg-gray-100 cursor-pointer" onClick={() => switchToMoodPlaylist('party_bangers')}>
            <div class="text-4xl mb-2">🔥</div>
            <h3 class="font-bold text-black">High Energy</h3>
            <p class="text-sm text-gray-600">Pump up your day with energetic beats</p>
            <button 
              class="win95-button px-3 py-1 text-xs mt-3 w-full"
              onClick={(e) => {
                e.stopPropagation();
                switchToMoodPlaylist('party_bangers');
              }}
            >
              <i class="fas fa-play mr-1"></i>Switch to Party Bangers
            </button>
          </div>
          
          <div class="win95-panel p-4 hover:bg-gray-100 cursor-pointer" onClick={() => switchToMoodPlaylist('80s_synthwave')}>
            <div class="text-4xl mb-2">🌙</div>
            <h3 class="font-bold text-black">Late Night</h3>
            <p class="text-sm text-gray-600">Perfect for after midnight sessions</p>
            <button 
              class="win95-button px-3 py-1 text-xs mt-3 w-full"
              onClick={(e) => {
                e.stopPropagation();
                switchToMoodPlaylist('80s_synthwave');
              }}
            >
              <i class="fas fa-play mr-1"></i>Switch to 80s Synthwave
            </button>
          </div>
        </div>
      </div>

      {/* Genre Blending */}
      <div class="win95-panel p-6 mb-6">
        <h3 class="text-xl font-bold text-black mb-4">
          <i class="fas fa-blender text-orange-600 mr-2"></i>Genre Blending
        </h3>
        <p class="text-sm text-gray-600 mb-4">Mix genres you haven't explored yet</p>
        <div class="grid grid-cols-2 gap-4">
          <div class="win95-panel p-4 hover:bg-gray-100 cursor-pointer" onClick={() => exploreGenreBlend('grunge-hiphop')}>
            <div class="flex items-center gap-3 mb-2">
              <div class="text-2xl">🎸</div>
              <div class="text-xl">+</div>
              <div class="text-2xl">🎤</div>
              <div class="flex-1">
                <h4 class="font-bold text-black">Grunge × Hip-Hop</h4>
                <p class="text-sm text-gray-600">Raw energy meets urban beats</p>
              </div>
            </div>
            <button class="win95-button px-3 py-1 text-xs w-full">
              <i class="fas fa-shuffle mr-1"></i>Blend & Discover
            </button>
          </div>
          
          <div class="win95-panel p-4 hover:bg-gray-100 cursor-pointer" onClick={() => exploreGenreBlend('synthwave-indie')}>
            <div class="flex items-center gap-3 mb-2">
              <div class="text-2xl">🌈</div>
              <div class="text-xl">+</div>
              <div class="text-2xl">💎</div>
              <div class="flex-1">
                <h4 class="font-bold text-black">Synthwave × Indie</h4>
                <p class="text-sm text-gray-600">Retro synths meet indie charm</p>
              </div>
            </div>
            <button class="win95-button px-3 py-1 text-xs w-full">
              <i class="fas fa-shuffle mr-1"></i>Blend & Discover
            </button>
          </div>
        </div>
      </div>
      
      {/* AI Recommendations */}
      <div class="win95-panel p-6">
        <h3 class="text-xl font-bold text-black mb-4">
          <i class="fas fa-robot text-blue-600 mr-2"></i>Because you liked "Smells Like Teen Spirit"
        </h3>
        <div class="grid grid-cols-2 gap-4">
          <div 
            class="win95-panel p-4 hover:bg-gray-100 cursor-pointer"
            onClick={() => playHiddenGem('In Bloom', 'Nirvana', 'PbgKEjNBHqM')}
          >
            <div class="flex items-center gap-3">
              <img src="https://img.youtube.com/vi/PbgKEjNBHqM/mqdefault.jpg" class="w-16 h-12 object-cover rounded" />
              <div class="flex-1">
                <h4 class="font-bold text-black text-sm">In Bloom</h4>
                <p class="text-sm text-gray-600">Nirvana • 94% match</p>
                <div class="text-xs text-gray-500 mt-1">🤖 AI recommended</div>
              </div>
              <button class="win95-button px-2 py-1 text-xs">
                <i class="fas fa-play"></i>
              </button>
            </div>
          </div>
          
          <div 
            class="win95-panel p-4 hover:bg-gray-100 cursor-pointer"
            onClick={() => playHiddenGem('Man in the Box', 'Alice in Chains', 'TAqZb52sgpU')}
          >
            <div class="flex items-center gap-3">
              <img src="https://img.youtube.com/vi/TAqZb52sgpU/mqdefault.jpg" class="w-16 h-12 object-cover rounded" />
              <div class="flex-1">
                <h4 class="font-bold text-black text-sm">Man in the Box</h4>
                <p class="text-sm text-gray-600">Alice in Chains • 91% match</p>
                <div class="text-xs text-gray-500 mt-1">🤖 AI recommended</div>
              </div>
              <button class="win95-button px-2 py-1 text-xs">
                <i class="fas fa-play"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiscoverPage;