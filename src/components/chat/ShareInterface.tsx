import { Component, createSignal, createEffect, Show, For } from 'solid-js';
import AnimatedButton from '../common/AnimatedButton';

interface ShareInterfaceProps {
  initialText?: string;
  onShare: (data: ShareData) => void;
  mode?: 'inline' | 'modal';
}

interface ShareData {
  text: string;
  tracks: Track[];
  playlistTitle?: string;
  isCollaborative: boolean;
}

interface Track {
  url: string;
  title?: string;
  artist?: string;
  source: 'youtube' | 'spotify' | 'soundcloud';
}

const ShareInterface: Component<ShareInterfaceProps> = (props) => {
  const [text, setText] = createSignal(props.initialText || '');
  const [tracks, setTracks] = createSignal<Track[]>([]);
  const [playlistTitle, setPlaylistTitle] = createSignal('');
  const [isCollaborative, setIsCollaborative] = createSignal(false);
  const [showAI, setShowAI] = createSignal(false);
  const [aiSuggestion, setAiSuggestion] = createSignal('');

  // Detect URLs in text
  createEffect(() => {
    const content = text();
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = content.match(urlRegex) || [];
    
    const detectedTracks = urls.map(url => ({
      url,
      source: detectSource(url)
    })).filter(t => t.source !== null) as Track[];
    
    if (detectedTracks.length > 0) {
      setTracks(detectedTracks);
    }
  });

  // Detect if this should be collaborative
  createEffect(() => {
    const content = text().toLowerCase();
    setIsCollaborative(
      content.includes('?') || 
      content.includes('what are') || 
      content.includes('share your') ||
      content.includes('drop your')
    );
  });

  // Generate playlist title suggestion
  createEffect(() => {
    const content = text();
    if (isCollaborative()) {
      // Extract the question/prompt as title
      const questionMatch = content.match(/([^.!?]*\?)/);
      if (questionMatch) {
        setPlaylistTitle(questionMatch[1].trim());
      }
    } else if (content.includes('vibe') || content.includes('mood')) {
      // Extract mood/vibe description
      const words = content.split(' ').slice(0, 5).join(' ');
      setPlaylistTitle(words);
    }
  });

  const detectSource = (url: string): 'youtube' | 'spotify' | 'soundcloud' | null => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
    if (url.includes('spotify.com')) return 'spotify';
    if (url.includes('soundcloud.com')) return 'soundcloud';
    return null;
  };

  const handleShare = () => {
    props.onShare({
      text: text(),
      tracks: tracks(),
      playlistTitle: playlistTitle(),
      isCollaborative: isCollaborative()
    });
  };

  const getAISuggestion = () => {
    setShowAI(true);
    // Simulate AI response
    setTimeout(() => {
      const suggestions = [
        "How about adding some Tame Impala for that psychedelic touch?",
        "This vibe could use some Mac DeMarco - perfect for late night sessions",
        "Consider some Japanese city pop to complete this aesthetic",
        "Frank Ocean would fit perfectly with this mood"
      ];
      setAiSuggestion(suggestions[Math.floor(Math.random() * suggestions.length)]);
    }, 500);
  };

  return (
    <div class={`${props.mode === 'modal' ? 'fixed inset-0 bg-black/80 flex items-center justify-center p-4' : ''}`}>
      <div class={`${props.mode === 'modal' ? 'bg-gray-900 rounded-lg p-6 max-w-2xl w-full' : 'w-full'}`}>
        {/* Quick share mode */}
        <div class="space-y-4">
          {/* Text input */}
          <textarea
            value={text()}
            onInput={(e) => setText(e.currentTarget.value)}
            placeholder="Share what you're listening to..."
            class="w-full bg-gray-800 text-white p-3 rounded-lg resize-none outline-none"
            rows="3"
          />

          {/* Detected tracks */}
          <Show when={tracks().length > 0}>
            <div class="bg-gray-800 rounded-lg p-3">
              <div class="text-xs text-gray-400 mb-2">Detected tracks:</div>
              <For each={tracks()}>
                {(track) => (
                  <div class="flex items-center gap-2 text-sm">
                    <span class="text-cyan-400">{track.source}</span>
                    <span class="text-gray-300 truncate">{track.url}</span>
                  </div>
                )}
              </For>
            </div>
          </Show>

          {/* Smart suggestions */}
          <Show when={playlistTitle()}>
            <div class="bg-gray-800 rounded-lg p-3">
              <div class="flex items-center justify-between">
                <div>
                  <div class="text-xs text-gray-400">Auto-organizing as:</div>
                  <div class="text-cyan-400 font-medium">{playlistTitle()}</div>
                </div>
                <Show when={isCollaborative()}>
                  <span class="text-xs bg-pink-900 text-pink-300 px-2 py-1 rounded">
                    Collaborative
                  </span>
                </Show>
              </div>
            </div>
          </Show>

          {/* AI assistance */}
          <div class="flex items-center gap-2">
            <button
              onClick={getAISuggestion}
              class="text-sm text-gray-400 hover:text-cyan-400 transition-colors"
            >
              ✨ Get AI suggestion
            </button>
          </div>

          <Show when={showAI() && aiSuggestion()}>
            <div class="bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-lg p-3 border border-purple-700">
              <div class="text-sm text-purple-300">{aiSuggestion()}</div>
            </div>
          </Show>

          {/* Actions */}
          <div class="flex justify-end gap-3">
            <AnimatedButton
              onClick={handleShare}
              disabled={!text().trim()}
              class="px-4 py-2 rounded-lg font-medium"
              style={{
                background: 'linear-gradient(135deg, #00f92a 0%, #04caf4 100%)',
                color: 'black'
              }}
            >
              Share to Farcaster
            </AnimatedButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareInterface;