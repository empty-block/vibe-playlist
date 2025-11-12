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
  const [loadingTrack, setLoadingTrack] = createSignal<boolean>(false);

  // Initialize player layout synchronization on mount
  onMount(() => {
    initPlayerLayoutSync();

    // Check sessionStorage for pending track from index.tsx (same page load)
    const pendingTrackRaw = sessionStorage.getItem('spotify_pending_track');

    let pendingData: any = null;
    if (pendingTrackRaw) {
      try {
        pendingData = JSON.parse(pendingTrackRaw);
      } catch (e) {
        console.error('Failed to parse pending track data:', e);
      }
    }

    console.log('🔍 DEBUG - App.tsx onMount checking sessionStorage');
    console.log('🔍 DEBUG - Has pending track in sessionStorage:', !!pendingTrackRaw);

    if (pendingData) {
      console.log('✅ App mounted - found pending track data in sessionStorage');
      console.log('📦 Pending track data:', pendingData);

      // Clear sessionStorage to prevent re-processing
      sessionStorage.removeItem('spotify_pending_track');

      // Show loading state
      setLoadingTrack(true);

      // Wait for next frame to ensure everything is rendered
      requestAnimationFrame(() => {
        setTimeout(async () => {
          console.log('🔄 Attempting to restore pending track after auth...');
          const restored = await restorePendingTrack(pendingData);

          // Hide loading state
          setLoadingTrack(false);

          if (restored) {
            console.log('✅ Successfully restored pending track after auth');
          } else {
            console.log('❌ Failed to restore pending track');
          }
        }, 100);
      });
    }
  });

  return (
    <>
      {/* Loading indicator for track restoration after OAuth */}
      <Show when={loadingTrack()}>
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          'background-color': 'rgba(0, 0, 0, 0.85)',
          color: '#fff',
          padding: '20px 30px',
          'border-radius': '12px',
          'z-index': '99999',
          'text-align': 'center',
          'font-size': '16px',
          'font-weight': '500',
          'box-shadow': '0 4px 20px rgba(0, 0, 0, 0.5)'
        }}>
          <div style={{ 'margin-bottom': '10px' }}>🎵</div>
          Loading your track...
        </div>
      </Show>

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
