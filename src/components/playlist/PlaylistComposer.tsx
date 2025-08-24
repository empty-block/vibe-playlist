import { Component, createSignal, onMount, For, Show, createEffect } from 'solid-js';
import anime from 'animejs';
import type { VibeType } from './VibeSelector';
import { creationStore } from '../../stores/creationStore';

interface TrackSuggestion {
  id: string;
  title: string;
  artist: string;
  source: 'youtube' | 'spotify';
  sourceId: string;
  preview?: string;
}

interface PlaylistComposerProps {
  selectedVibe?: { id: VibeType; name: string; description: string };
  selectedTracks: TrackSuggestion[];
  onComplete: () => void;
}

type CompositionPhase = 'tracks' | 'title' | 'image' | 'complete';

const PlaylistComposer: Component<PlaylistComposerProps> = (props) => {
  const [currentPhase, setCurrentPhase] = createSignal<CompositionPhase>('tracks');
  const [titleInput, setTitleInput] = createSignal('');
  const [showTitleSuggestions, setShowTitleSuggestions] = createSignal(false);
  const [titleSuggestions, setTitleSuggestions] = createSignal<string[]>([]);
  const [isGeneratingTitles, setIsGeneratingTitles] = createSignal(false);
  
  const [selectedImage, setSelectedImage] = createSignal<string | null>(null);
  const [showImageGenerator, setShowImageGenerator] = createSignal(false);
  const [generatedImages, setGeneratedImages] = createSignal<string[]>([]);
  const [isGeneratingImages, setIsGeneratingImages] = createSignal(false);
  const [imageStyle, setImageStyle] = createSignal<'neon' | 'minimalist' | 'retro' | 'abstract'>('neon');

  let containerRef: HTMLDivElement;
  let titleInputRef: HTMLInputElement;
  let fileInputRef: HTMLInputElement;

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
  });

  // Auto-focus title input when in title phase
  createEffect(() => {
    if (currentPhase() === 'title' && titleInputRef) {
      setTimeout(() => titleInputRef.focus(), 300);
    }
  });

  const handlePhaseTransition = (newPhase: CompositionPhase) => {
    // Animate phase transition
    if (containerRef) {
      anime({
        targets: containerRef,
        scale: [1, 0.98, 1],
        opacity: [1, 0.8, 1],
        duration: 400,
        easing: 'easeOutCubic',
        complete: () => {
          setCurrentPhase(newPhase);
        }
      });
    } else {
      setCurrentPhase(newPhase);
    }
  };

  const generateTitleSuggestions = async () => {
    setIsGeneratingTitles(true);
    setShowTitleSuggestions(true);

    // Simulate AI title generation
    await new Promise(resolve => setTimeout(resolve, 1000));

    const vibe = props.selectedVibe?.name.toLowerCase() || 'vibes';
    const trackCount = props.selectedTracks.length;
    
    // Generate contextual suggestions
    const suggestions = [
      `${vibe.charAt(0).toUpperCase() + vibe.slice(1)} Sessions`,
      `My ${vibe.charAt(0).toUpperCase() + vibe.slice(1)} Collection`,
      `Late Night ${vibe.charAt(0).toUpperCase() + vibe.slice(1)}`,
      `${trackCount} ${vibe.charAt(0).toUpperCase() + vibe.slice(1)} Tracks`,
      `${getTimeOfDayContext()} ${vibe.charAt(0).toUpperCase() + vibe.slice(1)}`
    ];

    setTitleSuggestions(suggestions);
    setIsGeneratingTitles(false);
  };

  const getTimeOfDayContext = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Morning';
    if (hour < 17) return 'Afternoon';
    if (hour < 22) return 'Evening';
    return 'Midnight';
  };

  const handleTitleSelect = (suggestion: string) => {
    setTitleInput(suggestion);
    setShowTitleSuggestions(false);
    // Auto-advance after selection
    setTimeout(() => handlePhaseTransition('image'), 800);
  };

  const handleTitleSubmit = () => {
    if (titleInput().trim()) {
      creationStore.setPlaylistTitle(titleInput().trim());
      handlePhaseTransition('image');
    }
  };

  const handleImageUpload = (event: Event) => {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setSelectedImage(result);
        setTimeout(() => handlePhaseTransition('complete'), 800);
      };
      reader.readAsDataURL(file);
    }
  };

  const generateImageSuggestions = async () => {
    setIsGeneratingImages(true);
    setShowImageGenerator(true);

    // Simulate AI image generation
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Mock generated images (in real implementation, these would be AI-generated)
    const mockImages = [
      'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImEiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiMzYjAwZmQ7c3RvcC1vcGFjaXR5OjEiIC8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdHlsZT0ic3RvcC1jb2xvcjojMDRjYWY0O3N0b3Atb3BhY2l0eToxIiAvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjYSkiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0id2hpdGUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZm9udC13ZWlnaHQ9ImJvbGQiPk5lb24gVmlibGVzPC90ZXh0Pjwvc3ZnPg==',
      'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cmFkaWFsR3JhZGllbnQgaWQ9ImIiIGN4PSI1MCUiIGN5PSI1MCUiIHI9IjUwJSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3R5bGU9InN0b3AtY29sb3I6IzAwZjkyYTtzdG9wLW9wYWNpdHk6MSIgLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiMwMDAwMDA7c3RvcC1vcGFjaXR5OjEiIC8+PC9yYWRpYWxHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNiKSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmb250LXdlaWdodD0iYm9sZCI+QWJzdHJhY3Q8L3RleHQ+PC9zdmc+',
      'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImMiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojZjkwNmQ2O3N0b3Atb3BhY2l0eToxIiAvPjxzdG9wIG9mZnNldD0iNTAlIiBzdHlsZT0ic3RvcC1jb2xvcjojZmY5YjAwO3N0b3Atb3BhY2l0eToxIiAvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3R5bGU9InN0b3AtY29sb3I6I2QxZjYwYTtzdG9wLW9wYWNpdHk6MSIgLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2MpIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IndoaXRlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZvbnQtd2VpZ2h0PSJib2xkIj5SZXRybyBWaWJlczwvdGV4dD48L3N2Zz4='
    ];

    setGeneratedImages(mockImages);
    setIsGeneratingImages(false);
  };

  const handleImageSelect = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setShowImageGenerator(false);
    setTimeout(() => handlePhaseTransition('complete'), 800);
  };

  return (
    <div 
      ref={containerRef!}
      class="h-full flex flex-col bg-gradient-to-b from-gray-900 to-black rounded-lg p-6"
      style={{ opacity: 0 }}
    >
      <Show when={currentPhase() === 'tracks'}>
        <div class="flex flex-col h-full">
          <div class="text-center mb-6">
            <div class="text-4xl mb-2">🎵</div>
            <h3 class="text-xl font-semibold mb-2 text-white">
              Your Playlist is Taking Shape
            </h3>
            <p class="text-gray-400">
              {props.selectedTracks.length} track{props.selectedTracks.length !== 1 ? 's' : ''} ready to go
            </p>
          </div>

          <div class="flex-1 overflow-y-auto mb-6">
            <div class="space-y-2">
              <For each={props.selectedTracks}>
                {(track, index) => (
                  <div class="p-3 bg-gray-800/50 rounded-lg flex items-center space-x-3">
                    <div class="text-gray-400 text-sm font-mono w-6">
                      {(index() + 1).toString().padStart(2, '0')}
                    </div>
                    <div class="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center">
                      🎵
                    </div>
                    <div class="flex-1">
                      <div class="font-medium text-white text-sm">{track.title}</div>
                      <div class="text-gray-400 text-xs">{track.artist}</div>
                    </div>
                    <div class="w-3 h-3 rounded-full" style={{
                      background: track.source === 'youtube' ? '#ff0000' : '#1db954'
                    }}></div>
                  </div>
                )}
              </For>
            </div>
          </div>

          <div class="text-center">
            <button
              onClick={() => handlePhaseTransition('title')}
              class="px-8 py-3 rounded-lg font-medium transition-all duration-300"
              style={{
                background: 'linear-gradient(135deg, #3b00fd 0%, #04caf4 100%)'
              }}
            >
              Let's Name Your Playlist →
            </button>
          </div>
        </div>
      </Show>

      <Show when={currentPhase() === 'title'}>
        <div class="flex flex-col h-full">
          <div class="text-center mb-8">
            <div class="text-4xl mb-2">✨</div>
            <h3 class="text-xl font-semibold mb-2 text-white">
              What would you like to call your playlist?
            </h3>
            <p class="text-gray-400">
              Give it a name that captures the vibe
            </p>
          </div>

          <div class="flex-1 flex flex-col justify-center max-w-lg mx-auto w-full">
            <div class="mb-6">
              <input
                ref={titleInputRef!}
                type="text"
                value={titleInput()}
                onInput={(e) => setTitleInput(e.currentTarget.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleTitleSubmit()}
                placeholder="Enter your playlist name..."
                class="w-full p-4 text-lg bg-gray-900/50 border-2 border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 transition-colors"
              />
            </div>

            <div class="flex flex-col items-center space-y-4">
              <Show when={!showTitleSuggestions()}>
                <button
                  onClick={generateTitleSuggestions}
                  disabled={isGeneratingTitles()}
                  class="px-4 py-2 text-sm border border-gray-600 rounded-full text-gray-300 hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                  {isGeneratingTitles() ? 'Getting ideas...' : 'Need ideas? 💡'}
                </button>
              </Show>

              <Show when={showTitleSuggestions()}>
                <div class="w-full">
                  <p class="text-sm text-gray-400 mb-3 text-center">Here are some suggestions:</p>
                  <div class="grid gap-2">
                    <For each={titleSuggestions()}>
                      {(suggestion) => (
                        <button
                          onClick={() => handleTitleSelect(suggestion)}
                          class="p-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white hover:bg-gray-700/50 hover:border-purple-500/50 transition-all text-left"
                        >
                          {suggestion}
                        </button>
                      )}
                    </For>
                  </div>
                  <button
                    onClick={() => setShowTitleSuggestions(false)}
                    class="w-full mt-3 px-3 py-2 text-sm text-gray-400 hover:text-gray-300 transition-colors"
                  >
                    Never mind, I'll think of my own
                  </button>
                </div>
              </Show>

              <Show when={titleInput().trim() && !showTitleSuggestions()}>
                <button
                  onClick={handleTitleSubmit}
                  class="px-8 py-3 rounded-lg font-medium transition-all duration-300"
                  style={{
                    background: 'linear-gradient(135deg, #00f92a 0%, #04caf4 100%)'
                  }}
                >
                  Perfect! Next Step →
                </button>
              </Show>
            </div>
          </div>
        </div>
      </Show>

      <Show when={currentPhase() === 'image'}>
        <div class="flex flex-col h-full">
          <div class="text-center mb-8">
            <div class="text-4xl mb-2">🎨</div>
            <h3 class="text-xl font-semibold mb-2 text-white">
              How should "{titleInput()}" look?
            </h3>
            <p class="text-gray-400">
              Upload your own image or let us create something
            </p>
          </div>

          <div class="flex-1 flex flex-col justify-center max-w-lg mx-auto w-full">
            <Show when={!selectedImage() && !showImageGenerator()}>
              <div class="space-y-4">
                <input
                  ref={fileInputRef!}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  class="hidden"
                />
                
                <button
                  onClick={() => fileInputRef.click()}
                  class="w-full p-6 border-2 border-dashed border-purple-500/50 rounded-lg text-center hover:border-purple-400 hover:bg-purple-900/10 transition-all"
                >
                  <div class="text-2xl mb-2">📸</div>
                  <div class="text-white font-medium mb-1">Upload Image</div>
                  <div class="text-gray-400 text-sm">Choose from your photos</div>
                </button>

                <div class="text-center text-gray-500 text-sm">or</div>

                <button
                  onClick={generateImageSuggestions}
                  disabled={isGeneratingImages()}
                  class="w-full p-4 bg-gray-800/50 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-700/50 transition-colors disabled:opacity-50"
                >
                  {isGeneratingImages() ? (
                    <div class="flex items-center justify-center space-x-2">
                      <div class="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
                      <span>Creating visuals...</span>
                    </div>
                  ) : (
                    <>
                      <div class="text-lg mb-1">✨</div>
                      <div>Generate Image</div>
                    </>
                  )}
                </button>
              </div>
            </Show>

            <Show when={showImageGenerator() && !selectedImage()}>
              <div class="space-y-4">
                <p class="text-sm text-gray-400 text-center mb-4">Choose a style:</p>
                <div class="grid grid-cols-2 gap-3 mb-6">
                  <For each={generatedImages()}>
                    {(imageUrl, index) => (
                      <button
                        onClick={() => handleImageSelect(imageUrl)}
                        class="aspect-square rounded-lg overflow-hidden border-2 border-gray-700 hover:border-purple-500 transition-colors"
                      >
                        <img 
                          src={imageUrl} 
                          alt={`Generated option ${index() + 1}`}
                          class="w-full h-full object-cover"
                        />
                      </button>
                    )}
                  </For>
                </div>
                <button
                  onClick={() => setShowImageGenerator(false)}
                  class="w-full px-3 py-2 text-sm text-gray-400 hover:text-gray-300 transition-colors"
                >
                  Let me upload my own instead
                </button>
              </div>
            </Show>

            <Show when={selectedImage()}>
              <div class="text-center">
                <div class="mb-6">
                  <img 
                    src={selectedImage()!} 
                    alt="Selected playlist cover"
                    class="w-48 h-48 mx-auto rounded-lg shadow-lg"
                  />
                </div>
                <button
                  onClick={() => handlePhaseTransition('complete')}
                  class="px-8 py-3 rounded-lg font-medium transition-all duration-300"
                  style={{
                    background: 'linear-gradient(135deg, #00f92a 0%, #04caf4 100%)'
                  }}
                >
                  Looks Perfect! →
                </button>
              </div>
            </Show>
          </div>
        </div>
      </Show>

      <Show when={currentPhase() === 'complete'}>
        <div class="flex items-center justify-center h-full text-center">
          <div class="max-w-lg">
            <div class="text-6xl mb-4">🎉</div>
            <h3 class="text-xl font-semibold mb-2 text-white">
              Your Playlist is Ready!
            </h3>
            <p class="text-gray-400 mb-6">
              "{titleInput()}" with {props.selectedTracks.length} tracks is looking great
            </p>

            <div class="bg-gray-900/50 rounded-lg p-4 mb-6">
              <div class="flex items-center space-x-4">
                <Show when={selectedImage()}>
                  <img 
                    src={selectedImage()!} 
                    alt="Playlist cover"
                    class="w-16 h-16 rounded-lg"
                  />
                </Show>
                <div class="flex-1 text-left">
                  <div class="font-medium text-white">{titleInput()}</div>
                  <div class="text-sm text-gray-400">
                    {props.selectedTracks.length} track{props.selectedTracks.length !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={props.onComplete}
              class="px-8 py-3 rounded-lg font-medium transition-all duration-300"
              style={{
                background: 'linear-gradient(135deg, #f906d6 0%, #ff9b00 100%)'
              }}
            >
              Continue to Social Step →
            </button>
          </div>
        </div>
      </Show>
    </div>
  );
};

export default PlaylistComposer;