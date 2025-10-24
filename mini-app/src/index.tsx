import { render } from 'solid-js/web';
import { onMount } from 'solid-js';
import sdk from '@farcaster/miniapp-sdk';
import App from './App';
import './styles/theme.css';
import './styles/window-layout.css';

const root = document.getElementById('root');

if (root) {
  render(() => {
    // Initialize Farcaster SDK after component mounts
    onMount(async () => {
      try {
        // Check if we're in a Farcaster context
        if (sdk.context) {
          console.log('Farcaster SDK initialized:', sdk.context);
        }

        // Signal that the app is ready (hides splash screen)
        await sdk.ready();
        console.log('Mini app ready');
      } catch (error) {
        console.error('Failed to initialize Farcaster SDK:', error);
        // App will still work for local development
      }
    });

    return <App />;
  }, root);
}
