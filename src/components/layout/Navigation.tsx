import { Component, createSignal, onMount } from 'solid-js';
import { A, useLocation } from '@solidjs/router';

const Navigation: Component = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = createSignal(false);
  const [focusedIndex, setFocusedIndex] = createSignal(-1);
  
  const isActive = (path: string) => {
    if (path === '/library') {
      return location.pathname === '/' || location.pathname === '/library';
    }
    if (path === '/me') {
      return location.pathname === '/me' || location.pathname.startsWith('/profile');
    }
    return location.pathname === path;
  };

  const navigationItems = [
    { href: '/library', label: 'Library', isPrimary: true },
    { href: '/network', label: 'Network', isPrimary: false },
    { href: '/me', label: 'Profile', isPrimary: false, isProfile: true }
  ];

  const handleKeyNavigation = (e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      const currentIndex = focusedIndex();
      let newIndex = currentIndex;
      
      if (e.key === 'ArrowRight') {
        newIndex = currentIndex >= navigationItems.length - 1 ? 0 : currentIndex + 1;
      } else {
        newIndex = currentIndex <= 0 ? navigationItems.length - 1 : currentIndex - 1;
      }
      
      setFocusedIndex(newIndex);
      const navElement = document.querySelector(`[data-nav-index="${newIndex}"]`) as HTMLElement;
      navElement?.focus();
    }
  };

  onMount(() => {
    document.addEventListener('keydown', handleKeyNavigation);
    return () => document.removeEventListener('keydown', handleKeyNavigation);
  });
  
  return (
    <nav 
      class="relative bg-black border-b border-gray-800 h-16"
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Mobile menu button - simplified */}
      <div class="md:hidden absolute left-6 top-1/2 -translate-y-1/2 z-20">
        <button
          class="p-2 text-gray-400 hover:text-neon-cyan focus:outline-none focus:ring-2 focus:ring-neon-cyan focus:ring-offset-2 focus:ring-offset-black transition-colors duration-200"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen())}
          aria-expanded={isMobileMenuOpen()}
          aria-label="Toggle navigation menu"
        >
          <div class="w-5 h-0.5 bg-current mb-1 transition-all duration-200"></div>
          <div class="w-5 h-0.5 bg-current mb-1 transition-all duration-200"></div>
          <div class="w-5 h-0.5 bg-current transition-all duration-200"></div>
        </button>
      </div>

      {/* Desktop Navigation - Zen Layout */}
      <div class="hidden md:flex h-full items-center px-6 font-display text-sm font-medium tracking-wide">
        
        {/* Primary Section: Library */}
        <div class="flex-shrink-0">
          <A 
            href="/library" 
            data-nav-index="0"
            class="relative px-4 py-3 transition-all duration-200 ease-out inline-flex items-center min-h-[44px] font-bold uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-neon-cyan focus:ring-offset-2 focus:ring-offset-black"
            classList={{ 
              'text-white bg-neon-blue/20 border border-neon-blue/30': isActive('/library'),
              'text-gray-400 hover:text-neon-blue': !isActive('/library')
            }}
            onFocus={() => setFocusedIndex(0)}
            aria-current={isActive('/library') ? 'page' : undefined}
          >
            Library
            {/* Clean underline indicator for active state */}
            {isActive('/library') && (
              <div class="absolute bottom-0 left-0 right-0 h-0.5 bg-neon-blue"></div>
            )}
          </A>
        </div>
        
        {/* Visual separator with proper spacing */}
        <div class="w-12 flex justify-center">
          <div class="w-px h-4 bg-gray-700"></div>
        </div>
        
        {/* Secondary Navigation - Network */}
        <div class="flex gap-8">
          <A 
            href="/network" 
            data-nav-index="1"
            class="relative px-3 py-3 transition-all duration-200 ease-out inline-flex items-center min-h-[44px] uppercase tracking-wide focus:outline-none focus:ring-2 focus:ring-neon-cyan focus:ring-offset-2 focus:ring-offset-black"
            classList={{ 
              'text-neon-cyan': isActive('/network'),
              'text-gray-400 hover:text-neon-cyan': !isActive('/network')
            }}
            onFocus={() => setFocusedIndex(1)}
            aria-current={isActive('/network') ? 'page' : undefined}
          >
            Network
            <div class={`absolute bottom-0 left-0 right-0 h-0.5 transition-all duration-200 ${
              isActive('/network') 
                ? 'bg-neon-cyan opacity-100' 
                : 'bg-neon-cyan opacity-0 hover:opacity-50'
            }`}></div>
          </A>
        </div>
        
        {/* Flexible space - golden ratio application */}
        <div class="flex-1"></div>
        
        {/* Profile - Special positioning */}
        <div class="flex-shrink-0">
          <A 
            href="/me" 
            data-nav-index="2"
            class="relative px-3 py-3 transition-all duration-200 ease-out inline-flex items-center min-h-[44px] uppercase tracking-wide focus:outline-none focus:ring-2 focus:ring-neon-cyan focus:ring-offset-2 focus:ring-offset-black"
            classList={{ 
              'text-neon-pink': isActive('/me'),
              'text-gray-400 hover:text-neon-pink': !isActive('/me')
            }}
            onFocus={() => setFocusedIndex(2)}
            aria-current={isActive('/me') ? 'page' : undefined}
          >
            Profile
            <div class={`absolute bottom-0 left-0 right-0 h-0.5 transition-all duration-200 ${
              isActive('/me') 
                ? 'bg-neon-pink opacity-100' 
                : 'bg-neon-pink opacity-0 hover:opacity-50'
            }`}></div>
          </A>
        </div>
      </div>

      {/* Mobile Navigation Menu - Simplified */}
      <div class={`md:hidden absolute top-16 left-0 right-0 bg-black border-b border-gray-800 transition-all duration-200 ease-out ${
        isMobileMenuOpen() ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'
      }`}>
        <div class="py-4 px-6 space-y-2">
          {navigationItems.map((item, index) => (
            <A 
              href={item.href}
              class={`block px-4 py-3 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-neon-cyan focus:ring-inset font-medium uppercase tracking-wide
                      ${isActive(item.href) 
                        ? item.isPrimary 
                          ? 'text-white bg-neon-blue/20' 
                          : item.isProfile 
                            ? 'text-neon-pink bg-neon-pink/10'
                            : 'text-neon-cyan bg-neon-cyan/10'
                        : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
                      }`}
              onClick={() => setIsMobileMenuOpen(false)}
              aria-current={isActive(item.href) ? 'page' : undefined}
            >
              <span class={item.isPrimary ? 'font-bold' : ''}>
                {item.label}
              </span>
            </A>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;