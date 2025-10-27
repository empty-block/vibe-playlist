import { render } from 'solid-js/web';
import sdk from '@farcaster/miniapp-sdk';
import App from './App';
import './styles/theme.css';
import './styles/window-layout.css';

// Initialize Farcaster SDK and render app
// The ready() call must happen before render to hide splash screen
const root = document.getElementById('root');

if (root) {
  // Call ready() and then render
  // This is done synchronously to ensure ready() is called ASAP
  sdk.actions.ready()
    .then(() => {
      console.log('Farcaster SDK ready called');
      render(() => <App />, root);
    })
    .catch((error) => {
      console.log('Not in Farcaster context or SDK ready failed:', error);
      // Still render the app for local development
      render(() => <App />, root);
    });
}
