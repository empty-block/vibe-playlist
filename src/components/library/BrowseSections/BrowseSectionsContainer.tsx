import { Component, Show, createMemo } from 'solid-js';
import { Track } from '../../../stores/playlistStore';
import { PersonalTrack } from '../LibraryTable';
import ArtistBrowseSection from './ArtistBrowseSection';
import GenreBrowseSection from './GenreBrowseSection';
import { extractArtistsFromTracks, extractGenresFromTracks } from './utils/browseDataExtractors';

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
  // Extract artist and genre data from tracks
  const artistsData = createMemo(() => extractArtistsFromTracks(props.tracks));
  const genresData = createMemo(() => extractGenresFromTracks(props.tracks));

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
          artists={artistsData()}
          selectedArtist={props.filters.selectedArtist}
          onArtistSelect={handleArtistSelect}
          isLoading={props.isLoading}
        />
        
        <GenreBrowseSection
          genres={genresData()}
          selectedGenre={props.filters.selectedGenre}
          onGenreSelect={handleGenreSelect}
          isLoading={props.isLoading}
        />
      </div>
    </Show>
  );
};

export default BrowseSectionsContainer;