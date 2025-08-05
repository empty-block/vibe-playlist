import { Component } from 'solid-js';
import { Router, Route } from '@solidjs/router';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import DiscoverPage from './pages/DiscoverPage';
import TrendingPage from './pages/TrendingPage';
import ProfilePage from './pages/ProfilePage';

const App: Component = () => {
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