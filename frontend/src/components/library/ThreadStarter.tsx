import { Component, Show, onMount, onCleanup } from 'solid-js';
import { Track } from '../../stores/playerStore';
import { PersonalTrack } from '../../types/library';
import anime from 'animejs';

interface ThreadStarterProps {
  threadStarter: Track | PersonalTrack;
  conversationText?: string; // The original post text/question that started the thread
  username?: string; // Username who started the thread
  userAvatar?: string; // User's profile image URL
  timestamp?: string; // When the thread was started
  replyCount?: number; // Number of replies in this thread
  onClose?: () => void; // Callback to exit thread mode
  isLoading?: boolean;
}

const ThreadStarter: Component<ThreadStarterProps> = (props) => {
  let containerRef: HTMLDivElement | undefined;

  // Thread pulse animation every 3 seconds
  onMount(() => {
    const pulseAnimation = () => {
      if (containerRef) {
        anime({
          targets: containerRef,
          boxShadow: [
            { value: '0 0 20px rgba(0, 255, 255, 0.3), inset 0 0 20px rgba(0, 255, 255, 0.1)' },
            { value: '0 0 40px rgba(0, 255, 255, 0.5), inset 0 0 30px rgba(0, 255, 255, 0.2)' },
            { value: '0 0 20px rgba(0, 255, 255, 0.3), inset 0 0 20px rgba(0, 255, 255, 0.1)' }
          ],
          duration: 1000,
          easing: 'easeInOutQuad'
        });
      }
    };

    // Initial pulse after mount
    setTimeout(pulseAnimation, 500);
    
    // Set up recurring pulse
    const interval = setInterval(pulseAnimation, 3000);
    
    // ESC key handler for thread exit
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && props.onClose) {
        props.onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscapeKey);
    
    onCleanup(() => {
      clearInterval(interval);
      document.removeEventListener('keydown', handleEscapeKey);
    });
  });

  const hasConversationText = () => props.conversationText && props.conversationText.trim().length > 0;

  return (
    <div class="thread-starter-container">
      <Show when={!props.isLoading} fallback={
        <div class="thread-starter-loading">
          <div class="loading-conversation-text"></div>
          <div class="loading-attribution"></div>
        </div>
      }>
        <div 
          ref={containerRef}
          class="thread-starter-content"
        >
          {/* Header with Social Attribution and Close Button */}
          <div class="thread-header">
            <div class="social-attribution">
              <Show when={props.username} fallback={<span class="attribution-text">Started by anonymous</span>}>
                <div class="attribution-content">
                  <Show when={props.userAvatar}>
                    <div class="user-avatar">
                      <img 
                        src={props.userAvatar} 
                        alt={props.username}
                        class="avatar-image"
                      />
                    </div>
                  </Show>
                  <span class="attribution-text">
                    <span class="username">@{props.username}</span>
                    <Show when={props.timestamp}>
                      <span class="timestamp"> • {props.timestamp}</span>
                    </Show>
                  </span>
                </div>
              </Show>
            </div>

            {/* Close Button */}
            <Show when={props.onClose}>
              <button 
                class="thread-close-btn" 
                onClick={props.onClose}
                title="Back to library (ESC)"
              >
                <span class="close-text">BACK</span>
                <span class="close-icon">←</span>
              </button>
            </Show>
          </div>

          {/* Conversation Text (Full Width Below) */}
          <Show when={hasConversationText()}>
            <div class="conversation-text">
              <p class="conversation-message">{props.conversationText}</p>
              {/* TODO: Add show more/less functionality for long text */}
            </div>
          </Show>
        </div>
      </Show>
    </div>
  );
};

export default ThreadStarter;