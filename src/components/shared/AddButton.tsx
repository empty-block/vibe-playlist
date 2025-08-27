import { Component } from 'solid-js';

interface AddButtonProps {
  onClick: () => void;
  children: string;
  variant?: 'desktop' | 'mobile';
  class?: string;
}

const AddButton: Component<AddButtonProps> = (props) => {
  const baseClasses = "bg-green-400/20 text-green-400 border border-green-400/30 hover:bg-green-400/30 transition-all duration-300 hover:border-green-300 hover:text-green-300 font-semibold";
  
  if (props.variant === 'mobile') {
    return (
      <button
        onClick={props.onClick}
        class={`fixed bottom-6 right-6 w-14 h-14 ${baseClasses} rounded-full shadow-lg shadow-green-400/30 hover:scale-110 flex items-center justify-center text-xl z-50 sm:hidden ${props.class || ''}`}
        style={{
          'box-shadow': '0 4px 20px rgba(34, 197, 94, 0.4), 0 0 40px rgba(34, 197, 94, 0.2)'
        }}
      >
        +
      </button>
    );
  }
  
  return (
    <button
      onClick={props.onClick}
      class={`${baseClasses} px-6 py-3 rounded-lg ${props.class || ''}`}
    >
      {props.children}
    </button>
  );
};

export default AddButton;