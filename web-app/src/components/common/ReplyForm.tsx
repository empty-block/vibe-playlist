import { Component, createSignal } from 'solid-js';
import TextInput from './TextInput';
import AnimatedButton from './AnimatedButton';
import { contrastColors, semanticColors, getThemeColors, getNeonGlow } from '../../utils/contrastColors';

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
  
  // Get theme-appropriate colors
  const colors = getThemeColors();

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
    <div style={{ background: colors.surface, padding: '1.5rem', 'border-radius': '8px' }}>
      <h3 
        class="text-lg font-semibold leading-tight mb-5 flex items-center gap-2"
        style={{
          color: colors.heading,
          ...getNeonGlow(colors.heading, 'low')
        }}
      >
        <i class="fas fa-comment"></i>
        Reply to "{props.originalTrack?.title}" by {props.originalTrack?.artist}
      </h3>
      
      <div class="space-y-5">
        {/* Track URL Section (Optional) */}
        <div 
          class="pl-4 py-3 rounded"
          style={{
            'border-left': `3px solid ${colors.success}`,
            background: colors.panel,
            border: `1px solid ${colors.border}`
          }}
        >
          <label 
            class="block text-sm font-semibold leading-normal mb-2"
            style={{
              color: colors.success,
              ...getNeonGlow(colors.success, 'low')
            }}
          >
            <i class="fas fa-music mr-2"></i>
            Track URL (optional)
          </label>
          <TextInput
            value={songUrl()}
            onInput={setSongUrl}
            placeholder="Paste a YouTube, Spotify, or SoundCloud URL"
          />
          {songUrl() && !isValidUrl(songUrl()) && (
            <p 
              class="text-sm mt-2"
              style={{
                color: colors.error,
                ...getNeonGlow(colors.error, 'low')
              }}
            >
              Please enter a valid URL
            </p>
          )}
        </div>

        {/* Comment Section (Optional) */}
        <div 
          class="pl-4 py-3 rounded"
          style={{
            'border-left': `3px solid ${colors.info}`,
            background: colors.panel,
            border: `1px solid ${colors.border}`
          }}
        >
          <label 
            class="block text-sm font-semibold leading-normal mb-2"
            style={{
              color: colors.info,
              ...getNeonGlow(colors.info, 'low')
            }}
          >
            <i class="fas fa-comment mr-2"></i>
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
        <div 
          class="text-sm leading-normal p-3 rounded"
          style={{
            color: colors.body,
            background: colors.elevated,
            border: `1px solid ${colors.border}`
          }}
        >
          <i class="fas fa-info-circle mr-2" style={{ color: colors.info }}></i>
          Add a track, leave a comment, or both!
        </div>
        
        <div class="flex gap-4 justify-end mt-6">
          <button
            onClick={props.onCancel}
            class="px-4 py-3 text-sm font-semibold leading-normal transition-all duration-300 min-h-[44px] rounded"
            style={{
              background: colors.elevated,
              border: `2px solid ${colors.border}`,
              color: colors.body,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = colors.borderHover;
              e.currentTarget.style.boxShadow = `0 0 15px ${colors.borderHover}30`;
              e.currentTarget.style.color = colors.linkHover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = colors.border;
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.color = colors.body;
            }}
          >
            Cancel
          </button>
          
          <button
            onClick={handleSubmit}
            disabled={!songUrl().trim() && !comment().trim()}
            class="px-4 py-3 text-sm font-semibold leading-normal transition-all duration-300 min-h-[44px] rounded"
            style={{
              background: (!songUrl().trim() && !comment().trim()) 
                ? colors.elevated
                : colors.panel,
              border: `2px solid ${colors.info}`,
              color: (!songUrl().trim() && !comment().trim()) ? colors.muted : colors.body,
              opacity: (!songUrl().trim() && !comment().trim()) ? '0.5' : '1',
              cursor: (!songUrl().trim() && !comment().trim()) ? 'not-allowed' : 'pointer'
            }}
            onMouseEnter={(e) => {
              if (songUrl().trim() || comment().trim()) {
                e.currentTarget.style.borderColor = colors.info;
                e.currentTarget.style.boxShadow = `0 0 25px ${colors.info}60, 0 0 50px ${colors.info}30`;
                e.currentTarget.style.color = colors.info;
                e.currentTarget.style.textShadow = `0 0 10px ${colors.info}80`;
              }
            }}
            onMouseLeave={(e) => {
              if (songUrl().trim() || comment().trim()) {
                e.currentTarget.style.borderColor = colors.info;
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.color = colors.body;
                e.currentTarget.style.textShadow = 'none';
              }
            }}
          >
            <i class="fas fa-paper-plane mr-2"></i>
            Post Reply
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReplyForm;