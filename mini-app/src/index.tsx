import { render } from 'solid-js/web';
import sdk from '@farcaster/miniapp-sdk';
import App from './App';
import './styles/theme.css';
import './styles/window-layout.css';

// Initialize Farcaster SDK IMMEDIATELY
// Must be called before rendering to hide splash screen
(async () => {
  try {
    // Signal that the app is ready (hides splash screen)
    // This MUST be called as early as possible
    await sdk.actions.ready();
    console.log('Farcaster SDK ready called');
  } catch (error) {
    console.log('Not in Farcaster context or SDK ready failed:', error);
    // App will still work for local development
  }
})();

const root = document.getElementById('root');

if (root) {
  render(() => <App />, root);
}
