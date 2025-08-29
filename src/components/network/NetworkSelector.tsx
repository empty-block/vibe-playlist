import { Component, createSignal, For, Show } from 'solid-js';
import anime from 'animejs';

interface NetworkOption {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  userCount?: number;
  isLocked?: boolean;
}

interface NetworkSelectorProps {
  selectedNetwork: string;
  onNetworkChange: (networkId: string) => void;
}

const NetworkSelector: Component<NetworkSelectorProps> = (props) => {
  const [isOpen, setIsOpen] = createSignal(false);
  const [isTyping, setIsTyping] = createSignal(false);
  
  const networks: NetworkOption[] = [
    {
      id: 'personal',
      name: 'Personal Network',
      description: 'Your direct connections and influences',
      icon: 'fas fa-user-circle',
      color: 'from-cyan-400 to-blue-400',
      userCount: 147
    },
    {
      id: 'extended',
      name: 'Extended Network',
      description: 'Friends of friends and their music',
      icon: 'fas fa-users',
      color: 'from-green-400 to-cyan-400',
      userCount: 2843
    },
    {
      id: 'community',
      name: 'Jamzy Community',
      description: 'The entire Jamzy network',
      icon: 'fas fa-globe',
      color: 'from-purple-400 to-pink-400',
      userCount: 48392
    },
    {
      id: 'genre-hiphop',
      name: 'Hip Hop Network',
      description: 'Hip hop enthusiasts and artists',
      icon: 'fas fa-microphone',
      color: 'from-yellow-400 to-orange-400',
      userCount: 12847
    },
    {
      id: 'genre-electronic',
      name: 'Electronic Network',
      description: 'Electronic music community',
      icon: 'fas fa-wave-square',
      color: 'from-pink-400 to-purple-400',
      userCount: 9283
    },
    {
      id: 'genre-indie',
      name: 'Indie Network',
      description: 'Independent artists and fans',
      icon: 'fas fa-guitar',
      color: 'from-indigo-400 to-purple-400',
      userCount: 7629
    },
    {
      id: 'trending',
      name: 'Trending Network',
      description: 'Most active users this week',
      icon: 'fas fa-fire',
      color: 'from-red-400 to-orange-400',
      userCount: 3847,
      isLocked: false
    }
  ];
  
  const currentNetwork = () => networks.find(n => n.id === props.selectedNetwork) || networks[0];
  
  const handleNetworkSelect = (network: NetworkOption) => {
    if (network.isLocked) return;
    
    setIsTyping(true);
    
    // Simulate terminal typing effect
    anime({
      targets: {},
      duration: 500,
      complete: () => {
        props.onNetworkChange(network.id);
        setIsOpen(false);
        setIsTyping(false);
      }
    });
  };
  
  return (
    <div class="relative">
      {/* Terminal-style selector */}
      <button
        onClick={() => setIsOpen(!isOpen())}
        class="w-full bg-black/60 border-2 border-[#04caf4]/30 p-4 text-left hover:border-[#04caf4] transition-all group"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class={`w-10 h-10 bg-gradient-to-r ${currentNetwork().color} flex items-center justify-center shadow-lg`}>
              <i class={`${currentNetwork().icon} text-white`}></i>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <span class="text-cyan-400 font-mono text-sm">NETWORK://</span>
                <h3 class="text-white font-bold">{currentNetwork().name}</h3>
              </div>
              <p class="text-cyan-300/60 text-sm">{currentNetwork().description}</p>
            </div>
          </div>
          <div class="flex items-center gap-3">
            {currentNetwork().userCount && (
              <div class="text-right">
                <p class="text-cyan-400 font-mono text-lg font-bold">
                  {currentNetwork().userCount.toLocaleString()}
                </p>
                <p class="text-cyan-300/60 text-xs">nodes</p>
              </div>
            )}
            <i class={`fas fa-chevron-${isOpen() ? 'up' : 'down'} text-cyan-400 group-hover:text-cyan-300 transition-all`}></i>
          </div>
        </div>
        
        {/* Typing cursor effect */}
        <Show when={isTyping()}>
          <div class="absolute bottom-2 right-4">
            <span class="text-cyan-400 font-mono text-xs animate-pulse">LOADING_</span>
          </div>
        </Show>
      </button>
      
      {/* Dropdown menu */}
      <Show when={isOpen()}>
        <div class="absolute top-full left-0 right-0 mt-2 bg-black/90 border-2 border-[#04caf4]/30 overflow-hidden z-50">
          {/* Terminal header */}
          <div class="bg-cyan-400/10 px-4 py-2 border-b border-cyan-400/20">
            <div class="flex items-center gap-2">
              <div class="w-2 h-2 rounded-full bg-red-400"></div>
              <div class="w-2 h-2 rounded-full bg-yellow-400"></div>
              <div class="w-2 h-2 rounded-full bg-green-400"></div>
              <span class="ml-2 text-cyan-400 font-mono text-xs">SELECT_NETWORK.exe</span>
            </div>
          </div>
          
          {/* Network options */}
          <div class="max-h-96 overflow-y-auto">
            <For each={networks}>
              {(network) => (
                <button
                  onClick={() => handleNetworkSelect(network)}
                  disabled={network.isLocked}
                  class={`w-full p-4 text-left hover:bg-cyan-400/10 transition-all border-b border-cyan-400/10 last:border-0 ${
                    network.isLocked ? 'opacity-50 cursor-not-allowed' : ''
                  } ${network.id === props.selectedNetwork ? 'bg-cyan-400/5' : ''}`}
                >
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3">
                      <div class={`w-8 h-8 bg-gradient-to-r ${network.color} flex items-center justify-center`}>
                        <i class={`${network.icon} text-white text-sm`}></i>
                      </div>
                      <div>
                        <h4 class="text-white font-semibold flex items-center gap-2">
                          {network.name}
                          {network.isLocked && (
                            <i class="fas fa-lock text-gray-500 text-xs"></i>
                          )}
                        </h4>
                        <p class="text-gray-400 text-sm">{network.description}</p>
                      </div>
                    </div>
                    {network.userCount && (
                      <div class="text-right">
                        <p class="text-cyan-400 font-mono font-bold">
                          {network.userCount.toLocaleString()}
                        </p>
                        <p class="text-gray-500 text-xs">nodes</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Selection indicator */}
                  {network.id === props.selectedNetwork && (
                    <div class="mt-2 pt-2 border-t border-cyan-400/20">
                      <span class="text-cyan-400 font-mono text-xs">
                        <i class="fas fa-terminal mr-1"></i>
                        CURRENTLY_ACTIVE
                      </span>
                    </div>
                  )}
                </button>
              )}
            </For>
          </div>
          
          {/* Terminal footer */}
          <div class="bg-cyan-400/5 px-4 py-2 border-t border-cyan-400/20">
            <p class="text-cyan-400/60 font-mono text-xs">
              Press ESC to cancel • Use ↑↓ to navigate
            </p>
          </div>
        </div>
      </Show>
    </div>
  );
};

export default NetworkSelector;