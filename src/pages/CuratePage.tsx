import { Component, createSignal, onMount, Show } from 'solid-js';
import CreateChatInterface from '../components/chat/CreateChatInterface';
import { pageEnter, staggeredFadeIn } from '../utils/animations';

const CuratePage: Component = () => {
  const [curateMode, setCurateMode] = createSignal<'contribute' | 'create' | 'quality'>('create');
  const [showChatInterface, setShowChatInterface] = createSignal(false);
  let pageRef: HTMLDivElement | undefined;

  onMount(() => {
    if (pageRef) {
      pageEnter(pageRef);
      
      setTimeout(() => {
        const sections = pageRef!.querySelectorAll('.curate-section');
        if (sections) {
          staggeredFadeIn(sections);
        }
      }, 300);
    }
  });

  const handleStartCreating = () => {
    setShowChatInterface(true);
  };

  const handleContribute = () => {
    setCurateMode('contribute');
    // TODO: Show contribution interface
  };

  const handleViewStats = () => {
    setCurateMode('quality');
    // TODO: Show curation stats
  };

  return (
    <div ref={pageRef} class="min-h-screen bg-gradient-to-br from-black via-purple-900/20 to-slate-800 p-4">
      <div class="max-w-7xl mx-auto">
        
        {/* Curate Header */}
        <div class="curate-section mb-8 text-center">
          <h1 class="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-orange-400 mb-4 inline-flex items-center justify-center">
            <i class="fas fa-palette mr-3 text-pink-400"></i>
            Curate
          </h1>
          <p class="text-xl text-white/70 max-w-3xl mx-auto">
            Shape the musical landscape. Add to collective playlists, create themed collections, and contribute to the community's sonic journey.
          </p>
        </div>
        
        <Show when={!showChatInterface()} fallback={
          <div class="curate-section">
            <div class="mb-6">
              <button 
                onClick={() => setShowChatInterface(false)}
                class="text-white/60 hover:text-white transition-colors"
              >
                <i class="fas fa-arrow-left mr-2"></i>Back to curation options
              </button>
            </div>
            <CreateChatInterface />
          </div>
        }>
          {/* Curation Methods */}
          <div class="curate-section curation-methods grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            
            {/* Contribute Card */}
            <div 
              class="curation-card p-6 rounded-xl transition-all duration-300 cursor-pointer bg-white/5 border-2 border-white/10 backdrop-blur-sm hover:border-green-400/50 hover:bg-green-400/5 hover:shadow-2xl hover:shadow-green-400/20 hover:-translate-y-1"
              onClick={handleContribute}
            >
              <div class="card-header">
                <i class="fas fa-plus-circle text-2xl text-green-400 mb-3"></i>
                <h3 class="text-xl font-bold text-white">Contribute to Library</h3>
              </div>
              <p class="text-white/60 mb-4">Add tracks to the collective music library and existing community playlists.</p>
              <button class="w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200 bg-gradient-to-r from-blue-600/30 to-cyan-400/30 text-cyan-400 border border-cyan-400/30 hover:from-blue-600/40 hover:to-cyan-400/40 hover:shadow-lg hover:shadow-cyan-400/20 hover:-translate-y-px">
                <i class="fas fa-music mr-2"></i>Browse Collections
              </button>
            </div>
            
            {/* Create Card */}
            <div 
              class="curation-card p-6 rounded-xl transition-all duration-300 cursor-pointer bg-white/5 border-2 border-white/10 backdrop-blur-sm hover:border-purple-400/50 hover:bg-purple-400/5 hover:shadow-2xl hover:shadow-purple-400/20 hover:-translate-y-1"
              onClick={handleStartCreating}
            >
              <div class="card-header">
                <i class="fas fa-wand-magic text-2xl text-purple-400 mb-3"></i>
                <h3 class="text-xl font-bold text-white">Create New Playlist</h3>
              </div>
              <p class="text-white/60 mb-4">Start a new themed collection with AI assistance and community input.</p>
              <button class="w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200 bg-gradient-to-r from-blue-600/30 to-cyan-400/30 text-cyan-400 border border-cyan-400/30 hover:from-blue-600/40 hover:to-cyan-400/40 hover:shadow-lg hover:shadow-cyan-400/20 hover:-translate-y-px">
                <i class="fas fa-sparkles mr-2"></i>Start Creating
              </button>
            </div>
            
            {/* Quality Card */}
            <div 
              class="curation-card p-6 rounded-xl transition-all duration-300 cursor-pointer bg-white/5 border-2 border-white/10 backdrop-blur-sm hover:border-orange-400/50 hover:bg-orange-400/5 hover:shadow-2xl hover:shadow-orange-400/20 hover:-translate-y-1"
              onClick={handleViewStats}
            >
              <div class="card-header">
                <i class="fas fa-star text-2xl text-orange-400 mb-3"></i>
                <h3 class="text-xl font-bold text-white">Quality Contributions</h3>
              </div>
              <p class="text-white/60 mb-4">Your curation quality score and community impact metrics.</p>
              <button class="w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200 bg-gradient-to-r from-blue-600/30 to-cyan-400/30 text-cyan-400 border border-cyan-400/30 hover:from-blue-600/40 hover:to-cyan-400/40 hover:shadow-lg hover:shadow-cyan-400/20 hover:-translate-y-px">
                <i class="fas fa-chart-line mr-2"></i>View Stats
              </button>
            </div>
          </div>

          {/* Recent Activity */}
          <div class="curate-section mt-8">
            <div class="bg-gradient-to-b from-slate-800/50 to-slate-900/50 rounded-xl p-6 border border-cyan-400/20">
              <h3 class="text-xl font-bold text-white mb-4">
                <i class="fas fa-clock mr-2 text-cyan-400"></i>Recent Curation Activity
              </h3>
              <div class="space-y-3">
                <div class="flex items-center justify-between p-3 bg-black/30 rounded-lg">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-gradient-to-br from-green-400 to-cyan-400 rounded-full flex items-center justify-center text-white font-bold">
                      +5
                    </div>
                    <div>
                      <p class="text-white font-semibold">Tracks added to Library</p>
                      <p class="text-white/60 text-sm">2 hours ago</p>
                    </div>
                  </div>
                  <i class="fas fa-arrow-right text-white/40"></i>
                </div>
                
                <div class="flex items-center justify-between p-3 bg-black/30 rounded-lg">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold">
                      <i class="fas fa-list text-sm"></i>
                    </div>
                    <div>
                      <p class="text-white font-semibold">Created "Sunday Vibes"</p>
                      <p class="text-white/60 text-sm">Yesterday</p>
                    </div>
                  </div>
                  <i class="fas fa-arrow-right text-white/40"></i>
                </div>
                
                <div class="flex items-center justify-between p-3 bg-black/30 rounded-lg">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-400 rounded-full flex items-center justify-center text-white font-bold">
                      ⭐
                    </div>
                    <div>
                      <p class="text-white font-semibold">Quality Score Increased</p>
                      <p class="text-white/60 text-sm">3 days ago</p>
                    </div>
                  </div>
                  <i class="fas fa-arrow-right text-white/40"></i>
                </div>
              </div>
            </div>
          </div>
        </Show>
      </div>
    </div>
  );
};

export default CuratePage;