import { Component, createEffect, onMount, createSignal } from 'solid-js';
import { currentTrack, setCurrentTrack, Track } from '../../stores/playerStore';
import { resolveOdesliUrl, OdesliResolution } from '../../services/odesliResolver';

interface SonglinkMediaProps {
  onPlayerReady: (ready: boolean) => void;
  onTogglePlay: (toggleFn: () => void) => void;
  onSeek?: (seekFn: (time: number) => void) => void;
  onPlaybackStarted?: (hasStarted: boolean) => void;
  onPause?: (pauseFn: () => void) => void;
}

const SonglinkMedia: Component<SonglinkMediaProps> = (props) => {
  const [resolution, setResolution] = createSignal<OdesliResolution | null>(null);
  const [isResolving, setIsResolving] = createSignal(true);
  const [error, setError] = createSignal<string | null>(null);

  onMount(() => {
    console.log('[SonglinkMedia] Component mounted');
    props.onPlayerReady(false); // Not ready until resolved
  });

  // Resolve song.link URL to playable platform
  createEffect(() => {
    const track = currentTrack();
    if (!track || track.source !== 'songlink') {
      return;
    }

    console.log('[SonglinkMedia] Resolving song.link URL:', track.url);
    setIsResolving(true);
    setError(null);

    // Use track.url if available, otherwise construct from sourceId
    const urlToResolve = track.url || `https://song.link/${track.sourceId}`;

    resolveOdesliUrl(urlToResolve)
      .then((resolved) => {
        console.log('[SonglinkMedia] Resolution result:', resolved);
        setResolution(resolved);
        setIsResolving(false);

        if (resolved.platform && resolved.platformId) {
          // Successfully resolved - update track to use resolved platform
          const updatedTrack: Track = {
            ...track,
            source: resolved.platform,
            sourceId: resolved.platformId,
            originalSource: 'songlink', // Remember it came from song.link
            // Update metadata if we got better info from Odesli
            title: resolved.title || track.title,
            artist: resolved.artist || track.artist,
            thumbnail: resolved.thumbnail || track.thumbnail
          };

          console.log('[SonglinkMedia] Updating track to:', updatedTrack);
          setCurrentTrack(updatedTrack);
          props.onPlayerReady(true);
        } else {
          // Resolution failed
          const errorMsg = resolved.error || 'Could not resolve to a supported platform';
          console.error('[SonglinkMedia]', errorMsg);
          setError(errorMsg);
          props.onPlayerReady(false);
        }
      })
      .catch((err) => {
        const errorMsg = `Resolution error: ${err.message}`;
        console.error('[SonglinkMedia]', errorMsg);
        setError(errorMsg);
        setIsResolving(false);
        props.onPlayerReady(false);
      });
  });

  return (
    <div class="flex flex-col items-center justify-center w-full h-full p-4 text-center">
      {isResolving() ? (
        <div class="space-y-3">
          <div class="text-jamzy-pink text-lg font-bold animate-pulse">
            Resolving track...
          </div>
          <div class="text-gray-400 text-sm">
            Finding best available platform
          </div>
        </div>
      ) : error() ? (
        <div class="space-y-3">
          <div class="text-jamzy-pink text-lg font-bold">
            ⚠️ Resolution Failed
          </div>
          <div class="text-gray-400 text-sm max-w-md">
            {error()}
          </div>
          {currentTrack()?.url && (
            <a
              href={currentTrack()!.url}
              target="_blank"
              rel="noopener noreferrer"
              class="inline-block mt-4 px-4 py-2 bg-jamzy-pink text-black font-bold rounded hover:bg-pink-400 transition-colors"
            >
              Open in Song.link
            </a>
          )}
        </div>
      ) : (
        <div class="text-gray-400 text-sm">
          Preparing playback...
        </div>
      )}
    </div>
  );
};

export default SonglinkMedia;
