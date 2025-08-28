import { Component, createSignal, onMount } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { pageEnter, staggeredFadeIn } from '../utils/animations';

// New discover components
import TrendingSection from '../components/discover/TrendingSection';
import GenreExplorer from '../components/discover/GenreExplorer';
import DiscoveryGrid from '../components/discover/DiscoveryGrid';

// Discover store
import {
  trendingTracks,
  freshTracks,
  genreTags,
  isTrendingLoading,
  isFreshLoading,
  isGenresLoading,
  initializeDiscoverData
} from '../stores/discoverStore';

const DiscoverPage: Component = () => {
  const [searchQuery, setSearchQuery] = createSignal('');
  const navigate = useNavigate();
  let pageRef: HTMLDivElement | undefined;

  onMount(async () => {
    // Initialize discover data
    await initializeDiscoverData();
    
    if (pageRef) {
      pageEnter(pageRef);
      
      // Staggered fade-in for sections with longer delays
      setTimeout(() => {
        const sections = pageRef!.querySelectorAll('.discover-section');
        if (sections) {
          staggeredFadeIn(sections);
        }
      }, 500);
    }
  });

  const handleSearch = () => {
    // Enhanced search functionality - could filter all sections
    console.log('Searching for:', searchQuery());
    // TODO: Implement search across trending, fresh, curators, genres
  };

  const handleGenreClick = (genre: any) => {
    console.log('Genre clicked:', genre);
    // TODO: Filter content by selected genre
  };

  return (
    <div 
      ref={pageRef!} 
      class="min-h-screen bg-gradient-to-br from-black via-slate-900 to-slate-800"
      style={{ opacity: '0' }}
    >
      <div class="p-4 md:p-6 max-w-7xl mx-auto">
        
        {/* DISCOVERY HEADER */}
        <div class="discover-section mb-8" style={{ opacity: '0' }}>
          <div class="text-center mb-8">
            <div class="flex items-center justify-center gap-4 mb-4">
              <div class="w-4 h-4 rounded-full bg-gradient-to-r from-green-400 to-cyan-400 animate-pulse shadow-lg shadow-green-400/50"></div>
              <h1 class="font-bold text-3xl lg:text-4xl text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-cyan-400 to-blue-400 font-mono tracking-wider">
                DISCOVER_MUSIC.EXE
              </h1>
              <div class="w-4 h-4 rounded-full bg-gradient-to-r from-cyan-400 to-blue-400 animate-pulse shadow-lg shadow-cyan-400/50"></div>
            </div>
            <p class="text-green-300/70 font-mono text-lg">
              Neural music discovery protocol activated
            </p>
          </div>

          {/* ENHANCED SEARCH TERMINAL */}
          <div class="retro-music-terminal bg-gradient-to-b from-slate-900/60 to-black/60 border-2 border-green-400/30 rounded-xl p-6 max-w-4xl mx-auto">
            <div class="terminal-header mb-4">
              <div class="text-green-400 font-mono text-sm uppercase tracking-wide flex items-center gap-2">
                <i class="fas fa-search"></i>
                <span>Search Database</span>
                <div class="flex-1 border-b border-green-400/30"></div>
                <span class="text-green-400/60">v2.1.3</span>
              </div>
            </div>
            
            <div class="flex flex-col md:flex-row items-stretch md:items-center gap-3">
              <input
                type="text"
                placeholder="ENTER SEARCH PARAMETERS..."
                value={searchQuery()}
                onInput={(e) => setSearchQuery(e.currentTarget.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                class="flex-1 px-6 py-4 font-mono text-lg bg-black/80 border-2 border-green-400/40 text-green-400 rounded-lg focus:border-green-400 focus:shadow-lg focus:shadow-green-400/20 transition-all duration-300"
                style={{ 'text-shadow': '0 0 5px rgba(0, 249, 42, 0.6)' }}
              />
              <button 
                onClick={handleSearch}
                class="px-6 py-4 font-bold text-lg bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                <i class="fas fa-search mr-2"></i>
                SCAN
              </button>
            </div>
          </div>
        </div>

        {/* TRENDING THIS WEEK SECTION */}
        <TrendingSection 
          tracks={trendingTracks()} 
          isLoading={isTrendingLoading()} 
        />

        {/* DISCOVERY GRID DASHBOARD */}
        <DiscoveryGrid 
          isLoading={isFreshLoading()}
          trendingTracks={trendingTracks()}
          freshTracks={freshTracks()}
        />


        {/* GENRE EXPLORER SECTION */}
        <GenreExplorer 
          genres={genreTags()} 
          isLoading={isGenresLoading()}
          onGenreClick={handleGenreClick}
        />

      </div>
    </div>
  );
};

export default DiscoverPage;