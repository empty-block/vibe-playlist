import { Component, onMount } from 'solid-js';
import { LibraryTable } from '../components/library';
import { pageEnter, staggeredFadeIn } from '../utils/animations';

const LibraryPage: Component = () => {
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
        
        {/* Main Content Container - Header Removed for More Screen Space */}
        <div class="relative">
          
          <div class="bg-[#0d0d0d]/80 backdrop-blur border-2 border-[#04caf4]/30 rounded-lg overflow-hidden" style="box-shadow: inset 0 0 30px rgba(4, 202, 244, 0.1);">
            
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