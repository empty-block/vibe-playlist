import { Component } from 'solid-js';
import { A } from '@solidjs/router';
import { AggregatedLikesActivity as AggregatedLikesActivityType } from '../../data/mockActivity';
import { setCurrentTrack, setIsPlaying } from '../../stores/playerStore';

interface LikesActivityProps {
  activity: AggregatedLikesActivityType;
}

const LikesActivity: Component<LikesActivityProps> = (props) => {
  const playTrack = (track: any) => {
    setCurrentTrack(track);
    setIsPlaying(true);
  };

  const packetId = props.activity.id.substring(props.activity.id.length - 4);

  // Calculate engagement bar
  const totalBars = 20;
  const filledBars = Math.min(totalBars, Math.floor((props.activity.likeCount / 20) * totalBars));
  const emptyBars = totalBars - filledBars;

  return (
    <div class="terminal-activity-block terminal-activity-block--like">
      {/* Top border with metadata */}
      <div class="terminal-block-header">
        <span>╭─[</span>
        <span class="packet-type">ENGAGEMENT_SPIKE</span>
        <span>]──────────────────────────────[</span>
        <span class="packet-id">ID: 0x{packetId}</span>
        <span>]─╮</span>
      </div>

      {/* Metadata line */}
      <div class="terminal-block-meta">
        <span class="border-v">│</span>
        <span class="meta-arrow">&gt;&gt;</span>
        <span style={{ color: 'var(--neon-green)', 'font-weight': 600 }}>{props.activity.likeCount} likes</span>
        <span style={{ color: 'var(--terminal-text)' }}> on "{props.activity.track.title}"</span>
        <span class="info-separator"> • </span>
        <span class="info-value">{props.activity.timestamp}</span>
        <span style={{ 'margin-left': 'auto' }}></span>
        <span class="border-v">│</span>
      </div>

      {/* Divider */}
      <div class="terminal-block-divider">
        <span>├─────────────────────────────────────────────────────────────┤</span>
      </div>

      {/* Track content */}
      <div class="terminal-block-content">
        <span class="border-v">│</span>
        <div class="terminal-track-row">
          {/* Track thumbnail */}
          <div class="terminal-thumbnail">
            <div class="thumbnail-border-top">┌─┐</div>
            <img src={props.activity.track.thumbnail} alt="" class="thumbnail-image" />
            <div class="thumbnail-border-bottom">└─┘</div>
          </div>

          {/* Track info */}
          <div class="terminal-track-info">
            <div class="track-title-line">
              <span class="track-title">"{props.activity.track.title}"</span>
              <span class="track-source">[SRC: {props.activity.track.source.toUpperCase()}]</span>
            </div>
            <div class="track-artist-line">
              <span class="track-label">by</span>
              <span class="track-artist">{props.activity.track.artist}</span>
            </div>
          </div>
        </div>
        <span class="border-v">│</span>
      </div>

      {/* Engagement graph */}
      <div class="terminal-engagement-graph">
        <span class="border-v">│</span>
        <div style={{ flex: 1 }}>
          <div>
            <span class="meta-arrow">&gt;&gt;</span>
            <span class="engagement-label">ENGAGEMENT_GRAPH:</span>
          </div>
          <div style={{ 'margin-top': '4px', 'margin-left': '24px' }}>
            <span class="engagement-bar">
              <span class="engagement-bar-filled">{'█'.repeat(filledBars)}</span>
              <span class="engagement-bar-empty">{'░'.repeat(emptyBars)}</span>
            </span>
            <span class="engagement-stats"> {props.activity.likeCount} likes</span>
          </div>
        </div>
        <span class="border-v">│</span>
      </div>

      {/* Social actions */}
      <div class="terminal-block-actions">
        <span class="border-v">│</span>
        <div class="terminal-social-row">
          <button class="terminal-action-btn">
            <span class="action-bracket">[</span>
            <span class="action-icon">❤</span>
            <span class="action-count"> {props.activity.likeCount}</span>
            <span class="action-bracket">]</span>
          </button>

          <button class="terminal-action-btn">
            <span class="action-bracket">[</span>
            <span class="action-icon">💬</span>
            <span class="action-count"> {props.activity.track.replies || 0}</span>
            <span class="action-bracket">]</span>
          </button>

          <A href={`/thread/${props.activity.threadId}`} style={{ 'text-decoration': 'none', 'margin-left': 'auto' }}>
            <button class="terminal-action-btn">
              <span class="action-bracket">[</span>
              <span style={{ 'font-size': '11px' }}>VIEW THREAD</span>
              <span class="action-bracket">]</span>
            </button>
          </A>

          <button class="terminal-play-btn" onClick={() => playTrack(props.activity.track)}>
            <span class="action-bracket">[</span>
            <span class="play-icon">▶</span>
            <span class="play-text">PLAY</span>
            <span class="action-bracket">]</span>
          </button>
        </div>
        <span class="border-v">│</span>
      </div>

      {/* Bottom border */}
      <div class="terminal-block-footer">
        <span>╰──────────────────────────────────────────────────────────────╯</span>
      </div>
    </div>
  );
};

export default LikesActivity;
