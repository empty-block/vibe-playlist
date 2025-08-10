import { Component } from 'solid-js';
import { A, useLocation } from '@solidjs/router';
import { toggleChat, showChat } from '../stores/chatStore';
import { isAuthenticated } from '../stores/authStore';

const Navigation: Component = () => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path || (path === '/' && location.pathname === '/') || (path === '/player' && location.pathname === '/player');
  };
  
  return (
    <div class="win95-panel p-1 border-b-2 overflow-x-auto">
      <div class="flex justify-between items-center text-black text-sm font-bold min-w-fit">
        <div class="flex gap-2 sm:gap-4 flex-shrink-0">
          <A 
            href="/" 
            class="nav-link px-2 py-1 hover:bg-blue-600 hover:text-white cursor-pointer whitespace-nowrap"
            classList={{ 'bg-blue-600 text-white': isActive('/') }}
          >
            <i class="fas fa-home mr-1"></i>Home
          </A>
          <A 
            href="/player" 
            class="nav-link px-2 py-1 hover:bg-blue-600 hover:text-white cursor-pointer whitespace-nowrap"
            classList={{ 'bg-blue-600 text-white': isActive('/player') }}
          >
            <i class="fas fa-play mr-1"></i>Player
          </A>
          <A 
            href="/discover" 
            class="nav-link px-2 py-1 hover:bg-blue-600 hover:text-white cursor-pointer whitespace-nowrap"
            classList={{ 'bg-blue-600 text-white': isActive('/discover') }}
          >
            <i class="fas fa-compass mr-1"></i>Discover
          </A>
          <A 
            href="/trending" 
            class="nav-link px-2 py-1 hover:bg-blue-600 hover:text-white cursor-pointer whitespace-nowrap"
            classList={{ 'bg-blue-600 text-white': isActive('/trending') }}
          >
            <i class="fas fa-fire mr-1"></i>Trending
          </A>
          <A 
            href="/share" 
            class="nav-link px-2 py-1 hover:bg-blue-600 hover:text-white cursor-pointer whitespace-nowrap"
            classList={{ 'bg-blue-600 text-white': isActive('/share') }}
          >
            <i class="fas fa-plus mr-1"></i>Create
          </A>
        </div>
        
        {/* Right side buttons */}
        <div class="flex gap-2 sm:gap-4 flex-shrink-0 ml-4">
          <button
            class="nav-link px-2 py-1 hover:bg-blue-600 hover:text-white cursor-pointer whitespace-nowrap"
            classList={{ 'bg-blue-600 text-white': showChat() }}
            onClick={toggleChat}
          >
            <i class="fas fa-comment-dots mr-1"></i>Chat
          </button>
          <A 
            href="/profile" 
            class="nav-link px-2 py-1 hover:bg-blue-600 hover:text-white cursor-pointer whitespace-nowrap"
            classList={{ 'bg-blue-600 text-white': isActive('/profile') }}
          >
            <i class="fas fa-user mr-1"></i>Profile
          </A>
        </div>
      </div>
    </div>
  );
};

export default Navigation;