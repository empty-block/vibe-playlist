import { Component, createSignal, onMount, createEffect } from 'solid-js';
import { Show } from 'solid-js';
import RetroTooltip from '../../ui/RetroTooltip';

interface TrackMetadataProps {
  title: string;
  artist: string;
  layout?: 'stacked' | 'inline';
  className?: string;
}

const TrackMetadata: Component<TrackMetadataProps> = (props) => {
  const [isTitleTruncated, setIsTitleTruncated] = createSignal(false);
  const [isArtistTruncated, setIsArtistTruncated] = createSignal(false);

  let titleRef: HTMLDivElement | undefined;
  let artistRef: HTMLDivElement | undefined;

  const layout = () => props.layout || 'stacked';

  const checkTruncation = () => {
    if (titleRef) {
      setIsTitleTruncated(titleRef.scrollWidth > titleRef.clientWidth);
    }
    if (artistRef) {
      setIsArtistTruncated(artistRef.scrollWidth > artistRef.clientWidth);
    }
  };

  onMount(() => {
    checkTruncation();
    window.addEventListener('resize', checkTruncation);
    return () => window.removeEventListener('resize', checkTruncation);
  });

  createEffect(() => {
    props.title;
    props.artist;
    setTimeout(checkTruncation, 0);
  });

  const containerClass = () => {
    return layout() === 'inline'
      ? `flex items-center gap-2 ${props.className || ''}`
      : `flex flex-col gap-1 ${props.className || ''}`;
  };

  return (
    <div class={containerClass()}>
      {/* Title */}
      <Show
        when={isTitleTruncated()}
        fallback={
          <div ref={titleRef} class="retro-track-title text-sm font-bold truncate">
            {props.title}
          </div>
        }
      >
        <RetroTooltip content={props.title} delay={200}>
          <div ref={titleRef} class="retro-track-title text-sm font-bold truncate cursor-help">
            {props.title}
          </div>
        </RetroTooltip>
      </Show>

      {/* Artist */}
      <Show
        when={isArtistTruncated()}
        fallback={
          <div ref={artistRef} class="retro-track-artist text-xs truncate">
            {props.artist}
          </div>
        }
      >
        <RetroTooltip content={props.artist} delay={200}>
          <div ref={artistRef} class="retro-track-artist text-xs truncate cursor-help">
            {props.artist}
          </div>
        </RetroTooltip>
      </Show>
    </div>
  );
};

export default TrackMetadata;