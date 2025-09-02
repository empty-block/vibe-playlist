import { Component, onMount } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { LibraryTable } from '../components/library';
import AddButton from '../components/shared/AddButton';
import { pageEnter, staggeredFadeIn } from '../utils/animations';
import { filteredTracks, allTracks } from '../stores/libraryStore';
import NetworkSelector from '../components/network/NetworkSelector';
import { selectedNetwork, setSelectedNetwork } from '../stores/networkStore';

const LibraryPage: Component = () => {
  const navigate = useNavigate();
  let pageRef: HTMLDivElement | undefined;

  onMount(() => {
    // Remove slow page animations - content loads immediately
  });

  return (
    <div 
      ref={pageRef} 
      class="min-h-screen bg-black relative overflow-hidden"
    >
      {/* Cyberpunk Grid Background */}
      <div class="absolute inset-0 opacity-20">
        <div class="absolute inset-0" style="background-image: repeating-linear-gradient(0deg, transparent, transparent 30px, rgba(4, 202, 244, 0.1) 30px, rgba(4, 202, 244, 0.1) 32px);"></div>
        <div class="absolute inset-0" style="background-image: repeating-linear-gradient(90deg, transparent, transparent 30px, rgba(4, 202, 244, 0.1) 30px, rgba(4, 202, 244, 0.1) 32px);"></div>
      </div>

      <div class="relative z-10 max-w-[1400px] mx-auto p-6">
        
        {/* Cyberpunk Terminal Window Header */}
        <div>
          {/* Window Controls */}
          <div class="bg-[#0d0d0d] border-2 border-[#04caf4]/30 border-b-0 rounded-t-lg p-3">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="flex items-center gap-2">
                  <div class="w-3 h-3 bg-[#00f92a] rounded-full animate-pulse"></div>
                  <span class="text-xs text-[#00f92a]/70 font-mono tracking-wider">ONLINE</span>
                </div>
                <div class="text-[#04caf4] font-mono text-lg font-bold tracking-wider ml-4" style="text-shadow: 0 0 10px rgba(4, 202, 244, 0.5);">
                  [JAMZY::LIBRARY]
                </div>
              </div>
              
              <AddButton onClick={() => navigate('/add')}>
                <span class="text-xs font-bold tracking-wider">+ ADD_TRACK</span>
              </AddButton>
            </div>
          </div>

        {/* Network Selector - Seamlessly connected */}
        <div class="relative z-[9998]">
          <NetworkSelector 
            selectedNetwork={selectedNetwork()}
            onNetworkChange={(networkId) => setSelectedNetwork(networkId)}
            seamless={true}
          />
        </div>
        </div>

        {/* Main Content Container */}
        <div class="relative">
          
          <div class="bg-[#0d0d0d]/80 backdrop-blur border-2 border-[#04caf4]/30 rounded-b-lg overflow-hidden" style="box-shadow: inset 0 0 30px rgba(4, 202, 244, 0.1);">
            
            {/* Compact Terminal Header */}
            <div class="bg-[rgba(4,202,244,0.05)] border border-[#04caf4] p-2">
              <div class="flex items-center justify-between">
                <div class="text-[#04caf4] font-mono text-xs font-normal tracking-wide">
                  ┌─ LIBRARY QUERY INTERFACE ─────────────────────┐
                </div>
                <div class="text-[#04caf4] font-mono text-xs font-normal tracking-wide">
                  │ {filteredTracks().length} TRACKS INDEXED │
                </div>
              </div>
            </div>
            
            {/* Library Content */}
            <div class="p-6">
              <LibraryTable />
            </div>
            
          </div>
        </div>
        
      </div>

      {/* Additional Glow Effects */}
      <div class="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#04caf4]/50 to-transparent opacity-60"></div>
      <div class="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#f906d6]/50 to-transparent opacity-60"></div>
    </div>
  );
};

export default LibraryPage;