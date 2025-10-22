import { Component, For, Show } from 'solid-js';
import type { UserConnection } from '../HomePage';

interface TopConnectionsSectionProps {
  connections: UserConnection[];
  loading: boolean;
}

export const TopConnectionsSection: Component<TopConnectionsSectionProps> = (props) => {
  const handleConnectionClick = (connection: UserConnection) => {
    console.log('Viewing connection:', connection.username);
    // TODO: Navigate to user profile
  };

  const handleKeyPress = (e: KeyboardEvent, connection: UserConnection) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleConnectionClick(connection);
    }
  };

  const getConnectionStrength = (musicMatch: number): 'strong' | 'moderate' | 'new' => {
    if (musicMatch >= 85) return 'strong';
    if (musicMatch >= 70) return 'moderate';
    return 'new';
  };

  return (
    <section class="top-connections-section">
      <div class="section-header">
        <h2 class="section-title">
          <span class="terminal-prompt">[CONNECTIONS]$</span>
          Top Musical Matches
        </h2>
        <Show when={props.connections.length > 0}>
          <span class="connections-count">{props.connections.length} active</span>
        </Show>
      </div>

      <Show
        when={!props.loading && props.connections.length > 0}
        fallback={
          <Show when={props.loading}>
            <div class="connections-grid">
              <For each={[1, 2, 3, 4]}>
                {() => (
                  <div class="connection-card skeleton">
                    <div class="connection-header-skeleton">
                      <div class="avatar-skeleton"></div>
                      <div class="match-skeleton"></div>
                    </div>
                    <div class="info-skeleton">
                      <div class="username-skeleton"></div>
                      <div class="track-skeleton"></div>
                      <div class="genres-skeleton"></div>
                    </div>
                  </div>
                )}
              </For>
            </div>
          </Show>
        }
      >
        <div class="connections-grid">
          <For each={props.connections}>
            {(connection) => (
              <div
                class={`connection-card ${getConnectionStrength(connection.musicMatch)}`}
                role="button"
                tabIndex={0}
                aria-label={`View profile for ${connection.username}, ${connection.musicMatch}% music match`}
                onClick={() => handleConnectionClick(connection)}
                onKeyDown={(e) => handleKeyPress(e, connection)}
              >
                <div class="connection-header">
                  <div class="connection-avatar">
                    <img 
                      src={connection.avatar} 
                      alt={`${connection.username}'s avatar`}
                      loading="lazy"
                    />
                    <Show when={connection.isOnline}>
                      <div class="online-indicator"></div>
                    </Show>
                  </div>
                  <div class="connection-info">
                    <h3 class="connection-username">{connection.username}</h3>
                    <div class="music-match">{connection.musicMatch}% match</div>
                  </div>
                </div>

                <Show when={connection.recentlyPlayed}>
                  <div class="recently-played">
                    <span class="now-playing-icon">♪</span>
                    <span class="track-name">{connection.recentlyPlayed}</span>
                  </div>
                </Show>

                <div class="favorite-genres">
                  <For each={connection.favoriteGenres.slice(0, 3)}>
                    {(genre) => (
                      <span class="genre-tag">{genre}</span>
                    )}
                  </For>
                </div>
              </div>
            )}
          </For>
        </div>
      </Show>

      <Show when={!props.loading && props.connections.length === 0}>
        <div class="empty-state">
          <div class="empty-icon">👥</div>
          <p class="empty-text">No connections found</p>
          <p class="empty-subtext">Start following users to build your network</p>
        </div>
      </Show>

      <div class="section-footer">
        <button class="view-all-button">
          <span>VIEW ALL CONNECTIONS</span>
          <span class="button-arrow">→</span>
        </button>
      </div>
    </section>
  );
};