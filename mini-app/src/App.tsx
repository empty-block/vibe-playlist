import { Router, Route } from '@solidjs/router';
import { Component, Show, JSX, onMount } from 'solid-js';
import HomePage from './pages/HomePage';
import ThreadsPage from './pages/ThreadsPage';
import ThreadViewPage from './pages/ThreadViewPage';
import ChannelViewPage from './pages/ChannelViewPage';
import ActivityPage from './pages/ActivityPage';
import ProfilePage from './pages/ProfilePage';
import ChannelsPage from './pages/ChannelsPage';
import TrendingPage from './pages/TrendingPage';
import MediaPlayer from './components/player/MediaPlayer';
import { currentTrack } from './stores/playerStore';
import { initPlayerLayoutSync } from './utils/playerLayoutSync';

// Root component that wraps all routes and provides player
const RootLayout: Component<{ children?: JSX.Element }> = (props) => {
  // Initialize player layout synchronization on mount
  onMount(() => {
    initPlayerLayoutSync();
  });

  return (
    <>
      {props.children}

      {/* Player - Fixed at bottom */}
      <Show when={currentTrack()}>
        <MediaPlayer />
      </Show>
    </>
  );
};

const App: Component = () => {
  return (
    <Router root={RootLayout}>
      <Route path="/" component={HomePage} />
      <Route path="/home" component={HomePage} />
      <Route path="/channels" component={ChannelsPage} />
      <Route path="/channels/:id" component={ChannelViewPage} />
      <Route path="/activity" component={ActivityPage} />
      <Route path="/trending" component={TrendingPage} />
      <Route path="/thread/:id" component={ThreadViewPage} />
      <Route path="/profile" component={ProfilePage} />
      <Route path="/profile/:fid" component={ProfilePage} />
    </Router>
  );
};

export default App;
