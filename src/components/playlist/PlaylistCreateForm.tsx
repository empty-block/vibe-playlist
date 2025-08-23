import { Component, createSignal } from 'solid-js';
import TextInput from '../common/TextInput';
import AnimatedButton from '../common/AnimatedButton';

export type PlaylistType = 'personal' | 'collaborative' | 'ai_curated';

interface PlaylistCreateFormProps {
  onCreatePlaylist: (name: string, type: PlaylistType) => void;
  disabled?: boolean;
}

const PlaylistCreateForm: Component<PlaylistCreateFormProps> = (props) => {
  const [playlistName, setPlaylistName] = createSignal('');
  const [playlistType, setPlaylistType] = createSignal<PlaylistType>('collaborative');

  const handleSubmit = () => {
    if (!playlistName().trim()) return;
    
    props.onCreatePlaylist(playlistName().trim(), playlistType());
    
    // Reset form
    setPlaylistName('');
    setPlaylistType('collaborative');
  };

  const isValidSubmission = () => {
    return playlistName().trim().length > 0;
  };

  return (
    <div class="win95-panel mb-6 p-6">
      <h2 class="text-xl font-bold text-black mb-4 flex items-center gap-2">
        <i class="fas fa-plus"></i>
        Create New Playlist
      </h2>
      
      <div class="space-y-4 max-w-md">
        <TextInput
          label="Playlist Name"
          value={playlistName()}
          onInput={setPlaylistName}
          placeholder="e.g., 'Sunday Chill Vibes' or 'Workout Bangers'"
          disabled={props.disabled}
        />
        
        <div>
          <label class="block text-sm font-bold text-black mb-1">
            Playlist Type
          </label>
          <select
            value={playlistType()}
            onChange={(e) => setPlaylistType(e.currentTarget.value as PlaylistType)}
            class="win95-panel w-full px-3 py-2 text-sm font-bold text-black"
            disabled={props.disabled}
          >
            <option value="collaborative">👥 Collaborative - Others can add songs</option>
            <option value="personal">👤 Personal - Only you can add songs</option>
          </select>
        </div>
        
        <div class="win95-panel p-3 bg-blue-50">
          <div class="text-xs text-gray-600">
            <i class="fas fa-info-circle mr-1 text-blue-600"></i>
            <strong>Collaborative:</strong> Anyone can add tracks, perfect for group playlists<br/>
            <strong>Personal:</strong> Only you control what gets added
          </div>
        </div>
        
        <AnimatedButton
          onClick={handleSubmit}
          disabled={!isValidSubmission() || props.disabled}
          class="win95-button px-6 py-3 text-lg font-bold w-full"
          classList={{
            'hover:bg-green-100': isValidSubmission() && !props.disabled,
            'cursor-not-allowed opacity-50': !isValidSubmission() || props.disabled
          }}
          animationType="social"
        >
          <i class="fas fa-plus mr-2"></i>
          Create Playlist! ✨
        </AnimatedButton>
      </div>
    </div>
  );
};

export default PlaylistCreateForm;