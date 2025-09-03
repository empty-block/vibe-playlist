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
  seamless?: boolean; // For seamless connection to header
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
        class={`w-full bg-black/60 border-2 border-[#04caf4]/30 ${props.seamless ? 'border-t-0' : ''} p-4 text-left ${!isOpen() ? 'hover:border-[#04caf4]' : 'border-[#04caf4]'} transition-all group relative overflow-hidden`}
      >
        {/* Scanning line on hover */}
        <div class="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#00f92a] to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-scan" />
        
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
          <div class="flex items-center gap-4">
            {currentNetwork().userCount && (
              <div class="text-right mr-3">
                <p class="text-cyan-400 font-mono text-lg font-bold">
                  {currentNetwork().userCount.toLocaleString()}
                </p>
                <p class="text-cyan-300/60 text-xs">nodes</p>
              </div>
            )}
            {/* Simple dropdown indicator */}
            <i class={`fas fa-chevron-${isOpen() ? 'up' : 'down'} text-cyan-400 transition-transform duration-200 text-lg`}></i>
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
        <div class="absolute top-full left-0 right-0 -mt-px bg-black/95 backdrop-blur-sm border-2 border-[#04caf4]/30 border-t-0 overflow-hidden z-[9999] shadow-2xl shadow-cyan-400/20">
          
          {/* Network options */}
          <div class="max-h-96 overflow-y-auto">
            <For each={networks}>
              {(network) => (
                <button
                  onClick={() => handleNetworkSelect(network)}
                  disabled={network.isLocked}
                  class={`w-full p-4 text-left hover:bg-cyan-400/10 transition-all border-b border-cyan-400/10 last:border-0 ${
                    network.isLocked ? 'opacity-50 cursor-not-allowed' : ''
                  } ${network.id === props.selectedNetwork ? 'bg-cyan-400/15 border-l-2 border-l-cyan-400' : ''}`}
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
                  
                </button>
              )}
            </For>
          </div>
        </div>
      </Show>
      
      {/* Scanning animation styles */}
      <style>{`
        @keyframes scan {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        .group:hover .group-hover\\:animate-scan {
          animation: scan 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default NetworkSelector;