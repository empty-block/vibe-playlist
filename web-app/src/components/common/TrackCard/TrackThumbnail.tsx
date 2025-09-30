import { Component, createSignal, Show, JSX } from 'solid-js';

interface TrackThumbnailProps {
  src: string;
  alt: string;
  size?: 'small' | 'medium' | 'large';
  showPlayButton?: boolean;
  onPlay?: () => void;
  children?: JSX.Element;
  className?: string;
}

const TrackThumbnail: Component<TrackThumbnailProps> = (props) => {
  const [imageLoaded, setImageLoaded] = createSignal(false);
  const [imageError, setImageError] = createSignal(false);
  const [isHovered, setIsHovered] = createSignal(false);

  const size = () => props.size || 'medium';

  const getSizeClasses = () => {
    switch (size()) {
      case 'small':
        return 'w-16 h-16';
      case 'large':
        return 'w-26 h-26';
      case 'medium':
      default:
        return 'w-20 h-20';
    }
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(true);
  };

  const handlePlayClick = (e: MouseEvent) => {
    e.stopPropagation();
    props.onPlay?.();
  };

  return (
    <div
      class={`relative ${getSizeClasses()} rounded-lg overflow-hidden ${props.className || ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Loading skeleton */}
      <Show when={!imageLoaded()}>
        <div class="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 animate-pulse" />
      </Show>

      {/* Image */}
      <Show when={!imageError()} fallback={
        <div class="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 flex items-center justify-center">
          <span class="text-2xl">🎵</span>
        </div>
      }>
        <img
          src={props.src}
          alt={props.alt}
          class="w-full h-full object-cover"
          loading="lazy"
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
      </Show>

      {/* Play button overlay */}
      <Show when={props.showPlayButton && (isHovered() || props.onPlay)}>
        <div class="absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity">
          <button
            onClick={handlePlayClick}
            class="w-10 h-10 rounded-full bg-cyan-400/20 border-2 border-cyan-400 text-cyan-400 flex items-center justify-center hover:bg-cyan-400/30 hover:scale-110 transition-all"
            aria-label="Play track"
          >
            <span class="text-lg">▶</span>
          </button>
        </div>
      </Show>

      {/* Children (e.g., PlatformBadge overlay) */}
      {props.children}
    </div>
  );
};

export default TrackThumbnail;