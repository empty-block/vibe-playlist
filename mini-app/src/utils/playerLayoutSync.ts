/**
 * Player Layout Synchronization Utility
 *
 * Dynamically updates the --player-bar-height CSS variable based on player visibility
 * This ensures the page-window-container adjusts height to prevent content overlap
 */

import { createEffect, onCleanup } from 'solid-js';
import { isPlayerVisible } from '../stores/playerStore';

/**
 * Measures the actual player bar height and updates CSS variable
 */
const updatePlayerHeight = () => {
  const playerBar = document.querySelector('.player-bar') as HTMLElement;

  if (playerBar && isPlayerVisible()) {
    // Get the actual computed height of the player bar
    const height = playerBar.offsetHeight;

    // Add minimal buffer for visual breathing room (2px)
    const adjustedHeight = height + 2;

    // Update CSS custom property
    document.documentElement.style.setProperty(
      '--player-bar-height',
      `${adjustedHeight}px`
    );

    console.log('[PlayerLayoutSync] Player height updated:', adjustedHeight);
  } else {
    // Reset to 0 when player is not visible
    document.documentElement.style.setProperty('--player-bar-height', '0px');
    console.log('[PlayerLayoutSync] Player height reset to 0');
  }
};

/**
 * Initialize player layout synchronization
 * Call this once in your app's root component
 */
export const initPlayerLayoutSync = () => {
  // Watch for player visibility changes
  createEffect(() => {
    const visible = isPlayerVisible();

    if (visible) {
      // Player just became visible - update height after a short delay
      // to allow the player DOM to fully render
      setTimeout(updatePlayerHeight, 100);

      // Also set up a ResizeObserver to handle dynamic height changes
      // (e.g., when YouTube embed expands/collapses)
      const playerBar = document.querySelector('.player-bar') as HTMLElement;
      if (playerBar) {
        const resizeObserver = new ResizeObserver(() => {
          updatePlayerHeight();
        });

        resizeObserver.observe(playerBar);

        // Clean up observer when player is hidden
        onCleanup(() => {
          resizeObserver.disconnect();
        });
      }
    } else {
      // Player hidden - reset immediately
      updatePlayerHeight();
    }
  });
};
