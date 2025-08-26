import { Component, createSignal, For, Show, onMount } from 'solid-js';
import { pageEnter, staggeredFadeIn } from '../utils/animations';
import { mockDataService } from '../data/mockData';
import anime from 'animejs';

interface TrendingItem {
  id: string;
  rank: number;
  change: 'up' | 'down' | 'same';
  title: string;
  subtitle: string;
  metric: string;
  icon?: string;
  avatar?: string;
}

const TrendingPage: Component = () => {
  const [currentCategory, setCurrentCategory] = createSignal<'playlists' | 'songs' | 'artists' | 'users'>('playlists');
  const [currentTimeframe, setCurrentTimeframe] = createSignal<'today' | 'week' | 'month' | 'all'>('today');
  const [isLoading, setIsLoading] = createSignal(false);
  let pageRef: HTMLDivElement | undefined;

  onMount(async () => {
    if (pageRef) {
      pageEnter(pageRef);
    }
    
    // Load initial trending data
    await loadTrendingData();
    
    // Animate trending items on load
    setTimeout(() => {
      const trendingItems = pageRef?.querySelectorAll('.trending-item');
      if (trendingItems) {
        staggeredFadeIn(trendingItems);
      }
    }, 300);
  });

  // Helper functions for neon color system with improved hierarchy
  const getRankColor = (rank: number) => {
    if (rank === 1) return '#00f92a'; // neon-green (winner)
    if (rank <= 3) return '#ff9b00';   // neon-orange (top 3) 
    if (rank <= 10) return '#04caf4';  // neon-cyan (top 10)
    return '#f906d6';                  // neon-pink (others)
  };


  const getCategoryIcon = (category: string) => {
    const icons = {
      playlists: '📂',
      songs: '🎵', 
      artists: '🎤',
      users: '👤'
    };
    return icons[category as keyof typeof icons] || '';
  };

  const [trendingData, setTrendingData] = createSignal<TrendingItem[]>([]);

  // Load trending data from mock service
  const loadTrendingData = async () => {
    try {
      const data = await mockDataService.getTrendingData(currentCategory(), currentTimeframe());
      setTrendingData(data);
    } catch (error) {
      console.error('Failed to load trending data:', error);
      setTrendingData([]);
    }
  };

  const currentData = () => trendingData();

  const handleCategoryChange = async (category: 'playlists' | 'songs' | 'artists' | 'users') => {
    setIsLoading(true);
    setCurrentCategory(category);
    await loadTrendingData();
    // Re-animate trending items when category changes
    setTimeout(() => {
      const trendingItems = pageRef?.querySelectorAll('.trending-item');
      if (trendingItems) {
        staggeredFadeIn(trendingItems);
      }
      setIsLoading(false);
    }, 100);
  };

  const handleTimeframeChange = async (e: Event) => {
    const select = e.currentTarget as HTMLSelectElement;
    setIsLoading(true);
    setCurrentTimeframe(select.value as 'today' | 'week' | 'month' | 'all');
    await loadTrendingData();
    // Re-animate trending items when timeframe changes
    setTimeout(() => {
      const trendingItems = pageRef?.querySelectorAll('.trending-item');
      if (trendingItems) {
        staggeredFadeIn(trendingItems);
      }
      setIsLoading(false);
    }, 100);
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
        {/* TRENDING HEADER */}
        <div 
          class="mb-6 p-4 pl-6 border-l-4 flex items-center gap-3"
          style={{
            'border-color': '#ff9b00'
          }}
        >
          <div 
            class="w-3 h-3 rounded-full animate-pulse flex-shrink-0"
            style={{
              background: '#ff9b00',
              'box-shadow': '0 0 8px rgba(255, 155, 0, 0.6)'
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
            Trending Music
          </h1>
        </div>

        {/* FILTERS */}
        <div 
          class="mb-8 p-6 rounded-xl"
          style={{
            background: '#1a1a1a',
            border: '2px solid rgba(4, 202, 244, 0.4)'
          }}
        >
          {/* Desktop Layout: Category Buttons + Timeframe Dropdown in same row */}
          <div class="hidden md:flex items-center justify-between gap-6">
            {/* Category Buttons */}
            <div class="flex flex-wrap gap-3">
              <For each={['playlists', 'songs', 'artists', 'users'] as const}>
                {(category) => (
                  <button
                    class="px-4 lg:px-6 py-3 lg:py-4 font-bold text-base transition-all duration-300 rounded min-h-[48px] flex items-center justify-center gap-2"
                    style={{
                      background: currentCategory() === category 
                        ? 'linear-gradient(135deg, #3b00fd 0%, #04caf4 100%)' 
                        : 'rgba(4, 202, 244, 0.1)',
                      border: `2px solid ${currentCategory() === category ? '#3b00fd' : 'rgba(4, 202, 244, 0.4)'}`,
                      color: currentCategory() === category ? '#ffffff' : 'rgba(4, 202, 244, 0.8)',
                      'box-shadow': currentCategory() === category ? '0 0 10px rgba(59, 0, 253, 0.3)' : 'none',
                      opacity: isLoading() ? '0.6' : '1'
                    }}
                    onClick={() => handleCategoryChange(category)}
                    disabled={isLoading()}
                    aria-pressed={currentCategory() === category}
                    aria-label={`View trending ${category}`}
                    onMouseEnter={(e) => {
                      if (currentCategory() !== category) {
                        e.currentTarget.style.boxShadow = '0 0 20px rgba(59, 0, 253, 0.6)';
                        e.currentTarget.style.transform = 'scale(1.02)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (currentCategory() !== category) {
                        e.currentTarget.style.boxShadow = 'none';
                        e.currentTarget.style.transform = 'scale(1)';
                      }
                    }}
                  >
                    <span>{getCategoryIcon(category)}</span>
                    <span class="capitalize">{category}</span>
                  </button>
                )}
              </For>
            </div>

            {/* Timeframe Dropdown */}
            <div class="flex items-center gap-3">
              <span 
                class="text-sm font-bold uppercase tracking-wide whitespace-nowrap"
                style={{
                  color: 'rgba(0, 249, 42, 0.7)',
                  'text-shadow': '0 0 3px rgba(0, 249, 42, 0.5)'
                }}
              >
                <i class="fas fa-clock mr-2"></i>
                Timeframe:
              </span>
              <select
                value={currentTimeframe()}
                onChange={handleTimeframeChange}
                class="px-4 py-3 font-bold text-base rounded cursor-pointer"
                style={{
                  background: 'rgba(0, 0, 0, 0.9)',
                  border: '2px solid rgba(0, 249, 42, 0.4)',
                  color: '#00f92a',
                  'text-shadow': '0 0 5px rgba(0, 249, 42, 0.6)',
                  'min-height': '48px',
                  opacity: isLoading() ? '0.6' : '1'
                }}
                disabled={isLoading()}
                aria-label="Select timeframe for trending data"
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#00f92a';
                  e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 249, 42, 0.4)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(0, 249, 42, 0.4)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="all">All Time</option>
              </select>
            </div>
          </div>

          {/* Mobile Layout: Stacked Dropdowns */}
          <div class="flex md:hidden flex-col gap-4">
            {/* Category Dropdown */}
            <div class="flex items-center gap-3">
              <span 
                class="text-sm font-bold uppercase tracking-wide whitespace-nowrap"
                style={{
                  color: 'rgba(4, 202, 244, 0.7)',
                  'text-shadow': '0 0 3px rgba(4, 202, 244, 0.5)'
                }}
              >
                <i class="fas fa-filter mr-2"></i>
                Category:
              </span>
              <select
                value={currentCategory()}
                onChange={(e) => {
                  const select = e.currentTarget as HTMLSelectElement;
                  handleCategoryChange(select.value as 'playlists' | 'songs' | 'artists' | 'users');
                }}
                class="px-4 py-3 font-bold text-base rounded cursor-pointer flex-1"
                style={{
                  background: 'rgba(0, 0, 0, 0.9)',
                  border: '2px solid rgba(4, 202, 244, 0.4)',
                  color: '#04caf4',
                  'text-shadow': '0 0 5px rgba(4, 202, 244, 0.6)',
                  'min-height': '48px',
                  opacity: isLoading() ? '0.6' : '1'
                }}
                disabled={isLoading()}
                aria-label="Select category for trending data"
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#04caf4';
                  e.currentTarget.style.boxShadow = '0 0 20px rgba(4, 202, 244, 0.4)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(4, 202, 244, 0.4)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <option value="playlists">{getCategoryIcon('playlists')} Playlists</option>
                <option value="songs">{getCategoryIcon('songs')} Songs</option>
                <option value="artists">{getCategoryIcon('artists')} Artists</option>
                <option value="users">{getCategoryIcon('users')} Users</option>
              </select>
            </div>

            {/* Timeframe Dropdown */}
            <div class="flex items-center gap-3">
              <span 
                class="text-sm font-bold uppercase tracking-wide whitespace-nowrap"
                style={{
                  color: 'rgba(0, 249, 42, 0.7)',
                  'text-shadow': '0 0 3px rgba(0, 249, 42, 0.5)'
                }}
              >
                <i class="fas fa-clock mr-2"></i>
                Timeframe:
              </span>
              <select
                value={currentTimeframe()}
                onChange={handleTimeframeChange}
                class="px-4 py-3 font-bold text-base rounded cursor-pointer flex-1"
                style={{
                  background: 'rgba(0, 0, 0, 0.9)',
                  border: '2px solid rgba(0, 249, 42, 0.4)',
                  color: '#00f92a',
                  'text-shadow': '0 0 5px rgba(0, 249, 42, 0.6)',
                  'min-height': '48px',
                  opacity: isLoading() ? '0.6' : '1'
                }}
                disabled={isLoading()}
                aria-label="Select timeframe for trending data"
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#00f92a';
                  e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 249, 42, 0.4)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(0, 249, 42, 0.4)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="all">All Time</option>
              </select>
            </div>
          </div>
        </div>

        {/* TRENDING RESULTS */}
        <div style={{ 'margin-bottom': '84px' }}>
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
              <i class="fas fa-chart-line mr-3 text-base" style={{ color: '#f906d6' }}></i>
              Trending {currentCategory().charAt(0).toUpperCase() + currentCategory().slice(1)}
            </h2>
            <p 
              class="text-sm"
              style={{
                color: 'rgba(249, 6, 214, 0.7)'
              }}
            >
              High-frequency {currentCategory()} data streams
            </p>
          </div>
        
          <div class="space-y-4" role="list" aria-label="Trending items">
            {/* Loading indicator */}
            <Show when={isLoading()}>
              <div class="text-center py-8">
                <div 
                  class="inline-block animate-spin text-3xl"
                  style={{
                    color: '#04caf4',
                    filter: 'drop-shadow(0 0 10px rgba(4, 202, 244, 0.6))'
                  }}
                >
                  ⟳
                </div>
                <p 
                  class="text-sm mt-4"
                  style={{
                    color: 'rgba(4, 202, 244, 0.8)'
                  }}
                >
                  Loading trending data...
                </p>
              </div>
            </Show>
          <For each={currentData()}>
            {(item) => (
              <div 
                class="trending-item relative p-6 rounded-lg cursor-pointer transition-all duration-300 group"
                style={{
                  opacity: isLoading() ? '0.5' : '0',
                  background: '#1a1a1a',
                  border: '2px solid rgba(4, 202, 244, 0.2)'
                }}
                role="listitem"
                tabindex="0"
                aria-label={`Rank ${item.rank}: ${item.title} by ${item.subtitle}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    // Handle item selection
                  }
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#04caf4';
                  e.currentTarget.style.transform = 'scale(1.02)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(4, 202, 244, 0.2)';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                {/* Rank indicator */}
                <div 
                  class="absolute left-0 top-0 bottom-0 w-16 flex items-center justify-center"
                  style={{
                    background: `linear-gradient(135deg, ${getRankColor(item.rank)}20 0%, transparent 100%)`
                  }}
                >
                  <span 
                    class="font-bold"
                    style={{
                      color: getRankColor(item.rank),
                      'text-shadow': `0 0 6px ${getRankColor(item.rank)}`,
                      'font-size': item.rank === 1 ? '1.5rem' : item.rank <= 3 ? '1.25rem' : '1rem'
                    }}
                  >
                    #{item.rank}
                  </span>
                </div>
                
                {/* Content area */}
                <div class="ml-16 flex items-center gap-6 flex-1">
                  {/* Icon/Avatar */}
                  <Show when={item.icon || item.avatar}>
                    <div 
                      class="text-4xl flex-shrink-0"
                      style={{
                        filter: `drop-shadow(0 0 8px ${getRankColor(item.rank)}40)`
                      }}
                    >
                      {item.icon || item.avatar}
                    </div>
                  </Show>
                  
                  {/* Text content */}
                  <div class="flex-1 min-w-0">
                    <h3 
                      class="font-bold mb-2 truncate"
                      style={{
                        color: '#ffffff',
                        'text-shadow': '0 2px 4px rgba(0, 0, 0, 0.8)',
                        'font-size': item.rank === 1 ? '1.25rem' : item.rank <= 3 ? '1.125rem' : '1rem'
                      }}
                    >
                      {item.title}
                    </h3>
                    <p 
                      class="text-sm truncate"
                      style={{
                        color: 'rgba(4, 202, 244, 0.8)'
                      }}
                    >
                      {item.subtitle}
                    </p>
                  </div>

                  {/* Action Button - Only show for users */}
                  <Show when={currentCategory() === 'users'}>
              {/* Follow button styling to match DiscoverPage search button */}
                    <button 
                      class="px-4 md:px-6 py-3 md:py-4 font-bold text-base md:text-lg transition-all duration-300 rounded min-h-[44px] flex-shrink-0 flex items-center gap-2"
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
                      <i class="fas fa-user-plus"></i>
                      <span class="hidden sm:inline">FOLLOW</span>
                    </button>
                  </Show>
                </div>
              </div>
            )}
          </For>
          </div>
        </div>
        
        {/* Empty State */}
        <Show when={currentData().length === 0 && !isLoading()}>
          <div 
            class="p-12 text-center rounded-lg"
            style={{
              background: '#1a1a1a',
              border: '2px solid rgba(4, 202, 244, 0.2)'
            }}
          >
            <i 
              class="fas fa-chart-line text-6xl mb-6"
              style={{
                color: 'rgba(4, 202, 244, 0.5)',
                filter: 'drop-shadow(0 0 10px rgba(4, 202, 244, 0.3))'
              }}
            ></i>
            <p 
              class="text-lg"
              style={{
                color: 'rgba(4, 202, 244, 0.7)'
              }}
              role="status"
              aria-live="polite"
            >
              No trending data available for this timeframe
            </p>
          </div>
        </Show>
      </div>
    </div>
  );
};

export default TrendingPage;