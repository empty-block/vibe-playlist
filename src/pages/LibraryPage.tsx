import { Component, onMount } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { LibraryTable } from '../components/library';
import AddButton from '../components/shared/AddButton';
import { pageEnter, staggeredFadeIn } from '../utils/animations';

const LibraryPage: Component = () => {
  const navigate = useNavigate();
  let pageRef: HTMLDivElement | undefined;

  onMount(() => {
    // Remove slow page animations - content loads immediately
  });

  return (
    <div ref={pageRef} class="min-h-screen bg-gradient-to-br from-black via-slate-900 to-slate-800 p-4">
      <div class="max-w-7xl mx-auto">
        
        {/* Library Header */}
        <div class="library-section mb-0">
          <div class="library-header bg-black/40 border-b border-pink-400/20 p-3 rounded-t-xl">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <h1 class="text-pink-400 font-mono text-lg font-bold">jamzy@library:~/$</h1>
                <span class="hidden sm:inline text-white/60 text-sm font-mono">global music discovery</span>
              </div>
              
              <div class="flex items-center gap-3">
                <AddButton onClick={() => navigate('/curate')}>
                  <span class="hidden sm:inline">+ Add Track</span>
                  <span class="sm:hidden">+</span>
                </AddButton>
              </div>
            </div>
          </div>
        </div>
        
        {/* Library Table */}
        <div class="library-section">
          <LibraryTable />
        </div>
        
        {/* Floating Action Button for mobile */}
        <AddButton onClick={() => navigate('/curate')} variant="mobile">
          +
        </AddButton>
        
      </div>
    </div>
  );
};

export default LibraryPage;