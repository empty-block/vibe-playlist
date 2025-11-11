import { Router, Route } from '@solidjs/router';
import { Component, Show, JSX, onMount, lazy, createSignal } from 'solid-js';
import MediaPlayer from './components/player/MediaPlayer';
import { currentTrack, restorePendingTrack } from './stores/playerStore';
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

    // Check sessionStorage for pending track data from OAuth state parameter
    const pendingDataRaw = sessionStorage.getItem('pending_track_data');

    if (pendingDataRaw) {
      console.log('✅ App mounted - found pending track data in sessionStorage');

      try {
        const pendingData = JSON.parse(pendingDataRaw);
        console.log('📦 Pending track data:', pendingData);

        // Clear it immediately to prevent re-processing
        sessionStorage.removeItem('pending_track_data');

        // Wait for next frame to ensure everything is rendered
        requestAnimationFrame(() => {
          setTimeout(async () => {
            console.log('🔄 Attempting to restore pending track after auth...');
            const restored = await restorePendingTrack(pendingData);
            if (restored) {
              console.log('✅ Successfully restored pending track after auth');
            } else {
              console.log('❌ Failed to restore pending track');
            }
          }, 500);
        });
      } catch (error) {
        console.error('❌ Failed to parse pending track data:', error);
        sessionStorage.removeItem('pending_track_data');
      }
    } else {
      console.log('ℹ️ No pending track data - normal app load');
    }
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
