import { Component } from 'solid-js';
import { A } from '@solidjs/router';
import { TrackShareActivity as TrackShareActivityType } from '../../data/mockActivity';
import { setCurrentTrack, setIsPlaying } from '../../stores/playerStore';

interface TrackShareActivityProps {
  activity: TrackShareActivityType;
}

const TrackShareActivity: Component<TrackShareActivityProps> = (props) => {
  const playTrack = (track: any) => {
    setCurrentTrack(track);
    setIsPlaying(true);
  };

  const packetId = props.activity.id.substring(props.activity.id.length - 4);

  return (
    <div class="terminal-activity-block terminal-activity-block--share">
      {/* Top border */}
      <div class="terminal-block-header">
        <span>╭─────────────────────────────────────────────────────────────┬──[0x{packetId}]─╮</span>
      </div>

      {/* Metadata line */}
      <div class="terminal-block-meta">
        <span class="border-v">│</span>
        <span class="meta-arrow">&gt;&gt;</span>
        <A
          href={`/user/${props.activity.user.username}`}
          style={{ 'text-decoration': 'none' }}
        >
          <span class="meta-username">@{props.activity.user.username}</span>
        </A>
        <span style={{ color: 'var(--terminal-text)' }}> shared a track</span>
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

      {/* Comment section */}
      {props.activity.track.comment && (
        <div class="terminal-block-comment">
          <span class="border-v">│</span>
          <span class="comment-arrow">&gt;&gt;</span>
          <span class="comment-label">COMMENT:</span>
          <span class="comment-text">"{props.activity.track.comment}"</span>
          <span class="border-v">│</span>
        </div>
      )}

      <div class="terminal-block-actions">
        <span class="border-v">│</span>
        <div class="terminal-social-row">
          <button class="terminal-action-btn">
            <span class="action-bracket">[</span>
            <span class="action-icon">❤</span>
            <span class="action-count"> {props.activity.track.likes}</span>
            <span class="action-bracket">]</span>
          </button>

          <button class="terminal-action-btn">
            <span class="action-bracket">[</span>
            <span class="action-icon">💬</span>
            <span class="action-count"> {props.activity.track.replies}</span>
            <span class="action-bracket">]</span>
          </button>

          <button class="terminal-action-btn">
            <span class="action-bracket">[</span>
            <span class="action-icon">↻</span>
            <span class="action-count"> {props.activity.track.recasts}</span>
            <span class="action-bracket">]</span>
          </button>

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

export default TrackShareActivity;
