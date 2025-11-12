import { createSignal, onMount } from 'solid-js';
import sdk from '@farcaster/miniapp-sdk';

export interface SafeAreaInsets {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

// Default safe area insets (fallback values)
const DEFAULT_INSETS: SafeAreaInsets = {
  top: 0,
  bottom: 0,
  left: 0,
  right: 0,
};

// Store safe area insets from Farcaster SDK
export const [safeAreaInsets, setSafeAreaInsets] = createSignal<SafeAreaInsets>(DEFAULT_INSETS);

/**
 * Initialize safe area insets from Farcaster SDK context
 * This should be called on app initialization
 */
export const initializeSafeAreaInsets = async () => {
  try {
    // Check if we're in a Farcaster Mini App
    const isInMiniApp = await sdk.isInMiniApp();

    if (!isInMiniApp) {
      console.log('[SafeArea] Not in Farcaster Mini App - using default insets');
      return;
    }

    // Get the context which contains safeAreaInsets
    const context = await sdk.context;

    // Access safeAreaInsets from client context
    const insets = await context?.client?.safeAreaInsets;

    if (insets) {
      console.log('[SafeArea] Got Farcaster safe area insets:', insets);
      setSafeAreaInsets({
        top: insets.top || 0,
        bottom: insets.bottom || 0,
        left: insets.left || 0,
        right: insets.right || 0,
      });
    } else {
      console.log('[SafeArea] No safe area insets in context');
    }
  } catch (error) {
    console.log('[SafeArea] Failed to get safe area insets:', error);
    // Keep default insets on error
  }
};

// Auto-initialize when the store is imported (for browser environment only)
if (typeof window !== 'undefined') {
  initializeSafeAreaInsets().catch((error) => {
    console.log('[SafeArea] Initialization skipped:', error);
  });
}
