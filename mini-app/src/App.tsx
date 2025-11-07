import { Router, Route } from '@solidjs/router';
import { Component, Show, JSX, onMount, lazy } from 'solid-js';
import MediaPlayer from './components/player/MediaPlayer';
import { currentTrack } from './stores/playerStore';
import { initPlayerLayoutSync } from './utils/playerLayoutSync';
import InviteGatePage from './pages/InviteGatePage';
import { showInviteModal } from './stores/authStore';

// Lazy load all page components for code splitting
const HomePage = lazy(() => import('./pages/HomePage'));
const ThreadsPage = lazy(() => import('./pages/ThreadsPage'));
const ThreadViewPage = lazy(() => import('./pages/ThreadViewPage'));
const ChannelViewPage = lazy(() => import('./pages/ChannelViewPage'));
const ActivityPage = lazy(() => import('./pages/ActivityPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const ChannelsPage = lazy(() => import('./pages/ChannelsPage'));
const TrendingPage = lazy(() => import('./pages/TrendingPage'));

// Root component that wraps all routes and provides player
const RootLayout: Component<{ children?: JSX.Element }> = (props) => {
  // Initialize player layout synchronization on mount
  onMount(() => {
    initPlayerLayoutSync();
  });

  return (
    <>
      {/* Show invite gate page if user needs beta access */}
      <Show
        when={!showInviteModal()}
        fallback={<InviteGatePage />}
      >
        {props.children}

        {/* Player - Fixed at bottom */}
        <Show when={currentTrack()}>
          <MediaPlayer />
        </Show>
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
