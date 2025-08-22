import { Component, createSignal, onMount } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { playlists, setCurrentPlaylistId } from '../stores/playlistStore';
import DiscoveryBar from '../components/common/DiscoveryBar';
import { pageEnter, staggeredFadeIn } from '../utils/animations';

const DiscoverPage: Component = () => {
  const [searchQuery, setSearchQuery] = createSignal('');
  const navigate = useNavigate();
  let pageRef: HTMLDivElement | undefined;

  onMount(() => {
    if (pageRef) {
      pageEnter(pageRef);
      
      // Simple staggered fade-in for sections
      setTimeout(() => {
        const sections = pageRef.querySelectorAll('.discover-section');
        if (sections) {
          staggeredFadeIn(sections);
        }
      }, 300);
    }
  });

  const handlePlaylistChange = (playlistId: string) => {
    setCurrentPlaylistId(playlistId);
    // Redirect to player page to browse playlist without auto-playing
    navigate('/player');
  };

  const handleSearch = () => {
    // Search functionality placeholder
    console.log('Searching for:', searchQuery());
  };

  return (
    <div 
      ref={pageRef!} 
      class="min-h-screen"
      style={{ 
        opacity: '0',
        background: '#0f0f0f'
      }}
    >
      <div class="p-4 md:p-6 max-w-7xl mx-auto">
      {/* DISCOVERY HEADER */}
      <div 
        class="mb-6 p-4 pl-6 border-l-4 flex items-center gap-3"
        style={{
          'border-color': '#00f92a'
        }}
      >
        <div 
          class="w-3 h-3 rounded-full animate-pulse flex-shrink-0"
          style={{
            background: '#00f92a',
            'box-shadow': '0 0 8px rgba(0, 249, 42, 0.6)'
          }}
        />
        <h1 
          class="font-bold text-2xl lg:text-3xl"
          style={{
            color: '#f906d6',
            'text-shadow': '0 0 8px rgba(249, 6, 214, 0.7)',
            'letter-spacing': '0.1em'
          }}
        >
          Discover Music
        </h1>
      </div>

      {/* SEARCH TERMINAL */}
      <div 
        class="discover-section relative p-6 rounded-xl overflow-hidden"
        style={{ 
          opacity: '0',
          'margin-bottom': '52px',
          background: '#1a1a1a',
          border: '2px solid rgba(0, 249, 42, 0.4)'
        }}
      >
        
        <div 
          class="text-sm md:text-base font-bold uppercase tracking-wide mb-4"
          style={{
            color: 'rgba(0, 249, 42, 0.7)',
            'text-shadow': '0 0 3px rgba(0, 249, 42, 0.5)'
          }}
        >
          <i class="fas fa-search mr-2"></i>
          Search Database
        </div>
        
        <div class="flex flex-col md:flex-row items-stretch md:items-center gap-3 max-w-3xl mx-auto">
          <input
            type="text"
            placeholder="ENTER SEARCH PARAMETERS..."
            value={searchQuery()}
            onInput={(e) => setSearchQuery(e.currentTarget.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            class="flex-1 px-4 md:px-6 py-3 md:py-4 font-bold text-base md:text-lg rounded"
            style={{
              background: 'rgba(0, 0, 0, 0.9)',
              border: '2px solid rgba(0, 249, 42, 0.4)',
              color: '#00f92a',
              'text-shadow': '0 0 5px rgba(0, 249, 42, 0.6)',
              'min-height': '48px'
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#00f92a';
              e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 249, 42, 0.4)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'rgba(0, 249, 42, 0.4)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          />
          <button 
            onClick={handleSearch}
            class="px-4 md:px-6 py-3 md:py-4 font-bold text-base md:text-lg transition-all duration-300 rounded"
            style={{
              background: 'linear-gradient(135deg, #3b00fd 0%, #04caf4 100%)',
              border: '2px solid #3b00fd',
              color: '#ffffff',
              'min-height': '48px',
              'min-width': '48px',
              'box-shadow': '0 0 10px rgba(59, 0, 253, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 0 20px rgba(59, 0, 253, 0.6)';
              e.currentTarget.style.transform = 'scale(1.02)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 0 10px rgba(59, 0, 253, 0.3)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <i class="fas fa-search"></i>
          </button>
        </div>
      </div>

      {/* NEW DISCOVERIES */}
      <div class="discover-section" style={{ 
        opacity: '0',
        'margin-bottom': '84px' 
      }}>
        <div 
          class="mb-6 pl-4 border-l-4"
          style={{
            'border-color': '#f906d6'
          }}
        >
          <h2 
            class="font-bold text-lg md:text-xl lg:text-2xl mb-1"
            style={{
              color: '#ffffff'
            }}
          >
            <i class="fas fa-sparkles mr-3 text-base" style={{ color: '#f906d6' }}></i>
            New Discoveries
          </h2>
          <p 
            class="text-sm"
            style={{
              color: 'rgba(249, 6, 214, 0.7)'
            }}
          >
            Fresh sonic archives detected
          </p>
        </div>
        
        <DiscoveryBar
          playlists={Object.values(playlists)}
          onPlaylistClick={handlePlaylistChange}
        />
      </div>

      {/* TRENDING DATA */}
      <div class="discover-section" style={{ 
        opacity: '0',
        'margin-bottom': '84px' 
      }}>
        <div 
          class="mb-6 pl-4 border-l-4"
          style={{
            'border-color': '#ff9b00'
          }}
        >
          <h2 
            class="font-bold text-lg md:text-xl lg:text-2xl mb-1"
            style={{
              color: '#ffffff'
            }}
          >
            <i class="fas fa-chart-line mr-3 text-base" style={{ color: '#ff9b00' }}></i>
            Trending Data
          </h2>
          <p 
            class="text-sm"
            style={{
              color: 'rgba(255, 155, 0, 0.7)'
            }}
          >
            High-frequency audio streams this cycle
          </p>
        </div>
        
        <DiscoveryBar
          playlists={Object.values(playlists).slice(0, 4)}
          onPlaylistClick={handlePlaylistChange}
        />
      </div>

      {/* NEURAL MATCH */}
      <div class="discover-section" style={{ opacity: '0' }}>
        <div 
          class="mb-6 pl-4 border-l-4"
          style={{
            'border-color': '#04caf4'
          }}
        >
          <h2 
            class="font-bold text-lg md:text-xl lg:text-2xl mb-1"
            style={{
              color: '#ffffff'
            }}
          >
            <i class="fas fa-brain mr-3 text-base" style={{ color: '#04caf4' }}></i>
            Neural Match
          </h2>
          <p 
            class="text-sm"
            style={{
              color: 'rgba(4, 202, 244, 0.7)'
            }}
          >
            AI-analyzed personal taste profile
          </p>
        </div>
        
        <DiscoveryBar
          playlists={Object.values(playlists).slice(2, 6)}
          onPlaylistClick={handlePlaylistChange}
        />
      </div>
      </div>
    </div>
  );
};

export default DiscoverPage;