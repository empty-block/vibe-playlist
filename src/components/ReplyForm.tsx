import { Component, createSignal } from 'solid-js';
import TextInput from './TextInput';
import AnimatedButton from './AnimatedButton';

interface ReplyFormProps {
  onSubmit: (data: { songUrl?: string; comment: string }) => void;
  onCancel: () => void;
  originalTrack?: {
    title: string;
    artist: string;
  };
}

const ReplyForm: Component<ReplyFormProps> = (props) => {
  const [songUrl, setSongUrl] = createSignal('');
  const [comment, setComment] = createSignal('');

  const handleSubmit = () => {
    if (!songUrl().trim() && !comment().trim()) return;
    
    props.onSubmit({
      songUrl: songUrl().trim() || undefined,
      comment: comment().trim()
    });
    
    // Reset form
    setSongUrl('');
    setComment('');
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return url.includes('youtube.com') || url.includes('youtu.be') || 
             url.includes('spotify.com') || url.includes('soundcloud.com');
    } catch {
      return false;
    }
  };

  return (
    <div class="win95-panel p-4 mt-4">
      <h3 class="text-sm font-bold text-black mb-3 flex items-center gap-2">
        <i class="fas fa-comment"></i>
        Reply to "{props.originalTrack?.title}" by {props.originalTrack?.artist}
      </h3>
      
      <div class="space-y-4">
        {/* Track URL Section (Optional) */}
        <div class="border-l-4 border-green-400 pl-3">
          <label class="block text-xs font-bold text-black mb-1">
            <i class="fas fa-music mr-1"></i>
            Track URL (optional)
          </label>
          <TextInput
            value={songUrl()}
            onInput={setSongUrl}
            placeholder="Paste a YouTube, Spotify, or SoundCloud URL"
          />
          {songUrl() && !isValidUrl(songUrl()) && (
            <p class="text-xs text-red-600 mt-1">
              Please enter a valid URL
            </p>
          )}
        </div>

        {/* Comment Section (Optional) */}
        <div class="border-l-4 border-blue-400 pl-3">
          <label class="block text-xs font-bold text-black mb-1">
            <i class="fas fa-comment mr-1"></i>
            Your comment (optional)
          </label>
          <TextInput
            value={comment()}
            onInput={setComment}
            placeholder="Share your thoughts or just add a track..."
            multiline={true}
            rows={2}
          />
        </div>

        {/* Helper text */}
        <div class="text-xs text-gray-600 bg-gray-50 p-2 rounded">
          <i class="fas fa-info-circle mr-1"></i>
          Add a track, leave a comment, or both!
        </div>
        
        <div class="flex gap-2 justify-end">
          <AnimatedButton
            onClick={props.onCancel}
            class="win95-button px-3 py-1 text-xs font-bold"
            animationType="default"
          >
            Cancel
          </AnimatedButton>
          
          <AnimatedButton
            onClick={handleSubmit}
            class="win95-button px-3 py-1 text-xs font-bold"
            animationType="social"
            disabled={!songUrl().trim() && !comment().trim()}
          >
            <i class="fas fa-paper-plane mr-1"></i>
            Post Reply
          </AnimatedButton>
        </div>
      </div>
    </div>
  );
};

export default ReplyForm;