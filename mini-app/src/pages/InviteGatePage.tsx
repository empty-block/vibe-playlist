import { Component, createSignal, Show } from 'solid-js';
import RetroWindow from '../components/common/RetroWindow';
import TextInput from '../components/common/TextInput';
import AnimatedButton from '../components/common/AnimatedButton';
import { redeemInviteCode } from '../utils/invite';
import { farcasterAuth, farcasterLoading } from '../stores/farcasterStore';
import { setCurrentUser, setIsAuthenticated, setShowInviteModal } from '../stores/authStore';
import { trackBetaCodeEntered } from '../utils/analytics';
import './inviteGatePage.css';

const InviteGatePage: Component = () => {
  const [inviteCode, setInviteCode] = createSignal('');
  const [isSubmitting, setIsSubmitting] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);

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
              <p class="invite-welcome-text">
                You're about to enter the beta for the most social way to discover music.
              </p>
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

            <div class="invite-footer-section">
              <Show when={!isGuest} fallback={
                <p class="invite-footer-text">
                  JAMZY is a Farcaster mini app. Open this link in Warpcast or another Farcaster client to access.
                </p>
              }>
                <p class="invite-footer-text">
                  Need an invite? Check your DMs or hit up the Jamzy channel on Farcaster.
                </p>
              </Show>
            </div>
          </div>
        </RetroWindow>
      </div>
    </div>
  );
};

export default InviteGatePage;
