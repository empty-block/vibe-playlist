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
    
    // Remove slow page animations - just show content immediately
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
    <main 
      ref={pageRef!} 
      style={{
        'min-height': '100vh',
        'background': 'var(--dark-bg)'
      }}
      role="main"
      aria-label="Music discovery page"
    >
      <div style={{
        'padding': 'var(--space-4) var(--space-6)',
        'max-width': 'var(--container-2xl)',
        'margin': '0 auto'
      }}>
        
        {/* DISCOVERY HEADER */}
        <header style={{'margin-bottom': 'var(--space-8)'}} role="banner">
          <div style={{'text-align': 'center', 'margin-bottom': 'var(--space-8)'}}>
            <div style={{
              'display': 'flex',
              'align-items': 'center',
              'justify-content': 'center',
              'gap': 'var(--space-4)',
              'margin-bottom': 'var(--space-4)'
            }}>
              <div style={{
                'width': 'var(--space-4)',
                'height': 'var(--space-4)',
                'background': 'linear-gradient(to right, var(--neon-green), var(--neon-cyan))',
                'animation': 'pulse 2s infinite',
                'box-shadow': '0 0 8px var(--neon-green)'
              }}></div>
              <h1 style={{
                'font-weight': 'bold',
                'font-size': 'var(--text-2xl)',
                'color': 'transparent',
                'background': 'linear-gradient(to right, var(--neon-green), var(--neon-cyan), var(--neon-blue))',
                'background-clip': 'text',
                '-webkit-background-clip': 'text',
                'font-family': 'var(--font-display)',
                'letter-spacing': '0.1em'
              }}>
                DISCOVER_MUSIC.EXE
              </h1>
              <div style={{
                'width': 'var(--space-4)',
                'height': 'var(--space-4)',
                'background': 'linear-gradient(to right, var(--neon-cyan), var(--neon-blue))',
                'animation': 'pulse 2s infinite',
                'box-shadow': '0 0 8px var(--neon-cyan)'
              }}></div>
            </div>
            <p style={{
              'color': 'var(--neon-green)',
              'opacity': '0.7',
              'font-family': 'var(--font-display)',
              'font-size': 'var(--text-lg)'
            }}>
              Neural music discovery protocol activated
            </p>
          </div>

          {/* ENHANCED SEARCH TERMINAL */}
          <div style={{
            'background': 'linear-gradient(to bottom, rgba(26, 26, 26, 0.6), rgba(15, 15, 15, 0.6))',
            'border': '2px solid var(--neon-cyan)',
            'border-opacity': '0.3',
            'padding': 'var(--space-6)',
            'max-width': 'var(--container-lg)',
            'margin': '0 auto'
          }}>
            <div style={{'margin-bottom': 'var(--space-4)'}}>
              <div style={{
                'color': 'var(--neon-cyan)',
                'font-family': 'var(--font-display)',
                'font-size': 'var(--text-sm)',
                'text-transform': 'uppercase',
                'letter-spacing': '0.05em',
                'display': 'flex',
                'align-items': 'center',
                'gap': 'var(--space-2)'
              }}>
                <i class="fas fa-search"></i>
                <span>Search Database</span>
                <div style={{
                  'flex': '1',
                  'border-bottom': '1px solid var(--neon-cyan)',
                  'opacity': '0.3'
                }}></div>
                <span style={{
                  'color': 'var(--neon-cyan)',
                  'opacity': '0.6'
                }}>v2.1.3</span>
              </div>
            </div>
            
            <div style={{
              'display': 'flex',
              'flex-direction': 'column',
              'align-items': 'stretch',
              'gap': 'var(--space-3)'
            }}>
              <input
                type="text"
                placeholder="ENTER SEARCH PARAMETERS..."
                value={searchQuery()}
                onInput={(e) => setSearchQuery(e.currentTarget.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch();
                  }
                }}
                aria-label="Search for music tracks, artists, or genres"
                role="searchbox"
                style={{
                  'flex': '1',
                  'padding': 'var(--space-4) var(--space-6)',
                  'font-family': 'var(--font-display)',
                  'font-size': 'var(--text-lg)',
                  'background': 'rgba(15, 15, 15, 0.8)',
                  'border': '2px solid var(--neon-cyan)',
                  'border-opacity': '0.4',
                  'color': 'var(--neon-cyan)',
                  'text-shadow': '0 0 5px var(--neon-cyan)',
                  'transition': 'all 300ms ease'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'var(--neon-cyan)';
                  e.currentTarget.style.boxShadow = '0 0 8px rgba(4, 202, 244, 0.3)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderOpacity = '0.4';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
              <button 
                onClick={handleSearch}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleSearch();
                  }
                }}
                aria-label="Search database for music content"
                role="button"
                tabIndex={0}
                style={{
                  'padding': 'var(--space-4) var(--space-6)',
                  'font-family': 'var(--font-interface)',
                  'font-size': 'var(--text-lg)',
                  'font-weight': 'bold',
                  'background': 'var(--neon-blue)',
                  'color': 'var(--light-text)',
                  'border': 'none',
                  'cursor': 'pointer',
                  'transition': 'all 200ms ease',
                  'transform': 'translateZ(0)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 0 12px rgba(59, 0, 253, 0.4)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.transform = 'translateZ(0)';
                }}
                onMouseDown={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.filter = 'brightness(0.9)';
                }}
                onMouseUp={(e) => {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.filter = 'none';
                }}
              >
                <i class="fas fa-search" style={{'margin-right': 'var(--space-2)'}}></i>
                SCAN
              </button>
            </div>
          </div>
        </header>

        {/* TRENDING THIS WEEK SECTION */}
        <section style={{'margin-bottom': 'var(--space-8)'}} aria-label="Trending tracks this week">
          <TrendingSection 
            tracks={trendingTracks()} 
            isLoading={isTrendingLoading()} 
          />
        </section>

        {/* DISCOVERY GRID DASHBOARD */}
        <section style={{'margin-bottom': 'var(--space-8)'}} aria-label="Discovery dashboard with fresh and trending content">
          <DiscoveryGrid 
            isLoading={isFreshLoading()}
            trendingTracks={trendingTracks()}
            freshTracks={freshTracks()}
          />
        </section>

        {/* GENRE EXPLORER SECTION */}
        <section style={{'margin-bottom': 'var(--space-8)'}} aria-label="Explore music by genre">
          <GenreExplorer 
            genres={genreTags()} 
            isLoading={isGenresLoading()}
            onGenreClick={handleGenreClick}
          />
        </section>

      </div>
    </main>
  );
};

export default DiscoverPage;