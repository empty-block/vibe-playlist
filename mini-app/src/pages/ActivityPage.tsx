import { Component, createSignal, For } from 'solid-js';
import MobileNavigation from '../components/layout/MobileNavigation/MobileNavigation';
import TerminalHeader from '../components/layout/Header/TerminalHeader';
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
