import { Component, onMount, For, Show } from 'solid-js';
import MobileNavigation from '../components/layout/MobileNavigation/MobileNavigation';
import ActivityItem from '../components/activity/ActivityItem';
import { activityFeed, isLoading, error, hasMore, loadActivity, loadMore } from '../stores/activityStore';
import './activityPageWin95.css';

const ActivityPage: Component = () => {
  // Load activity on mount
  onMount(() => {
    loadActivity(true);
  });

  return (
    <div class="activity-page">
      <div class="activity-container">
        <div class="win95-window">
          {/* Title Bar */}
          <div class="win95-title-bar">
            <div class="win95-title-left">
              <span class="win95-title-icon">📡</span>
              <span>Network Activity - Jamzy Monitor</span>
            </div>
            <div class="win95-window-controls">
              <button class="win95-control-btn">_</button>
              <button class="win95-control-btn">□</button>
              <button class="win95-control-btn">×</button>
            </div>
          </div>

          {/* Content Area */}
          <div class="win95-content">
            {/* Loading State */}
            <Show when={isLoading() && activityFeed().length === 0}>
              <div style={{ padding: '2rem', 'text-align': 'center', color: '#000080' }}>
                <div>Loading activity feed...</div>
              </div>
            </Show>

            {/* Error State */}
            <Show when={error()}>
              <div style={{ padding: '2rem', 'text-align': 'center', color: '#ff0000' }}>
                <div>Error: {error()}</div>
                <button
                  onClick={() => loadActivity(true)}
                  class="win95-retry-btn"
                  style={{
                    'margin-top': '1rem',
                    padding: '6px 12px'
                  }}
                >
                  Retry
                </button>
              </div>
            </Show>

            {/* Activity Feed */}
            <div class="win95-activity-feed">
              <For each={activityFeed()}>
                {(activity) => <ActivityItem activity={activity} />}
              </For>

              {/* Load More Button */}
              <Show when={hasMore() && !isLoading() && activityFeed().length > 0}>
                <div style={{
                  padding: '1rem',
                  'text-align': 'center'
                }}>
                  <button
                    onClick={loadMore}
                    class="win95-action-button"
                    style={{
                      padding: '6px 12px'
                    }}
                  >
                    <span>Load More</span>
                  </button>
                </div>
              </Show>

              {/* Loading More State */}
              <Show when={isLoading() && activityFeed().length > 0}>
                <div style={{
                  padding: '1rem',
                  'text-align': 'center',
                  color: '#000080'
                }}>
                  Loading more...
                </div>
              </Show>
            </div>
          </div>

          {/* Status Bar */}
          <div class="win95-status-bar">
            <div class="win95-status-item">
              <div class="win95-status-indicator">●</div>
              <span>Online</span>
            </div>
            <div class="win95-status-item">
              <span>{activityFeed().length} activities loaded</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <MobileNavigation class="pb-safe" />
    </div>
  );
};

export default ActivityPage;
