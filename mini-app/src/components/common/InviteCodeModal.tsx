import { Component, createSignal, Show } from 'solid-js';
import BaseModal from './Modal/BaseModal';
import TextInput from './TextInput';
import AnimatedButton from './AnimatedButton';
import { redeemInviteCode } from '../../utils/invite';
import { farcasterAuth } from '../../stores/farcasterStore';
import { setCurrentUser, setIsAuthenticated, setShowInviteModal } from '../../stores/authStore';
import './inviteCodeModal.css';

interface InviteCodeModalProps {
  isOpen: boolean;
}

const InviteCodeModal: Component<InviteCodeModalProps> = (props) => {
  const [inviteCode, setInviteCode] = createSignal('');
  const [isSubmitting, setIsSubmitting] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);

  const handleSubmit = async () => {
    const code = inviteCode().trim();

    if (!code) {
      setError('Please enter an invite code');
      return;
    }

    const auth = farcasterAuth();
    if (!auth.fid) {
      setError('Authentication required');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await redeemInviteCode(code, auth.fid);

      if (result.success) {
        // Success! Update auth state
        const effectiveDisplayName = auth.displayName || auth.username || 'User';
        const effectiveUsername = auth.username || 'unknown';

        setCurrentUser({
          fid: auth.fid,
          username: effectiveUsername,
          avatar: auth.pfpUrl,
          displayName: effectiveDisplayName,
        });
        setIsAuthenticated(true);
        setShowInviteModal(false);
        setInviteCode('');
      } else {
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

  return (
    <BaseModal
      isOpen={props.isOpen}
      onClose={() => {}} // Prevent closing - invite code is required
      title="Beta Access Required"
      size="sm"
      showCloseButton={false}
      closeOnBackdropClick={false}
      closeOnEscape={false}
    >
      <div class="invite-modal-content">
        <div class="invite-welcome-text">
          <p class="invite-welcome-secondary">
            Enter your invite code below to unlock access.
          </p>
        </div>

        <div class="invite-input-wrapper">
          <div onKeyPress={handleKeyPress}>
            <TextInput
              value={inviteCode()}
              onInput={setInviteCode}
              placeholder="JAMZY-XXXXXXXX"
              label="Invite Code"
              disabled={isSubmitting()}
            />
          </div>
        </div>

        <Show when={error()}>
          <div class="invite-error-box">
            <p class="invite-error-text">
              {error()}
            </p>
          </div>
        </Show>

        <div class="invite-button-wrapper">
          <AnimatedButton
            onClick={handleSubmit}
            disabled={isSubmitting()}
            animationType="social"
            class="invite-submit-button"
          >
            {isSubmitting() ? 'Verifying...' : 'Enter Jamzy'}
          </AnimatedButton>
        </div>

        <div class="invite-footer">
        </div>
      </div>
    </BaseModal>
  );
};

export default InviteCodeModal;
