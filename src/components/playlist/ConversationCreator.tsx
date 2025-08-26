import { Component, createSignal, createEffect, onMount, For, Show } from 'solid-js';
import anime from 'animejs';
import type { VibeType } from './VibeSelector';
import { mockDataService } from '../../data/mockData';

interface Message {
  id: string;
  type: 'user' | 'ai' | 'system';
  content: string;
  timestamp: Date;
  suggestions?: TrackSuggestion[];
  loading?: boolean;
}

interface TrackSuggestion {
  id: string;
  title: string;
  artist: string;
  source: 'youtube' | 'spotify';
  sourceId: string;
  preview?: string;
  reasoning?: string;
}

interface ConversationCreatorProps {
  selectedVibe?: { id: VibeType; name: string; description: string };
  onTracksSelected: (tracks: TrackSuggestion[]) => void;
  onConversationComplete: (threadText: string, tracks: TrackSuggestion[]) => void;
}

const ConversationCreator: Component<ConversationCreatorProps> = (props) => {
  const [messages, setMessages] = createSignal<Message[]>([]);
  const [inputText, setInputText] = createSignal('');
  const [isLoading, setIsLoading] = createSignal(false);
  const [selectedTracks, setSelectedTracks] = createSignal<TrackSuggestion[]>([]);
  const [threadText, setThreadText] = createSignal('');

  let containerRef: HTMLDivElement;
  let messagesRef: HTMLDivElement;
  let inputRef: HTMLInputElement;

  onMount(() => {
    // Initialize with AI greeting
    const initialMessage: Message = {
      id: Date.now().toString(),
      type: 'ai',
      content: `Hey! I'm your music curation AI. ${props.selectedVibe ? 
        `I see you want to create a ${props.selectedVibe.name.toLowerCase()} playlist - ${props.selectedVibe.description.toLowerCase()}. ` : ''
      }Let's build something amazing together! What kind of vibe or story are you going for?`,
      timestamp: new Date()
    };
    
    setMessages([initialMessage]);

    // Entrance animation
    if (containerRef) {
      anime({
        targets: containerRef,
        opacity: [0, 1],
        translateY: [20, 0],
        duration: 600,
        easing: 'easeOutCubic'
      });
    }
  });

  // Auto-scroll to bottom when new messages arrive
  createEffect(() => {
    const msgs = messages();
    if (msgs.length > 0 && messagesRef) {
      setTimeout(() => {
        messagesRef.scrollTop = messagesRef.scrollHeight;
      }, 100);
    }
  });

  const addMessage = (message: Omit<Message, 'id' | 'timestamp'>) => {
    const newMessage: Message = {
      ...message,
      id: Date.now().toString(),
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, newMessage]);
    
    // Animate new message
    setTimeout(() => {
      const messageEl = document.querySelector(`[data-message-id="${newMessage.id}"]`);
      if (messageEl) {
        anime({
          targets: messageEl,
          opacity: [0, 1],
          translateX: message.type === 'user' ? [20, 0] : [-20, 0],
          duration: 400,
          easing: 'easeOutCubic'
        });
      }
    }, 50);
  };

  const simulateAIResponse = async (userMessage: string) => {
    setIsLoading(true);
    
    // Add loading message
    const loadingMessage: Message = {
      id: 'loading-' + Date.now(),
      type: 'ai',
      content: 'Thinking of perfect tracks...',
      timestamp: new Date(),
      loading: true
    };
    setMessages(prev => [...prev, loadingMessage]);

    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Remove loading message
    setMessages(prev => prev.filter(m => m.id !== loadingMessage.id));

    // Get actual track suggestions from our centralized data
    // For now, just grab a few tracks that match the vibe from our database
    // In a real app, this would be AI-generated based on user input
    const allTracks = await mockDataService.getAllTracks();
    const synthTracks = allTracks.filter(track => 
      track.addedBy === 'synth_prophet_85' || 
      track.artist.toLowerCase().includes('m83') ||
      track.artist.toLowerCase().includes('daft punk')
    ).slice(0, 3);

    const mockTracks: TrackSuggestion[] = synthTracks.map(track => ({
      id: track.id,
      title: track.title,
      artist: track.artist,
      source: track.source,
      sourceId: track.sourceId,
      reasoning: `${track.comment.slice(0, 50)}...` // Use the user's comment as reasoning
    }));

    const aiResponse = `Great choice! Based on "${userMessage}", I found some tracks that should fit perfectly. These all have that electronic/synth vibe with emotional depth. Want to add any of these to your playlist?`;

    addMessage({
      type: 'ai',
      content: aiResponse,
      suggestions: mockTracks
    });

    setIsLoading(false);
  };

  const handleSendMessage = async () => {
    const message = inputText().trim();
    if (!message || isLoading()) return;

    // Add user message
    addMessage({
      type: 'user',
      content: message
    });

    setInputText('');

    // Get AI response
    await simulateAIResponse(message);
  };

  const handleTrackToggle = (track: TrackSuggestion) => {
    const selected = selectedTracks();
    const isSelected = selected.some(t => t.id === track.id);
    
    if (isSelected) {
      setSelectedTracks(selected.filter(t => t.id !== track.id));
    } else {
      setSelectedTracks([...selected, track]);
    }

    // Animate track selection
    const trackEl = document.querySelector(`[data-track-id="${track.id}"]`);
    if (trackEl) {
      anime({
        targets: trackEl,
        scale: [1, 1.05, 1],
        boxShadow: isSelected 
          ? ['0 0 20px #00f92a', '0 0 0px #00f92a']
          : ['0 0 0px #00f92a', '0 0 20px #00f92a'],
        duration: 400,
        easing: 'easeOutCubic'
      });
    }
  };

  const handleGenerateThreadText = () => {
    const vibeDescription = props.selectedVibe?.description || 'some amazing vibes';
    const trackCount = selectedTracks().length;
    
    const suggestions = [
      `Just curated ${trackCount} tracks for ${vibeDescription} - what would you add to complete this vibe?`,
      `Building the perfect playlist for ${vibeDescription}. These ${trackCount} tracks are just the start... help me expand it!`,
      `Found some gems that perfectly capture ${vibeDescription}. Drop your favorite tracks that match this energy!`,
      `Creating a sonic journey through ${vibeDescription}. These ${trackCount} tracks set the foundation - what should come next?`
    ];

    const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
    setThreadText(randomSuggestion);

    // Show thread text input
    const threadInput = document.getElementById('thread-input');
    if (threadInput) {
      anime({
        targets: threadInput,
        opacity: [0, 1],
        height: ['0px', 'auto'],
        duration: 500,
        easing: 'easeOutCubic'
      });
    }
  };

  const handleCompleteConversation = () => {
    if (selectedTracks().length === 0) {
      alert('Please select at least one track!');
      return;
    }

    const finalThreadText = threadText().trim() || 'Check out this playlist I just curated!';
    props.onConversationComplete(finalThreadText, selectedTracks());
  };

  return (
    <div 
      ref={containerRef!}
      class="flex flex-col h-full bg-gradient-to-b from-gray-900 to-black rounded-lg overflow-hidden"
      style={{ opacity: 0 }}
    >
      {/* Header */}
      <div class="p-4 border-b border-purple-500/30 bg-gradient-to-r from-purple-900/20 to-pink-900/20">
        <div class="flex items-center space-x-3">
          <div class="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 flex items-center justify-center">
            <span class="text-sm">🤖</span>
          </div>
          <div>
            <h3 class="font-semibold text-white">AI Music Curator</h3>
            <p class="text-xs text-gray-400">Let's find your perfect tracks</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div 
        ref={messagesRef!}
        class="flex-1 overflow-y-auto p-4 space-y-4"
        style={{ 'scrollbar-width': 'thin' }}
      >
        <For each={messages()}>
          {(message) => (
            <div
              data-message-id={message.id}
              class={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              style={{ opacity: 0 }}
            >
              <div
                class={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.type === 'user'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                    : 'bg-gray-700 text-gray-100'
                }`}
              >
                <p class="text-sm">{message.content}</p>
                
                {/* Loading indicator */}
                <Show when={message.loading}>
                  <div class="flex space-x-1 mt-2">
                    <div class="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                    <div class="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" style={{ 'animation-delay': '0.2s' }}></div>
                    <div class="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" style={{ 'animation-delay': '0.4s' }}></div>
                  </div>
                </Show>

                {/* Track suggestions */}
                <Show when={message.suggestions}>
                  <div class="mt-3 space-y-2">
                    <For each={message.suggestions}>
                      {(track) => (
                        <div
                          data-track-id={track.id}
                          class="p-3 bg-gray-800 rounded-lg cursor-pointer transition-all duration-300 border-2"
                          style={{
                            'border-color': selectedTracks().some(t => t.id === track.id) 
                              ? '#00f92a' 
                              : 'transparent'
                          }}
                          onClick={() => handleTrackToggle(track)}
                        >
                          <div class="flex items-center justify-between">
                            <div class="flex-1">
                              <div class="font-medium text-white text-sm">{track.title}</div>
                              <div class="text-gray-400 text-xs">{track.artist}</div>
                              {track.reasoning && (
                                <div class="text-gray-500 text-xs mt-1 italic">
                                  "{track.reasoning}"
                                </div>
                              )}
                            </div>
                            <div class="ml-3">
                              {selectedTracks().some(t => t.id === track.id) ? (
                                <div class="w-6 h-6 bg-green-400 rounded-full flex items-center justify-center">
                                  <span class="text-black text-xs">✓</span>
                                </div>
                              ) : (
                                <div class="w-6 h-6 border-2 border-gray-500 rounded-full"></div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </For>
                  </div>
                </Show>

                <div class="text-xs text-gray-400 mt-1">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          )}
        </For>
      </div>

      {/* Selected Tracks Summary */}
      <Show when={selectedTracks().length > 0}>
        <div class="px-4 py-2 border-t border-gray-700 bg-gray-800/50">
          <div class="text-sm text-gray-300 mb-2">
            Selected tracks ({selectedTracks().length}):
          </div>
          <div class="flex flex-wrap gap-2">
            <For each={selectedTracks()}>
              {(track) => (
                <span class="px-2 py-1 bg-green-600/20 text-green-300 rounded-full text-xs border border-green-500/30">
                  {track.title} - {track.artist}
                </span>
              )}
            </For>
          </div>
          <div class="mt-3 flex space-x-2">
            <button
              onClick={handleGenerateThreadText}
              class="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg text-sm font-medium hover:scale-105 transition-all duration-300"
            >
              Create Thread Text ✨
            </button>
          </div>
        </div>
      </Show>

      {/* Thread Text Input */}
      <div id="thread-input" style={{ opacity: 0, height: '0px', overflow: 'hidden' }}>
        <div class="p-4 border-t border-gray-700 bg-gray-800/50">
          <label class="block text-sm text-gray-300 mb-2">
            Conversation starter for your Farcaster thread:
          </label>
          <textarea
            value={threadText()}
            onInput={(e) => setThreadText(e.currentTarget.value)}
            placeholder="Write something to invite others to contribute..."
            class="w-full p-3 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-400 resize-none focus:outline-none focus:border-purple-500"
            rows="2"
          />
          <button
            onClick={handleCompleteConversation}
            class="mt-3 w-full py-3 bg-gradient-to-r from-green-500 to-cyan-500 text-black font-semibold rounded-lg hover:scale-105 transition-all duration-300"
          >
            Complete Playlist 🚀
          </button>
        </div>
      </div>

      {/* Input */}
      <div class="p-4 border-t border-gray-700">
        <div class="flex space-x-2">
          <input
            ref={inputRef!}
            type="text"
            value={inputText()}
            onInput={(e) => setInputText(e.currentTarget.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Describe the vibe, ask for suggestions, or refine your search..."
            class="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
            disabled={isLoading()}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputText().trim() || isLoading()}
            class="px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-all duration-300"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConversationCreator;