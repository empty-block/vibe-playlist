import { Track } from '../../../../stores/playerStore';
import { PersonalTrack } from '../../LibraryTable';

// Types for browse data
export interface ArtistData {
  name: string;
  count: number;
}

export interface GenreData {
  name: string;
  count: number;
}

/**
 * Extract artists from tracks with count information
 * Sorted by count (most popular first)
 */
export const extractArtistsFromTracks = (tracks: (Track | PersonalTrack)[]): ArtistData[] => {
  const artistMap = new Map<string, number>();
  
  tracks.forEach(track => {
    const artist = track.artist.trim();
    if (artist) {
      const count = artistMap.get(artist) || 0;
      artistMap.set(artist, count + 1);
    }
  });

  return Array.from(artistMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count); // Sort by count descending
};

/**
 * Extract genres from track tags with count information
 * Sorted by count (most popular first)
 */
export const extractGenresFromTracks = (tracks: (Track | PersonalTrack)[]): GenreData[] => {
  const genreMap = new Map<string, number>();
  
  tracks.forEach(track => {
    if (track.tags && track.tags.length > 0) {
      track.tags.forEach(tag => {
        const genre = tag.trim();
        if (genre) {
          const count = genreMap.get(genre) || 0;
          genreMap.set(genre, count + 1);
        }
      });
    } else {
      // Fallback: derive genres from artist/title if no tags available
      const derivedGenres = deriveGenresFromTrack(track);
      derivedGenres.forEach(genre => {
        const count = genreMap.get(genre) || 0;
        genreMap.set(genre, count + 1);
      });
    }
  });

  return Array.from(genreMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count); // Sort by count descending
};

/**
 * Derive genres from track data when tags are not available
 * This is a fallback mechanism to ensure we always have some genre data
 */
const deriveGenresFromTrack = (track: Track | PersonalTrack): string[] => {
  const artist = track.artist.toLowerCase();
  const title = track.title.toLowerCase();
  const derivedGenres: string[] = [];

  // Genre detection patterns (simplified)
  const genrePatterns = {
    'Hip Hop': ['hip', 'rap', 'trap', 'beats'],
    'Electronic': ['electr', 'synth', 'house', 'techno', 'edm', 'ambient'],
    'Indie': ['indie'],
    'Rock': ['rock'],
    'Metal': ['metal', 'thrash', 'death', 'black'],
    'Pop': ['pop'],
    'Jazz': ['jazz'],
    'Classical': ['classical', 'symphony', 'orchestra'],
    'Blues': ['blues'],
    'Folk': ['folk', 'acoustic'],
    'Reggae': ['reggae', 'ska'],
    'Punk': ['punk'],
    'Funk': ['funk'],
    'Soul': ['soul'],
    'R&B': ['r&b', 'rnb'],
    'Alternative': ['alternative', 'alt'],
    'Grunge': ['grunge'],
    'Progressive': ['progressive', 'prog'],
    'Experimental': ['experimental', 'avant']
  };

  // Check each pattern against artist and title
  Object.entries(genrePatterns).forEach(([genre, patterns]) => {
    const hasMatch = patterns.some(pattern => 
      artist.includes(pattern) || title.includes(pattern)
    );
    if (hasMatch) {
      derivedGenres.push(genre);
    }
  });

  // Default fallback
  if (derivedGenres.length === 0) {
    derivedGenres.push('Other');
  }

  return derivedGenres;
};

/**
 * Filter tracks by selected artist
 */
export const filterTracksByArtist = (
  tracks: (Track | PersonalTrack)[], 
  selectedArtist: string | null
): (Track | PersonalTrack)[] => {
  if (!selectedArtist) {
    return tracks;
  }
  
  return tracks.filter(track => track.artist === selectedArtist);
};

/**
 * Filter tracks by selected genre
 */
export const filterTracksByGenre = (
  tracks: (Track | PersonalTrack)[], 
  selectedGenre: string | null
): (Track | PersonalTrack)[] => {
  if (!selectedGenre) {
    return tracks;
  }
  
  return tracks.filter(track => {
    if (track.tags && track.tags.length > 0) {
      return track.tags.includes(selectedGenre);
    } else {
      // Fallback to derived genres
      const derivedGenres = deriveGenresFromTrack(track);
      return derivedGenres.includes(selectedGenre);
    }
  });
};

/**
 * Get combined artist and genre filter statistics
 */
export const getBrowseFilterStats = (tracks: (Track | PersonalTrack)[]) => {
  return {
    totalTracks: tracks.length,
    totalArtists: extractArtistsFromTracks(tracks).length,
    totalGenres: extractGenresFromTracks(tracks).length
  };
};