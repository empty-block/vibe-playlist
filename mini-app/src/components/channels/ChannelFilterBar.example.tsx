/**
 * Example usage of ChannelFilterBar component
 * This demonstrates how to integrate the filter bar into a channel feed page
 */

import { Component, createSignal } from 'solid-js';
import { ChannelFilterBar } from './ChannelFilterBar';
import type { ChannelFeedSortOption, MusicPlatform } from '../../../../shared/types/channels';

export const ChannelFilterBarExample: Component = () => {
  // Sort state
  const [activeSort, setActiveSort] = createSignal<ChannelFeedSortOption>('recent');

  // Filter states
  const [qualityFilter, setQualityFilter] = createSignal(0);
  const [musicSources, setMusicSources] = createSignal<MusicPlatform[]>([]);
  const [genres, setGenres] = createSignal<string[]>([]);

  // Available options (these would typically come from API/props)
  const availablePlatforms: MusicPlatform[] = [
    'spotify',
    'youtube',
    'apple_music',
    'soundcloud',
    'bandcamp',
  ];

  const availableGenres = [
    'Rock',
    'Pop',
    'Hip Hop',
    'Electronic',
    'Jazz',
    'Classical',
    'R&B',
    'Country',
    'Metal',
    'Indie',
  ];

  // Handler for when filters change - this would trigger API refetch
  const handleFilterChange = () => {
    console.log('Filters changed:', {
      sort: activeSort(),
      quality: qualityFilter(),
      sources: musicSources(),
      genres: genres(),
    });
    // In real implementation:
    // refetchChannelFeed({
    //   sort: activeSort(),
    //   minLikes: qualityFilter(),
    //   musicSources: musicSources(),
    //   genres: genres(),
    // });
  };

  return (
    <div style={{ padding: '20px', background: '#0f0f0f', min-height: '100vh' }}>
      <h1
        style={{
          color: '#00f92a',
          'font-family': 'monospace',
          'text-align': 'center',
          'margin-bottom': '32px',
        }}
      >
        Channel Filter Bar Example
      </h1>

      <ChannelFilterBar
        // Sort
        activeSort={activeSort()}
        onSortChange={(sort) => {
          setActiveSort(sort);
          handleFilterChange();
        }}
        // Filters
        qualityFilter={qualityFilter()}
        onQualityFilterChange={(minLikes) => {
          setQualityFilter(minLikes);
          handleFilterChange();
        }}
        musicSources={musicSources()}
        onMusicSourcesChange={(sources) => {
          setMusicSources(sources);
          handleFilterChange();
        }}
        genres={genres()}
        onGenresChange={(newGenres) => {
          setGenres(newGenres);
          handleFilterChange();
        }}
        // Available options
        availablePlatforms={availablePlatforms}
        availableGenres={availableGenres}
      />

      {/* Debug output */}
      <div
        style={{
          'margin-top': '40px',
          padding: '20px',
          background: 'rgba(0, 249, 42, 0.1)',
          border: '1px solid rgba(0, 249, 42, 0.3)',
          color: '#00f92a',
          'font-family': 'monospace',
          'font-size': '12px',
        }}
      >
        <h3>Current Filter State:</h3>
        <pre style={{ 'white-space': 'pre-wrap' }}>
          {JSON.stringify(
            {
              sort: activeSort(),
              qualityFilter: qualityFilter(),
              musicSources: musicSources(),
              genres: genres(),
            },
            null,
            2
          )}
        </pre>
      </div>
    </div>
  );
};
