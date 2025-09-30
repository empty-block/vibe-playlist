import { Component } from 'solid-js';
import { TrackSource } from '../../../stores/playerStore';

interface PlatformBadgeProps {
  source: TrackSource;
  variant?: 'overlay' | 'inline' | 'compact';
  className?: string;
}

const PlatformBadge: Component<PlatformBadgeProps> = (props) => {
  const variant = () => props.variant || 'inline';

  const getPlatformIcon = (source: TrackSource) => {
    switch (source) {
      case 'youtube':
        return '📺';
      case 'spotify':
        return '🟢';
      case 'soundcloud':
        return '🧡';
      case 'bandcamp':
        return '🔵';
      default:
        return '🎵';
    }
  };

  const getPlatformClass = (source: TrackSource) => {
    switch (source) {
      case 'youtube':
        return 'bg-red-500/20 border-red-500/40 text-red-400';
      case 'spotify':
        return 'bg-green-500/20 border-green-500/40 text-green-400';
      case 'soundcloud':
        return 'bg-[#e010e0]/20 border-[#e010e0]/40 text-[#e010e0]';
      case 'bandcamp':
        return 'bg-blue-500/20 border-blue-500/40 text-blue-400';
      default:
        return 'bg-gray-500/20 border-gray-500/40 text-gray-400';
    }
  };

  const baseClasses = () => {
    const classes = [getPlatformClass(props.source), props.className];

    switch (variant()) {
      case 'overlay':
        return [...classes, 'absolute top-1 right-1 px-1.5 py-0.5 rounded text-xs border font-semibold z-10'].join(' ');
      case 'compact':
        return [...classes, 'inline-flex items-center justify-center w-5 h-5 rounded border text-xs'].join(' ');
      case 'inline':
      default:
        return [...classes, 'inline-flex items-center gap-1 px-2 py-1 rounded border text-xs font-semibold'].join(' ');
    }
  };

  return (
    <div class={baseClasses()}>
      <span>{getPlatformIcon(props.source)}</span>
      {variant() === 'inline' && (
        <span class="capitalize">{props.source}</span>
      )}
    </div>
  );
};

export default PlatformBadge;