import { Component, createSignal, For, Show, onMount } from 'solid-js';
import { pageEnter, staggeredFadeIn } from '../utils/animations';

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
  let pageRef: HTMLDivElement | undefined;

  onMount(() => {
    if (pageRef) {
      pageEnter(pageRef);
      
      // Animate trending items on load
      setTimeout(() => {
        const trendingItems = pageRef.querySelectorAll('.trending-item');
        if (trendingItems) {
          staggeredFadeIn(trendingItems);
        }
      }, 300);
    }
  });

  // Helper functions for neon color system
  const getRankColor = (rank: number) => {
    if (rank === 1) return '#ff9b00'; // neon-orange (gold)
    if (rank <= 3) return '#04caf4';   // neon-cyan (silver) 
    if (rank <= 10) return '#00f92a';  // neon-green
    return '#f906d6';                  // neon-pink
  };

  const getChangeIcon = (change: 'up' | 'down' | 'same') => {
    switch (change) {
      case 'up': return '↗️';
      case 'down': return '↘️';
      case 'same': return '➡️';
    }
  };

  const getChangeGlowColor = (change: 'up' | 'down' | 'same') => {
    switch (change) {
      case 'up': return '#00f92a';    // neon-green
      case 'down': return '#f906d6';  // neon-pink  
      case 'same': return '#04caf4';  // neon-cyan
    }
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

  const trendingData = {
    playlists: {
      today: [
        { id: '1', rank: 1, change: 'up' as const, title: '90s Grunge Revival', subtitle: 'curated by grunge_master_93', metric: '+45% plays today', icon: '🎸' },
        { id: '2', rank: 2, change: 'down' as const, title: 'Synthwave Nights', subtitle: 'curated by neon_dreams_85', metric: '+32% plays today', icon: '🌈' },
        { id: '3', rank: 3, change: 'same' as const, title: 'Chill Indie Vibes', subtitle: 'curated by indie_explorer', metric: '+28% plays today', icon: '🌙' },
        { id: '4', rank: 4, change: 'up' as const, title: 'Underground Hip-Hop', subtitle: 'curated by beat_digger', metric: '+25% plays today', icon: '🎤' }
      ],
      week: [
        { id: '1', rank: 1, change: 'same' as const, title: '90s Grunge Revival', subtitle: 'curated by grunge_master_93', metric: '2.1M plays this week', icon: '🎸' },
        { id: '2', rank: 2, change: 'up' as const, title: 'Y2K Throwbacks', subtitle: 'curated by millennium_kid', metric: '1.8M plays this week', icon: '💿' }
      ]
    },
    songs: {
      today: [
        { id: '1', rank: 1, change: 'up' as const, title: 'Smells Like Teen Spirit', subtitle: 'Nirvana', metric: '45K plays today' },
        { id: '2', rank: 2, change: 'down' as const, title: 'Blue Monday', subtitle: 'New Order', metric: '38K plays today' },
        { id: '3', rank: 3, change: 'up' as const, title: 'Midnight City', subtitle: 'M83', metric: '35K plays today' }
      ],
      week: [
        { id: '1', rank: 1, change: 'same' as const, title: 'Smells Like Teen Spirit', subtitle: 'Nirvana', metric: '312K plays this week' },
        { id: '2', rank: 2, change: 'up' as const, title: 'Take On Me', subtitle: 'a-ha', metric: '287K plays this week' }
      ]
    },
    artists: {
      today: [
        { id: '1', rank: 1, change: 'up' as const, title: 'Nirvana', subtitle: '3 tracks trending', metric: '+52% plays today' },
        { id: '2', rank: 2, change: 'same' as const, title: 'New Order', subtitle: '2 tracks trending', metric: '+41% plays today' },
        { id: '3', rank: 3, change: 'up' as const, title: 'M83', subtitle: '1 track trending', metric: '+35% plays today' }
      ],
      week: [
        { id: '1', rank: 1, change: 'same' as const, title: 'Nirvana', subtitle: '5 tracks in top 100', metric: '892K total plays' },
        { id: '2', rank: 2, change: 'up' as const, title: 'The Killers', subtitle: '3 tracks in top 100', metric: '654K total plays' }
      ]
    },
    users: {
      today: [
        { id: '1', rank: 1, change: 'up' as const, title: 'grunge_master_93', subtitle: '⭐ Elite Curator', metric: '+125% engagement', avatar: '🎸' },
        { id: '2', rank: 2, change: 'down' as const, title: 'synth_prophet_85', subtitle: '🏆 Master Curator', metric: '+98% engagement', avatar: '🌈' },
        { id: '3', rank: 3, change: 'up' as const, title: 'underground_oracle', subtitle: '💎 Hidden Gems Expert', metric: '+87% engagement', avatar: '🔮' },
        { id: '4', rank: 4, change: 'same' as const, title: 'vinyl_archaeologist', subtitle: '📀 Rare Finds Specialist', metric: '+76% engagement', avatar: '💿' }
      ],
      week: [
        { id: '1', rank: 1, change: 'same' as const, title: 'grunge_master_93', subtitle: '2.3K followers • 156 tracks shared', metric: '45K total interactions', avatar: '🎸' },
        { id: '2', rank: 2, change: 'up' as const, title: 'underground_oracle', subtitle: '3.7K followers • 412 tracks shared', metric: '38K total interactions', avatar: '🔮' }
      ]
    }
  };

  const currentData = () => trendingData[currentCategory()][currentTimeframe()] || [];

  const handleCategoryChange = (category: 'playlists' | 'songs' | 'artists' | 'users') => {
    setCurrentCategory(category);
    // Re-animate trending items when category changes
    setTimeout(() => {
      const trendingItems = pageRef?.querySelectorAll('.trending-item');
      if (trendingItems) {
        staggeredFadeIn(trendingItems);
      }
    }, 100);
  };

  const handleTimeframeChange = (e: Event) => {
    const select = e.currentTarget as HTMLSelectElement;
    setCurrentTimeframe(select.value as 'today' | 'week' | 'month' | 'all');
    // Re-animate trending items when timeframe changes
    setTimeout(() => {
      const trendingItems = pageRef?.querySelectorAll('.trending-item');
      if (trendingItems) {
        staggeredFadeIn(trendingItems);
      }
    }, 100);
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
        {/* CYBERPUNK TRENDING HEADER */}
        <div 
          class="relative text-center mb-12 p-8 rounded-xl overflow-hidden"
          style={{
            background: 'linear-gradient(145deg, #0a0a0a, #1a1a1a)',
            border: '1px solid rgba(249, 6, 214, 0.2)',
            'box-shadow': 'inset 0 0 20px rgba(0, 0, 0, 0.6)'
          }}
        >
          {/* Scan lines */}
          <div 
            class="absolute inset-0 pointer-events-none opacity-5"
            style={{
              background: `repeating-linear-gradient(
                0deg,
                transparent 0px,
                transparent 3px,
                rgba(249, 6, 214, 0.08) 4px,
                rgba(249, 6, 214, 0.08) 5px
              )`
            }}
          />
          
          <h1 
            class="font-mono font-bold text-5xl lg:text-6xl mb-4"
            style={{
              color: '#f906d6',
              'text-shadow': '0 0 8px rgba(249, 6, 214, 0.7)',
              'font-family': 'Courier New, monospace',
              'letter-spacing': '0.1em'
            }}
          >
            TRENDING
          </h1>
          
          <p 
            class="font-mono text-sm"
            style={{
              color: 'rgba(249, 6, 214, 0.7)',
              'font-family': 'Courier New, monospace'
            }}
          >
            HIGH-VELOCITY SONIC DATA STREAMS
          </p>
        </div>

        {/* CATEGORY FILTERS - TERMINAL TABS */}
        <div 
          class="mb-8 p-4 rounded-xl"
          style={{
            background: 'linear-gradient(145deg, #0a0a0a, #1a1a1a)',
            border: '1px solid rgba(4, 202, 244, 0.2)',
            'box-shadow': 'inset 0 0 15px rgba(0, 0, 0, 0.6)'
          }}
        >
          <div class="flex flex-wrap gap-2">
            <For each={['playlists', 'songs', 'artists', 'users'] as const}>
              {(category) => (
                <button
                  class="px-4 py-3 font-mono text-sm transition-all duration-300 rounded"
                  style={{
                    background: currentCategory() === category 
                      ? 'rgba(4, 202, 244, 0.1)' 
                      : 'transparent',
                    border: `2px solid ${currentCategory() === category ? '#04caf4' : 'rgba(4, 202, 244, 0.2)'}`,
                    color: currentCategory() === category ? '#04caf4' : 'rgba(4, 202, 244, 0.7)',
                    'text-shadow': currentCategory() === category ? '0 0 8px rgba(4, 202, 244, 0.6)' : 'none',
                    'font-family': 'Courier New, monospace'
                  }}
                  onClick={() => handleCategoryChange(category)}
                  onMouseEnter={(e) => {
                    if (currentCategory() !== category) {
                      e.currentTarget.style.borderColor = 'rgba(4, 202, 244, 0.6)';
                      e.currentTarget.style.color = 'rgba(4, 202, 244, 0.9)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (currentCategory() !== category) {
                      e.currentTarget.style.borderColor = 'rgba(4, 202, 244, 0.2)';
                      e.currentTarget.style.color = 'rgba(4, 202, 244, 0.7)';
                    }
                  }}
                >
                  {getCategoryIcon(category)} {category.toUpperCase()}
                </button>
              )}
            </For>
          </div>
        </div>

        {/* TIMEFRAME DROPDOWN */}
        <div 
          class="mb-8 flex items-center gap-4 p-4 rounded-xl"
          style={{
            background: 'linear-gradient(145deg, #0a0a0a, #1a1a1a)',
            border: '1px solid rgba(0, 249, 42, 0.2)',
            'box-shadow': 'inset 0 0 15px rgba(0, 0, 0, 0.6)'
          }}
        >
          <span 
            class="font-mono text-sm"
            style={{
              color: 'rgba(0, 249, 42, 0.7)',
              'font-family': 'Courier New, monospace'
            }}
          >
            <i class="fas fa-clock mr-2"></i>
            TIMEFRAME:
          </span>
          
          <div class="relative">
            <select
              value={currentTimeframe()}
              onChange={handleTimeframeChange}
              class="px-4 py-2 font-mono text-sm rounded cursor-pointer"
              style={{
                background: 'rgba(0, 0, 0, 0.9)',
                border: '2px solid rgba(0, 249, 42, 0.4)',
                color: '#00f92a',
                'font-family': 'Courier New, monospace',
                'text-shadow': '0 0 3px rgba(0, 249, 42, 0.6)'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#00f92a';
                e.currentTarget.style.boxShadow = '0 0 15px rgba(0, 249, 42, 0.4)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'rgba(0, 249, 42, 0.4)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <option value="today">TODAY</option>
              <option value="week">THIS WEEK</option>
              <option value="month">THIS MONTH</option>
              <option value="all">ALL TIME</option>
            </select>
          </div>
        </div>

        {/* TRENDING ITEMS */}
        <div class="space-y-4">
          <For each={currentData()}>
            {(item) => (
              <div 
                class="trending-item relative p-6 rounded-xl cursor-pointer transition-all duration-300 group"
                style={{
                  opacity: '0',
                  background: 'linear-gradient(145deg, rgba(10, 10, 10, 0.9), rgba(26, 26, 26, 0.9))',
                  border: '1px solid rgba(4, 202, 244, 0.2)',
                  'box-shadow': 'inset 0 0 15px rgba(0, 0, 0, 0.6)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#04caf4';
                  e.currentTarget.style.boxShadow = '0 0 25px rgba(4, 202, 244, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(4, 202, 244, 0.2)';
                  e.currentTarget.style.boxShadow = 'inset 0 0 15px rgba(0, 0, 0, 0.6)';
                }}
              >
                {/* Rank indicator with neon glow */}
                <div 
                  class="absolute left-0 top-0 bottom-0 w-16 flex items-center justify-center"
                  style={{
                    background: `linear-gradient(135deg, ${getRankColor(item.rank)}40 0%, transparent 100%)`
                  }}
                >
                  <span 
                    class="font-mono font-bold text-2xl"
                    style={{
                      color: getRankColor(item.rank),
                      'text-shadow': `0 0 10px ${getRankColor(item.rank)}`,
                      'font-family': 'Courier New, monospace'
                    }}
                  >
                    #{item.rank}
                  </span>
                </div>
                
                {/* Content area */}
                <div class="ml-16 flex items-center gap-6">
                  {/* Icon/Avatar with glow */}
                  <Show when={item.icon || item.avatar}>
                    <div 
                      class="text-4xl"
                      style={{
                        filter: 'drop-shadow(0 0 8px rgba(4, 202, 244, 0.6))'
                      }}
                    >
                      {item.icon || item.avatar}
                    </div>
                  </Show>
                  
                  {/* Text content */}
                  <div class="flex-1">
                    <h3 
                      class="font-mono font-bold text-xl mb-1"
                      style={{
                        color: '#ffffff',
                        'text-shadow': '0 2px 4px rgba(0, 0, 0, 0.8)',
                        'font-family': 'Courier New, monospace'
                      }}
                    >
                      {item.title}
                    </h3>
                    <p 
                      class="font-mono text-sm mb-2"
                      style={{
                        color: 'rgba(4, 202, 244, 0.7)',
                        'font-family': 'Courier New, monospace'
                      }}
                    >
                      {item.subtitle}
                    </p>
                    <div 
                      class="font-mono text-xs"
                      style={{
                        color: getRankColor(item.rank),
                        'text-shadow': `0 0 4px ${getRankColor(item.rank)}`,
                        'font-family': 'Courier New, monospace'
                      }}
                    >
                      {item.metric}
                    </div>
                  </div>
                  
                  {/* Change indicator */}
                  <div class="text-right">
                    <div 
                      class="text-2xl"
                      style={{
                        color: getChangeGlowColor(item.change),
                        filter: `drop-shadow(0 0 6px ${getChangeGlowColor(item.change)})`
                      }}
                    >
                      {getChangeIcon(item.change)}
                    </div>
                  </div>

                  {/* Action Button - Only show for users */}
                  <Show when={currentCategory() === 'users'}>
                    <button 
                      class="px-4 py-2 font-mono text-sm rounded transition-all duration-300"
                      style={{
                        background: 'rgba(59, 0, 253, 0.1)',
                        border: '2px solid rgba(59, 0, 253, 0.3)',
                        color: 'rgba(59, 0, 253, 0.8)',
                        'font-family': 'Courier New, monospace'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#3b00fd';
                        e.currentTarget.style.color = '#3b00fd';
                        e.currentTarget.style.boxShadow = '0 0 15px rgba(59, 0, 253, 0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(59, 0, 253, 0.3)';
                        e.currentTarget.style.color = 'rgba(59, 0, 253, 0.8)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      <i class="fas fa-user-plus mr-2"></i>FOLLOW
                    </button>
                  </Show>
                </div>
              </div>
            )}
          </For>
        </div>
        
        {/* Empty State */}
        <Show when={currentData().length === 0}>
          <div 
            class="p-12 text-center rounded-xl"
            style={{
              background: 'linear-gradient(145deg, #0a0a0a, #1a1a1a)',
              border: '1px solid rgba(4, 202, 244, 0.2)'
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
              class="font-mono text-lg"
              style={{
                color: 'rgba(4, 202, 244, 0.7)',
                'font-family': 'Courier New, monospace'
              }}
            >
              NO TRENDING DATA AVAILABLE FOR THIS TIMEFRAME
            </p>
          </div>
        </Show>
      </div>
    </div>
  );
};

export default TrendingPage;