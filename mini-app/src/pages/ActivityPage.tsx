import { Component, onMount, For, Show } from 'solid-js';
import MobileNavigation from '../components/layout/MobileNavigation/MobileNavigation';
import TerminalHeader from '../components/layout/Header/TerminalHeader';
import ActivityItem from '../components/activity/ActivityItem';
import { activityFeed, isLoading, error, hasMore, loadActivity, loadMore } from '../stores/activityStore';
import '../styles/terminal.css';

const ActivityPage: Component = () => {
  // Load activity on mount
  onMount(() => {
    loadActivity(true);
  });

  return (
    <div class="activity-page" style={{
      display: 'flex',
      'flex-direction': 'column',
      height: '100vh',
      background: 'var(--terminal-bg)',
      color: 'var(--terminal-text)'
    }}>
      {/* Terminal Header */}
      <TerminalHeader
        title="JAMZY::NETWORK_MONITOR"
        path="~/activity"
        command="stream --live --filter=all"
        statusInfo="v2.5.7"
        borderColor="cyan"
        class="terminal-header"
        additionalContent={<span class="terminal-cursor">█</span>}
      />

      {/* Scrollable Feed */}
      <div class="activity-feed" style={{
        flex: 1,
        'overflow-y': 'auto',
        padding: 'var(--space-4)',
        'padding-bottom': '120px',
        position: 'relative',
        'z-index': 1
      }}>
        {/* Loading State */}
        <Show when={isLoading() && activityFeed().length === 0}>
          <div style={{
            padding: 'var(--space-8)',
            'text-align': 'center',
            color: 'var(--terminal-cyan)'
          }}>
            Loading activity feed...
          </div>
        </Show>

        {/* Error State */}
        <Show when={error()}>
          <div style={{
            padding: 'var(--space-8)',
            'text-align': 'center',
            color: 'var(--terminal-red)'
          }}>
            Error: {error()}
            <br />
            <button
              onClick={() => loadActivity(true)}
              style={{
                'margin-top': 'var(--space-4)',
                padding: 'var(--space-2) var(--space-4)',
                background: 'var(--terminal-cyan)',
                color: 'var(--terminal-bg)',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Retry
            </button>
          </div>
        </Show>

        {/* Activity Feed */}
        <For each={activityFeed()}>
          {(activity) => <ActivityItem activity={activity} />}
        </For>

        {/* Load More Button */}
        <Show when={hasMore() && !isLoading() && activityFeed().length > 0}>
          <div style={{
            padding: 'var(--space-4)',
            'text-align': 'center'
          }}>
            <button
              onClick={loadMore}
              style={{
                padding: 'var(--space-2) var(--space-4)',
                background: 'var(--terminal-cyan)',
                color: 'var(--terminal-bg)',
                border: 'none',
                cursor: 'pointer',
                'font-family': 'monospace'
              }}
            >
              LOAD_MORE
            </button>
          </div>
        </Show>

        {/* Loading More State */}
        <Show when={isLoading() && activityFeed().length > 0}>
          <div style={{
            padding: 'var(--space-4)',
            'text-align': 'center',
            color: 'var(--terminal-cyan)'
          }}>
            Loading more...
          </div>
        </Show>
      </div>

      {/* Mobile Navigation */}
      <MobileNavigation class="pb-safe" />
    </div>
  );
};

export default ActivityPage;
