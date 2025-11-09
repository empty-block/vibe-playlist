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

    // DEBUG: Check what's in URL hash on mount
    const hash = window.location.hash;
    const hasPendingTrack = hash.includes('pending_track=');
    const restoreFlag = sessionStorage.getItem('restore_pending_after_render');

    let debugMsg = `📱 App Loaded\n`;
    debugMsg += `URL hash: ${hash ? 'YES' : 'NO'}\n`;
    debugMsg += `Pending track in hash: ${hasPendingTrack ? 'YES ✅' : 'NO ❌'}\n`;
    debugMsg += `Restore flag: ${restoreFlag || 'NO ❌'}\n`;

    if (hasPendingTrack) {
      try {
        const match = hash.match(/pending_track=([^&]*)/);
        if (match) {
          const decoded = decodeURIComponent(match[1]);
          const data = JSON.parse(decoded);
          debugMsg += `Track: ${data.track?.title || 'unknown'}\n`;
        }
      } catch (e) {
        debugMsg += `Track data error\n`;
      }
    }

    setDebugInfo(debugMsg);

    console.log('🔍 DEBUG - App mounted. URL hash:', hash);
    console.log('🔍 DEBUG - Has pending track:', hasPendingTrack);
    console.log('🔍 DEBUG - restore_pending_after_render flag:', restoreFlag);

    // Check if we need to restore pending track after Spotify auth
    const shouldRestore = restoreFlag === 'true' || hasPendingTrack;
    if (shouldRestore) {
      console.log('✅ App mounted - checking for pending track to restore...');
      sessionStorage.removeItem('restore_pending_after_render');

      // Wait for next frame to ensure everything is rendered
      requestAnimationFrame(() => {
        setTimeout(async () => {
          console.log('🔄 Attempting to restore pending track after auth...');
          const restored = await restorePendingTrack();
          if (restored) {
            console.log('✅ Successfully restored pending track after auth');
            setDebugInfo(prev => prev + 'Restored: YES ✅');
          } else {
            console.log('❌ No pending track to restore or restoration failed');
            setDebugInfo(prev => prev + 'Restored: FAILED ❌');
          }

          // Clear debug after 10 seconds
          setTimeout(() => setDebugInfo(''), 10000);
        }, 500);
      });
    } else {
      console.log('ℹ️ No restore flag or hash found - normal app load');
      // Clear debug after 5 seconds on normal load
      setTimeout(() => setDebugInfo(''), 5000);
    }
  });

  return (
    <>
      {/* DEBUG BANNER - Shows localStorage state without console */}
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
