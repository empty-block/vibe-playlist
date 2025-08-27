import { Component, For, Show, createSignal, onMount, onCleanup } from 'solid-js';
import { LiveActivity } from '../../types/community';

interface LiveActivityPulseProps {
  activities: LiveActivity[];
  isLoading: boolean;
}

const LiveActivityPulse: Component<LiveActivityPulseProps> = (props) => {
  const [currentActivityIndex, setCurrentActivityIndex] = createSignal(0);
  const [isAutoScrolling, setIsAutoScrolling] = createSignal(true);
  let intervalId: number | undefined;

  // Auto-scroll through activities
  onMount(() => {
    if (props.activities.length > 1) {
      intervalId = window.setInterval(() => {
        if (isAutoScrolling()) {
          setCurrentActivityIndex((prev) => 
            prev >= props.activities.length - 1 ? 0 : prev + 1
          );
        }
      }, 3000);
    }
  });

  onCleanup(() => {
    if (intervalId) {
      clearInterval(intervalId);
    }
  });

  const getActivityText = (activity: LiveActivity) => {
    switch (activity.type) {
      case 'share':
        return `shared "${activity.track?.title}" by ${activity.track?.artist}`;
      case 'reply':
        return `replied: "${activity.content?.slice(0, 40)}${activity.content && activity.content.length > 40 ? '...' : ''}"`;
      case 'heart':
        return `hearted "${activity.track?.title}" by ${activity.track?.artist}`;
      case 'follow':
        return `started following @${activity.targetUser?.username}`;
      case 'recast':
        return `recast "${activity.track?.title}" by ${activity.track?.artist}`;
      default:
        return 'did something interesting';
    }
  };

  const getActivityIcon = (type: LiveActivity['type']) => {
    switch (type) {
      case 'share': return 'fas fa-share';
      case 'reply': return 'fas fa-comment';
      case 'heart': return 'fas fa-heart';
      case 'follow': return 'fas fa-user-plus';
      case 'recast': return 'fas fa-retweet';
      default: return 'fas fa-music';
    }
  };

  const getActivityColor = (type: LiveActivity['type']) => {
    switch (type) {
      case 'share': return 'text-green-400';
      case 'reply': return 'text-cyan-400';
      case 'heart': return 'text-pink-400';
      case 'follow': return 'text-purple-400';
      case 'recast': return 'text-yellow-400';
      default: return 'text-white';
    }
  };

  return (
    <div class="live-activity-pulse mb-6">
      <Show
        when={!props.isLoading && props.activities.length > 0}
        fallback={
          <div class="pulse-skeleton bg-gradient-to-r from-slate-800/60 to-slate-700/40 border-2 border-yellow-400/30 rounded-xl p-4">
            <div class="flex items-center gap-4">
              <div class="w-3 h-3 bg-yellow-400/40 rounded-full animate-pulse"></div>
              <div class="flex-1 space-y-2">
                <div class="h-4 bg-yellow-400/20 rounded w-1/3"></div>
                <div class="h-3 bg-yellow-400/20 rounded w-3/4"></div>
              </div>
            </div>
          </div>
        }
      >
        <div 
          class="pulse-bar bg-gradient-to-r from-slate-900/80 to-black/80 border-2 border-yellow-400/40 rounded-xl p-4 relative overflow-hidden cursor-pointer"
          onClick={() => setIsAutoScrolling(!isAutoScrolling())}
        >
          {/* Animated background pulse */}
          <div class="absolute inset-0 bg-gradient-to-r from-yellow-400/5 to-transparent animate-pulse"></div>
          
          <div class="relative z-10 flex items-center gap-4">
            {/* Live indicator */}
            <div class="flex items-center gap-2 flex-shrink-0">
              <div class="w-3 h-3 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full shadow-lg shadow-yellow-400/50">
                <div class="w-3 h-3 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full animate-ping opacity-40"></div>
              </div>
              <span class="text-yellow-400 font-mono text-sm font-bold uppercase tracking-wide">
                LIVE
              </span>
            </div>

            {/* Activity counter */}
            <div class="flex items-center gap-4 text-sm font-mono text-yellow-300/80">
              <span>{props.activities.length} people active</span>
              <span>•</span>
              <span>{props.activities.filter(a => a.type === 'share').length} sharing</span>
              <span>•</span>
              <span>{props.activities.filter(a => a.type === 'reply').length} replying</span>
            </div>

            {/* Current activity display */}
            <Show when={props.activities.length > 0}>
              <div class="flex-1 min-w-0">
                <div class="activity-ticker relative h-8 overflow-hidden">
                  <For each={props.activities}>
                    {(activity, index) => (
                      <div
                        class={`activity-item absolute inset-0 flex items-center gap-3 transition-transform duration-500 ease-in-out ${
                          index() === currentActivityIndex() 
                            ? 'translate-x-0 opacity-100' 
                            : index() === currentActivityIndex() - 1 || (currentActivityIndex() === 0 && index() === props.activities.length - 1)
                              ? '-translate-x-full opacity-0'
                              : 'translate-x-full opacity-0'
                        }`}
                      >
                        {/* Activity icon */}
                        <i class={`${getActivityIcon(activity.type)} ${getActivityColor(activity.type)} text-sm`}></i>
                        
                        {/* User avatar */}
                        <img 
                          src={activity.user.avatar} 
                          alt={activity.user.displayName}
                          class="w-6 h-6 rounded-full border border-yellow-400/30"
                        />
                        
                        {/* Activity text */}
                        <div class="flex items-center gap-2 text-white/90 text-sm min-w-0">
                          <span class="font-medium text-yellow-300">@{activity.user.username}</span>
                          <span class="truncate">{getActivityText(activity)}</span>
                          <span class="text-yellow-400/60 text-xs flex-shrink-0">• {activity.timeAgo}</span>
                        </div>
                      </div>
                    )}
                  </For>
                </div>
              </div>
            </Show>

            {/* Manual navigation dots */}
            <Show when={props.activities.length > 1}>
              <div class="flex items-center gap-1 flex-shrink-0">
                <For each={props.activities}>
                  {(_, index) => (
                    <button
                      class={`w-2 h-2 rounded-full transition-all duration-200 ${
                        index() === currentActivityIndex()
                          ? 'bg-yellow-400 shadow-lg shadow-yellow-400/50'
                          : 'bg-yellow-400/30 hover:bg-yellow-400/50'
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentActivityIndex(index());
                        setIsAutoScrolling(false);
                      }}
                    />
                  )}
                </For>
              </div>
            </Show>

            {/* Auto-scroll indicator */}
            <div class="flex items-center gap-2 text-yellow-400/60 text-xs flex-shrink-0">
              <i class={`fas ${isAutoScrolling() ? 'fa-play' : 'fa-pause'}`}></i>
              <span class="hidden md:inline">
                {isAutoScrolling() ? 'Auto' : 'Paused'}
              </span>
            </div>
          </div>

          {/* Subtle animated border */}
          <div class="absolute inset-0 rounded-xl border-2 border-transparent bg-gradient-to-r from-yellow-400/20 via-transparent to-yellow-400/20 bg-clip-border opacity-50"></div>
        </div>
      </Show>
    </div>
  );
};

export default LiveActivityPulse;