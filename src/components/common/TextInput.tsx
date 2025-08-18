import { Component } from 'solid-js';

interface TextInputProps {
  value: string;
  onInput: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
  rows?: number;
  className?: string;
  disabled?: boolean;
  label?: string;
}

const TextInput: Component<TextInputProps> = (props) => {
  const baseClasses = "w-full px-3 py-2 text-sm border-2 border-gray-400 bg-white disabled:opacity-50 disabled:cursor-not-allowed";
  const combinedClasses = `${baseClasses} ${props.className || ''}`;

  return (
    <div>
      {props.label && (
        <label class="block text-sm font-bold text-black mb-1">
          {props.label}
        </label>
      )}
      
      {props.multiline ? (
        <textarea
          placeholder={props.placeholder}
          value={props.value}
          onInput={(e) => props.onInput(e.currentTarget.value)}
          class={`${combinedClasses} resize-none`}
          rows={props.rows || 3}
          disabled={props.disabled}
        />
      ) : (
        <input
          type="text"
          placeholder={props.placeholder}
          value={props.value}
          onInput={(e) => props.onInput(e.currentTarget.value)}
          class={combinedClasses}
          disabled={props.disabled}
        />
      )}
    </div>
  );
};

export default TextInput;