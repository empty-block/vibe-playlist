import { Component, createSignal, onMount, For, Show, createEffect } from 'solid-js';
import anime from 'animejs';
import type { VibeType } from './VibeSelector';

interface TrackSuggestion {
  id: string;
  title: string;
  artist: string;
  source: 'youtube' | 'spotify';
  sourceId: string;
  preview?: string;
  reasoning?: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  suggestions?: TrackSuggestion[];
  timestamp: Date;
}

interface ConversationalDiscoveryProps {
  selectedVibe?: { id: VibeType; name: string; description: string };
  onTracksSelected: (tracks: TrackSuggestion[]) => void;
  onComplete: (tracks: TrackSuggestion[]) => void;
}

const ConversationalDiscovery: Component<ConversationalDiscoveryProps> = (props) => {
  const [messages, setMessages] = createSignal<Message[]>([]);
  const [inputValue, setInputValue] = createSignal('');
  const [selectedTracks, setSelectedTracks] = createSignal<TrackSuggestion[]>([]);
  const [isTyping, setIsTyping] = createSignal(false);
  const [showQuickActions, setShowQuickActions] = createSignal(true);

  let containerRef: HTMLDivElement;
  let chatRef: HTMLDivElement;
  let inputRef: HTMLInputElement;

  onMount(() => {
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

    // Initial greeting
    setTimeout(() => {
      addAssistantMessage(getInitialGreeting(), []);
    }, 400);

    // Focus input
    inputRef?.focus();
  });

  // Auto-scroll to bottom when new messages arrive
  createEffect(() => {
    messages();
    if (chatRef) {
      setTimeout(() => {
        chatRef.scrollTop = chatRef.scrollHeight;
      }, 100);
    }
  });

  const getInitialGreeting = () => {
    const vibe = props.selectedVibe;
    if (vibe) {
      return `Perfect! You chose the ${vibe.name.toLowerCase()} vibe. Tell me about some artists, songs, or even just describe the mood you're going for - I'll help you build an amazing playlist. What kind of music captures this ${vibe.name.toLowerCase()} feeling for you?`;
    }
    return "Hey! I'm here to help you build your perfect playlist. Just describe what you're looking for - maybe some artists you love, specific songs you have in mind, or even just the mood you want to create. I'll suggest tracks that match your vision. What are you thinking?";
  };

  const addUserMessage = (content: string) => {
    const message: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, message]);
  };

  const addAssistantMessage = (content: string, suggestions: TrackSuggestion[]) => {
    const message: Message = {
      id: `msg-${Date.now()}`,
      role: 'assistant',
      content,
      suggestions,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, message]);
  };

  const processUserInput = async (input: string) => {
    setIsTyping(true);
    setShowQuickActions(false);

    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Parse input for artist names, track mentions, or mood descriptions
    const lowerInput = input.toLowerCase();
    const suggestions: TrackSuggestion[] = [];
    let response = '';

    // Check for specific artist mentions
    if (lowerInput.includes('frank ocean') || lowerInput.includes('ocean')) {
      suggestions.push(
        { id: 'fo1', title: 'Pink + White', artist: 'Frank Ocean', source: 'youtube', sourceId: 'uzS3WG6__E4', reasoning: 'A beautiful, dreamy track that captures Frank Ocean\'s signature sound' },
        { id: 'fo2', title: 'Nights', artist: 'Frank Ocean', source: 'youtube', sourceId: '7k4j1sSQ8nY', reasoning: 'The beat switch in this song is legendary - perfect for a vibe shift' },
        { id: 'fo3', title: 'Thinkin Bout You', artist: 'Frank Ocean', source: 'youtube', sourceId: 'pNBD4OFF8cc', reasoning: 'Classic Frank Ocean - emotional and atmospheric' }
      );
      response = "Great choice! Frank Ocean has such a unique sound. I found some of his best tracks that would fit perfectly. ";
    } else if (lowerInput.includes('bon iver')) {
      suggestions.push(
        { id: 'bi1', title: 'Holocene', artist: 'Bon Iver', source: 'youtube', sourceId: 'TWcyIpul8OE', reasoning: 'Hauntingly beautiful - perfect for introspective moments' },
        { id: 'bi2', title: 're: Stacks', artist: 'Bon Iver', source: 'youtube', sourceId: 'GhDnyPsQsB0', reasoning: 'Raw emotion and stunning acoustics' },
        { id: 'bi3', title: '8 (circle)', artist: 'Bon Iver', source: 'youtube', sourceId: 'ldVavCASMOc', reasoning: 'Modern Bon Iver with incredible production' }
      );
      response = "Bon Iver brings such emotional depth! Here are some tracks that capture that ethereal, intimate feeling. ";
    } else if (lowerInput.includes('chill') || lowerInput.includes('relax')) {
      suggestions.push(
        { id: 'ch1', title: 'Resonance', artist: 'HOME', source: 'youtube', sourceId: '8GW6sLrK40k', reasoning: 'The ultimate chill synthwave track - nostalgic and peaceful' },
        { id: 'ch2', title: 'Dreams Tonite', artist: 'Alvvays', source: 'youtube', sourceId: 'ZXu6q-6JKjA', reasoning: 'Dreamy indie rock with a relaxed vibe' },
        { id: 'ch3', title: 'Chamber of Reflection', artist: 'Mac DeMarco', source: 'youtube', sourceId: 'pQsF3pzOc54', reasoning: 'Introspective and mellow - perfect for late nights' }
      );
      response = "I love that chill vibe! Here are some tracks that create that perfect relaxed atmosphere. ";
    } else if (lowerInput.includes('energy') || lowerInput.includes('upbeat') || lowerInput.includes('party')) {
      suggestions.push(
        { id: 'up1', title: 'Midnight City', artist: 'M83', source: 'youtube', sourceId: 'dX3k_QDnzHE', reasoning: 'That sax solo hits different - pure energy' },
        { id: 'up2', title: 'Electric Feel', artist: 'MGMT', source: 'youtube', sourceId: 'MmZexg8sxyk', reasoning: 'Psychedelic dance vibes that never get old' },
        { id: 'up3', title: 'Tongue Tied', artist: 'Grouplove', source: 'youtube', sourceId: '1x1wjGKHjBI', reasoning: 'Infectious energy and singalong potential' }
      );
      response = "Let's bring the energy! These tracks will definitely get things moving. ";
    } else {
      // Generic suggestions based on vibe
      const vibe = props.selectedVibe?.name.toLowerCase() || 'general';
      suggestions.push(
        { id: 'g1', title: 'Dissolve Me', artist: 'Alt-J', source: 'youtube', sourceId: 'Qg6BwvDcANg', reasoning: 'Unique sound with layered production' },
        { id: 'g2', title: 'Intro', artist: 'The xx', source: 'youtube', sourceId: '_VPKfacgXao', reasoning: 'Minimalist and atmospheric - sets a perfect mood' },
        { id: 'g3', title: 'Sleepyhead', artist: 'Passion Pit', source: 'youtube', sourceId: 'T0RvPYRRRbE', reasoning: 'Dreamy electronic indie that feels like floating' }
      );
      response = `I hear you! Based on what you're describing, here are some tracks that might capture that feeling. `;
    }

    // Add contextual advice
    if (suggestions.length > 0) {
      response += `Each of these has a unique quality that could work well. What do you think? You can select the ones you like, or tell me more about what you're looking for!`;
    } else {
      response = "Hmm, tell me more about what you're looking for. Maybe mention some artists you like, or describe the mood you want to create?";
    }

    setIsTyping(false);
    addAssistantMessage(response, suggestions);
  };

  const handleSend = () => {
    const input = inputValue().trim();
    if (!input) return;

    addUserMessage(input);
    setInputValue('');
    processUserInput(input);
  };

  const handleTrackToggle = (track: TrackSuggestion) => {
    const selected = selectedTracks();
    const isSelected = selected.some(t => t.id === track.id);
    
    if (isSelected) {
      const newSelected = selected.filter(t => t.id !== track.id);
      setSelectedTracks(newSelected);
      props.onTracksSelected(newSelected);
    } else {
      const newSelected = [...selected, track];
      setSelectedTracks(newSelected);
      props.onTracksSelected(newSelected);
    }

    // Animate selection
    const trackEl = document.querySelector(`[data-track-id="${track.id}"]`);
    if (trackEl) {
      anime({
        targets: trackEl,
        scale: [1, 1.05, 1],
        duration: 300,
        easing: 'easeOutCubic'
      });
    }
  };

  const handleQuickAction = (action: string) => {
    setInputValue(action);
    handleSend();
  };

  const handleComplete = () => {
    if (selectedTracks().length === 0) {
      addAssistantMessage("Hold on! You haven't selected any tracks yet. Click on the tracks you like from my suggestions, or tell me what else you're looking for!", []);
      return;
    }
    props.onComplete(selectedTracks());
  };

  return (
    <div 
      ref={containerRef!}
      class="h-full flex flex-col bg-gradient-to-b from-gray-900 to-black rounded-lg"
      style={{ opacity: 0 }}
    >
      {/* Chat Messages */}
      <div 
        ref={chatRef!}
        class="flex-1 overflow-y-auto p-4 space-y-4"
      >
        <For each={messages()}>
          {(message) => (
            <div class={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div class={`max-w-[80%] ${message.role === 'user' ? 'order-2' : ''}`}>
                {/* Message Bubble */}
                <div 
                  class={`p-3 rounded-lg ${
                    message.role === 'user' 
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white' 
                      : 'bg-gray-800 text-gray-100'
                  }`}
                >
                  <p class="text-sm">{message.content}</p>
                </div>

                {/* Track Suggestions */}
                <Show when={message.suggestions && message.suggestions.length > 0}>
                  <div class="mt-3 space-y-2">
                    <For each={message.suggestions}>
                      {(track) => (
                        <div
                          data-track-id={track.id}
                          onClick={() => handleTrackToggle(track)}
                          class="p-3 bg-gray-800/80 rounded-lg cursor-pointer transition-all duration-300 border-2 hover:bg-gray-700/80"
                          style={{
                            'border-color': selectedTracks().some(t => t.id === track.id) 
                              ? '#00f92a' 
                              : 'transparent'
                          }}
                        >
                          <div class="flex items-center justify-between">
                            <div class="flex-1">
                              <div class="flex items-center space-x-2">
                                <span class="text-white font-medium text-sm">{track.title}</span>
                                <span class="text-gray-400 text-xs">by {track.artist}</span>
                                <div 
                                  class="w-3 h-3 rounded-full"
                                  style={{ background: track.source === 'youtube' ? '#ff0000' : '#1db954' }}
                                />
                              </div>
                              <Show when={track.reasoning}>
                                <p class="text-gray-400 text-xs mt-1 italic">{track.reasoning}</p>
                              </Show>
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
              </div>
            </div>
          )}
        </For>

        {/* Typing Indicator */}
        <Show when={isTyping()}>
          <div class="flex justify-start">
            <div class="bg-gray-800 rounded-lg px-4 py-3">
              <div class="flex space-x-1">
                <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ 'animation-delay': '0ms' }}></div>
                <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ 'animation-delay': '150ms' }}></div>
                <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ 'animation-delay': '300ms' }}></div>
              </div>
            </div>
          </div>
        </Show>
      </div>

      {/* Quick Actions (for first interaction) */}
      <Show when={showQuickActions() && messages().length <= 1}>
        <div class="px-4 pb-2">
          <p class="text-xs text-gray-400 mb-2">Quick starts:</p>
          <div class="flex flex-wrap gap-2">
            <button
              onClick={() => handleQuickAction("I want some Frank Ocean and similar vibes")}
              class="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs rounded-full transition-colors"
            >
              "Frank Ocean vibes"
            </button>
            <button
              onClick={() => handleQuickAction("Something chill for late night coding")}
              class="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs rounded-full transition-colors"
            >
              "Late night coding"
            </button>
            <button
              onClick={() => handleQuickAction("High energy electronic music")}
              class="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs rounded-full transition-colors"
            >
              "High energy electronic"
            </button>
          </div>
        </div>
      </Show>

      {/* Selected Tracks Summary */}
      <Show when={selectedTracks().length > 0}>
        <div class="px-4 py-2 bg-green-900/20 border-t border-green-500/30">
          <div class="flex items-center justify-between">
            <span class="text-sm text-green-300">
              {selectedTracks().length} track{selectedTracks().length !== 1 ? 's' : ''} selected
            </span>
            <button
              onClick={handleComplete}
              class="px-4 py-1 text-sm rounded-full font-medium transition-all duration-300"
              style={{
                background: 'linear-gradient(135deg, #00f92a 0%, #04caf4 100%)'
              }}
            >
              Continue →
            </button>
          </div>
        </div>
      </Show>

      {/* Input Area */}
      <div class="border-t border-gray-800 p-4">
        <div class="flex space-x-2">
          <input
            ref={inputRef!}
            type="text"
            value={inputValue()}
            onInput={(e) => setInputValue(e.currentTarget.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Tell me about artists, songs, or the mood you want..."
            class="flex-1 px-4 py-2 bg-gray-900 border border-gray-700 rounded-full text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
          />
          <button
            onClick={handleSend}
            disabled={!inputValue().trim() || isTyping()}
            class="px-6 py-2 rounded-full font-medium transition-all duration-300 disabled:opacity-50"
            style={{
              background: inputValue().trim() && !isTyping()
                ? 'linear-gradient(135deg, #3b00fd 0%, #04caf4 100%)'
                : 'rgba(255,255,255,0.1)'
            }}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConversationalDiscovery;