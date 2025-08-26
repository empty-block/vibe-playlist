import { Component, onMount, Show, createSignal, createMemo } from 'solid-js';
import { useParams } from '@solidjs/router';
import Playlist from '../components/playlist/Playlist';
import PlaylistHeader from '../components/playlist/PlaylistHeader';
import DiscoveryBar from '../components/common/DiscoveryBar';
import { getPlaylistTracksAsync, getCurrentPlaylistTracks, playlists, currentPlaylistId } from '../stores/playlistStore';
import { pageEnter, staggeredFadeIn } from '../utils/animations';

const ListenPage: Component = () => {
  const params = useParams();
  const [isLoading, setIsLoading] = createSignal(false);
  let pageRef: HTMLDivElement | undefined;

  // Simple handlers like in PlayerPage
  const handleCreatorClick = (creatorUsername: string) => {
    console.log('Navigate to creator profile:', creatorUsername);
  };
  
  const handleAddTrack = () => {
    console.log('Add track clicked');
  };
  
  const handlePlayPlaylist = () => {
    console.log('Play playlist clicked');
  };

  onMount(async () => {
    setIsLoading(true);
    
    // If there's a playlist ID in params, load it
    if (params.id) {
      await getPlaylistTracksAsync(params.id);
    } else if (!currentPlaylistId()) {
      // If no current playlist, load the first one
      const availablePlaylists = Object.values(playlists);
      if (availablePlaylists.length > 0) {
        await getPlaylistTracksAsync(availablePlaylists[0].id);
      }
    }
    
    setIsLoading(false);

    // Apply page animations
    if (pageRef) {
      pageEnter(pageRef);
      
      setTimeout(() => {
        const sections = pageRef!.querySelectorAll('.listen-section');
        if (sections) {
          staggeredFadeIn(sections);
        }
      }, 300);
    }
  });

  return (
    <div ref={pageRef} class="min-h-screen bg-gradient-to-br from-black via-slate-900 to-slate-800 p-4">
      <div class="max-w-7xl mx-auto">
        
        {/* Page Header */}
        <div class="listen-section mb-8">
          <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 class="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-cyan-400 inline-flex items-center">
                <i class="fas fa-headphones mr-3 text-green-400"></i>
                Listen
              </h1>
              <p class="text-lg text-white/70 mt-2">
                Immerse yourself in curated music conversations
              </p>
            </div>
            
            {/* Social Listening Options */}
            <div class="social-listen-controls flex gap-3">
              <button class="px-4 py-2 rounded-lg font-semibold transition-all duration-200 bg-gradient-to-r from-green-400/20 to-cyan-400/20 text-green-400 border border-green-400/30 hover:from-green-400/30 hover:to-cyan-400/30 hover:shadow-lg hover:shadow-green-400/20 hover:-translate-y-px">
                <i class="fas fa-users mr-2"></i>Join Session
              </button>
              <button class="px-4 py-2 rounded-lg font-semibold transition-all duration-200 bg-gradient-to-r from-green-400/20 to-cyan-400/20 text-green-400 border border-green-400/30 hover:from-green-400/30 hover:to-cyan-400/30 hover:shadow-lg hover:shadow-green-400/20 hover:-translate-y-px">
                <i class="fas fa-share mr-2"></i>Share Queue
              </button>
            </div>
          </div>
        </div>

        {/* Main Listen Interface */}
        <div class="listen-section">
          <Show when={!isLoading()} fallback={
            <div class="text-center py-16">
              <div class="text-cyan-400/60 text-lg mb-4 animate-pulse">🎵</div>
              <div class="text-white/70 text-lg">Loading your music...</div>
            </div>
          }>
            <div class="space-y-8">
              {/* Current Playlist Context */}
              <div class="bg-gradient-to-b from-slate-800/50 to-slate-900/50 rounded-xl p-6 border border-cyan-400/20 shadow-xl">
                <Show when={currentPlaylistId() && playlists[currentPlaylistId()!]} fallback={
                  <div class="text-center py-8">
                    <h2 class="text-xl text-white/60">No playlist selected</h2>
                    <p class="text-white/40">Select a playlist to start listening</p>
                  </div>
                }>
                  <PlaylistHeader 
                    playlist={playlists[currentPlaylistId()!]!}
                    onCreatorClick={handleCreatorClick}
                    onAddTrack={handleAddTrack}
                    onPlayPlaylist={handlePlayPlaylist}
                  />
                </Show>
                
                {/* Conversation Context */}
                <div class="mt-6 p-4 bg-black/30 rounded-lg border border-cyan-400/10">
                  <div class="flex items-center gap-3 mb-3">
                    <i class="fas fa-comments text-cyan-400"></i>
                    <h3 class="text-lg font-semibold text-white">Music Conversation</h3>
                  </div>
                  <p class="text-white/60 text-sm">
                    This playlist is part of an ongoing musical dialogue. Each track tells a story, responds to another, or sets a new theme.
                  </p>
                </div>
              </div>

              {/* Playlist Tracks */}
              <div class="bg-gradient-to-b from-slate-900/60 to-black/60 rounded-xl border border-cyan-400/20">
                <Playlist />
              </div>

              {/* Discovery Bar */}
              <div class="listen-section">
                <div class="mb-4">
                  <h3 class="text-xl font-bold text-white mb-2">Discover More Conversations</h3>
                  <p class="text-white/60 text-sm">Explore other musical journeys from the community</p>
                </div>
                <DiscoveryBar />
              </div>
            </div>
          </Show>
        </div>
      </div>
    </div>
  );
};

export default ListenPage;