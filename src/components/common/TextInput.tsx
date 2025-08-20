import { Component } from 'solid-js';
import { getThemeColors } from '../../utils/contrastColors';

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
  const colors = getThemeColors();
  
  const getInputStyle = () => ({
    width: '100%',
    padding: '0.75rem',
    fontSize: '0.875rem',
    background: colors.elevated,
    border: `2px solid ${colors.border}`,
    borderRadius: '4px',
    color: colors.body,
    outline: 'none',
    transition: 'border-color 0.2s ease',
    opacity: props.disabled ? '0.5' : '1',
    cursor: props.disabled ? 'not-allowed' : 'text'
  });

  const getLabelStyle = () => ({
    display: 'block',
    fontSize: '0.875rem',
    fontWeight: 'bold',
    color: colors.subheading,
    marginBottom: '0.25rem'
  });

  const handleFocus = (e: FocusEvent) => {
    (e.currentTarget as HTMLElement).style.borderColor = colors.borderAccent;
  };

  const handleBlur = (e: FocusEvent) => {
    (e.currentTarget as HTMLElement).style.borderColor = colors.border;
  };

  return (
    <div class={props.className || ''}>
      {props.label && (
        <label style={getLabelStyle()}>
          {props.label}
        </label>
      )}
      
      {props.multiline ? (
        <textarea
          placeholder={props.placeholder}
          value={props.value}
          onInput={(e) => props.onInput(e.currentTarget.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          style={{ ...getInputStyle(), resize: 'none' }}
          rows={props.rows || 3}
          disabled={props.disabled}
        />
      ) : (
        <input
          type="text"
          placeholder={props.placeholder}
          value={props.value}
          onInput={(e) => props.onInput(e.currentTarget.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          style={getInputStyle()}
          disabled={props.disabled}
        />
      )}
    </div>
  );
};

export default TextInput;