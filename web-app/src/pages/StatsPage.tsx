import { Component, onMount, createSignal, Show } from 'solid-js';
import anime from 'animejs';

// Network components
import NetworkSelector from '../components/network/NetworkSelector';
import NetworkMetrics from '../components/network/NetworkMetrics';

// Network store
import {
  selectedNetwork,
  setSelectedNetwork,
  networkData,
  networkStats,
  isLoading,
  fetchNetworkData
} from '../stores/networkStore';

const StatsPage: Component = () => {
  let pageRef: HTMLDivElement | undefined;
  const [showBootSequence, setShowBootSequence] = createSignal(true);
  
  onMount(() => {
    // Faster boot sequence animation
    setTimeout(() => {
      setShowBootSequence(false);
      
      // Animate page elements in with faster timing
      if (pageRef) {
        anime({
          targets: pageRef.querySelectorAll('.network-element'),
          opacity: [0, 1],
          translateY: [15, 0],
          delay: anime.stagger(60),
          duration: 500,
          easing: 'easeOutExpo'
        });
      }
    }, 400);
  });
  
  const handleNetworkChange = async (networkId: string) => {
    setSelectedNetwork(networkId);
    await fetchNetworkData(networkId);
  };
  
  return (
    <div 
      ref={pageRef!}
      class="min-h-screen bg-[#0f0f0f] relative overflow-hidden"
    >
      {/* Subtle grid overlay for depth */}
      <div class="absolute inset-0 opacity-5">
        <div class="absolute inset-0" style="background-image: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(4, 202, 244, 0.03) 2px, rgba(4, 202, 244, 0.03) 4px);"></div>
        <div class="absolute inset-0" style="background-image: repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(4, 202, 244, 0.03) 2px, rgba(4, 202, 244, 0.03) 4px);"></div>
      </div>
      
      {/* Boot sequence overlay */}
      <Show when={showBootSequence()}>
        <div class="fixed inset-0 bg-[#0f0f0f] z-50 flex items-center justify-center">
          <div class="text-center">
            <div class="mb-8">
              <div class="text-[#04caf4] font-mono text-lg mb-4 animate-pulse tracking-wider">
                JAMZY NETWORK MATRIX v2.0.1
              </div>
              <div class="text-[#00f92a] font-mono text-sm space-y-2">
                <div class="opacity-0 animate-[fadeIn_0.2s_ease-in_forwards]">
                  [OK] LOADING NETWORK MODULES...
                </div>
                <div class="opacity-0 animate-[fadeIn_0.2s_ease-in_0.15s_forwards]">
                  [OK] ESTABLISHING NODE CONNECTIONS...
                </div>
                <div class="opacity-0 animate-[fadeIn_0.2s_ease-in_0.3s_forwards]">
                  [OK] CALCULATING NETWORK TOPOLOGY...
                </div>
                <div class="opacity-0 animate-[fadeIn_0.2s_ease-in_0.45s_forwards]">
                  [OK] READY.
                </div>
              </div>
            </div>
            <div class="flex items-center justify-center">
              <div class="inline-block animate-spin h-6 w-6 border-2 border-[#04caf4] border-t-transparent"></div>
            </div>
          </div>
        </div>
      </Show>
      
      {/* Main content */}
      <div class="relative z-10 max-w-[1400px] mx-auto px-6 py-8">
        
        {/* Cyberpunk Terminal Window Header */}
        <div class="mb-6">
          {/* Window Controls */}
          <div class="bg-[#0d0d0d] border-2 border-[#04caf4]/30 rounded-t-lg p-3">
            <div class="flex items-center justify-between">
              {/* Left section: Window controls and title */}
              <div class="flex items-center gap-3">
                <div class="flex items-center gap-2">
                  <div class="w-3 h-3 bg-[#e010e0] rounded-full animate-pulse"></div>
                  <div class="w-3 h-3 bg-[#d1f60a] rounded-full animate-pulse" style="animation-delay: 0.2s;"></div>
                  <div class="w-3 h-3 bg-[#00f92a] rounded-full animate-pulse" style="animation-delay: 0.4s;"></div>
                </div>
                <div class="text-[#04caf4] font-mono text-sm font-bold tracking-wider ml-4" style="text-shadow: 0 0 10px rgba(4, 202, 244, 0.5);">
                  [JAMZY::STATS]
                </div>
              </div>
              
              {/* Center section: Network Selector */}
              <div class="flex-shrink-0">
                <NetworkSelector 
                  selectedNetwork={selectedNetwork()}
                  onNetworkChange={handleNetworkChange}
                  compact={true}
                />
              </div>
              
              {/* Right section: Connected Status */}
              <div class="bg-[#00f92a]/20 border border-[#00f92a]/40 px-3 py-1">
                <span class="text-[#00f92a] font-mono text-xs font-bold">CONNECTED</span>
              </div>
            </div>
          </div>

          {/* Command Line */}
          <div class="bg-[#0d0d0d] border-l-2 border-r-2 border-[#04caf4]/30 p-4 font-mono">
            <div class="flex items-center gap-2 text-sm">
              <span class="text-[#00f92a]">user@jamzy</span>
              <span class="text-[#04caf4]">:</span>
              <span class="text-[#f906d6]">~/stats/data</span>
              <span class="text-[#04caf4]">$</span>
              <span class="text-white/70 ml-2">ping -c 4 music.nodes | traceroute --graph</span>
            </div>
          </div>
        </div>
        
        {/* Network Activity Feed - Terminal Style */}
        <div class="network-element mb-8">
          <div class="bg-[#1a1a1a] border-2 border-[#00f92a]/30 p-6">
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 bg-[#00f92a] flex items-center justify-center">
                  <i class="fas fa-terminal text-black"></i>
                </div>
                <h2 class="text-[#00f92a] font-mono text-lg font-bold tracking-wider">
                  NETWORK ACTIVITY
                </h2>
              </div>
              <div class="flex items-center gap-2">
                <div class="w-2 h-2 bg-[#00f92a] animate-pulse"></div>
                <span class="text-[#00f92a]/80 font-mono text-xs">LIVE</span>
              </div>
            </div>
            
            <div class="bg-black/60 border border-[#00f92a]/30 p-4 h-64 overflow-y-auto font-mono text-sm">
              <div class="space-y-1">
                <div class="text-[#00f92a] opacity-90">[14:18:23] NEON_DREAMS shared "Digital Nights" → +47 nodes</div>
                <div class="text-[#04caf4] opacity-80">[14:17:52] BEAT_MATRIX joined Electronic Network</div>
                <div class="text-[#f906d6] opacity-90">[14:17:31] "Cyber Cascade" trending → 890 shares</div>
                <div class="text-[#e010e0] opacity-80">[14:16:45] Network velocity +23.4% (connections/hour)</div>
                <div class="text-[#04caf4] opacity-80">[14:16:12] SOUND_ARCHITECT created new playlist</div>
                <div class="text-[#00f92a] opacity-90">[14:15:58] RETRO_PULSE gained 12 new followers</div>
                <div class="text-[#f906d6] opacity-80">[14:15:23] "Neon Velocity" shared by VIBE_CURATOR</div>
                <div class="text-[#3b00fd] opacity-90">[14:14:47] Extended Network: +15 connections</div>
                <div class="text-[#04caf4] opacity-80">[14:14:02] CYBER_SOUND released new track</div>
                <div class="text-[#e010e0] opacity-90">[14:13:38] Peak activity window started</div>
                <div class="text-[#00f92a] opacity-80">[14:13:15] MusicLover42 joined Hip Hop Network</div>
                <div class="text-[#f906d6] opacity-90">[14:12:44] "Synthetic Dreams" gained momentum</div>
                <div class="text-[#04caf4] opacity-80">[14:12:20] Network health: 89% (excellent)</div>
                <div class="text-[#3b00fd] opacity-90">[14:11:55] RHYTHM_SAGE offline</div>
                <div class="text-[#00f92a] opacity-80">[14:11:32] New genre cluster detected: Lo-fi House</div>
                <div class="flex items-center gap-2 mt-2">
                  <div class="w-2 h-2 bg-[#00f92a] animate-pulse"></div>
                  <span class="text-[#00f92a] animate-pulse">_</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* New Trending & Connections Section - Three Component Grid */}
        <div class="network-element mb-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* 1. TRENDING ARTISTS - Cyan Theme */}
          <div class="bg-[#1a1a1a] border-2 border-[#04caf4]/30 p-5">
            <h3 class="text-[#04caf4] font-mono text-lg font-bold mb-4 flex items-center gap-3">
              <div class="w-8 h-8 bg-[#04caf4] flex items-center justify-center">
                <i class="fas fa-fire text-black"></i>
              </div>
              TRENDING ARTISTS
            </h3>
            <div class="space-y-3">
              <div class="bg-[#04caf4]/10 border border-[#04caf4]/30 p-3 hover:bg-[#04caf4]/20 transition-all cursor-pointer group">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 bg-[#04caf4]/30 flex items-center justify-center">
                    <i class="fas fa-music text-[#04caf4] text-xs"></i>
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center justify-between">
                      <p class="text-[#04caf4] font-mono font-bold text-sm truncate">NEON_DREAMS</p>
                      <div class="flex items-center gap-1">
                        <i class="fas fa-arrow-up text-[#00f92a] text-xs"></i>
                        <span class="text-[#00f92a] font-mono text-xs">+12%</span>
                      </div>
                    </div>
                    <div class="flex items-center justify-between mt-1">
                      <p class="text-[#04caf4]/70 font-mono text-xs">2.4K followers</p>
                      <div class="w-12 h-1 bg-[#04caf4]/30">
                        <div class="w-9 h-1 bg-[#04caf4] group-hover:animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="bg-[#04caf4]/10 border border-[#04caf4]/30 p-3 hover:bg-[#04caf4]/20 transition-all cursor-pointer group">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 bg-[#04caf4]/30 flex items-center justify-center">
                    <i class="fas fa-headphones text-[#04caf4] text-xs"></i>
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center justify-between">
                      <p class="text-[#04caf4] font-mono font-bold text-sm truncate">CYBER_SOUND</p>
                      <div class="flex items-center gap-1">
                        <i class="fas fa-arrow-up text-[#00f92a] text-xs"></i>
                        <span class="text-[#00f92a] font-mono text-xs">+8%</span>
                      </div>
                    </div>
                    <div class="flex items-center justify-between mt-1">
                      <p class="text-[#04caf4]/70 font-mono text-xs">1.8K followers</p>
                      <div class="w-12 h-1 bg-[#04caf4]/30">
                        <div class="w-7 h-1 bg-[#04caf4] group-hover:animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="bg-[#04caf4]/10 border border-[#04caf4]/30 p-3 hover:bg-[#04caf4]/20 transition-all cursor-pointer group">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 bg-[#04caf4]/30 flex items-center justify-center">
                    <i class="fas fa-wave-square text-[#04caf4] text-xs"></i>
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center justify-between">
                      <p class="text-[#04caf4] font-mono font-bold text-sm truncate">RETRO_PULSE</p>
                      <div class="flex items-center gap-1">
                        <i class="fas fa-arrow-up text-[#00f92a] text-xs"></i>
                        <span class="text-[#00f92a] font-mono text-xs">+5%</span>
                      </div>
                    </div>
                    <div class="flex items-center justify-between mt-1">
                      <p class="text-[#04caf4]/70 font-mono text-xs">1.2K followers</p>
                      <div class="w-12 h-1 bg-[#04caf4]/30">
                        <div class="w-6 h-1 bg-[#04caf4] group-hover:animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="bg-[#04caf4]/10 border border-[#04caf4]/30 p-3 hover:bg-[#04caf4]/20 transition-all cursor-pointer group">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 bg-[#04caf4]/30 flex items-center justify-center">
                    <i class="fas fa-microphone text-[#04caf4] text-xs"></i>
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center justify-between">
                      <p class="text-[#04caf4] font-mono font-bold text-sm truncate">SYNTH_WIZARD</p>
                      <div class="flex items-center gap-1">
                        <i class="fas fa-minus text-[#e010e0] text-xs"></i>
                        <span class="text-[#e010e0] font-mono text-xs">-2%</span>
                      </div>
                    </div>
                    <div class="flex items-center justify-between mt-1">
                      <p class="text-[#04caf4]/70 font-mono text-xs">980 followers</p>
                      <div class="w-12 h-1 bg-[#04caf4]/30">
                        <div class="w-5 h-1 bg-[#04caf4] group-hover:animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* 2. TRENDING TRACKS - Pink Theme */}
          <div class="bg-[#1a1a1a] border-2 border-[#f906d6]/30 p-5">
            <h3 class="text-[#f906d6] font-mono text-lg font-bold mb-4 flex items-center gap-3">
              <div class="w-8 h-8 bg-[#f906d6] flex items-center justify-center">
                <i class="fas fa-chart-line text-black"></i>
              </div>
              TRENDING TRACKS
            </h3>
            <div class="space-y-3">
              <div class="bg-[#f906d6]/10 border border-[#f906d6]/30 p-3 hover:bg-[#f906d6]/20 transition-all cursor-pointer group">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 bg-[#f906d6]/30 flex items-center justify-center relative">
                    <i class="fas fa-play text-[#f906d6] text-xs"></i>
                    <div class="absolute -top-1 -right-1 w-3 h-3 bg-[#00f92a] animate-pulse"></div>
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center justify-between">
                      <p class="text-[#f906d6] font-mono font-bold text-sm truncate">Digital Nights</p>
                      <div class="flex items-center gap-1">
                        <i class="fas fa-arrow-up text-[#00f92a] text-xs"></i>
                        <span class="text-[#00f92a] font-mono text-xs">+47</span>
                      </div>
                    </div>
                    <div class="flex items-center justify-between mt-1">
                      <p class="text-[#f906d6]/70 font-mono text-xs">NEON_DREAMS • 3:24</p>
                      <p class="text-[#f906d6]/70 font-mono text-xs">1.2K shares</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="bg-[#f906d6]/10 border border-[#f906d6]/30 p-3 hover:bg-[#f906d6]/20 transition-all cursor-pointer group">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 bg-[#f906d6]/30 flex items-center justify-center relative">
                    <i class="fas fa-play text-[#f906d6] text-xs"></i>
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center justify-between">
                      <p class="text-[#f906d6] font-mono font-bold text-sm truncate">Cyber Cascade</p>
                      <div class="flex items-center gap-1">
                        <i class="fas fa-arrow-up text-[#00f92a] text-xs"></i>
                        <span class="text-[#00f92a] font-mono text-xs">+32</span>
                      </div>
                    </div>
                    <div class="flex items-center justify-between mt-1">
                      <p class="text-[#f906d6]/70 font-mono text-xs">CYBER_SOUND • 4:12</p>
                      <p class="text-[#f906d6]/70 font-mono text-xs">890 shares</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="bg-[#f906d6]/10 border border-[#f906d6]/30 p-3 hover:bg-[#f906d6]/20 transition-all cursor-pointer group">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 bg-[#f906d6]/30 flex items-center justify-center">
                    <i class="fas fa-play text-[#f906d6] text-xs"></i>
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center justify-between">
                      <p class="text-[#f906d6] font-mono font-bold text-sm truncate">Neon Velocity</p>
                      <div class="flex items-center gap-1">
                        <i class="fas fa-arrow-up text-[#00f92a] text-xs"></i>
                        <span class="text-[#00f92a] font-mono text-xs">+28</span>
                      </div>
                    </div>
                    <div class="flex items-center justify-between mt-1">
                      <p class="text-[#f906d6]/70 font-mono text-xs">RETRO_PULSE • 2:58</p>
                      <p class="text-[#f906d6]/70 font-mono text-xs">756 shares</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="bg-[#f906d6]/10 border border-[#f906d6]/30 p-3 hover:bg-[#f906d6]/20 transition-all cursor-pointer group">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 bg-[#f906d6]/30 flex items-center justify-center">
                    <i class="fas fa-play text-[#f906d6] text-xs"></i>
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center justify-between">
                      <p class="text-[#f906d6] font-mono font-bold text-sm truncate">Synthetic Dreams</p>
                      <div class="flex items-center gap-1">
                        <i class="fas fa-minus text-[#e010e0] text-xs"></i>
                        <span class="text-[#e010e0] font-mono text-xs">-5</span>
                      </div>
                    </div>
                    <div class="flex items-center justify-between mt-1">
                      <p class="text-[#f906d6]/70 font-mono text-xs">SYNTH_WIZARD • 5:17</p>
                      <p class="text-[#f906d6]/70 font-mono text-xs">623 shares</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* 3. TOP CONNECTIONS - Blue Theme */}
          <div class="bg-[#1a1a1a] border-2 border-[#3b00fd]/30 p-5">
            <h3 class="text-[#3b00fd] font-mono text-lg font-bold mb-4 flex items-center gap-3">
              <div class="w-8 h-8 bg-[#3b00fd] flex items-center justify-center">
                <i class="fas fa-users text-white"></i>
              </div>
              TOP CONNECTIONS
            </h3>
            <div class="space-y-3">
              <div class="bg-[#3b00fd]/10 border border-[#3b00fd]/30 p-3 hover:bg-[#3b00fd]/20 transition-all cursor-pointer group">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 bg-[#3b00fd]/30 flex items-center justify-center relative">
                    <i class="fas fa-user text-[#3b00fd] text-xs"></i>
                    <div class="absolute -top-1 -right-1 w-3 h-3 bg-[#00f92a] rounded-full"></div>
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center justify-between">
                      <p class="text-[#3b00fd] font-mono font-bold text-sm truncate">BEAT_MATRIX</p>
                      <span class="text-[#00f92a] font-mono text-lg font-bold">96%</span>
                    </div>
                    <div class="flex items-center justify-between mt-1">
                      <p class="text-[#3b00fd]/70 font-mono text-xs">12 mutual • 47 shared</p>
                      <div class="flex items-center gap-1">
                        <div class="w-2 h-2 bg-[#00f92a] animate-pulse"></div>
                        <span class="text-[#00f92a] font-mono text-xs">ACTIVE</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="bg-[#3b00fd]/10 border border-[#3b00fd]/30 p-3 hover:bg-[#3b00fd]/20 transition-all cursor-pointer group">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 bg-[#3b00fd]/30 flex items-center justify-center relative">
                    <i class="fas fa-user text-[#3b00fd] text-xs"></i>
                    <div class="absolute -top-1 -right-1 w-3 h-3 bg-[#00f92a] rounded-full"></div>
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center justify-between">
                      <p class="text-[#3b00fd] font-mono font-bold text-sm truncate">SOUND_ARCHITECT</p>
                      <span class="text-[#04caf4] font-mono text-lg font-bold">91%</span>
                    </div>
                    <div class="flex items-center justify-between mt-1">
                      <p class="text-[#3b00fd]/70 font-mono text-xs">8 mutual • 34 shared</p>
                      <div class="flex items-center gap-1">
                        <div class="w-2 h-2 bg-[#00f92a] animate-pulse"></div>
                        <span class="text-[#00f92a] font-mono text-xs">ACTIVE</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="bg-[#3b00fd]/10 border border-[#3b00fd]/30 p-3 hover:bg-[#3b00fd]/20 transition-all cursor-pointer group">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 bg-[#3b00fd]/30 flex items-center justify-center">
                    <i class="fas fa-user text-[#3b00fd] text-xs"></i>
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center justify-between">
                      <p class="text-[#3b00fd] font-mono font-bold text-sm truncate">VIBE_CURATOR</p>
                      <span class="text-[#f906d6] font-mono text-lg font-bold">87%</span>
                    </div>
                    <div class="flex items-center justify-between mt-1">
                      <p class="text-[#3b00fd]/70 font-mono text-xs">6 mutual • 28 shared</p>
                      <div class="flex items-center gap-1">
                        <div class="w-2 h-2 bg-[#cc0ecc] opacity-70"></div>
                        <span class="text-[#cc0ecc] font-mono text-xs">IDLE</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="bg-[#3b00fd]/10 border border-[#3b00fd]/30 p-3 hover:bg-[#3b00fd]/20 transition-all cursor-pointer group">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 bg-[#3b00fd]/30 flex items-center justify-center">
                    <i class="fas fa-user text-[#3b00fd] text-xs"></i>
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center justify-between">
                      <p class="text-[#3b00fd] font-mono font-bold text-sm truncate">RHYTHM_SAGE</p>
                      <span class="text-[#e010e0] font-mono text-lg font-bold">83%</span>
                    </div>
                    <div class="flex items-center justify-between mt-1">
                      <p class="text-[#3b00fd]/70 font-mono text-xs">4 mutual • 21 shared</p>
                      <div class="flex items-center gap-1">
                        <div class="w-2 h-2 border-2 border-gray-400"></div>
                        <span class="text-gray-400 font-mono text-xs">OFFLINE</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
        </div>
        
        {/* Network Topology Data Table - Yellow Theme */}
        <div class="network-element">
          <div class="bg-[#1a1a1a] border-2 border-[#d1f60a]/30 p-6">
            <div class="flex items-center justify-between mb-6">
              <div class="flex items-center gap-4">
                <div class="w-10 h-10 bg-[#d1f60a] flex items-center justify-center">
                  <i class="fas fa-table text-black text-lg"></i>
                </div>
                <h2 class="text-[#d1f60a] font-mono text-2xl font-bold tracking-wider">
                  NETWORK TOPOLOGY DATA
                </h2>
              </div>
              <div class="flex items-center gap-3">
                <button class="text-[#d1f60a]/60 hover:text-[#d1f60a] transition-colors">
                  <i class="fas fa-filter"></i>
                </button>
                <button class="text-[#d1f60a]/60 hover:text-[#d1f60a] transition-colors">
                  <i class="fas fa-sort"></i>
                </button>
                <button class="text-[#d1f60a]/60 hover:text-[#d1f60a] transition-colors">
                  <i class="fas fa-expand"></i>
                </button>
              </div>
            </div>
            
            <div class="overflow-x-auto">
              <table class="w-full font-mono">
                <thead>
                  <tr class="border-b-2 border-[#d1f60a]/40">
                    <th class="text-left py-4 text-[#d1f60a] font-bold text-sm tracking-wider">USER</th>
                    <th class="text-left py-4 text-[#d1f60a] font-bold text-sm tracking-wider">CONNECTIONS</th>
                    <th class="text-left py-4 text-[#d1f60a] font-bold text-sm tracking-wider">INFLUENCE</th>
                    <th class="text-left py-4 text-[#d1f60a] font-bold text-sm tracking-wider">GENRE FOCUS</th>
                    <th class="text-left py-4 text-[#d1f60a] font-bold text-sm tracking-wider">STATUS</th>
                    <th class="text-left py-4 text-[#d1f60a] font-bold text-sm tracking-wider">MATCH %</th>
                  </tr>
                </thead>
                <tbody>
                  <tr class="border-b border-[#d1f60a]/20 hover:bg-[#d1f60a]/5 transition-colors">
                    <td class="py-4 text-white font-mono font-bold">MusicLover42</td>
                    <td class="py-4 text-[#04caf4] font-mono">47</td>
                    <td class="py-4 text-[#00f92a] font-mono">HIGH</td>
                    <td class="py-4 text-[#3b00fd] font-mono">ELECTRONIC</td>
                    <td class="py-4">
                      <div class="w-3 h-3 bg-[#00f92a]"></div>
                    </td>
                    <td class="py-4 text-[#d1f60a] font-mono font-bold">92%</td>
                  </tr>
                  <tr class="border-b border-[#d1f60a]/20 hover:bg-[#d1f60a]/5 transition-colors">
                    <td class="py-4 text-white font-mono font-bold">VinylCollector</td>
                    <td class="py-4 text-[#04caf4] font-mono">38</td>
                    <td class="py-4 text-[#e010e0] font-mono">MED</td>
                    <td class="py-4 text-[#3b00fd] font-mono">ROCK/JAZZ</td>
                    <td class="py-4">
                      <div class="w-3 h-3 bg-[#00f92a]"></div>
                    </td>
                    <td class="py-4 text-[#d1f60a] font-mono font-bold">87%</td>
                  </tr>
                  <tr class="border-b border-[#d1f60a]/20 hover:bg-[#d1f60a]/5 transition-colors">
                    <td class="py-4 text-white font-mono font-bold">BeatExplorer</td>
                    <td class="py-4 text-[#04caf4] font-mono">32</td>
                    <td class="py-4 text-[#e010e0] font-mono">MED</td>
                    <td class="py-4 text-[#3b00fd] font-mono">HIP-HOP</td>
                    <td class="py-4">
                      <div class="w-3 h-3 bg-[#cc0ecc] opacity-70"></div>
                    </td>
                    <td class="py-4 text-[#d1f60a] font-mono font-bold">84%</td>
                  </tr>
                  <tr class="border-b border-[#d1f60a]/20 hover:bg-[#d1f60a]/5 transition-colors">
                    <td class="py-4 text-white font-mono font-bold">SynthMaster</td>
                    <td class="py-4 text-[#04caf4] font-mono">29</td>
                    <td class="py-4 text-red-400 font-mono">LOW</td>
                    <td class="py-4 text-[#3b00fd] font-mono">SYNTHWAVE</td>
                    <td class="py-4">
                      <div class="w-3 h-3 border-2 border-gray-400"></div>
                    </td>
                    <td class="py-4 text-[#d1f60a] font-mono font-bold">81%</td>
                  </tr>
                  <tr class="border-b border-[#d1f60a]/20 hover:bg-[#d1f60a]/5 transition-colors">
                    <td class="py-4 text-white font-mono font-bold">RetroWave</td>
                    <td class="py-4 text-[#04caf4] font-mono">25</td>
                    <td class="py-4 text-[#e010e0] font-mono">MED</td>
                    <td class="py-4 text-[#3b00fd] font-mono">SYNTHWAVE</td>
                    <td class="py-4">
                      <div class="w-3 h-3 bg-[#00f92a]"></div>
                    </td>
                    <td class="py-4 text-[#d1f60a] font-mono font-bold">78%</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div class="mt-6 flex items-center justify-between">
              <p class="text-[#d1f60a]/80 font-mono text-sm">
                Showing 5 of 147 network connections
              </p>
              <div class="flex items-center gap-6">
                <div class="flex items-center gap-2">
                  <div class="w-3 h-3 bg-[#00f92a]"></div>
                  <span class="text-[#00f92a] font-mono text-sm">ACTIVE</span>
                </div>
                <div class="flex items-center gap-2">
                  <div class="w-3 h-3 bg-[#cc0ecc] opacity-70"></div>
                  <span class="text-[#cc0ecc] font-mono text-sm">IDLE</span>
                </div>
                <div class="flex items-center gap-2">
                  <div class="w-3 h-3 border-2 border-gray-400"></div>
                  <span class="text-gray-400 font-mono text-sm">OFFLINE</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
      </div>
      
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default StatsPage;