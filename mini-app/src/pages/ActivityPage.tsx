import { Component, createSignal, For } from 'solid-js';
import MobileNavigation from '../components/layout/MobileNavigation/MobileNavigation';
import ActivityItem from '../components/activity/ActivityItem';
import { mockActivityFeed, ActivityEvent } from '../data/mockActivity';
import '../styles/terminal.css';

const ActivityPage: Component = () => {
  const [activityFeed] = createSignal<ActivityEvent[]>(mockActivityFeed);

  return (
    <div class="activity-page" style={{
      display: 'flex',
      'flex-direction': 'column',
      height: '100vh',
      background: 'var(--terminal-bg)',
      color: 'var(--terminal-text)'
    }}>
      {/* Terminal Header */}
      <div class="terminal-header">
        {/* Top border with title */}
        <div class="terminal-title-bar">
          <span>┌─[</span>
          <span style={{ 'font-weight': 700 }}>JAMZY::NETWORK_MONITOR</span>
          <span>]─────────────────────────────[</span>
          <span style={{ color: 'var(--neon-yellow)' }}>v2.5.7</span>
          <span>]─┐</span>
        </div>

        {/* Command prompt */}
        <div class="terminal-prompt-line">
          <span class="border-v">│</span>
          <span class="terminal-user">user@jamzy</span>
          <span class="terminal-colon">:</span>
          <span class="terminal-path">~/activity</span>
          <span class="terminal-dollar">$</span>
          <span class="terminal-command">stream --live --filter=all</span>
          <span class="terminal-cursor">█</span>
          <span style={{ 'margin-left': 'auto' }}></span>
          <span class="border-v">│</span>
        </div>

        {/* Bottom border */}
        <div style={{ color: 'var(--terminal-muted)' }}>
          <span>└────────────────────────────────────────────────────────────────┘</span>
        </div>
      </div>

      {/* Scrollable Feed */}
      <div style={{
        flex: 1,
        'overflow-y': 'auto',
        padding: 'var(--space-4)',
        'padding-bottom': '120px',
        position: 'relative',
        'z-index': 1
      }}>
        <For each={activityFeed()}>
          {(activity) => <ActivityItem activity={activity} />}
        </For>
      </div>

      {/* Mobile Navigation */}
      <MobileNavigation class="pb-safe" />
    </div>
  );
};

export default ActivityPage;
