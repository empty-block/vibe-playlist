import { Router, Route } from '@solidjs/router';
import { Component, Show, JSX } from 'solid-js';
import ThreadsPage from './pages/ThreadsPage';
import ThreadViewPage from './pages/ThreadViewPage';
import ChannelViewPage from './pages/ChannelViewPage';
import ActivityPage from './pages/ActivityPage';
import ProfilePage from './pages/ProfilePage';
import ChannelsPage from './pages/ChannelsPage';
import MediaPlayer from './components/player/MediaPlayer';
import { currentTrack } from './stores/playerStore';

// Root component that wraps all routes and provides player
const RootLayout: Component<{ children?: JSX.Element }> = (props) => {
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
      <Route path="/" component={ChannelsPage} />
      <Route path="/channels" component={ChannelsPage} />
      <Route path="/channel/:id" component={ChannelViewPage} />
      <Route path="/activity" component={ActivityPage} />
      <Route path="/thread/:id" component={ThreadViewPage} />
      <Route path="/profile" component={ProfilePage} />
    </Router>
  );
};

export default App;
