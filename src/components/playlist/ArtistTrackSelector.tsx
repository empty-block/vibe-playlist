import { Component, createSignal, createEffect, onMount, For, Show } from 'solid-js';
import anime from 'animejs';
import type { VibeType } from './VibeSelector';

interface TrackSuggestion {
  id: string;
  title: string;
  artist: string;
  source: 'youtube' | 'spotify';
  sourceId: string;
  preview?: string;
}

interface ArtistTrackSelectorProps {
  selectedVibe?: { id: VibeType; name: string; description: string };
  onTracksSelected: (tracks: TrackSuggestion[]) => void;
  onComplete: (tracks: TrackSuggestion[]) => void;
}

const ArtistTrackSelector: Component<ArtistTrackSelectorProps> = (props) => {
  const [artistInput, setArtistInput] = createSignal('');
  const [trackInput, setTrackInput] = createSignal('');
  const [suggestedTracks, setSuggestedTracks] = createSignal<TrackSuggestion[]>([]);
  const [selectedTracks, setSelectedTracks] = createSignal<TrackSuggestion[]>([]);
  const [isSearching, setIsSearching] = createSignal(false);

  let containerRef: HTMLDivElement;
  let formRef: HTMLDivElement;

  onMount(() => {
    // Entrance animation
    if (containerRef) {
      anime({
        targets: containerRef,
        opacity: [0, 1],
        translateY: [20, 0],
        duration: 600,
        easing: 'easeOutCubic'
      });
    }

    // Auto-generate some suggestions based on vibe
    generateVibeBasedSuggestions();
  });

  const generateVibeBasedSuggestions = () => {
    const vibe = props.selectedVibe?.name?.toLowerCase() || 'general';
    
    const vibeTrackMap: Record<string, TrackSuggestion[]> = {
      'synthwave': [
        { id: '1', title: 'Midnight City', artist: 'M83', source: 'youtube', sourceId: 'dX3k_QDnzHE' },
        { id: '2', title: 'A Real Hero', artist: 'College & Electric Youth', source: 'youtube', sourceId: '-DSVDcw6iW8' },
        { id: '3', title: 'Nightcall', artist: 'Kavinsky', source: 'youtube', sourceId: 'MV_3Dpw-BRY' }
      ],
      'chill': [
        { id: '4', title: 'Resonance', artist: 'HOME', source: 'youtube', sourceId: '8GW6sLrK40k' },
        { id: '5', title: 'Dreams Tonite', artist: 'Alvvays', source: 'youtube', sourceId: 'ZXu6q-6JKjA' },
        { id: '6', title: 'Pink Moon', artist: 'Nick Drake', source: 'youtube', sourceId: 'irq959oTVSs' }
      ],
      'upbeat': [
        { id: '7', title: 'Uptown Funk', artist: 'Mark Ronson ft. Bruno Mars', source: 'youtube', sourceId: 'OPf0YbXqDm0' },
        { id: '8', title: 'September', artist: 'Earth Wind & Fire', source: 'youtube', sourceId: 'Gs069dndIYk' },
        { id: '9', title: 'Good as Hell', artist: 'Lizzo', source: 'youtube', sourceId: 'SmbmeOgWsqE' }
      ]
    };

    const tracks = vibeTrackMap[vibe] || vibeTrackMap['chill'];
    setSuggestedTracks(tracks);
  };

  const handleSearch = async () => {
    if (!artistInput().trim() && !trackInput().trim()) return;

    setIsSearching(true);

    // Simulate search delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock search results based on input
    const mockResults: TrackSuggestion[] = [];
    
    if (artistInput().trim()) {
      const artist = artistInput().trim();
      mockResults.push(
        { id: `search-${Date.now()}-1`, title: `Popular Song 1`, artist, source: 'youtube', sourceId: 'mock1' },
        { id: `search-${Date.now()}-2`, title: `Popular Song 2`, artist, source: 'youtube', sourceId: 'mock2' },
        { id: `search-${Date.now()}-3`, title: `Popular Song 3`, artist, source: 'spotify', sourceId: 'mock3' }
      );
    }

    if (trackInput().trim()) {
      const track = trackInput().trim();
      mockResults.push(
        { id: `search-${Date.now()}-4`, title: track, artist: 'Artist Name', source: 'youtube', sourceId: 'mock4' }
      );
    }

    setSuggestedTracks(prev => [...prev, ...mockResults]);
    setIsSearching(false);
    setArtistInput('');
    setTrackInput('');
  };

  const handleTrackToggle = (track: TrackSuggestion) => {
    const selected = selectedTracks();
    const isSelected = selected.some(t => t.id === track.id);
    
    if (isSelected) {
      const newSelected = selected.filter(t => t.id !== track.id);
      setSelectedTracks(newSelected);
      props.onTracksSelected(newSelected);
    } else {
      const newSelected = [...selected, track];
      setSelectedTracks(newSelected);
      props.onTracksSelected(newSelected);
    }

    // Animate track selection
    const trackEl = document.querySelector(`[data-track-id="${track.id}"]`);
    if (trackEl) {
      anime({
        targets: trackEl,
        scale: [1, 1.05, 1],
        boxShadow: isSelected 
          ? ['0 0 20px #00f92a', '0 0 0px #00f92a']
          : ['0 0 0px #00f92a', '0 0 20px #00f92a'],
        duration: 400,
        easing: 'easeOutCubic'
      });
    }
  };

  const handleComplete = () => {
    if (selectedTracks().length === 0) {
      alert('Please select at least one track!');
      return;
    }
    props.onComplete(selectedTracks());
  };

  return (
    <div 
      ref={containerRef!}
      class="h-full flex flex-col bg-gradient-to-b from-gray-900 to-black rounded-lg p-6"
      style={{ opacity: 0 }}
    >
      {/* Header */}
      <div class="text-center mb-6">
        <div class="text-4xl mb-2">🎵</div>
        <h3 class="text-xl font-semibold mb-2 text-white">
          What should we add to this playlist?
        </h3>
        <p class="text-gray-400">
          {props.selectedVibe ? 
            `Tell us some artists or specific tracks that fit the ${props.selectedVibe.name.toLowerCase()} vibe` :
            "Tell us some artists or specific tracks you'd like to include"
          }
        </p>
      </div>

      {/* Input Form */}
      <div ref={formRef!} class="bg-gray-800/50 rounded-lg p-4 mb-6 border border-purple-500/30">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label class="block text-sm text-gray-300 mb-2">Artist Name</label>
            <input
              type="text"
              value={artistInput()}
              onInput={(e) => setArtistInput(e.currentTarget.value)}
              placeholder="e.g. Daft Punk, The Weeknd..."
              class="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
            />
          </div>
          <div>
            <label class="block text-sm text-gray-300 mb-2">Specific Track</label>
            <input
              type="text"
              value={trackInput()}
              onInput={(e) => setTrackInput(e.currentTarget.value)}
              placeholder="e.g. Blinding Lights, Midnight City..."
              class="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>
        
        <button
          onClick={handleSearch}
          disabled={!artistInput().trim() && !trackInput().trim() || isSearching()}
          class="w-full py-2 rounded-lg font-medium transition-all duration-300 disabled:opacity-50"
          style={{
            background: (artistInput().trim() || trackInput().trim()) && !isSearching()
              ? 'linear-gradient(135deg, #04caf4 0%, #3b00fd 100%)'
              : 'rgba(255,255,255,0.1)'
          }}
        >
          {isSearching() ? 'Searching...' : 'Find Tracks'}
        </button>
      </div>

      {/* Track Suggestions */}
      <div class="flex-1 overflow-y-auto">
        <div class="flex items-center justify-between mb-4">
          <h4 class="text-lg font-medium text-white">
            {suggestedTracks().length > 6 ? 'Track Suggestions & Results' : 'Track Suggestions'}
          </h4>
          <span class="text-sm text-gray-400">
            {selectedTracks().length} selected
          </span>
        </div>

        <div class="grid grid-cols-1 gap-3 mb-6">
          <For each={suggestedTracks()}>
            {(track) => (
              <div
                data-track-id={track.id}
                class="p-3 bg-gray-800/50 rounded-lg cursor-pointer transition-all duration-300 border-2 hover:bg-gray-700/50"
                style={{
                  'border-color': selectedTracks().some(t => t.id === track.id) 
                    ? '#00f92a' 
                    : 'transparent'
                }}
                onClick={() => handleTrackToggle(track)}
              >
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-3">
                    <div class="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center">
                      🎵
                    </div>
                    <div class="flex-1">
                      <div class="font-medium text-white text-sm">{track.title}</div>
                      <div class="text-gray-400 text-xs">{track.artist}</div>
                    </div>
                    <div class="w-4 h-4 rounded-full" style={{
                      background: track.source === 'youtube' ? '#ff0000' : '#1db954'
                    }}></div>
                  </div>
                  <div class="ml-3">
                    {selectedTracks().some(t => t.id === track.id) ? (
                      <div class="w-6 h-6 bg-green-400 rounded-full flex items-center justify-center">
                        <span class="text-black text-xs">✓</span>
                      </div>
                    ) : (
                      <div class="w-6 h-6 border-2 border-gray-500 rounded-full"></div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </For>
        </div>
      </div>

      {/* Selected Tracks Summary */}
      <Show when={selectedTracks().length > 0}>
        <div class="bg-green-900/20 border border-green-500/30 rounded-lg p-4 mb-4">
          <div class="text-sm text-green-300 mb-2 font-medium">
            Selected tracks ({selectedTracks().length}):
          </div>
          <div class="flex flex-wrap gap-2">
            <For each={selectedTracks()}>
              {(track) => (
                <span class="px-2 py-1 bg-green-600/30 text-green-200 rounded-full text-xs border border-green-500/30">
                  {track.title} - {track.artist}
                </span>
              )}
            </For>
          </div>
        </div>
      </Show>

      {/* Action Button */}
      <Show when={selectedTracks().length > 0}>
        <div class="flex justify-center">
          <button
            onClick={handleComplete}
            class="px-8 py-3 rounded-lg font-medium transition-all duration-300"
            style={{
              background: 'linear-gradient(135deg, #00f92a 0%, #04caf4 100%)'
            }}
          >
            Continue with {selectedTracks().length} track{selectedTracks().length !== 1 ? 's' : ''} →
          </button>
        </div>
      </Show>
    </div>
  );
};

export default ArtistTrackSelector;