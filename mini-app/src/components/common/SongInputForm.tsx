import { Component, createSignal } from 'solid-js';
import TextInput from './TextInput';
import AnimatedButton from './AnimatedButton';
import RetroPanel from './RetroPanel';

interface SongInputFormProps {
  onSubmit: (data: { songUrl: string; comment: string }) => void;
  submitLabel?: string;
  disabled?: boolean;
  initialSongUrl?: string;
  initialComment?: string;
}

const SongInputForm: Component<SongInputFormProps> = (props) => {
  const [songUrl, setSongUrl] = createSignal(props.initialSongUrl || '');
  const [comment, setComment] = createSignal(props.initialComment || '');

  const handleSubmit = () => {
    if (!songUrl().trim()) return;

    props.onSubmit({
      songUrl: songUrl().trim(),
      comment: comment().trim()
    });

    // Reset form if no initial values provided
    if (!props.initialSongUrl && !props.initialComment) {
      setSongUrl('');
      setComment('');
    }
  };

  const isValidSubmission = () => {
    return songUrl().trim().length > 0;
  };

  return (
    <RetroPanel variant="3d" class="mb-6">
      <h2 class="text-xl font-bold mb-4 flex items-center gap-2">
        <i class="fas fa-music"></i>
        What's the track?
      </h2>

      <div class="space-y-4">
        <TextInput
          label="Song URL (YouTube, Spotify, etc.)"
          value={songUrl()}
          onInput={setSongUrl}
          placeholder="https://youtu.be/dQw4w9WgXcQ or https://open.spotify.com/track/..."
          disabled={props.disabled}
        />

        <TextInput
          label="Your take (optional)"
          value={comment()}
          onInput={setComment}
          placeholder="This is my jam..."
          multiline={true}
          rows={3}
          disabled={props.disabled}
        />
      </div>

      <div class="text-center mt-6">
        <AnimatedButton
          onClick={handleSubmit}
          disabled={!isValidSubmission() || props.disabled}
          class="retro-button px-8 py-3 text-lg font-bold"
          classList={{
            'hover:bg-green-100': isValidSubmission() && !props.disabled,
            'cursor-not-allowed opacity-50': !isValidSubmission() || props.disabled
          }}
          animationType="social"
        >
          <i class="fas fa-plus mr-2"></i>
          {props.submitLabel || 'Add Track! 🎵'}
        </AnimatedButton>
      </div>
    </RetroPanel>
  );
};

export default SongInputForm;