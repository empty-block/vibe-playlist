import { Component } from 'solid-js';
import { A, useLocation } from '@solidjs/router';

const Navigation: Component = () => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    // Handle legacy routes
    if (path === '/library') {
      return location.pathname === '/' || location.pathname === '/library';
    }
    if (path === '/me') {
      return location.pathname === '/me' || location.pathname.startsWith('/profile');
    }
    return location.pathname === path;
  };
  
  return (
    <nav class="jamzy-terminal-nav relative bg-black border-b border-neon-cyan h-16 overflow-hidden">
      {/* Scan line overlay */}
      <div class="absolute inset-0 bg-gradient-to-b from-transparent via-neon-cyan/5 to-transparent pointer-events-none scan-lines"></div>
      
      <div class="h-full flex items-center px-6 font-display text-sm tracking-wide">
        {/* Library - Primary Section */}
        <div class="flex-shrink-0">
          <A 
            href="/library" 
            class="jamzy-nav-primary px-4 py-2 border transition-all duration-300 transform inline-flex items-center
                   focus:outline-none focus:ring-2 focus:ring-neon-cyan"
            classList={{ 
              'bg-neon-blue/10 border-neon-blue text-neon-blue glow-neon-blue': isActive('/library'),
              'border-gray-600 text-gray-400 hover:border-neon-blue/50 hover:text-neon-blue/80 hover:-translate-y-px': !isActive('/library')
            }}
          >
            <span class="mr-3 text-base">🏠</span>
            <span class="font-bold uppercase tracking-wider">Library</span>
          </A>
        </div>
        
        {/* Separator */}
        <div class="w-px h-6 bg-gray-700 mx-8"></div>
        
        {/* Secondary Navigation */}
        <div class="flex gap-8 flex-1">
          <A 
            href="/discover" 
            class="jamzy-nav-secondary py-2 transition-all duration-300 transform inline-flex items-center relative
                   focus:outline-none focus:ring-2 focus:ring-neon-cyan"
            classList={{ 
              'text-neon-cyan after:bg-neon-cyan after:glow-neon-cyan': isActive('/discover'),
              'text-gray-400 hover:text-neon-cyan/80 hover:-translate-y-px after:bg-neon-cyan/30': !isActive('/discover')
            }}
            style="position: relative"
          >
            <span class="mr-2">🔍</span>
            <span class="font-medium uppercase tracking-wide">Discover</span>
            <div class={`absolute bottom-0 left-0 right-0 h-0.5 transition-all duration-300 ${
              isActive('/discover') ? 'bg-neon-cyan glow-neon-cyan' : 'bg-transparent'
            }`}></div>
          </A>
          
          <A 
            href="/network" 
            class="jamzy-nav-secondary py-2 transition-all duration-300 transform inline-flex items-center relative
                   focus:outline-none focus:ring-2 focus:ring-neon-cyan"
            classList={{ 
              'text-neon-cyan': isActive('/network'),
              'text-gray-400 hover:text-neon-cyan/80 hover:-translate-y-px': !isActive('/network')
            }}
          >
            <span class="mr-2">🌐</span>
            <span class="font-medium uppercase tracking-wide">Network</span>
            <div class={`absolute bottom-0 left-0 right-0 h-0.5 transition-all duration-300 ${
              isActive('/network') ? 'bg-neon-cyan glow-neon-cyan' : 'bg-transparent'
            }`}></div>
          </A>
        </div>
        
        {/* Spacer */}
        <div class="flex-1"></div>
        
        {/* Profile - Special Section */}
        <div class="flex-shrink-0">
          <A 
            href="/me" 
            class="jamzy-nav-profile px-3 py-2 border transition-all duration-300 transform inline-flex items-center
                   focus:outline-none focus:ring-2 focus:ring-neon-cyan"
            classList={{ 
              'border-neon-pink text-neon-pink bg-neon-pink/5 glow-neon-pink': isActive('/me'),
              'border-gray-600 text-gray-400 hover:border-neon-pink/50 hover:text-neon-pink/80 hover:-translate-y-px': !isActive('/me')
            }}
          >
            <span class="mr-2">👤</span>
            <span class="font-medium uppercase tracking-wide">Profile</span>
          </A>
        </div>
      </div>
      
      {/* Terminal cursor effect (optional - can be animated) */}
      <div class="absolute right-2 top-1/2 -translate-y-1/2 w-2 h-4 bg-neon-cyan animate-pulse opacity-70"></div>
    </nav>
  );
};

export default Navigation;