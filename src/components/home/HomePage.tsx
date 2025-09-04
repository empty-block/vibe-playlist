import { Component, createSignal, onMount, Show } from 'solid-js';
import { isAuthenticated } from '../../stores/authStore';
import { pageEnter } from '../../utils/animations';
import './HomePage.css';

// Sub-components (will create next)
import { SplashContent } from './SplashContent';
import { PersonalizedContent } from './PersonalizedContent';

// Types for home page data
export interface Track {
  id: string;
  title: string;
  artist: string;
  source: string;
  thumbnail?: string;
  isNew?: boolean;
}

export interface Network {
  id: string;
  name: string;
  avatar: string;
  userCount: number;
  isActive: boolean;
  isNew?: boolean;
}

export interface UserConnection {
  id: string;
  username: string;
  avatar: string;
  musicMatch: number;
  recentlyPlayed?: string;
  isOnline: boolean;
  favoriteGenres: string[];
}

export interface Suggestion {
  id: string;
  type: 'trending' | 'ai-curated';
  title: string;
  description: string;
  reasoning?: string;
}

export interface HomePageData {
  recentlyPlayed: Track[];
  favoriteNetworks: Network[];
  favoriteArtists: Track[]; // Adding missing favoriteArtists
  topConnections: UserConnection[];
  discoveryStats: {
    newConnections: number;
    newTracks: number;
  } | null;
  suggestions: Suggestion[];
}

const HomePage: Component = () => {
  const [isLoading, setIsLoading] = createSignal(false);
  const [contentLoaded, setContentLoaded] = createSignal(false);
  let pageRef!: HTMLDivElement;

  // Consolidated personalized content state
  const [homePageData, setHomePageData] = createSignal<HomePageData>({
    recentlyPlayed: [],
    favoriteNetworks: [],
    favoriteArtists: [],
    topConnections: [],
    discoveryStats: null,
    suggestions: []
  });

  onMount(() => {
    // Initialize page animations
    if (pageRef) {
      pageEnter(pageRef);
    }

    // Load personalized content if authenticated
    if (isAuthenticated()) {
      loadPersonalizedContent();
    }
  });

  const loadPersonalizedContent = async () => {
    setIsLoading(true);
    
    // Load all data in parallel and update single state
    const [recentlyPlayed, favoriteNetworks, topConnections, suggestions] = 
      await Promise.all([
        loadRecentlyPlayed(),
        loadFavoriteNetworks(), 
        loadTopConnections(),
        loadDiscoverySuggestions()
      ]);
    
    setHomePageData({
      recentlyPlayed,
      favoriteNetworks,
      favoriteArtists: recentlyPlayed.slice(0, 6), // Use top 6 recently played as favorite artists for now
      topConnections,
      discoveryStats: { 
        newConnections: favoriteNetworks.filter(n => n.isNew).length,
        newTracks: recentlyPlayed.filter(t => t.isNew).length 
      },
      suggestions
    });
    
    setContentLoaded(true);
    setIsLoading(false);
  };

  // Mock data loading functions (replace with real API calls)
  const loadRecentlyPlayed = async (): Promise<Track[]> => {
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
    return [
      {
        id: '1',
        title: 'Purple Haze',
        artist: 'Jimi Hendrix',
        source: 'spotify',
        thumbnail: 'https://i.scdn.co/image/ab67616d0000b273e8b066f70c206551210d902b',
        isNew: true
      },
      {
        id: '2',
        title: 'Hotel California',
        artist: 'Eagles',
        source: 'youtube',
        thumbnail: 'https://img.youtube.com/vi/BciS5krYL80/mqdefault.jpg'
      },
      {
        id: '3',
        title: 'Bohemian Rhapsody',
        artist: 'Queen',
        source: 'spotify',
        thumbnail: 'https://i.scdn.co/image/ab67616d0000b273ce4f1737bc8a646c8c4bd25a'
      },
      {
        id: '4',
        title: 'Stairway to Heaven',
        artist: 'Led Zeppelin',
        source: 'youtube',
        thumbnail: 'https://img.youtube.com/vi/QkF3oxziUI4/mqdefault.jpg',
        isNew: true
      },
      {
        id: '5',
        title: 'Black',
        artist: 'Pearl Jam',
        source: 'spotify',
        thumbnail: 'https://i.scdn.co/image/ab67616d0000b273a8b7298a7ebe0b5a3ea64c6e'
      },
      {
        id: '6',
        title: 'Thunderstruck',
        artist: 'AC/DC',
        source: 'youtube',
        thumbnail: 'https://img.youtube.com/vi/v2AC41dglnM/mqdefault.jpg'
      },
      {
        id: '7',
        title: 'Sweet Child O Mine',
        artist: 'Guns N Roses',
        source: 'spotify',
        thumbnail: 'https://i.scdn.co/image/ab67616d0000b273b9dd0dc74f86b5bef1ad9e90',
        isNew: true
      },
      {
        id: '8',
        title: 'Smells Like Teen Spirit',
        artist: 'Nirvana',
        source: 'youtube',
        thumbnail: 'https://img.youtube.com/vi/hTWKbfoikeg/mqdefault.jpg'
      },
      {
        id: '9',
        title: 'Enter Sandman',
        artist: 'Metallica',
        source: 'spotify',
        thumbnail: 'https://i.scdn.co/image/ab67616d0000b273b7c24efcf38b1ec97edc4949'
      },
      {
        id: '10',
        title: 'Kashmir',
        artist: 'Led Zeppelin',
        source: 'youtube',
        thumbnail: 'https://img.youtube.com/vi/tzqAflS0Goo/mqdefault.jpg'
      },
      {
        id: '11',
        title: 'Paranoid',
        artist: 'Black Sabbath',
        source: 'spotify',
        thumbnail: 'https://i.scdn.co/image/ab67616d0000b273781c6b77e5b7acf85c8ad11e'
      },
      {
        id: '12',
        title: 'The Wall',
        artist: 'Pink Floyd',
        source: 'youtube',
        thumbnail: 'https://img.youtube.com/vi/YR5ApYxkU-U/mqdefault.jpg',
        isNew: true
      }
    ];
  };

  const loadFavoriteNetworks = async (): Promise<Network[]> => {
    await new Promise(resolve => setTimeout(resolve, 600));
    return [
      {
        id: 'classic-rock',
        name: 'Classic Rock',
        avatar: 'https://i.pravatar.cc/48?img=1',
        userCount: 1247,
        isActive: true,
        isNew: false
      },
      {
        id: 'indie-vibes',
        name: 'Indie Vibes',
        avatar: 'https://i.pravatar.cc/48?img=2',
        userCount: 892,
        isActive: false,
        isNew: true
      },
      {
        id: 'electronic',
        name: 'Electronic',
        avatar: 'https://i.pravatar.cc/48?img=3',
        userCount: 2156,
        isActive: true,
        isNew: false
      },
      {
        id: 'hip-hop',
        name: 'Hip Hop',
        avatar: 'https://i.pravatar.cc/48?img=4',
        userCount: 3421,
        isActive: true,
        isNew: false
      },
      {
        id: 'jazz-fusion',
        name: 'Jazz Fusion',
        avatar: 'https://i.pravatar.cc/48?img=5',
        userCount: 567,
        isActive: false,
        isNew: false
      },
      {
        id: 'metal',
        name: 'Metal',
        avatar: 'https://i.pravatar.cc/48?img=6',
        userCount: 1893,
        isActive: true,
        isNew: true
      },
      {
        id: 'synthwave',
        name: 'Synthwave',
        avatar: 'https://i.pravatar.cc/48?img=7',
        userCount: 1245,
        isActive: true,
        isNew: false
      },
      {
        id: 'folk-acoustic',
        name: 'Folk & Acoustic',
        avatar: 'https://i.pravatar.cc/48?img=8',
        userCount: 789,
        isActive: false,
        isNew: false
      }
    ];
  };

  const loadTopConnections = async (): Promise<UserConnection[]> => {
    await new Promise(resolve => setTimeout(resolve, 400));
    return [
      {
        id: 'user-1',
        username: 'rockgod87',
        avatar: 'https://i.pravatar.cc/150?img=1',
        musicMatch: 92,
        recentlyPlayed: 'Stairway to Heaven - Led Zeppelin',
        isOnline: true,
        favoriteGenres: ['Classic Rock', 'Progressive', 'Psychedelic']
      },
      {
        id: 'user-2',
        username: 'vinylheart',
        avatar: 'https://i.pravatar.cc/150?img=2',
        musicMatch: 87,
        recentlyPlayed: 'Wish You Were Here - Pink Floyd',
        isOnline: true,
        favoriteGenres: ['Rock', 'Blues', 'Folk']
      },
      {
        id: 'user-3',
        username: 'metalhead420',
        avatar: 'https://i.pravatar.cc/150?img=3',
        musicMatch: 84,
        recentlyPlayed: 'Master of Puppets - Metallica',
        isOnline: false,
        favoriteGenres: ['Metal', 'Thrash', 'Hard Rock']
      },
      {
        id: 'user-4',
        username: 'grungequeen',
        avatar: 'https://i.pravatar.cc/150?img=4',
        musicMatch: 78,
        recentlyPlayed: 'Black - Pearl Jam',
        isOnline: true,
        favoriteGenres: ['Grunge', 'Alternative', 'Indie']
      },
      {
        id: 'user-5',
        username: 'psychsoul',
        avatar: 'https://i.pravatar.cc/150?img=5',
        musicMatch: 75,
        isOnline: false,
        favoriteGenres: ['Psychedelic', 'Soul', 'Funk']
      },
      {
        id: 'user-6',
        username: 'bluesmaster',
        avatar: 'https://i.pravatar.cc/150?img=6',
        musicMatch: 71,
        recentlyPlayed: 'The Thrill Is Gone - B.B. King',
        isOnline: true,
        favoriteGenres: ['Blues', 'Jazz', 'Soul']
      }
    ];
  };

  const loadDiscoverySuggestions = async (): Promise<Suggestion[]> => {
    await new Promise(resolve => setTimeout(resolve, 700));
    return [
      {
        id: '1',
        type: 'trending',
        title: 'Psychedelic Rock Revival',
        description: 'Trending in your Classic Rock network',
        reasoning: 'Based on your Hendrix listening patterns'
      },
      {
        id: '2',
        type: 'ai-curated',
        title: 'Deep Cuts for You',
        description: 'AI-curated based on your taste profile',
        reasoning: 'Matches your progressive rock preference'
      },
      {
        id: '3',
        type: 'trending',
        title: 'Grunge Renaissance',
        description: 'Popular in your Alternative Rock circles',
        reasoning: 'Similar to your Pearl Jam and Nirvana plays'
      },
      {
        id: '4',
        type: 'ai-curated',
        title: 'Hidden Metal Gems',
        description: 'Underground tracks matching your taste',
        reasoning: 'Based on your Metallica and Black Sabbath history'
      },
      {
        id: '5',
        type: 'trending',
        title: 'Classic Blues Rock',
        description: 'Rising in popularity across networks',
        reasoning: 'Complements your Led Zeppelin preferences'
      }
    ];
  };

  return (
    <div ref={pageRef} class="home-container">
      <Show 
        when={isAuthenticated()}
        fallback={<SplashContent />}
      >
        <PersonalizedContent 
          data={homePageData()} 
          loading={isLoading()}
          contentLoaded={contentLoaded()}
        />
      </Show>
    </div>
  );
};

export default HomePage;