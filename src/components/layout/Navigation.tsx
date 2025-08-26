import { Component } from 'solid-js';
import { A, useLocation } from '@solidjs/router';

const Navigation: Component = () => {
  const location = useLocation();
  
  // Remove navigation store interference completely
  
  const isActive = (path: string) => {
    // Handle legacy routes
    if (path === '/library') {
      return location.pathname === '/' || location.pathname === '/library';
    }
    if (path === '/listen') {
      return location.pathname === '/listen' || location.pathname === '/player';
    }
    if (path === '/curate') {
      return location.pathname === '/curate' || location.pathname === '/create';
    }
    if (path === '/me') {
      return location.pathname === '/me' || location.pathname.startsWith('/profile');
    }
    return location.pathname === path;
  };
  
  return (
    <div class="win95-panel p-1 border-b-2 overflow-x-auto bg-gradient-to-r from-slate-800 to-slate-700">
      <div class="flex items-center text-white text-sm font-bold min-w-fit">
        
        {/* Library as Primary Home Tab - Left Side */}
        <div class="flex-shrink-0 mr-6">
          <A 
            href="/library" 
            class="home-tab px-4 py-3 rounded-lg cursor-pointer transition-all duration-200 inline-flex items-center"
            classList={{ 
              'bg-gradient-to-r from-blue-600 to-cyan-500 shadow-lg shadow-cyan-500/30 border-2 border-green-400': isActive('/library'),
              'bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500': !isActive('/library')
            }}
          >
            <i class="fas fa-home mr-2 text-lg"></i>
            <span class="font-black text-lg">Library</span>
          </A>
        </div>
        
        {/* Secondary Navigation - Center */}
        <div class="flex gap-4 flex-1 justify-center">
          <A 
            href="/listen" 
            class="secondary-nav-link px-3 py-2 rounded cursor-pointer transition-all duration-200 inline-flex items-center"
            classList={{ 
              'text-green-400 bg-green-400/10 border border-green-400': isActive('/listen'),
              'text-gray-300 hover:text-cyan-400 hover:bg-cyan-400/10': !isActive('/listen')
            }}
          >
            <i class="fas fa-headphones mr-1"></i>Listen
          </A>
          
          <A 
            href="/curate" 
            class="secondary-nav-link px-3 py-2 rounded cursor-pointer transition-all duration-200 inline-flex items-center"
            classList={{ 
              'text-green-400 bg-green-400/10 border border-green-400': isActive('/curate'),
              'text-gray-300 hover:text-cyan-400 hover:bg-cyan-400/10': !isActive('/curate')
            }}
          >
            <i class="fas fa-palette mr-1"></i>Curate
          </A>
        </div>
        
        {/* Profile - Right Side */}
        <div class="flex-shrink-0 ml-6">
          <A 
            href="/me" 
            class="profile-nav-link px-3 py-2 rounded cursor-pointer transition-all duration-200 inline-flex items-center"
            classList={{ 
              'text-pink-400 bg-pink-400/10 border border-pink-400': isActive('/me'),
              'text-pink-400/70 hover:text-pink-400 hover:bg-pink-400/10': !isActive('/me')
            }}
          >
            <i class="fas fa-user mr-1"></i>Me
          </A>
        </div>
      </div>
    </div>
  );
};

export default Navigation;