import { Component, onMount, Show } from 'solid-js';
import { Router, Route, useNavigate } from '@solidjs/router';
import Layout from './components/layout/Layout';
import PlayerPage from './pages/PlayerPage';
import LandingPage from './pages/LandingPage';
import DiscoverPage from './pages/DiscoverPage';
import TrendingPage from './pages/TrendingPage';
import CreatePage from './pages/CreatePage';
import ProfilePage from './pages/ProfilePage';
import LibraryPage from './pages/LibraryPage';
import ListenPage from './pages/ListenPage';
import CuratePage from './pages/CuratePage';
import MePage from './pages/MePage';
import { initializeAuth, handleSpotifyCallback, isAuthenticated } from './stores/authStore';

const App: Component = () => {
  onMount(async () => {
    // Check for Spotify callback (PKCE flow uses URL params)
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const error = urlParams.get('error');

    if (error) {
      console.error('Spotify auth error:', error);
      const errorDescription = urlParams.get('error_description');
      if (errorDescription) {
        console.error('Error description:', errorDescription);
      }
    } else if (code) {
      const success = await handleSpotifyCallback(code);
      if (success) {
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }

    // Initialize authentication state on app start
    await initializeAuth();
  });

  // Create a root route component that handles auth routing
  const RootRoute: Component = () => {
    const navigate = useNavigate();
    
    onMount(() => {
      // If authenticated, redirect to library (new home)
      if (isAuthenticated()) {
        navigate('/library');
      }
    });
    
    return (
      <Show when={!isAuthenticated()} fallback={null}>
        <LandingPage />
      </Show>
    );
  };

  return (
    <Router root={Layout}>
      <Route path="/" component={RootRoute} />
      
      {/* New primary navigation routes */}
      <Route path="/library" component={LibraryPage} />
      <Route path="/listen" component={ListenPage} />
      <Route path="/curate" component={CuratePage} />
      <Route path="/me/:username" component={MePage} />
      <Route path="/me" component={MePage} />
      
      {/* Legacy routes with redirects for backwards compatibility */}
      <Route path="/player" component={ListenPage} />
      <Route path="/create" component={CuratePage} />
      <Route path="/profile/:username" component={MePage} />
      <Route path="/profile" component={MePage} />
      <Route path="/discover" component={DiscoverPage} />
      <Route path="/trending" component={TrendingPage} />
    </Router>
  );
};

export default App;