import { Component, createSignal, onMount, For } from 'solid-js';
import anime from 'animejs';

export type VibeType = 'energetic' | 'chill' | 'nostalgic' | 'focus' | 'party' | 'emotional' | 'workout' | 'late_night';

interface Vibe {
  id: VibeType;
  name: string;
  emoji: string;
  description: string;
  color: string;
  gradient: string;
  keywords: string[];
  templateTracks?: string[];
}

interface VibeSelectorProps {
  selectedVibe?: VibeType;
  onVibeSelect: (vibe: Vibe) => void;
  onCustomVibeDescribe: (description: string) => void;
}

const vibes: Vibe[] = [
  {
    id: 'energetic',
    name: 'Energetic',
    emoji: '⚡',
    description: 'High-energy tracks that pump you up',
    color: '#00f92a',
    gradient: 'linear-gradient(135deg, #00f92a 0%, #04caf4 100%)',
    keywords: ['upbeat', 'fast', 'electric', 'pump-up', 'dance'],
    templateTracks: ['Don\'t Stop Me Now - Queen', 'Uptown Funk - Bruno Mars']
  },
  {
    id: 'chill',
    name: 'Chill',
    emoji: '🌊',
    description: 'Laid-back vibes for relaxing moments',
    color: '#04caf4',
    gradient: 'linear-gradient(135deg, #04caf4 0%, #3b00fd 100%)',
    keywords: ['relaxed', 'smooth', 'mellow', 'ambient', 'calm'],
    templateTracks: ['Weightless - Marconi Union', 'Lofi Hip Hop Radio']
  },
  {
    id: 'nostalgic',
    name: 'Nostalgic',
    emoji: '🕰️',
    description: 'Songs that bring back memories',
    color: '#f906d6',
    gradient: 'linear-gradient(135deg, #f906d6 0%, #ff9b00 100%)',
    keywords: ['throwback', 'classic', 'vintage', 'memories', '90s'],
    templateTracks: ['Don\'t Look Back in Anger - Oasis', 'Mr. Brightside - The Killers']
  },
  {
    id: 'focus',
    name: 'Focus',
    emoji: '🎯',
    description: 'Perfect for concentration and deep work',
    color: '#3b00fd',
    gradient: 'linear-gradient(135deg, #3b00fd 0%, #04caf4 100%)',
    keywords: ['instrumental', 'ambient', 'minimal', 'concentration', 'study'],
    templateTracks: ['Ludovico Einaudi - Nuvole Bianche', 'Max Richter - On The Nature of Daylight']
  },
  {
    id: 'party',
    name: 'Party',
    emoji: '🎉',
    description: 'Turn up the volume and get the crowd moving',
    color: '#ff9b00',
    gradient: 'linear-gradient(135deg, #ff9b00 0%, #f906d6 100%)',
    keywords: ['bangers', 'crowd-pleasers', 'sing-along', 'hype', 'dance'],
    templateTracks: ['I Gotta Feeling - Black Eyed Peas', 'Good as Hell - Lizzo']
  },
  {
    id: 'emotional',
    name: 'Emotional',
    emoji: '💜',
    description: 'Deep, meaningful tracks that hit the feels',
    color: '#f906d6',
    gradient: 'linear-gradient(135deg, #f906d6 0%, #3b00fd 100%)',
    keywords: ['heartfelt', 'deep', 'touching', 'meaningful', 'soulful'],
    templateTracks: ['Mad World - Gary Jules', 'Hurt - Johnny Cash']
  },
  {
    id: 'workout',
    name: 'Workout',
    emoji: '💪',
    description: 'Intense beats to power through your session',
    color: '#00f92a',
    gradient: 'linear-gradient(135deg, #00f92a 0%, #ff9b00 100%)',
    keywords: ['intense', 'motivational', 'driving', 'power', 'adrenaline'],
    templateTracks: ['Eye of the Tiger - Survivor', 'Till I Collapse - Eminem']
  },
  {
    id: 'late_night',
    name: 'Late Night',
    emoji: '🌙',
    description: 'Moody tracks for those 2am feels',
    color: '#04caf4',
    gradient: 'linear-gradient(135deg, #04caf4 0%, #f906d6 100%)',
    keywords: ['moody', 'atmospheric', 'dark', 'introspective', 'night'],
    templateTracks: ['Midnight City - M83', 'The Night We Met - Lord Huron']
  }
];

