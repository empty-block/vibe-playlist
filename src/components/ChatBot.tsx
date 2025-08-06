import { Component, createSignal, createEffect, For } from 'solid-js';

interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  message: string;
  timestamp: Date;
}

interface ChatBotProps {
  isVisible?: boolean;
  onToggle?: () => void;
}

const ChatBot: Component<ChatBotProps> = (props) => {
  const [messages, setMessages] = createSignal<ChatMessage[]>([
    {
      id: '1',
      type: 'ai',
      message: "Hey there! I'm your AI music assistant. I can help you discover new tracks, analyze your playlist, or chat about 90s music. What would you like to do?",
      timestamp: new Date()
    }
  ]);
  
  const [inputValue, setInputValue] = createSignal('');
  const [isTyping, setIsTyping] = createSignal(false);

  let chatMessagesRef: HTMLDivElement | undefined;

  const scrollToBottom = () => {
    if (chatMessagesRef) {
      chatMessagesRef.scrollTop = chatMessagesRef.scrollHeight;
    }
  };

  createEffect(() => {
    // Scroll to bottom when messages change
    if (messages().length > 0) {
      setTimeout(scrollToBottom, 100);
    }
  });

  const addMessage = (type: 'user' | 'ai', message: string) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      type,
      message,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const generateAIResponse = (userMessage: string): string => {
    const responses = [
      `Interesting! I can hear that ${userMessage.toLowerCase()} vibe in your playlist. The 90s were such an amazing time for music discovery!`,
      `Great question about ${userMessage}! As a music AI from 1995, I've got tons of recommendations. What genre are you feeling?`,
      `I love talking about ${userMessage}! Your current playlist has some real gems. Want me to suggest similar artists?`,
      `${userMessage} reminds me of the underground scene back in '95. Those were the days of discovering music through word of mouth!`,
      `You know what goes great with ${userMessage}? Some deep album cuts that most people haven't discovered yet!`,
      `That ${userMessage} energy is perfect for this playlist! I'm already thinking of some tracks that would fit perfectly.`
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const sendMessage = () => {
    const message = inputValue().trim();
    if (!message) return;

    // Add user message
    addMessage('user', message);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI typing delay
    setTimeout(() => {
      const response = generateAIResponse(message);
      addMessage('ai', response);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const handleQuickAction = (action: string) => {
    const responses = {
      recommend: "Based on your grunge playlist, I'd suggest adding some Soundgarden, Mad Season, or early Foo Fighters! Want me to find specific tracks?",
      analyze: "Your playlist is 90% grunge/alternative with strong Seattle influence. You have great variety from Nirvana to Temple of the Dog. The energy flow is excellent!",
      trivia: "Fun fact: Did you know 'Smells Like Teen Spirit' was inspired by deodorant? Kurt Cobain didn't realize 'Teen Spirit' was a brand name!",
      mood: "I'm detecting some serious angst and rebellion in your playlist! Perfect for late-night coding or rainy day vibes. Want me to add some matching tracks?"
    };

    setIsTyping(true);
    setTimeout(() => {
      addMessage('ai', responses[action as keyof typeof responses]);
      setIsTyping(false);
    }, 800);
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(date);
  };

  return (
    <div class={`w-72 win95-panel p-4 m-2 flex flex-col ${props.isVisible === false ? 'hidden' : ''}`} style="height: calc(100vh - 4rem);">
      {/* Title Bar */}
      <div class="windows-titlebar p-2 mb-4 flex justify-between items-center">
        <span><i class="fas fa-robot mr-2"></i>DJ Bot 95 - Music Assistant</span>
        <button 
          onClick={props.onToggle}
          class="win95-button w-6 h-4 text-xs font-bold text-black hover:bg-red-200"
        >
          ×
        </button>
      </div>
      
      {/* AI Avatar & Status */}
      <div class="lcd-text mb-4 text-center">
        <div class="text-lg mb-1">🤖</div>
        <div class="text-xs">ONLINE • READY TO HELP</div>
      </div>
      
      {/* Chat Messages */}
      <div 
        ref={chatMessagesRef}
        class="bg-white border-2 border-gray-400 overflow-y-auto mb-4 p-3" 
        style="height: 280px; flex-shrink: 0;"
      >
        <div class="space-y-3">
          <For each={messages()}>
            {(message) => (
              <div class="flex gap-2">
                <div class="text-lg">
                  {message.type === 'ai' ? '🤖' : '👤'}
                </div>
                <div class="flex-1">
                  <div class={`rounded p-2 text-xs font-terminal ${
                    message.type === 'ai' ? 'bg-gray-200' : 'bg-blue-100'
                  }`}>
                    <strong>{message.type === 'ai' ? 'DJ Bot 95:' : 'You:'}</strong> {message.message}
                  </div>
                  <div class="text-xs text-gray-500 mt-1">{formatTime(message.timestamp)}</div>
                </div>
              </div>
            )}
          </For>
          
          {/* Typing indicator */}
          {isTyping() && (
            <div class="flex gap-2">
              <div class="text-lg">🤖</div>
              <div class="flex-1">
                <div class="bg-gray-200 rounded p-2 text-xs font-terminal">
                  <strong>DJ Bot 95:</strong> <i>typing...</i>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Quick Actions */}
      <div class="mb-3 flex-shrink-0">
        <div class="text-xs font-bold text-black mb-2">Quick Actions:</div>
        <div class="grid grid-cols-2 gap-1">
          <button 
            onClick={() => handleQuickAction('recommend')} 
            class="win95-button px-2 py-1 text-xs text-black"
          >
            🎯 Recommend
          </button>
          <button 
            onClick={() => handleQuickAction('analyze')} 
            class="win95-button px-2 py-1 text-xs text-black"
          >
            📊 Analyze
          </button>
          <button 
            onClick={() => handleQuickAction('trivia')} 
            class="win95-button px-2 py-1 text-xs text-black"
          >
            🎮 Trivia
          </button>
          <button 
            onClick={() => handleQuickAction('mood')} 
            class="win95-button px-2 py-1 text-xs text-black"
          >
            😎 Mood Mix
          </button>
        </div>
      </div>
      
      {/* Chat Input */}
      <div class="flex flex-col gap-2 flex-shrink-0">
        <textarea 
          placeholder="Ask DJ Bot 95 anything about music, playlists, or 90s trivia..."
          value={inputValue()}
          onInput={(e) => setInputValue(e.currentTarget.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
          rows="4"
          class="w-full px-3 py-2 border-2 border-gray-400 bg-white text-black font-terminal text-sm resize-none"
        />
        <div class="flex gap-2">
          <button 
            onClick={sendMessage}
            class="win95-button px-3 py-1 text-black font-bold text-sm flex-1"
          >
            <i class="fas fa-paper-plane mr-1"></i>Send
          </button>
          <button 
            onClick={() => setInputValue('')}
            class="win95-button px-2 py-1 text-black font-bold text-sm"
            title="Clear input"
          >
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;