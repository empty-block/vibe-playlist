import { Component } from 'solid-js';
import { Playlist } from '../stores/playlistStore';

interface PlaylistHeaderProps {
  playlist: Playlist;
  onCreatorClick: (creatorUsername: string) => void;
}

const PlaylistHeader: Component<PlaylistHeaderProps> = (props) => {
  return (
    <div class="mb-4">
      <h1 class="text-2xl font-bold text-black mb-2">
        {props.playlist.icon} {props.playlist.name}
      </h1>
      <p class="text-sm text-gray-600 mb-4">
        {props.playlist.description}
      </p>
      
      <button
        onClick={() => console.log('Navigate to submit track page')}
        class="win95-button px-4 py-2 text-black font-bold text-sm mb-4"
        title="Add a track to this playlist"
      >
        <i class="fas fa-plus mr-2"></i>Submit Track
      </button>
    </div>
  );
};

export default PlaylistHeader;