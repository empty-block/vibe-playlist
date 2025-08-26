import { Component, onMount } from 'solid-js';
import { LibraryTable } from '../components/library';
import { pageEnter, staggeredFadeIn } from '../utils/animations';

const LibraryPage: Component = () => {
  let pageRef: HTMLDivElement | undefined;

  onMount(() => {
    if (pageRef) {
      pageEnter(pageRef);
      
      // Apply animations to library components
      setTimeout(() => {
        const libraryElements = pageRef.querySelectorAll('.library-section');
        if (libraryElements) {
          staggeredFadeIn(libraryElements);
        }
      }, 300);
    }
  });

  return (
    <div ref={pageRef} class="min-h-screen bg-gradient-to-br from-black via-slate-900 to-slate-800 p-4">
      <div class="max-w-7xl mx-auto">
        
        {/* Page Header */}
        <div class="library-section mb-8 text-center">
          <h1 class="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-pink-400 mb-4">
            Collective Music Library
          </h1>
          <p class="text-lg text-white/70 max-w-2xl mx-auto">
            Explore the complete collection of music shared by the Jamzy community. 
            Discover hidden gems, trending tracks, and find your next favorite song.
          </p>
        </div>

        {/* Library Table */}
        <div class="library-section">
          <LibraryTable />
        </div>

        {/* Footer Info */}
        <div class="library-section mt-8 text-center text-sm text-white/40">
          <p>Double-click any track to start playing • Use filters to find exactly what you're looking for</p>
        </div>
      </div>
    </div>
  );
};

export default LibraryPage;