import { Component, For, Show, createSignal } from 'solid-js';
import { GenreTag } from '../../types/discover';

interface GenreExplorerProps {
  genres: GenreTag[];
  isLoading: boolean;
  onGenreClick?: (genre: GenreTag) => void;
}

const GenreExplorer: Component<GenreExplorerProps> = (props) => {
  const [selectedGenres, setSelectedGenres] = createSignal<string[]>([]);

  const handleGenreClick = (genre: GenreTag) => {
    const current = selectedGenres();
    const isSelected = current.includes(genre.id);
    
    if (isSelected) {
      setSelectedGenres(current.filter(id => id !== genre.id));
    } else {
      setSelectedGenres([...current, genre.id]);
    }
    
    props.onGenreClick?.(genre);
  };

  const isGenreSelected = (genreId: string) => {
    return selectedGenres().includes(genreId);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  };

  const getPopularitySize = (popularity: number) => {
    if (popularity >= 8) return 'text-lg';
    if (popularity >= 6) return 'text-base';
    if (popularity >= 4) return 'text-sm';
    return 'text-xs';
  };

  const getPopularityOpacity = (popularity: number) => {
    if (popularity >= 8) return 'opacity-100';
    if (popularity >= 6) return 'opacity-90';
    if (popularity >= 4) return 'opacity-75';
    return 'opacity-60';
  };

  return (
    <div class="discover-section genre-explorer mb-8">
      <div class="retro-music-terminal bg-gradient-to-b from-slate-900/60 to-black/60 border-2 border-cyan-400/30 rounded-xl p-6">
        <div class="section-header mb-6">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="retro-section-title flex items-center gap-3 text-2xl font-bold text-white mb-2">
                <i class="fas fa-tags text-cyan-400"></i>
                <span class="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
                  Genre Explorer
                </span>
              </h2>
              <p class="retro-section-subtitle text-cyan-300/70 text-sm font-mono">
                Browse by mood and style
              </p>
            </div>
            <div class="text-cyan-400/60 text-xs font-mono">
              {selectedGenres().length} selected
            </div>
          </div>
        </div>

        <Show
          when={!props.isLoading}
          fallback={
            <div class="genre-skeleton">
              <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                <For each={Array(10).fill(0)}>
                  {() => (
                    <div class="animate-pulse">
                      <div class="h-12 bg-cyan-400/20 rounded-lg"></div>
                    </div>
                  )}
                </For>
              </div>
            </div>
          }
        >
          <div class="genre-content">
            {/* Selected Genres Summary */}
            <Show when={selectedGenres().length > 0}>
              <div class="selected-genres-summary mb-6 p-4 bg-cyan-400/5 border border-cyan-400/20 rounded-lg">
                <div class="flex items-center justify-between mb-3">
                  <h3 class="text-cyan-300 font-medium">Selected Genres</h3>
                  <button 
                    class="text-cyan-400/70 hover:text-cyan-400 text-sm"
                    onClick={() => setSelectedGenres([])}
                  >
                    Clear all
                  </button>
                </div>
                <div class="flex flex-wrap gap-2">
                  <For each={selectedGenres()}>
                    {(genreId) => {
                      const genre = props.genres.find(g => g.id === genreId);
                      return genre ? (
                        <div class="selected-genre-chip flex items-center gap-2 px-3 py-1 bg-cyan-500/20 border border-cyan-400/40 rounded-full text-cyan-200 text-sm">
                          <span>{genre.emoji}</span>
                          <span>{genre.name}</span>
                          <button 
                            class="text-cyan-400/70 hover:text-cyan-400"
                            onClick={() => handleGenreClick(genre)}
                          >
                            <i class="fas fa-times text-xs"></i>
                          </button>
                        </div>
                      ) : null;
                    }}
                  </For>
                </div>
              </div>
            </Show>

            {/* Genre Cloud */}
            <div class="genre-tags-cloud">
              <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
                <For each={props.genres}>
                  {(genre) => {
                    const isSelected = isGenreSelected(genre.id);
                    return (
                      <div 
                        class={`genre-tag group cursor-pointer transition-all duration-300 ${
                          isSelected ? 'scale-105' : 'hover:scale-105'
                        }`}
                        onClick={() => handleGenreClick(genre)}
                      >
                        <div class={`genre-tag-content p-4 rounded-lg border-2 transition-all duration-300 ${
                          isSelected
                            ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-cyan-400/60 shadow-lg shadow-cyan-400/20'
                            : 'bg-gradient-to-r from-slate-800/60 to-slate-700/40 border-cyan-400/20 hover:border-cyan-400/40 hover:from-slate-700/80 hover:to-slate-600/60'
                        }`}>
                          
                          {/* Genre Header */}
                          <div class="flex items-center justify-between mb-2">
                            <div class={`genre-emoji text-2xl ${getPopularitySize(genre.popularity)} ${getPopularityOpacity(genre.popularity)}`}>
                              {genre.emoji}
                            </div>
                            <div class={`genre-popularity text-xs font-mono ${
                              isSelected ? 'text-cyan-300' : 'text-cyan-400/70'
                            }`}>
                              #{genre.popularity}
                            </div>
                          </div>

                          {/* Genre Name */}
                          <div class={`genre-name font-semibold mb-1 transition-colors duration-300 ${
                            isSelected 
                              ? 'text-cyan-200' 
                              : 'text-white group-hover:text-cyan-300'
                          }`}>
                            {genre.name}
                          </div>

                          {/* Track Count */}
                          <div class={`genre-count text-sm font-mono transition-colors duration-300 ${
                            isSelected
                              ? 'text-cyan-300/80'
                              : 'text-cyan-400/70 group-hover:text-cyan-300/90'
                          }`}>
                            {formatNumber(genre.trackCount)} tracks
                          </div>

                          {/* Popularity Bar */}
                          <div class="genre-popularity-bar mt-3">
                            <div class="w-full h-1 bg-slate-700 rounded-full overflow-hidden">
                              <div 
                                class={`h-full bg-gradient-to-r transition-all duration-500 ${
                                  isSelected
                                    ? 'from-cyan-400 to-blue-400'
                                    : 'from-cyan-500 to-blue-500'
                                }`}
                                style={{ width: `${genre.popularity * 10}%` }}
                              ></div>
                            </div>
                          </div>

                          {/* Selection Indicator */}
                          <Show when={isSelected}>
                            <div class="selection-indicator absolute top-2 right-2">
                              <div class="w-6 h-6 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full flex items-center justify-center shadow-lg">
                                <i class="fas fa-check text-white text-xs"></i>
                              </div>
                            </div>
                          </Show>
                        </div>
                      </div>
                    );
                  }}
                </For>
              </div>

              {/* Action Buttons */}
              <div class="genre-actions flex flex-wrap gap-4 justify-center">
                <Show when={selectedGenres().length > 0}>
                  <button class="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
                    <i class="fas fa-search mr-2"></i>
                    Explore Selected Genres ({selectedGenres().length})
                  </button>
                </Show>
                
                <button class="px-6 py-3 text-cyan-400 hover:text-cyan-300 font-medium border border-cyan-400/30 hover:border-cyan-400/50 rounded-lg bg-cyan-400/5 hover:bg-cyan-400/10 transition-all duration-300">
                  <i class="fas fa-shuffle mr-2"></i>
                  Surprise Me
                </button>
              </div>
            </div>

            {/* Popular Combinations */}
            <div class="popular-combinations mt-8">
              <h3 class="text-cyan-300 font-medium mb-4 flex items-center gap-2">
                <i class="fas fa-fire text-sm"></i>
                Popular Combinations
              </h3>
              <div class="flex flex-wrap gap-3">
                <button class="combination-pill px-4 py-2 bg-cyan-400/10 hover:bg-cyan-400/20 border border-cyan-400/30 hover:border-cyan-400/50 rounded-full text-cyan-300 hover:text-cyan-200 text-sm transition-all duration-300">
                  🎵 Pop + Electronic
                </button>
                <button class="combination-pill px-4 py-2 bg-cyan-400/10 hover:bg-cyan-400/20 border border-cyan-400/30 hover:border-cyan-400/50 rounded-full text-cyan-300 hover:text-cyan-200 text-sm transition-all duration-300">
                  🎤 Hip-Hop + R&B
                </button>
                <button class="combination-pill px-4 py-2 bg-cyan-400/10 hover:bg-cyan-400/20 border border-cyan-400/30 hover:border-cyan-400/50 rounded-full text-cyan-300 hover:text-cyan-200 text-sm transition-all duration-300">
                  🌿 Indie + Folk
                </button>
                <button class="combination-pill px-4 py-2 bg-cyan-400/10 hover:bg-cyan-400/20 border border-cyan-400/30 hover:border-cyan-400/50 rounded-full text-cyan-300 hover:text-cyan-200 text-sm transition-all duration-300">
                  🌊 Ambient + Jazz
                </button>
              </div>
            </div>
          </div>
        </Show>
      </div>
    </div>
  );
};

export default GenreExplorer;