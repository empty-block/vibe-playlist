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
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0a0a0a 100%)'
      }}
    >
      <div class="p-6 max-w-7xl mx-auto">
      {/* SIMPLIFIED DISCOVERY HEADER */}
      <div 
        class="relative text-center mb-12 p-8 rounded-xl overflow-hidden"
        style={{
          background: 'linear-gradient(145deg, #0a0a0a, #1a1a1a)',
          border: '1px solid rgba(4, 202, 244, 0.2)',
          'box-shadow': 'inset 0 0 20px rgba(0, 0, 0, 0.6)'
        }}
      >
        {/* Subtle retro scan lines */}
        <div 
          class="absolute inset-0 pointer-events-none opacity-5"
          style={{
            background: `repeating-linear-gradient(
              0deg,
              transparent 0px,
              transparent 3px,
              rgba(4, 202, 244, 0.08) 4px,
              rgba(4, 202, 244, 0.08) 5px
            )`
          }}
        />
        
        {/* Status indicator */}
        <div class="flex items-center justify-center gap-4 mb-8">
          <div 
            class="w-3 h-3 rounded-full animate-pulse"
            style={{
              background: '#00f92a',
              'box-shadow': '0 0 8px rgba(0, 249, 42, 0.6)'
            }}
          />
          <span 
            class="text-xs font-mono uppercase tracking-widest"
            style={{
              color: '#04caf4',
              'text-shadow': '0 0 3px rgba(4, 202, 244, 0.5)',
              'font-family': 'Courier New, monospace'
            }}
          >
            DISCOVERY SYSTEM ONLINE
          </span>
        </div>
        
        <h1 
          class="font-mono font-bold text-5xl lg:text-6xl"
          style={{
            color: '#f906d6',
            'text-shadow': '0 0 8px rgba(249, 6, 214, 0.7)',
            'font-family': 'Courier New, monospace',
            'letter-spacing': '0.1em'
          }}
        >
          DISCOVER
        </h1>
      </div>

      {/* NEON SEARCH TERMINAL */}
      <div 
        class="discover-section mb-12 relative p-6 rounded-xl overflow-hidden"
        style={{ 
          opacity: '0',
          background: 'linear-gradient(145deg, #0a0a0a, #1a1a1a)',
          border: '1px solid rgba(0, 249, 42, 0.3)',
          'box-shadow': `
            inset 0 0 15px rgba(0, 0, 0, 0.8),
            0 0 15px rgba(0, 249, 42, 0.1)
          `
        }}
      >
        {/* Scan lines for search */}
        <div 
          class="absolute inset-0 pointer-events-none opacity-8"
          style={{
            background: `repeating-linear-gradient(
              0deg,
              transparent 0px,
              transparent 2px,
              rgba(0, 249, 42, 0.08) 3px,
              rgba(0, 249, 42, 0.08) 4px
            )`
          }}
        />
        
        <div 
          class="text-sm font-mono uppercase tracking-wide mb-4"
          style={{
            color: 'rgba(0, 249, 42, 0.7)',
            'text-shadow': '0 0 3px rgba(0, 249, 42, 0.5)'
          }}
        >
          <i class="fas fa-search mr-2"></i>
          SEARCH DATABASE
        </div>
        
        <div class="flex items-center gap-3 max-w-3xl mx-auto">
          <input
            type="text"
            placeholder="ENTER SEARCH PARAMETERS..."
            value={searchQuery()}
            onInput={(e) => setSearchQuery(e.currentTarget.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            class="flex-1 px-6 py-4 font-mono font-bold text-lg rounded"
            style={{
              background: 'rgba(0, 0, 0, 0.9)',
              border: '2px solid rgba(0, 249, 42, 0.4)',
              color: '#00f92a',
              'text-shadow': '0 0 5px rgba(0, 249, 42, 0.6)',
              'font-family': 'Courier New, monospace',
              'min-height': '56px'
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
            class="px-6 py-4 font-mono font-bold text-lg transition-all duration-300 rounded"
            style={{
              background: 'linear-gradient(145deg, #2a2a2a, #1a1a1a)',
              border: '2px solid rgba(0, 249, 42, 0.4)',
              color: '#ffffff',
              'font-family': 'Courier New, monospace',
              'min-height': '56px',
              'min-width': '56px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#00f92a';
              e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 249, 42, 0.8)';
              e.currentTarget.style.color = '#00f92a';
              e.currentTarget.style.textShadow = '0 0 10px rgba(0, 249, 42, 0.9)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(0, 249, 42, 0.4)';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.color = '#ffffff';
              e.currentTarget.style.textShadow = 'none';
            }}
          >
            <i class="fas fa-search"></i>
          </button>
        </div>
      </div>

      {/* NEW DISCOVERIES */}
      <div class="discover-section mb-16" style={{ opacity: '0' }}>
        <div 
          class="mb-6 pl-4 border-l-4"
          style={{
            'border-color': '#f906d6'
          }}
        >
          <h2 
            class="font-mono font-bold text-xl lg:text-2xl mb-1"
            style={{
              color: '#ffffff',
              'text-shadow': '0 2px 4px rgba(0, 0, 0, 0.8)',
              'font-family': 'Courier New, monospace'
            }}
          >
            <i class="fas fa-sparkles mr-3 text-base" style={{ color: '#f906d6' }}></i>
            NEW DISCOVERIES
          </h2>
          <p 
            class="font-mono text-sm"
            style={{
              color: 'rgba(249, 6, 214, 0.7)',
              'font-family': 'Courier New, monospace'
            }}
          >
            FRESH SONIC ARCHIVES DETECTED
          </p>
        </div>
        
        <DiscoveryBar
          playlists={Object.values(playlists)}
          onPlaylistClick={handlePlaylistChange}
        />
      </div>

      {/* TRENDING DATA */}
      <div class="discover-section mb-16" style={{ opacity: '0' }}>
        <div 
          class="mb-6 pl-4 border-l-4"
          style={{
            'border-color': '#ff9b00'
          }}
        >
          <h2 
            class="font-mono font-bold text-xl lg:text-2xl mb-1"
            style={{
              color: '#ffffff',
              'text-shadow': '0 2px 4px rgba(0, 0, 0, 0.8)',
              'font-family': 'Courier New, monospace'
            }}
          >
            <i class="fas fa-chart-line mr-3 text-base" style={{ color: '#ff9b00' }}></i>
            TRENDING DATA
          </h2>
          <p 
            class="font-mono text-sm"
            style={{
              color: 'rgba(211, 246, 10, 0.7)',
              'font-family': 'Courier New, monospace'
            }}
          >
            HIGH-FREQUENCY AUDIO STREAMS THIS CYCLE
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
            class="font-mono font-bold text-xl lg:text-2xl mb-1"
            style={{
              color: '#ffffff',
              'text-shadow': '0 2px 4px rgba(0, 0, 0, 0.8)',
              'font-family': 'Courier New, monospace'
            }}
          >
            <i class="fas fa-brain mr-3 text-base" style={{ color: '#04caf4' }}></i>
            NEURAL MATCH
          </h2>
          <p 
            class="font-mono text-sm"
            style={{
              color: 'rgba(4, 202, 244, 0.7)',
              'font-family': 'Courier New, monospace'
            }}
          >
            AI-ANALYZED PERSONAL TASTE PROFILE
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