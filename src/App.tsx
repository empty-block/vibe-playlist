import { Component, onMount, Show } from 'solid-js';
import { Router, Route, useNavigate } from '@solidjs/router';
import Layout from './components/layout/Layout';
import HomePage from './components/home/HomePage';
import ProfilePage from './pages/ProfilePage';
import LibraryPage from './pages/LibraryPage';
import StatsPage from './pages/StatsPage';
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

  return (
    <Router root={Layout}>
      {/* Home page - dual splash/personalized functionality */}
      <Route path="/" component={HomePage} />
      
      {/* Main navigation routes */}
      <Route path="/library" component={LibraryPage} />
      <Route path="/network" component={StatsPage} />
      <Route path="/me/:username" component={ProfilePage} />
      <Route path="/me" component={ProfilePage} />
      <Route path="/profile/:username" component={ProfilePage} />
      <Route path="/profile" component={ProfilePage} />
    </Router>
  );
};

export default App;