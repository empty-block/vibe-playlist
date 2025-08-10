import { Component, createSignal, For, Show, onMount } from 'solid-js';
import { pageEnter, staggeredFadeIn, buttonHover, slideIn } from '../utils/animations';

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
  let pageRef: HTMLDivElement;

  onMount(() => {
    // Page entrance animation
    if (pageRef) {
      pageEnter(pageRef);
    }
    
    // Animate filter buttons with slide in
    setTimeout(() => {
      const filterButtons = pageRef?.querySelectorAll('.filter-button');
      if (filterButtons) {
        Array.from(filterButtons).forEach((button, index) => {
          setTimeout(() => slideIn.fromLeft(button as HTMLElement), index * 50);
        });
      }
      
      // Animate initial trending items
      setTimeout(() => animateTrendingItems(), 500);
    }, 300);
  });

  // Animate trending items when data changes
  const animateTrendingItems = () => {
    setTimeout(() => {
      const trendingItems = pageRef?.querySelectorAll('.trending-item');
      if (trendingItems) {
        staggeredFadeIn(trendingItems);
      }
    }, 100);
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

  const getChangeIcon = (change: 'up' | 'down' | 'same') => {
    switch (change) {
      case 'up': return '↗️';
      case 'down': return '↘️';
      case 'same': return '➡️';
    }
  };

  const getChangeColor = (change: 'up' | 'down' | 'same') => {
    switch (change) {
      case 'up': return 'text-blue-700';
      case 'down': return 'text-red-600';
      case 'same': return 'text-gray-500';
    }
  };

  const currentData = () => trendingData[currentCategory()][currentTimeframe()] || [];

  const handleCategoryChange = (category: 'playlists' | 'songs' | 'artists' | 'users') => {
    setCurrentCategory(category);
    animateTrendingItems();
  };

  const handleTimeframeChange = (timeframe: 'today' | 'week' | 'month' | 'all') => {
    setCurrentTimeframe(timeframe);
    animateTrendingItems();
  };

  const handleButtonHover = (e: MouseEvent) => {
    const button = e.currentTarget as HTMLElement;
    buttonHover.enter(button);
  };

  const handleButtonLeave = (e: MouseEvent) => {
    const button = e.currentTarget as HTMLElement;
    buttonHover.leave(button);
  };

  return (
    <div ref={pageRef!} class="p-8" style={{ opacity: '0' }}>
      <div class="win95-panel p-6 mb-6">
        <h2 class="text-2xl font-bold text-black mb-4">
          <i class="fas fa-fire text-red-500 mr-2"></i>What's Trending
        </h2>
        <p class="text-gray-700">The hottest music, artists, and curators right now</p>
      </div>
      
      {/* Filters */}
      <div class="flex justify-between items-center mb-6 flex-wrap gap-4">
        {/* Category filters */}
        <div class="flex gap-2">
          <button
            class={`filter-button win95-button px-4 py-2 text-black ${currentCategory() === 'playlists' ? 'font-bold bg-blue-200' : ''}`}
            onClick={() => handleCategoryChange('playlists')}
            onMouseEnter={handleButtonHover}
            onMouseLeave={handleButtonLeave}
            style={{ opacity: '0' }}
          >
            🎵 Playlists
          </button>
          <button
            class={`filter-button win95-button px-4 py-2 text-black ${currentCategory() === 'songs' ? 'font-bold bg-blue-200' : ''}`}
            onClick={() => handleCategoryChange('songs')}
            onMouseEnter={handleButtonHover}
            onMouseLeave={handleButtonLeave}
            style={{ opacity: '0' }}
          >
            🎵 Songs
          </button>
          <button
            class={`filter-button win95-button px-4 py-2 text-black ${currentCategory() === 'artists' ? 'font-bold bg-blue-200' : ''}`}
            onClick={() => handleCategoryChange('artists')}
            onMouseEnter={handleButtonHover}
            onMouseLeave={handleButtonLeave}
            style={{ opacity: '0' }}
          >
            🎤 Artists
          </button>
          <button
            class={`filter-button win95-button px-4 py-2 text-black ${currentCategory() === 'users' ? 'font-bold bg-blue-200' : ''}`}
            onClick={() => handleCategoryChange('users')}
            onMouseEnter={handleButtonHover}
            onMouseLeave={handleButtonLeave}
            style={{ opacity: '0' }}
          >
            👥 Users
          </button>
        </div>
        
        {/* Time filters */}
        <div class="flex items-center gap-2">
          <span class="text-sm font-bold text-gray-600">Timeframe:</span>
          <button
            class={`filter-button win95-button px-3 py-1 text-black text-sm ${currentTimeframe() === 'today' ? 'font-bold bg-blue-200' : ''}`}
            onClick={() => handleTimeframeChange('today')}
            onMouseEnter={handleButtonHover}
            onMouseLeave={handleButtonLeave}
            style={{ opacity: '0' }}
          >
            Today
          </button>
          <button
            class={`filter-button win95-button px-3 py-1 text-black text-sm ${currentTimeframe() === 'week' ? 'font-bold bg-blue-200' : ''}`}
            onClick={() => handleTimeframeChange('week')}
            onMouseEnter={handleButtonHover}
            onMouseLeave={handleButtonLeave}
            style={{ opacity: '0' }}
          >
            This Week
          </button>
          <button
            class={`filter-button win95-button px-3 py-1 text-black text-sm ${currentTimeframe() === 'month' ? 'font-bold bg-blue-200' : ''}`}
            onClick={() => handleTimeframeChange('month')}
            onMouseEnter={handleButtonHover}
            onMouseLeave={handleButtonLeave}
            style={{ opacity: '0' }}
          >
            This Month
          </button>
          <button
            class={`filter-button win95-button px-3 py-1 text-black text-sm ${currentTimeframe() === 'all' ? 'font-bold bg-blue-200' : ''}`}
            onClick={() => handleTimeframeChange('all')}
            onMouseEnter={handleButtonHover}
            onMouseLeave={handleButtonLeave}
            style={{ opacity: '0' }}
          >
            All Time
          </button>
        </div>
      </div>
      
      {/* Trending Items */}
      <div class="space-y-4">
        <For each={currentData()}>
          {(item) => (
            <div class="trending-item win95-panel p-4 hover:bg-gray-100 cursor-pointer transition-all" style={{ opacity: '0' }}>
              <div class="flex items-center gap-4">
                {/* Rank */}
                <div class="flex items-center gap-2 w-16">
                  <span class="text-2xl font-bold text-gray-600">#{item.rank}</span>
                  <span class={`text-lg ${getChangeColor(item.change)}`}>
                    {getChangeIcon(item.change)}
                  </span>
                </div>
                
                {/* Icon/Avatar */}
                <Show when={item.icon || item.avatar}>
                  <div class="text-3xl">{item.icon || item.avatar}</div>
                </Show>
                
                {/* Content */}
                <div class="flex-1">
                  <h3 class="font-bold text-lg text-black">{item.title}</h3>
                  <p class="text-sm text-gray-600">{item.subtitle}</p>
                  <p class="text-sm text-blue-600 mt-1">{item.metric}</p>
                </div>
                
                {/* Action Button - Only show for users */}
                <Show when={currentCategory() === 'users'}>
                  <div class="flex gap-2">
                    <button class="win95-button px-3 py-1 text-sm">
                      <i class="fas fa-user-plus mr-1"></i>Follow
                    </button>
                  </div>
                </Show>
              </div>
            </div>
          )}
        </For>
      </div>
      
      {/* Empty State */}
      <Show when={currentData().length === 0}>
        <div class="win95-panel p-8 text-center">
          <i class="fas fa-chart-line text-4xl text-gray-400 mb-4"></i>
          <p class="text-gray-600">No trending data available for this timeframe.</p>
        </div>
      </Show>
    </div>
  );
};

export default TrendingPage;