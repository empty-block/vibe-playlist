import { Component } from 'solid-js';
import { A, useLocation } from '@solidjs/router';

const Navigation: Component = () => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path || (path === '/home' && location.pathname === '/');
  };
  
  return (
    <div class="win95-panel p-1 border-b-2">
      <div class="flex gap-4 text-black text-sm font-bold">
        <A 
          href="/home" 
          class="nav-link px-2 py-1 hover:bg-blue-600 hover:text-white cursor-pointer"
          classList={{ 'bg-blue-600 text-white': isActive('/home') }}
        >
          <i class="fas fa-home mr-1"></i>Home
        </A>
        <A 
          href="/discover" 
          class="nav-link px-2 py-1 hover:bg-blue-600 hover:text-white cursor-pointer"
          classList={{ 'bg-blue-600 text-white': isActive('/discover') }}
        >
          <i class="fas fa-compass mr-1"></i>Discover
        </A>
        <A 
          href="/trending" 
          class="nav-link px-2 py-1 hover:bg-blue-600 hover:text-white cursor-pointer"
          classList={{ 'bg-blue-600 text-white': isActive('/trending') }}
        >
          <i class="fas fa-fire mr-1"></i>Trending
        </A>
        <A 
          href="/share" 
          class="nav-link px-2 py-1 hover:bg-blue-600 hover:text-white cursor-pointer"
          classList={{ 'bg-blue-600 text-white': isActive('/share') }}
        >
          <i class="fas fa-plus mr-1"></i>Create
        </A>
        <A 
          href="/profile" 
          class="nav-link px-2 py-1 hover:bg-blue-600 hover:text-white cursor-pointer"
          classList={{ 'bg-blue-600 text-white': isActive('/profile') }}
        >
          <i class="fas fa-user mr-1"></i>Profile
        </A>
      </div>
    </div>
  );
};

export default Navigation;