/**
 * Haptics Utility Module
 *
 * Provides safe, reusable haptic feedback using the Farcaster Mini App SDK.
 * Automatically handles capability detection and graceful fallbacks.
 */

import sdk from '@farcaster/miniapp-sdk';

interface HapticsSupport {
  impact: boolean;
  notification: boolean;
  selection: boolean;
}

let hapticsSupported: HapticsSupport = {
  impact: false,
  notification: false,
  selection: false
};

let capabilitiesChecked = false;

/**
 * Check if haptics are supported by the current platform
 * Caches result to avoid repeated SDK calls
 */
async function checkHapticsSupport(): Promise<HapticsSupport> {
  if (capabilitiesChecked) {
    return hapticsSupported;
  }

  try {
    const isInMiniApp = await sdk.isInMiniApp();
    if (!isInMiniApp) {
      console.log('[Haptics] Not in mini app context, haptics disabled');
      capabilitiesChecked = true;
      return hapticsSupported;
    }

    const capabilities = await sdk.getCapabilities();
    hapticsSupported = {
      impact: capabilities.includes('haptics.impactOccurred'),
      notification: capabilities.includes('haptics.notificationOccurred'),
      selection: capabilities.includes('haptics.selectionChanged')
    };

    console.log('[Haptics] Capabilities detected:', hapticsSupported);
    capabilitiesChecked = true;
  } catch (error) {
    console.log('[Haptics] Capability check failed:', error);
    capabilitiesChecked = true;
  }

  return hapticsSupported;
}

/**
 * Trigger an impact haptic feedback
 *
 * @param type - Impact type: 'light' (subtle), 'medium' (moderate), 'heavy' (strong)
 *
 * Usage:
 * - 'light': Button presses, track selection, subtle interactions
 * - 'medium': Moderate actions (use sparingly in music apps)
 * - 'heavy': Strong actions (rarely appropriate in music apps)
 */
export async function triggerImpact(
  type: 'light' | 'medium' | 'heavy' | 'soft' | 'rigid' = 'light'
): Promise<void> {
  const support = await checkHapticsSupport();
  if (!support.impact) {
    return;
  }

  try {
    await sdk.haptics.impactOccurred(type);
  } catch (error) {
    console.log('[Haptics] Impact haptic failed:', error);
  }
}

/**
 * Trigger a notification haptic feedback
 *
 * @param type - Notification type: 'success', 'warning', or 'error'
 *
 * Usage:
 * - 'success': Successful operation (e.g., track added to playlist)
 * - 'warning': Warning state (e.g., low volume)
 * - 'error': Error state (e.g., failed to load track)
 */
export async function triggerNotification(
  type: 'success' | 'warning' | 'error'
): Promise<void> {
  const support = await checkHapticsSupport();
  if (!support.notification) {
    return;
  }

  try {
    await sdk.haptics.notificationOccurred(type);
  } catch (error) {
    console.log('[Haptics] Notification haptic failed:', error);
  }
}

/**
 * Trigger a selection haptic feedback
 *
 * Usage:
 * - Scrolling through a picker
 * - Changing selections in a list
 * - Fine-grained selection changes
 */
export async function triggerSelection(): Promise<void> {
  const support = await checkHapticsSupport();
  if (!support.selection) {
    return;
  }

  try {
    await sdk.haptics.selectionChanged();
  } catch (error) {
    console.log('[Haptics] Selection haptic failed:', error);
  }
}
