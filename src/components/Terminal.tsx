import { Component, createSignal, onMount } from 'solid-js';

interface TerminalProps {
  onClose: () => void;
}

const Terminal: Component<TerminalProps> = (props) => {
  const [terminalLines, setTerminalLines] = createSignal<string[]>([
    'VIBES OS [Version 1.0.95]',
    '(C) Copyright 1995 Vibes Corp. All rights reserved.',
    '',
    'System exited. Terminal mode activated.',
    ''
  ]);
  const [currentInput, setCurrentInput] = createSignal('');
  let inputRef: HTMLInputElement;
  
  onMount(() => {
    inputRef?.focus();
  });
  
  const addLine = (line: string) => {
    setTerminalLines(prev => [...prev, line]);
  };
  
  const handleCommand = (cmd: string) => {
    addLine(`C:\\VIBES> ${cmd}`);
    
    const command = cmd.toLowerCase().trim();
    
    switch(command) {
      case 'help':
        addLine('Available commands:');
        addLine('  help     - Show this help message');
        addLine('  about    - About VIBES');
        addLine('  clear    - Clear terminal');
        addLine('  exit     - Exit terminal');
        addLine('  play     - Resume playback');
        addLine('  stop     - Stop playback');
        addLine('  next     - Next track');
        addLine('  prev     - Previous track');
        break;
        
      case 'about':
        addLine('VIBES 95 - Digital Mixtape Creator');
        addLine('Version 1.0');
        addLine('Created with pure 90s nostalgia and modern web tech');
        break;
        
      case 'clear':
        setTerminalLines([]);
        break;
        
      case 'exit':
        props.onClose();
        break;
        
      case 'play':
        addLine('Resuming playback...');
        // TODO: Implement play functionality
        break;
        
      case 'stop':
        addLine('Stopping playback...');
        // TODO: Implement stop functionality
        break;
        
      default:
        addLine(`'${cmd}' is not recognized as an internal or external command.`);
        addLine('Type "help" for available commands.');
    }
    
    addLine('');
  };
  
  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      const input = currentInput();
      if (input) {
        handleCommand(input);
        setCurrentInput('');
      }
    }
  };
  
  return (
    <div 
      class="fixed inset-0 bg-black font-mono p-4 z-50 overflow-auto" style="color: var(--primary-color);"
      onClick={() => inputRef?.focus()}
    >
      <div class="max-w-4xl mx-auto">
        <div class="mb-2 flex justify-between items-center">
          <h2 class="text-xl">VIBES Terminal</h2>
          <button 
            onClick={props.onClose}
            class="text-red-500 hover:text-red-400"
          >
            [X] Close
          </button>
        </div>
        
        <div class="p-4 min-h-[400px]" style="border: 1px solid var(--primary-color);">
          {terminalLines().map(line => (
            <div class="whitespace-pre-wrap">{line}</div>
          ))}
          
          <div class="flex items-center">
            <span>C:\VIBES&gt; </span>
            <input
              ref={inputRef!}
              type="text"
              value={currentInput()}
              onInput={(e) => setCurrentInput(e.currentTarget.value)}
              onKeyPress={handleKeyPress}
              class="flex-1 bg-transparent outline-none ml-2"
              spellcheck={false}
            />
            <span class="animate-blink">_</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terminal;