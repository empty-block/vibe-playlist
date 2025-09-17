import { Component } from 'solid-js';

interface ThreadStatusProps {
  replyCount: number;
  threadTitle?: string;
}

const ThreadStatus: Component<ThreadStatusProps> = (props) => {
  return (
    <div class="thread-status-container">
      <div class="thread-status-indicator">
        <div class="status-icon">🔗</div>
        <div class="status-text">
          <span class="status-label">THREAD REPLIES ONLY</span>
          <span class="status-count">• {props.replyCount} tracks</span>
        </div>
        <div class="status-glow"></div>
      </div>
    </div>
  );
};

export default ThreadStatus;