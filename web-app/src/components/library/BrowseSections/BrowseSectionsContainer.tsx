import { Component, Show, createMemo, createEffect } from 'solid-js';
import { Track } from '../../../stores/playerStore';
import { PersonalTrack } from '../../../types/library';
import ArtistBrowseSection from './ArtistBrowseSection';
import GenreBrowseSection from './GenreBrowseSection';
import { extractArtistsFromTracks, extractGenresFromTracks } from './utils/browseDataExtractors';
import { artistsData, genresData, loadAggregations, isLoadingAggregations } from '../../../stores/libraryAggregationsStore';

// Remove local LibraryFilters interface - use the one from libraryStore

interface BrowseSectionsContainerProps {
  tracks: (Track | PersonalTrack)[];
  // NEW: Use store filters directly
  selectedArtist: string | null;
  selectedGenre: string | null;
  onArtistSelect: (artist: string | null) => void;
  onGenreSelect: (genre: string | null) => void;
  isLoading?: boolean;
  showBrowseSections?: boolean;
}

const BrowseSectionsContainer: Component<BrowseSectionsContainerProps> = (props) => {
  // Load aggregations on mount and when filters change
  createEffect(() => {
    loadAggregations();
  });

  // Fallback to client-side extraction if aggregations aren't loaded yet
  const fallbackArtistsData = createMemo(() => extractArtistsFromTracks(props.tracks));
  const fallbackGenresData = createMemo(() => extractGenresFromTracks(props.tracks));

  // Use store data if available, otherwise fall back to client-side extraction
  const finalArtistsData = createMemo(() => {
    const storeData = artistsData();
    return storeData.length > 0 ? storeData : fallbackArtistsData();
  });

  const finalGenresData = createMemo(() => {
    const storeData = genresData();
    return storeData.length > 0 ? storeData : fallbackGenresData();
  });

  // Remove local state management - delegate to parent
  const handleArtistSelect = (artist: string | null) => {
    props.onArtistSelect(artist);
  };

  const handleGenreSelect = (genre: string | null) => {
    props.onGenreSelect(genre);
  };

  return (
    <Show when={props.showBrowseSections !== false}>
      <div class="browse-sections-container">
        <ArtistBrowseSection
          artists={finalArtistsData()}
          selectedArtist={props.selectedArtist}
          onArtistSelect={handleArtistSelect}
          isLoading={props.isLoading || isLoadingAggregations()}
        />
        
        <GenreBrowseSection
          genres={finalGenresData()}
          selectedGenre={props.selectedGenre}
          onGenreSelect={handleGenreSelect}
          isLoading={props.isLoading || isLoadingAggregations()}
        />
      </div>
    </Show>
  );
};

export default BrowseSectionsContainer;