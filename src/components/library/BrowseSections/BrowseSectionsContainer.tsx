import { Component, Show, createMemo, createEffect } from 'solid-js';
import { Track } from '../../../stores/playerStore';
import { PersonalTrack } from '../LibraryTable';
import ArtistBrowseSection from './ArtistBrowseSection';
import GenreBrowseSection from './GenreBrowseSection';
import { extractArtistsFromTracks, extractGenresFromTracks } from './utils/browseDataExtractors';
import { artistsData, genresData, loadAggregations, isLoadingAggregations } from '../../../stores/libraryAggregationsStore';

export interface LibraryFilters {
  selectedArtist: string | null;
  selectedGenre: string | null;
  searchQuery: string;
  personalFilter: string;
}

interface BrowseSectionsContainerProps {
  tracks: (Track | PersonalTrack)[];
  filters: LibraryFilters;
  onFiltersChange: (filters: Partial<LibraryFilters>) => void;
  isLoading?: boolean;
  // Show/hide control for mobile
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

  const handleArtistSelect = (artist: string | null) => {
    props.onFiltersChange({ selectedArtist: artist });
  };

  const handleGenreSelect = (genre: string | null) => {
    props.onFiltersChange({ selectedGenre: genre });
  };

  return (
    <Show when={props.showBrowseSections !== false}>
      <div class="browse-sections-container">
        <ArtistBrowseSection
          artists={finalArtistsData()}
          selectedArtist={props.filters.selectedArtist}
          onArtistSelect={handleArtistSelect}
          isLoading={props.isLoading || isLoadingAggregations()}
        />
        
        <GenreBrowseSection
          genres={finalGenresData()}
          selectedGenre={props.filters.selectedGenre}
          onGenreSelect={handleGenreSelect}
          isLoading={props.isLoading || isLoadingAggregations()}
        />
      </div>
    </Show>
  );
};

export default BrowseSectionsContainer;