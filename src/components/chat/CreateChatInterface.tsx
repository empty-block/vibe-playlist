import { Component, createSignal, For, onMount } from 'solid-js';
import { slideIn, staggeredFadeIn } from '../../utils/animations';
import anime from 'animejs';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  actions?: {
    type: 'create_playlist' | 'add_track' | 'confirm';
    data?: any;
  }[];
}

interface CreateChatInterfaceProps {
  onCreatePlaylist?: (name: string, type: string) => void;
  onAddTrack?: (url: string, playlistId: string, comment?: string) => void;
}

const CreateChatInterface: Component<CreateChatInterfaceProps> = (props) => {
  const [messages, setMessages] = createSignal<Message[]>([
    {
      id: '1',
      text: "Hey! I'm here to help you create playlists and add tracks. You can say things like:\n\n• 'Create a workout playlist called Gym Bangers'\n• 'Add [YouTube URL] to Friday Bangers'\n• 'Add this song to Chill Vibes and Road Trip'\n• 'Find me songs similar to Radiohead for my Study playlist'\n\nWhat would you like to do?",
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = createSignal('');
  const [isTyping, setIsTyping] = createSignal(false);
  
  let messagesEndRef: HTMLDivElement;
  let chatContainerRef: HTMLDivElement;
  let inputRef: HTMLInputElement;

  onMount(() => {
    // Animate chat container entrance
    if (chatContainerRef) {
      slideIn.fromBottom(chatContainerRef);
    }
    
    // Focus input
    inputRef?.focus();
  });

  const scrollToBottom = () => {
    messagesEndRef?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async () => {
    const text = inputText().trim();
    if (!text) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);
    
    // Simulate AI response
    setTimeout(() => {
      const aiResponse = generateAIResponse(text);
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
      scrollToBottom();
    }, 1000 + Math.random() * 1000);
  };

  const generateAIResponse = (userInput: string): Message => {
    const input = userInput.toLowerCase();
    
    // Mock playlist names for detection
    const playlists = ['my jams', 'friday bangers', 'chill vibes', 'study', 'workout', 'road trip', 'indie discoveries'];
    
    // Check for playlist creation
    if (input.includes('create') && (input.includes('playlist') || input.includes('list'))) {
      const nameMatch = input.match(/called\s+(.+?)(?:\s|$)|named\s+(.+?)(?:\s|$)|"(.+?)"/);
      const playlistName = nameMatch ? (nameMatch[1] || nameMatch[2] || nameMatch[3]) : 'New Playlist';
      
      return {
        id: Date.now().toString(),
        text: `Great! I'll create a playlist called "${playlistName}". What type should it be?`,
        sender: 'ai',
        timestamp: new Date(),
        actions: [
          {
            type: 'create_playlist',
            data: { name: playlistName, type: 'collaborative' }
          }
        ]
      };
    }
    
    // Check for adding tracks with playlist specification
    if (input.includes('add') || input.includes('youtube.com') || input.includes('spotify.com')) {
      const urlMatch = input.match(/https?:\/\/[^\s]+/);
      
      // Check which playlists are mentioned
      const mentionedPlaylists = playlists.filter(p => input.includes(p));
      
      if (urlMatch) {
        if (mentionedPlaylists.length > 0) {
          return {
            id: Date.now().toString(),
            text: `Perfect! I'll add this track to ${mentionedPlaylists.map(p => `"${p}"`).join(' and ')}. Here's what I found:\n\n🎵 Track: [Analyzing URL...]\n📝 Playlists: ${mentionedPlaylists.join(', ')}\n\nLook good?`,
            sender: 'ai',
            timestamp: new Date(),
            actions: [
              {
                type: 'add_track',
                data: { url: urlMatch[0], playlists: mentionedPlaylists }
              }
            ]
          };
        } else {
          return {
            id: Date.now().toString(),
            text: `I found a track URL! Which playlist(s) should I add it to?\n\n📌 Popular choices:\n• My Jams (your personal feed)\n• Friday Bangers (party vibes)\n• Chill Vibes (relaxation)\n• Study (focus music)\n\nYou can select multiple playlists!`,
            sender: 'ai',
            timestamp: new Date(),
            actions: [
              {
                type: 'add_track',
                data: { url: urlMatch[0] }
              }
            ]
          };
        }
      }
      
      // No URL but wants to add music
      if (mentionedPlaylists.length > 0) {
        return {
          id: Date.now().toString(),
          text: `I'll help you add tracks to ${mentionedPlaylists.map(p => `"${p}"`).join(' and ')}! Just paste the track URL (YouTube, Spotify, or SoundCloud).`,
          sender: 'ai',
          timestamp: new Date()
        };
      }
      
      return {
        id: Date.now().toString(),
        text: `I can help you add tracks! Just paste a YouTube, Spotify, or SoundCloud URL and tell me which playlist(s) to add it to.`,
        sender: 'ai',
        timestamp: new Date()
      };
    }
    
    // Check for music discovery
    if (input.includes('find') || input.includes('similar') || input.includes('like')) {
      return {
        id: Date.now().toString(),
        text: `I'd love to help you discover new music! Based on your request, here are some suggestions:\n\n• Similar artists you might enjoy\n• Tracks with the same vibe\n• Genre-based recommendations\n\nWould you like me to add any specific tracks to a playlist?`,
        sender: 'ai',
        timestamp: new Date()
      };
    }
    
    // Default response
    return {
      id: Date.now().toString(),
      text: `I understand you want to ${userInput}. Could you be more specific? For example:\n• "Create a playlist called Weekend Vibes"\n• "Add [YouTube URL] to My Jams"\n• "Find songs similar to Nirvana"`,
      sender: 'ai',
      timestamp: new Date()
    };
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div ref={chatContainerRef!} class="flex flex-col h-full">
      {/* Messages Area */}
      <div class="flex-1 overflow-y-auto p-4 space-y-4">
        <For each={messages()}>
          {(message) => (
            <div class={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div class={`max-w-md ${message.sender === 'user' ? 'order-2' : 'order-1'}`}>
                <div 
                  class={`p-3 rounded-lg ${
                    message.sender === 'user' 
                      ? 'bg-blue-500 text-white' 
                      : 'win95-panel bg-gray-100'
                  }`}
                  style={message.sender === 'user' ? {
                    background: 'linear-gradient(135deg, #3b00fd 0%, #04caf4 100%)'
                  } : {}}
                >
                  <p class="text-sm whitespace-pre-wrap">{message.text}</p>
                  
                  {/* Action Buttons */}
                  {message.actions && (
                    <div class="mt-3 space-y-2">
                      <For each={message.actions}>
                        {(action) => (
                          <button 
                            class="win95-button px-3 py-1 text-xs font-bold w-full"
                            onClick={() => {
                              if (action.type === 'create_playlist' && props.onCreatePlaylist) {
                                props.onCreatePlaylist(action.data.name, action.data.type);
                              } else if (action.type === 'add_track' && props.onAddTrack) {
                                props.onAddTrack(action.data.url, 'my_jams');
                              }
                            }}
                          >
                            {action.type === 'create_playlist' ? '✨ Create Playlist' : '🎵 Add Track'}
                          </button>
                        )}
                      </For>
                    </div>
                  )}
                </div>
                <div class={`text-xs text-gray-500 mt-1 ${message.sender === 'user' ? 'text-right' : ''}`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          )}
        </For>
        
        {/* Typing Indicator */}
        {isTyping() && (
          <div class="flex justify-start">
            <div class="win95-panel bg-gray-100 p-3 rounded-lg">
              <div class="flex gap-1">
                <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0ms"></span>
                <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 150ms"></span>
                <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 300ms"></span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef!}></div>
      </div>
      
      {/* Input Area */}
      <div class="border-t-2 border-gray-300 p-4">
        <div class="flex gap-2">
          <input
            ref={inputRef!}
            type="text"
            value={inputText()}
            onInput={(e) => setInputText(e.currentTarget.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            class="flex-1 px-3 py-2 text-sm border-2 border-gray-400 bg-white"
          />
          <button
            onClick={handleSend}
            disabled={!inputText().trim()}
            class="win95-button px-4 py-2 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            style={inputText().trim() ? {
              background: 'linear-gradient(135deg, #04caf4 0%, #00f92a 100%)'
            } : {}}
          >
            <i class="fas fa-paper-plane"></i>
          </button>
        </div>
        
        {/* Example prompts */}
        <div class="mt-2 flex flex-wrap gap-2">
          <button
            onClick={() => setInputText("Create a workout playlist called 'Gym Bangers'")}
            class="text-xs text-gray-600 hover:text-blue-600 underline"
          >
            Create playlist
          </button>
          <span class="text-xs text-gray-400">•</span>
          <button
            onClick={() => setInputText("Add this to Friday Bangers and Chill Vibes")}
            class="text-xs text-gray-600 hover:text-blue-600 underline"
          >
            Add to multiple
          </button>
          <span class="text-xs text-gray-400">•</span>
          <button
            onClick={() => setInputText("Find songs similar to Radiohead for my Study playlist")}
            class="text-xs text-gray-600 hover:text-blue-600 underline"
          >
            Discover for playlist
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateChatInterface;