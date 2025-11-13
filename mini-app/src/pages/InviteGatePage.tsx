import { Component, createSignal, Show } from 'solid-js';
import RetroWindow from '../components/common/RetroWindow';
import TextInput from '../components/common/TextInput';
import AnimatedButton from '../components/common/AnimatedButton';
import { redeemInviteCode } from '../utils/invite';
import { farcasterAuth, farcasterLoading } from '../stores/farcasterStore';
import { setCurrentUser, setIsAuthenticated, setShowInviteModal, createGuestSession } from '../stores/authStore';
import { trackBetaCodeEntered } from '../utils/analytics';
import './inviteGatePage.css';

const InviteGatePage: Component = () => {
  const [inviteCode, setInviteCode] = createSignal('');
  const [isSubmitting, setIsSubmitting] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);

  // Guest code state (for browser users)
  const [guestCode, setGuestCode] = createSignal('');
  const [isSubmittingGuest, setIsSubmittingGuest] = createSignal(false);
  const [guestError, setGuestError] = createSignal<string | null>(null);

  const handleSubmit = async () => {
    const code = inviteCode().trim();

    if (!code) {
      setError('Please enter an invite code');
      return;
    }

    // Get FID from Farcaster auth - must be authenticated
    const auth = farcasterAuth();
    const fid = auth.fid;

    if (!fid) {
      setError('Please open JAMZY in the Farcaster app to redeem your code');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await redeemInviteCode(code, fid);

      if (result.success) {
        // Track successful beta code redemption
        trackBetaCodeEntered(true);

        // Success! Update auth state
        const effectiveDisplayName = auth.displayName || auth.username || 'User';
        const effectiveUsername = auth.username || 'dwr'; // Dev mode username

        setCurrentUser({
          fid: fid,
          username: effectiveUsername,
          avatar: auth.pfpUrl || 'https://i.imgur.com/qQrY7wZ.jpg',
          displayName: effectiveDisplayName,
        });
        setIsAuthenticated(true);
        setShowInviteModal(false);
        setInviteCode('');
      } else {
        // Track failed beta code redemption
        const errorCode = result.error?.code || 'unknown_error';
        trackBetaCodeEntered(false, errorCode);

        // Show error
        const errorMessage = result.error?.message || 'Failed to redeem invite code';
        setError(errorMessage);
      }
    } catch (err) {
      console.error('Error redeeming invite code:', err);
      setError('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !isSubmitting()) {
      handleSubmit();
    }
  };

  // Handle guest code submission (browser users only)
  const handleGuestSubmit = async () => {
    const code = guestCode().trim();

    if (!code) {
      setGuestError('Please enter a testing code');
      return;
    }

    setIsSubmittingGuest(true);
    setGuestError(null);

    try {
      // Generate simple browser fingerprint
      const browserFingerprint = `${navigator.userAgent}_${screen.width}x${screen.height}_${navigator.language}`.replace(/\s/g, '_');

      // Call backend API to redeem guest code
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4201';
      const response = await fetch(`${API_URL}/api/invites/redeem-guest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          browserFingerprint,
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Success! Create guest session
        createGuestSession(result.sessionId, code);
        setGuestCode('');
        console.log('[InviteGate] Guest session created successfully');
      } else {
        // Show error
        const errorMessage = result.error?.message || 'Invalid testing code';
        setGuestError(errorMessage);
      }
    } catch (err) {
      console.error('Error redeeming guest code:', err);
      setGuestError('An unexpected error occurred');
    } finally {
      setIsSubmittingGuest(false);
    }
  };

  const handleGuestKeyPress = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !isSubmittingGuest()) {
      handleGuestSubmit();
    }
  };

  const auth = farcasterAuth();
  const isLoading = farcasterLoading();
  const isGuest = !auth.fid;

  return (
    <div class="invite-gate-page">
      <div class="invite-gate-container">
        <RetroWindow
          title="Beta Access Required"
          variant="neon"
          icon={<span class="invite-gate-icon">🎵</span>}
          showClose={false}
          class="invite-gate-window"
        >
          <div class="invite-gate-content">
            <div class="invite-welcome-section">
              <h2 class="invite-welcome-heading">Welcome to Jamzy!</h2>
              <Show when={isLoading} fallback={
                <Show when={!isGuest} fallback={
                  <p class="invite-welcome-subtext" style="color: #ff6b9d; font-weight: 600;">
                    ⚠️ Please open this link in the Farcaster app to continue.
                  </p>
                }>
                  <p class="invite-welcome-subtext">
                    Enter your invite code below to unlock access.
                  </p>
                </Show>
              }>
                <p class="invite-welcome-subtext" style="color: #04caf4; font-weight: 600;">
                  Initializing...
                </p>
              </Show>
            </div>

            <Show when={!isLoading && !isGuest}>
              <div class="invite-form-section">
                <div onKeyPress={handleKeyPress}>
                  <TextInput
                    value={inviteCode()}
                    onInput={setInviteCode}
                    placeholder="JAMZY-XXXXXXXX"
                    label="Invite Code"
                    disabled={isSubmitting()}
                  />
                </div>

                <Show when={error()}>
                  <div class="invite-error-message">
                    <span class="invite-error-icon">⚠️</span>
                    <p class="invite-error-text">{error()}</p>
                  </div>
                </Show>

                <div class="invite-submit-wrapper">
                  <AnimatedButton
                    onClick={handleSubmit}
                    disabled={isSubmitting()}
                    animationType="social"
                    class="invite-submit-btn"
                  >
                    {isSubmitting() ? 'Verifying...' : 'Enter Jamzy'}
                  </AnimatedButton>
                </div>
              </div>
            </Show>

            {/* Guest testing code input - ONLY for browser users */}
            <Show when={!isLoading && isGuest}>
              <div class="invite-divider">
                <span class="invite-divider-text">Testing Access</span>
              </div>
              <div class="invite-form-section">
                <p class="invite-welcome-subtext" style="font-size: 0.9rem; margin-bottom: 1rem;">
                  Have a testing code? Enter it below for guest access.
                </p>
                <div onKeyPress={handleGuestKeyPress}>
                  <TextInput
                    value={guestCode()}
                    onInput={setGuestCode}
                    placeholder="JAMZY-XXXXXXXX"
                    label="Testing Code"
                    disabled={isSubmittingGuest()}
                  />
                </div>

                <Show when={guestError()}>
                  <div class="invite-error-message">
                    <span class="invite-error-icon">⚠️</span>
                    <p class="invite-error-text">{guestError()}</p>
                  </div>
                </Show>

                <div class="invite-submit-wrapper">
                  <AnimatedButton
                    onClick={handleGuestSubmit}
                    disabled={isSubmittingGuest()}
                    animationType="social"
                    class="invite-submit-btn"
                  >
                    {isSubmittingGuest() ? 'Verifying...' : 'Enter as Guest'}
                  </AnimatedButton>
                </div>
              </div>
            </Show>

            <div class="invite-footer-section">
              <Show when={!isGuest} fallback={
                <p class="invite-footer-text">
                  JAMZY is a Farcaster mini app. Open this link in Farcaster or another client to access.
                </p>
              }>
              </Show>
            </div>
          </div>
        </RetroWindow>
      </div>
    </div>
  );
};

export default InviteGatePage;
