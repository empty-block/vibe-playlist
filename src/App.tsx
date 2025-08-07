import { Component, onMount } from 'solid-js';
import { Router, Route } from '@solidjs/router';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import DiscoverPage from './pages/DiscoverPage';
import TrendingPage from './pages/TrendingPage';
import SharePage from './pages/SharePage';
import ProfilePage from './pages/ProfilePage';
import { initializeAuth, handleSpotifyCallback } from './stores/authStore';

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

  return (
    <Router root={Layout}>
      <Route path="/" component={HomePage} />
      <Route path="/home" component={HomePage} />
      <Route path="/discover" component={DiscoverPage} />
      <Route path="/trending" component={TrendingPage} />
      <Route path="/share" component={SharePage} />
      <Route path="/profile" component={ProfilePage} />
      <Route path="/profile/:username" component={ProfilePage} />
    </Router>
  );
};

export default App;