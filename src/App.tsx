import { Component, onMount } from 'solid-js';
import { Router, Route } from '@solidjs/router';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import DiscoverPage from './pages/DiscoverPage';
import TrendingPage from './pages/TrendingPage';
import ProfilePage from './pages/ProfilePage';
import { initializeAuth, handleSpotifyCallback } from './stores/authStore';

const App: Component = () => {
  onMount(async () => {
    console.log('App mounted, checking for Spotify callback...');
    console.log('Current URL:', window.location.href);
    
    // Check for Spotify callback (PKCE flow uses URL params)
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const error = urlParams.get('error');
    const state = urlParams.get('state');

    console.log('URL params:', { 
      code: code ? `Present (${code.substring(0, 10)}...)` : 'Not present', 
      error: error || 'None',
      state: state || 'None'
    });

    if (error) {
      console.error('Spotify auth error:', error);
      const errorDescription = urlParams.get('error_description');
      if (errorDescription) {
        console.error('Error description:', errorDescription);
      }
    } else if (code) {
      console.log('Spotify authorization code received, exchanging for token...');
      const success = await handleSpotifyCallback(code);
      if (success) {
        console.log('Token exchange successful, cleaning up URL...');
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
      } else {
        console.error('Token exchange failed');
      }
    } else {
      console.log('No Spotify callback detected');
    }

    // Initialize authentication state on app start
    console.log('Initializing auth state...');
    await initializeAuth();
  });

  return (
    <Router root={Layout}>
      <Route path="/" component={HomePage} />
      <Route path="/home" component={HomePage} />
      <Route path="/discover" component={DiscoverPage} />
      <Route path="/trending" component={TrendingPage} />
      <Route path="/profile" component={ProfilePage} />
    </Router>
  );
};

export default App;