const VibeSelector: Component<VibeSelectorProps> = (props) => {
  const [selectedVibe, setSelectedVibe] = createSignal<VibeType | null>(props.selectedVibe || null);
  const [customDescription, setCustomDescription] = createSignal('');
  const [showCustomInput, setShowCustomInput] = createSignal(false);
  
  let containerRef: HTMLDivElement;
  let vibeGridRef: HTMLDivElement;
  let customInputRef: HTMLDivElement;

  onMount(() => {
    // Container entrance animation
    if (containerRef) {
      anime({
        targets: containerRef,
        opacity: [0, 1],
        translateY: [30, 0],
        duration: 600,
        easing: 'easeOutCubic'
      });
    }

    // Staggered vibe cards animation
    if (vibeGridRef) {
      const vibeCards = vibeGridRef.querySelectorAll('.vibe-card');
      anime({
        targets: vibeCards,
        opacity: [0, 1],
        scale: [0.8, 1],
        translateY: [20, 0],
        duration: 500,
        delay: anime.stagger(100, {start: 200}),
        easing: 'easeOutCubic'
      });
    }
  });

  const handleVibeSelect = (vibe: Vibe) => {
    const previousSelected = selectedVibe();
    setSelectedVibe(vibe.id);
    setShowCustomInput(false);

    // Animate selection
    const vibeCard = document.querySelector(`[data-vibe="${vibe.id}"]`) as HTMLElement;
    if (vibeCard) {
      // First, animate out the previous selection
      if (previousSelected) {
        const prevCard = document.querySelector(`[data-vibe="${previousSelected}"]`) as HTMLElement;
        if (prevCard) {
          anime({
            targets: prevCard,
            scale: [1.1, 1],
            boxShadow: ['0 0 30px currentColor', '0 0 0px currentColor'],
            duration: 300
          });
        }
      }

      // Then animate in the new selection
      anime({
        targets: vibeCard,
        scale: [1, 1.1, 1],
        boxShadow: [
          '0 0 0px currentColor',
          '0 0 30px currentColor',
          '0 0 20px currentColor'
        ],
        duration: 600,
        easing: 'easeOutElastic(1, .8)'
      });

      // Particle burst effect
      const rect = vibeCard.getBoundingClientRect();
      createParticleBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, vibe.color);
    }

    props.onVibeSelect(vibe);
  };

  const createParticleBurst = (x: number, y: number, color: string) => {
    const particles = [];
    for (let i = 0; i < 12; i++) {
      const particle = document.createElement('div');
      particle.style.position = 'fixed';
      particle.style.left = x + 'px';
      particle.style.top = y + 'px';
      particle.style.width = '4px';
      particle.style.height = '4px';
      particle.style.backgroundColor = color;
      particle.style.borderRadius = '50%';
      particle.style.pointerEvents = 'none';
      particle.style.zIndex = '9999';
      document.body.appendChild(particle);
      particles.push(particle);
    }

    anime({
      targets: particles,
      translateX: () => anime.random(-60, 60),
      translateY: () => anime.random(-60, 60),
      scale: [1, 0],
      opacity: [1, 0],
      duration: 800,
      delay: anime.stagger(50),
      easing: 'easeOutCubic',
      complete: () => {
        particles.forEach(p => document.body.removeChild(p));
      }
    });
  };

  const handleCustomVibeToggle = () => {
    setShowCustomInput(!showCustomInput());
    setSelectedVibe(null);

    if (customInputRef) {
      if (!showCustomInput()) {
        // Animate in custom input
        anime({
          targets: customInputRef,
          opacity: [0, 1],
          height: [0, 'auto'],
          duration: 400,
          easing: 'easeOutCubic'
        });
      }
    }
  };

  const handleCustomSubmit = () => {
    const description = customDescription().trim();
    if (description) {
      props.onCustomVibeDescribe(description);
    }
  };

  return (
    <div ref={containerRef!} class="w-full max-w-4xl mx-auto p-6" style={{ opacity: 0 }}>
      {/* Header */}
      <div class="text-center mb-8">
        <h2 class="text-3xl font-bold mb-4" style={{ 
          background: 'linear-gradient(135deg, #3b00fd 0%, #04caf4 100%)',
          'background-clip': 'text',
          '-webkit-background-clip': 'text',
          '-webkit-text-fill-color': 'transparent'
        }}>
          Choose Your Vibe
        </h2>
        <p class="text-gray-400 text-lg">
          What energy should this playlist capture?
        </p>
      </div>

      {/* Vibe Grid */}
      <div 
        ref={vibeGridRef!} 
        class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
      >
        <For each={vibes}>
          {(vibe) => (
            <button
              class="vibe-card group relative p-6 rounded-xl transition-all duration-300 cursor-pointer border-2"
              data-vibe={vibe.id}
              style={{
                opacity: 0,
                background: selectedVibe() === vibe.id 
                  ? vibe.gradient 
                  : 'rgba(255,255,255,0.05)',
                'border-color': selectedVibe() === vibe.id ? vibe.color : 'rgba(255,255,255,0.1)',
                color: selectedVibe() === vibe.id ? '#000' : '#fff'
              }}
              onClick={() => handleVibeSelect(vibe)}
              onMouseEnter={(e) => {
                if (selectedVibe() !== vibe.id) {
                  anime({
                    targets: e.currentTarget,
                    scale: 1.05,
                    boxShadow: `0 10px 30px ${vibe.color}40`,
                    duration: 300
                  });
                }
              }}
              onMouseLeave={(e) => {
                if (selectedVibe() !== vibe.id) {
                  anime({
                    targets: e.currentTarget,
                    scale: 1,
                    boxShadow: '0 0 0px transparent',
                    duration: 300
                  });
                }
              }}
            >
              <div class="text-center">
                <div class="text-4xl mb-3">{vibe.emoji}</div>
                <h3 class="font-bold text-lg mb-2">{vibe.name}</h3>
                <p class="text-sm opacity-80 leading-tight">
                  {vibe.description}
                </p>
                
                {/* Keywords */}
                <div class="mt-3 flex flex-wrap gap-1 justify-center">
                  <For each={vibe.keywords.slice(0, 3)}>
                    {(keyword) => (
                      <span class="text-xs px-2 py-1 rounded-full" style={{
                        background: selectedVibe() === vibe.id 
                          ? 'rgba(0,0,0,0.2)' 
                          : 'rgba(255,255,255,0.1)'
                      }}>
                        #{keyword}
                      </span>
                    )}
                  </For>
                </div>
              </div>

              {/* Selection Indicator */}
              {selectedVibe() === vibe.id && (
                <div class="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-green-400 flex items-center justify-center">
                  <span class="text-black text-sm">✓</span>
                </div>
              )}
            </button>
          )}
        </For>
      </div>

      {/* Custom Vibe Option */}
      <div class="text-center">
        <button
          onClick={handleCustomVibeToggle}
          class="px-6 py-3 rounded-lg border-2 border-dashed border-purple-500/50 text-purple-300 hover:border-purple-400 hover:text-purple-200 transition-all duration-300"
          style={{
            background: showCustomInput() ? 'rgba(249, 6, 214, 0.1)' : 'transparent'
          }}
        >
          🎨 Describe Your Own Vibe
        </button>

        {/* Custom Input */}
        {showCustomInput() && (
          <div 
            ref={customInputRef!}
            class="mt-6 max-w-md mx-auto"
            style={{ opacity: 0 }}
          >
            <textarea
              value={customDescription()}
              onInput={(e) => setCustomDescription(e.currentTarget.value)}
              placeholder="Describe the vibe... e.g., 'Songs that make me feel like I'm in a cyberpunk movie' or 'Tracks for late-night coding sessions'"
              class="w-full p-4 rounded-lg bg-gray-900/50 border border-purple-500/30 text-white placeholder-gray-400 resize-none focus:outline-none focus:border-purple-400"
              rows="3"
            />
            <button
              onClick={handleCustomSubmit}
              disabled={!customDescription().trim()}
              class="mt-3 px-6 py-2 rounded-lg font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: customDescription().trim() 
                  ? 'linear-gradient(135deg, #f906d6 0%, #ff9b00 100%)' 
                  : 'rgba(255,255,255,0.1)',
                color: customDescription().trim() ? '#000' : '#666'
              }}
            >
              Use This Vibe ✨
            </button>
          </div>
        )}
      </div>

      {/* Selected Vibe Preview */}
      {selectedVibe() && (
        <div class="mt-8 p-6 rounded-xl border border-gray-700 bg-gray-900/50">
          <h4 class="font-semibold mb-3 text-center" style={{ color: vibes.find(v => v.id === selectedVibe())?.color }}>
            Perfect! Let's build a {vibes.find(v => v.id === selectedVibe())?.name.toLowerCase()} playlist
          </h4>
          <div class="text-sm text-gray-400 text-center">
            Keywords: {vibes.find(v => v.id === selectedVibe())?.keywords.join(', ')}
          </div>
          {vibes.find(v => v.id === selectedVibe())?.templateTracks && (
            <div class="mt-3 text-sm text-gray-300 text-center">
              <span class="text-gray-500">Similar to:</span> {vibes.find(v => v.id === selectedVibe())?.templateTracks?.join(', ')}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VibeSelector;