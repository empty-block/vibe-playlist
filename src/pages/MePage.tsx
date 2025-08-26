import { Component, createSignal, createEffect, onMount, Show, For } from 'solid-js';
import { useParams, useNavigate } from '@solidjs/router';
import { getTracksByUserAsync, Track, setCurrentTrack, setIsPlaying } from '../stores/playlistStore';
import TrackItem from '../components/playlist/TrackItem';
import { pageEnter, staggeredFadeIn } from '../utils/animations';

const MePage: Component = () => {
  const params = useParams();
  const navigate = useNavigate();
  const [tracks, setTracks] = createSignal<Track[]>([]);
  const [isLoading, setIsLoading] = createSignal(true);
  const [filterMode, setFilterMode] = createSignal<'all' | 'conversations' | 'liked'>('all');
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
      const userTracks = await getTracksByUserAsync(currentUser.username);
      setTracks(userTracks);
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

  const filteredTracks = () => {
    const allTracks = tracks();
    switch (filterMode()) {
      case 'conversations':
        return allTracks.filter(t => t.isConversation);
      case 'liked':
        return allTracks.filter(t => t.isLiked);
      default:
        return allTracks;
    }
  };

  return (
    <div ref={pageRef} class="min-h-screen bg-gradient-to-br from-black via-slate-900 to-slate-800 p-4">
      <div class="max-w-7xl mx-auto">
        
        {/* Streamlined Profile Header */}
        <div class="me-section mb-8">
          <div class="bg-gradient-to-b from-slate-800/50 to-slate-900/50 rounded-xl p-8 border border-pink-400/20 shadow-xl">
            <div class="flex flex-col lg:flex-row items-center gap-6">
              
              {/* Avatar */}
              <div class="relative">
                <img 
                  src={currentUser.avatar}
                  alt={currentUser.displayName}
                  class="w-32 h-32 rounded-full border-4 border-pink-400/50 shadow-2xl"
                />
                <div class="absolute -bottom-2 -right-2 w-10 h-10 bg-gradient-to-br from-green-400 to-cyan-400 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                  {currentUser.curationScore}
                </div>
              </div>

              {/* Profile Info */}
              <div class="flex-1 text-center lg:text-left">
                <h1 class="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400 mb-2">
                  {currentUser.displayName}
                </h1>
                <p class="text-lg text-white/60 mb-4">@{currentUser.username}</p>
                
                {/* Quick Stats */}
                <div class="flex flex-wrap gap-6 justify-center lg:justify-start">
                  <div>
                    <span class="text-2xl font-bold text-white">{tracks().length}</span>
                    <span class="text-white/60 ml-2">Tracks Shared</span>
                  </div>
                  <div>
                    <span class="text-2xl font-bold text-cyan-400">{currentUser.followers}</span>
                    <span class="text-white/60 ml-2">Followers</span>
                  </div>
                  <div>
                    <span class="text-2xl font-bold text-green-400">{currentUser.curationScore}</span>
                    <span class="text-white/60 ml-2">Curation Score</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div class="flex flex-col gap-3">
                <button 
                  onClick={() => navigate('/curate')}
                  class="px-6 py-3 rounded-lg font-semibold transition-all duration-200 bg-gradient-to-r from-pink-400 to-purple-400 text-white hover:from-pink-500 hover:to-purple-500 hover:shadow-lg hover:shadow-pink-400/30 hover:-translate-y-px"
                >
                  <i class="fas fa-plus mr-2"></i>Add Music
                </button>
                <button class="px-6 py-3 rounded-lg font-semibold transition-all duration-200 bg-white/10 text-white border border-white/20 hover:bg-white/20 hover:border-white/30">
                  <i class="fas fa-cog mr-2"></i>Settings
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Music Activity */}
        <div class="me-section">
          <div class="mb-6">
            <h2 class="text-2xl font-bold text-white mb-4">My Music Activity</h2>
            
            {/* Filter Tabs */}
            <div class="flex gap-2">
              <button
                onClick={() => setFilterMode('all')}
                class={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
                  filterMode() === 'all'
                    ? 'bg-gradient-to-r from-cyan-400 to-blue-400 text-white'
                    : 'bg-white/10 text-white/60 hover:bg-white/20 hover:text-white'
                }`}
              >
                All ({tracks().length})
              </button>
              <button
                onClick={() => setFilterMode('conversations')}
                class={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
                  filterMode() === 'conversations'
                    ? 'bg-gradient-to-r from-cyan-400 to-blue-400 text-white'
                    : 'bg-white/10 text-white/60 hover:bg-white/20 hover:text-white'
                }`}
              >
                Conversations
              </button>
              <button
                onClick={() => setFilterMode('liked')}
                class={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
                  filterMode() === 'liked'
                    ? 'bg-gradient-to-r from-cyan-400 to-blue-400 text-white'
                    : 'bg-white/10 text-white/60 hover:bg-white/20 hover:text-white'
                }`}
              >
                Liked
              </button>
            </div>
          </div>

          {/* Tracks List */}
          <div class="bg-gradient-to-b from-slate-900/60 to-black/60 rounded-xl border border-cyan-400/20 p-6">
            <Show when={!isLoading()} fallback={
              <div class="text-center py-16">
                <div class="text-cyan-400/60 text-lg mb-4 animate-pulse">🎵</div>
                <div class="text-white/70 text-lg">Loading your music...</div>
              </div>
            }>
              <Show when={filteredTracks().length > 0} fallback={
                <div class="text-center py-16">
                  <div class="text-white/40 text-lg mb-4">No tracks found</div>
                  <button 
                    onClick={() => navigate('/curate')}
                    class="text-cyan-400 hover:text-cyan-300 transition-colors"
                  >
                    Start adding music <i class="fas fa-arrow-right ml-2"></i>
                  </button>
                </div>
              }>
                <div class="space-y-3">
                  <For each={filteredTracks()}>
                    {(track, index) => (
                      <div class="me-track-item">
                        <TrackItem 
                          track={track} 
                          trackNumber={index() + 1}
                          onPlay={() => {
                            setCurrentTrack(track);
                            setIsPlaying(true);
                          }}
                        />
                      </div>
                    )}
                  </For>
                </div>
              </Show>
            </Show>
          </div>
        </div>

        {/* Quick Links */}
        <div class="me-section mt-8">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button 
              onClick={() => navigate('/library')}
              class="p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-cyan-400/30 transition-all text-center"
            >
              <i class="fas fa-home text-2xl text-cyan-400 mb-2"></i>
              <p class="text-white font-semibold">Browse Library</p>
            </button>
            <button 
              onClick={() => navigate('/listen')}
              class="p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-green-400/30 transition-all text-center"
            >
              <i class="fas fa-headphones text-2xl text-green-400 mb-2"></i>
              <p class="text-white font-semibold">Start Listening</p>
            </button>
            <button 
              onClick={() => navigate('/curate')}
              class="p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-pink-400/30 transition-all text-center"
            >
              <i class="fas fa-palette text-2xl text-pink-400 mb-2"></i>
              <p class="text-white font-semibold">Curate Music</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MePage;