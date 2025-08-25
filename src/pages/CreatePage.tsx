import { Component, onMount, createSignal, Show, createEffect } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { pageEnter, playbackButtonHover } from '../utils/animations';
import CreateChatInterface from '../components/chat/CreateChatInterface';
import AnimatedButton from '../components/common/AnimatedButton';
import { creationStore } from '../stores/creationStore';
import { playlistStore } from '../stores/playlistStore';

export type ShareMode = 'quick' | 'prompt' | 'curated';
export type PlaylistType = 'personal' | 'collaborative' | 'ai_curated';

const CreatePage: Component = () => {
  const navigate = useNavigate();
  const [shareMode, setShareMode] = createSignal<ShareMode | null>(null);
  const [shareText, setShareText] = createSignal('');
  const [trackUrl, setTrackUrl] = createSignal('');
  const [suggestedPlaylist, setSuggestedPlaylist] = createSignal<string>('');
  const [showAdvanced, setShowAdvanced] = createSignal(false);
  const [isProcessing, setIsProcessing] = createSignal(false);

  let pageRef: HTMLDivElement;
  let textareaRef: HTMLTextAreaElement;

  onMount(() => {
    if (pageRef) {
      pageEnter(pageRef);
    }
    creationStore.reset();
    
    // Auto-focus the textarea
    if (textareaRef) {
      textareaRef.focus();
    }
  });

  // Smart context detection
  createEffect(() => {
    const text = shareText().toLowerCase();
    
    if (text.includes('?') || text.includes('favorite') || text.includes('best')) {
      setShareMode('prompt');
      setSuggestedPlaylist('Community Picks');
    } else if (text.includes('found') || text.includes('discovered') || text.includes('obsessed')) {
      setShareMode('quick');
      setSuggestedPlaylist('Current Obsessions');
    } else if (text.includes('vibe') || text.includes('mood') || text.includes('playlist')) {
      setShareMode('curated');
      setSuggestedPlaylist('Curated Vibes');
    }
  });

  const handleQuickShare = async () => {
    setIsProcessing(true);
    
    // Parse the share for track URLs/mentions
    const hasTrack = trackUrl() || shareText().includes('http');
    
    if (hasTrack) {
      // Create a simple share with the track
      const newTrack = {
        id: Date.now().toString(),
        title: 'Shared Track',
        artist: 'Artist',
        source: 'youtube' as const,
        sourceId: extractTrackId(trackUrl() || shareText()),
        addedBy: 'You',
        timestamp: new Date().toISOString(),
        likes: 0,
        recasts: 0,
        replies: []
      };
      
      // Add to personal playlist or suggested playlist
      const targetPlaylist = suggestedPlaylist() || 'My Jams';
      console.log(`Adding to ${targetPlaylist}:`, newTrack);
      
      // Simulate success
      setTimeout(() => {
        alert(`✨ Shared to ${targetPlaylist}!\n\n"${shareText()}"`);
        navigate('/');
      }, 1000);
    } else {
      // Just a text post, could start a collaborative playlist
      if (shareMode() === 'prompt') {
        alert(`🎵 Starting collaborative playlist!\n\n"${shareText()}"\n\nOthers can now add their tracks.`);
      } else {
        alert(`📝 Posted to Farcaster!\n\n"${shareText()}"`);
      }
      navigate('/');
    }
    
    setIsProcessing(false);
  };

  const extractTrackId = (text: string): string => {
    // Extract YouTube/Spotify/SoundCloud IDs from URLs
    const youtubeMatch = text.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
    if (youtubeMatch) return youtubeMatch[1];
    
    const spotifyMatch = text.match(/spotify\.com\/track\/([^?\s]+)/);
    if (spotifyMatch) return spotifyMatch[1];
    
    return 'demo-track-id';
  };

  return (
    <div ref={pageRef!} class="min-h-screen bg-black text-white p-4">
      <div class="max-w-2xl mx-auto pt-8">
        {/* Natural sharing interface */}
        <div class="mb-8">
          <h1 class="text-3xl font-bold mb-2" style="color: #00f92a">
            Share Music
          </h1>
          <p class="text-gray-400">
            Share a track, start a conversation, or curate a vibe
          </p>
        </div>

        {/* Main sharing area */}
        <div class="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <textarea
            ref={textareaRef!}
            value={shareText()}
            onInput={(e) => setShareText(e.currentTarget.value)}
            placeholder="What's the vibe? Share a track, ask for recommendations, or just tell us what you're listening to..."
            class="w-full bg-transparent text-white placeholder-gray-500 resize-none outline-none text-lg"
            rows="4"
          />
          
          {/* Track URL input (optional) */}
          <div class="mt-4 flex items-center gap-2">
            <input
              type="text"
              value={trackUrl()}
              onInput={(e) => setTrackUrl(e.currentTarget.value)}
              placeholder="Paste a track URL (YouTube, Spotify, SoundCloud)"
              class="flex-1 bg-gray-800 text-white px-3 py-2 rounded border border-gray-700 focus:border-cyan-500 outline-none"
            />
          </div>

          {/* Smart suggestions */}
          <Show when={shareMode() && suggestedPlaylist()}>
            <div class="mt-4 p-3 bg-gray-800 rounded-lg border border-gray-700">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span class="text-sm text-gray-400">Suggested:</span>
                  <span class="text-cyan-400 font-medium">{suggestedPlaylist()}</span>
                  <Show when={shareMode() === 'prompt'}>
                    <span class="text-xs bg-pink-900 text-pink-300 px-2 py-1 rounded">Collaborative</span>
                  </Show>
                </div>
                <button
                  onClick={() => setSuggestedPlaylist('')}
                  class="text-gray-500 hover:text-gray-300 text-sm"
                >
                  Change
                </button>
              </div>
            </div>
          </Show>

          {/* Action buttons */}
          <div class="mt-6 flex items-center justify-between">
            <button
              onClick={() => setShowAdvanced(!showAdvanced())}
              class="text-gray-400 hover:text-white text-sm transition-colors"
            >
              {showAdvanced() ? 'Simple Mode' : 'Advanced Playlist Creation'}
            </button>
            
            <div class="flex gap-3">
              <button
                onClick={() => navigate('/')}
                class="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <AnimatedButton
                onClick={handleQuickShare}
                disabled={!shareText().trim() || isProcessing()}
                class="px-6 py-2 rounded-lg font-medium disabled:opacity-50"
                style={{
                  background: 'linear-gradient(135deg, #00f92a 0%, #04caf4 100%)',
                  color: 'black'
                }}
              >
                {isProcessing() ? 'Sharing...' : 'Share'}
              </AnimatedButton>
            </div>
          </div>
        </div>

        {/* Advanced mode (old CreateCanvas functionality) */}
        <Show when={showAdvanced()}>
          <div class="mt-8 bg-gray-900 rounded-lg p-6 border border-gray-800">
            <h2 class="text-xl font-bold mb-4" style="color: #f906d6">
              Advanced Playlist Creation
            </h2>
            <CreateChatInterface
              onComplete={(playlist) => {
                console.log('Advanced playlist created:', playlist);
                alert(`🎵 Playlist "${playlist.title}" created!`);
                navigate('/');
              }}
            />
          </div>
        </Show>

        {/* Examples for inspiration */}
        <div class="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => {
              setShareText('What are your favorite late-night coding tracks?');
              textareaRef?.focus();
            }}
            class="p-3 bg-gray-900 rounded-lg border border-gray-800 hover:border-cyan-500 transition-colors text-left"
          >
            <div class="text-cyan-400 text-sm mb-1">Start a Thread</div>
            <div class="text-gray-400 text-xs">Ask for recommendations</div>
          </button>
          
          <button
            onClick={() => {
              setShareText('Just discovered this gem, been on repeat all day');
              textareaRef?.focus();
            }}
            class="p-3 bg-gray-900 rounded-lg border border-gray-800 hover:border-green-500 transition-colors text-left"
          >
            <div class="text-green-400 text-sm mb-1">Quick Share</div>
            <div class="text-gray-400 text-xs">Share current obsession</div>
          </button>
          
          <button
            onClick={() => {
              setShareText('Sunday morning coffee vibes ☕');
              textareaRef?.focus();
            }}
            class="p-3 bg-gray-900 rounded-lg border border-gray-800 hover:border-pink-500 transition-colors text-left"
          >
            <div class="text-pink-400 text-sm mb-1">Set a Mood</div>
            <div class="text-gray-400 text-xs">Create a vibe</div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreatePage;