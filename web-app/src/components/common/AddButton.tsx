import { Component } from 'solid-js';

interface AddButtonProps {
  onClick: () => void;
  children: any; // Changed from string to any to support JSX content
  variant?: 'desktop' | 'mobile';
  class?: string;
}

const AddButton: Component<AddButtonProps> = (props) => {
  const baseClasses = `
    relative overflow-hidden
    bg-[#0d0d0d]/90 backdrop-blur
    text-[#00f92a] 
    border-2 border-[#04caf4]/40
    font-mono font-bold uppercase tracking-wider
    transition-all duration-300
    hover:bg-[#00f92a]/10 hover:border-[#00f92a]/60 hover:text-[#00ff41]
    hover:shadow-[0_0_20px_rgba(0,249,42,0.4),0_0_40px_rgba(4,202,244,0.2)]
    active:scale-[0.98] active:shadow-[0_0_15px_rgba(0,249,42,0.6)]
  `.replace(/\s+/g, ' ').trim();
  
  if (props.variant === 'mobile') {
    return (
      <button
        onClick={props.onClick}
        class={`
          fixed bottom-6 right-6 w-16 h-16 z-50 sm:hidden
          ${baseClasses}
          text-lg
          ${props.class || ''}
        `.replace(/\s+/g, ' ').trim()}
        style={{
          'text-shadow': '0 0 8px rgba(0, 249, 42, 0.6)',
          'box-shadow': '0 0 12px rgba(0, 249, 42, 0.3), 0 0 24px rgba(4, 202, 244, 0.1)'
        }}
      >
        {/* Corner Brackets */}
        <div class="absolute top-1 left-1 w-3 h-3 border-l-2 border-t-2 border-[#04caf4]/60"></div>
        <div class="absolute top-1 right-1 w-3 h-3 border-r-2 border-t-2 border-[#04caf4]/60"></div>
        <div class="absolute bottom-1 left-1 w-3 h-3 border-l-2 border-b-2 border-[#04caf4]/60"></div>
        <div class="absolute bottom-1 right-1 w-3 h-3 border-r-2 border-b-2 border-[#04caf4]/60"></div>
        
        {/* Scanning Lines */}
        <div class="absolute top-0 left-0 w-full h-px bg-[#00f92a]/60 animate-pulse"></div>
        <div class="absolute bottom-0 left-0 w-full h-px bg-[#04caf4]/40 animate-pulse" style="animation-delay: 0.5s;"></div>
        
        {/* Sweep Effect */}
        <div class="absolute inset-0 bg-gradient-to-r from-transparent via-[#00f92a]/20 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-500"></div>
        
        <div class="relative z-10">
          {props.children}
        </div>
      </button>
    );
  }
  
  return (
    <button
      onClick={props.onClick}
      class={`
        px-6 py-3 text-sm
        ${baseClasses}
        ${props.class || ''}
      `.replace(/\s+/g, ' ').trim()}
      style={{
        'text-shadow': '0 0 8px rgba(0, 249, 42, 0.6)',
        'box-shadow': '0 0 8px rgba(0, 249, 42, 0.2), 0 0 16px rgba(4, 202, 244, 0.1)'
      }}
    >
      {/* Corner Brackets */}
      <div class="absolute top-1 left-1 w-2 h-2 border-l-2 border-t-2 border-[#04caf4]/60"></div>
      <div class="absolute top-1 right-1 w-2 h-2 border-r-2 border-t-2 border-[#04caf4]/60"></div>
      <div class="absolute bottom-1 left-1 w-2 h-2 border-l-2 border-b-2 border-[#04caf4]/60"></div>
      <div class="absolute bottom-1 right-1 w-2 h-2 border-r-2 border-b-2 border-[#04caf4]/60"></div>
      
      {/* Scanning Lines */}
      <div class="absolute top-0 left-0 w-full h-px bg-[#00f92a]/60 animate-pulse"></div>
      <div class="absolute bottom-0 left-0 w-full h-px bg-[#04caf4]/40 animate-pulse" style="animation-delay: 0.5s;"></div>
      
      {/* Sweep Effect */}
      <div class="absolute inset-0 bg-gradient-to-r from-transparent via-[#00f92a]/20 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-500"></div>
      
      <div class="relative z-10 flex items-center gap-2">
        {props.children}
      </div>
    </button>
  );
};

export default AddButton;