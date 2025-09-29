import { Component, For, Show } from 'solid-js';
import type { Track } from '../HomePage';
import { HeroTrackCard } from '../../common/TrackCard/NEW';
import { setCurrentTrack, setIsPlaying } from '../../../stores/playerStore';
import type { Track as PlayerTrack } from '../../../stores/playerStore';

interface NewTracksSectionProps {
  tracks: Track[];
  loading: boolean;
}

export const NewTracksSection: Component<NewTracksSectionProps> = (props) => {
  const newTracks = () => props.tracks.filter(track => track.isNew);

  const handleTrackClick = (track: Track) => {
    console.log('Playing track:', track.title);
    // Convert HomePage Track to PlayerTrack format
    const playerTrack: PlayerTrack = {
      ...track,
      source: track.source as any, // Type assertion for source
      sourceId: track.id,
      duration: '0:00',
      thumbnail: track.thumbnail || '',
      addedBy: 'Network',
      userAvatar: '',
      timestamp: new Date().toISOString(),
      comment: '',
      likes: 0,
      replies: 0,
      recasts: 0
    };
    setCurrentTrack(playerTrack);
    setIsPlaying(true);
  };

  const handleKeyPress = (e: KeyboardEvent, track: Track) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleTrackClick(track);
    }
  };

  return (
    <section class="new-tracks-section">
      <div class="section-header">
        <h2 class="section-title">
          <span class="terminal-prompt">[NEW_TRACKS]$</span>
          Latest Discoveries
        </h2>
        <Show when={newTracks().length > 0}>
          <span class="track-count">{newTracks().length} new</span>
        </Show>
      </div>

      <Show
        when={!props.loading && newTracks().length > 0}
        fallback={
          <Show when={props.loading}>
            <div class="new-tracks-grid">
              <For each={[1, 2, 3, 4]}>
                {() => (
                  <div class="new-track-card skeleton">
                    <div class="track-thumbnail-skeleton"></div>
                    <div class="track-info-skeleton">
                      <div class="title-skeleton"></div>
                      <div class="artist-skeleton"></div>
                    </div>
                  </div>
                )}
              </For>
            </div>
          </Show>
        }
      >
        <div class="new-tracks-grid">
          <For each={newTracks()}>
            {(track) => {
              // Convert HomePage Track to PlayerTrack format for HeroTrackCard
              const playerTrack: PlayerTrack = {
                ...track,
                source: track.source as any,
                sourceId: track.id,
                duration: '0:00',
                thumbnail: track.thumbnail || '',
                addedBy: 'Network',
                userAvatar: '',
                timestamp: new Date().toISOString(),
                comment: '',
                likes: 0,
                replies: 0,
                recasts: 0
              };

              return (
                <HeroTrackCard
                  track={playerTrack}
                  onPlay={handleTrackClick}
                  onLike={() => {}}
                  onReply={() => {}}
                  showSocialContext={false}
                />
              );
            }}
          </For>
        </div>
      </Show>

      <Show when={!props.loading && newTracks().length === 0}>
        <div class="empty-state">
          <div class="empty-icon">🎵</div>
          <p class="empty-text">No new tracks discovered yet</p>
          <p class="empty-subtext">Connect to more networks to discover music</p>
        </div>
      </Show>
    </section>
  );
};