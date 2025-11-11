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
  const [debugInfo, setDebugInfo] = createSignal<string>('');

  // Initialize player layout synchronization on mount
  onMount(() => {
    initPlayerLayoutSync();

    // Check sessionStorage for pending track from index.tsx (same page load)
    const pendingTrackRaw = sessionStorage.getItem('spotify_pending_track');

    let debugMsg = `📱 App Loaded After OAuth\n`;
    debugMsg += `sessionStorage: ${pendingTrackRaw ? 'YES ✅' : 'NO ❌'}\n`;

    let pendingData: any = null;
    if (pendingTrackRaw) {
      try {
        pendingData = JSON.parse(pendingTrackRaw);
        debugMsg += `Platform: ${pendingData.platformName || 'unknown'}\n`;
        debugMsg += `Track ID: ${pendingData.platformId || 'unknown'}\n`;
        debugMsg += `Feed: ${pendingData.feedId || 'unknown'}\n`;
      } catch (e) {
        debugMsg += `Parse error: ${e.message}\n`;
      }
    }

    setDebugInfo(debugMsg);

    console.log('🔍 DEBUG - App.tsx onMount checking sessionStorage');
    console.log('🔍 DEBUG - Has pending track in sessionStorage:', !!pendingTrackRaw);

    if (pendingData) {
      console.log('✅ App mounted - found pending track data in sessionStorage');
      console.log('📦 Pending track data:', pendingData);

      // Clear sessionStorage to prevent re-processing
      sessionStorage.removeItem('spotify_pending_track');

      // Wait for next frame to ensure everything is rendered
      requestAnimationFrame(() => {
        setTimeout(async () => {
          console.log('🔄 Attempting to restore pending track after auth...');
          setDebugInfo(prev => prev + 'Restoring...\n');
          const restored = await restorePendingTrack(pendingData);
          if (restored) {
            console.log('✅ Successfully restored pending track after auth');
            const track = currentTrack();
            setDebugInfo(prev => prev + 'Restored: YES ✅\n' +
              `Thumbnail: ${track?.thumbnail ? '✅ ' + track.thumbnail.substring(0, 40) + '...' : '❌ MISSING'}`);
          } else {
            console.log('❌ Failed to restore pending track');
            setDebugInfo(prev => prev + 'Restored: FAILED ❌');
          }

          // Clear debug after 15 seconds
          setTimeout(() => setDebugInfo(''), 15000);
        }, 500);
      });
    } else {
      console.log('ℹ️ No pending track data - normal app load');
      // Clear debug after 5 seconds on normal load
      setTimeout(() => setDebugInfo(''), 5000);
    }
  });

  return (
    <>
      {/* DEBUG BANNER - Shows state without console */}
      <Show when={debugInfo()}>
        <div style={{
          position: 'fixed',
          top: '0',
          left: '0',
          right: '0',
          'background-color': 'rgba(0, 0, 0, 0.9)',
          color: '#0f0',
          'font-family': 'monospace',
          'font-size': '12px',
          padding: '10px',
          'z-index': '99999',
          'white-space': 'pre-wrap',
          'border-bottom': '2px solid #0f0'
        }}>
          {debugInfo()}
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
