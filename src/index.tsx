import { render } from 'solid-js/web';
import App from './App';

// Debug environment variables immediately on load
console.log('=== ENVIRONMENT VARIABLE DEBUG ===');
console.log('Raw import.meta.env:', import.meta.env);
console.log('VITE_SPOTIFY_CLIENT_ID:', import.meta.env.VITE_SPOTIFY_CLIENT_ID);
console.log('VITE_SPOTIFY_REDIRECT_URI:', import.meta.env.VITE_SPOTIFY_REDIRECT_URI);
console.log('==================================');

const root = document.getElementById('root');

if (root) {
  render(() => <App />, root);
}