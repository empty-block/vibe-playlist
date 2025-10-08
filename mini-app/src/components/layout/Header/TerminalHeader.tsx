import { Component, JSX, Show } from 'solid-js';
import CommandPrompt from './CommandPrompt';
import './TerminalHeader.css';

export type BorderColor = 'cyan' | 'magenta' | 'yellow' | 'green';

interface TerminalHeaderProps {
  title: string;
  path: string;
  command: string;
  statusInfo?: string;
  borderColor?: BorderColor;
  additionalContent?: JSX.Element;
  children?: JSX.Element;
  class?: string;
}

const TerminalHeader: Component<TerminalHeaderProps> = (props) => {
  const borderColorClass = () => {
    switch (props.borderColor) {
      case 'cyan':
        return 'terminal-header--cyan';
      case 'magenta':
        return 'terminal-header--magenta';
      case 'yellow':
        return 'terminal-header--yellow';
      case 'green':
        return 'terminal-header--green';
      default:
        return 'terminal-header--magenta'; // default
    }
  };

  return (
    <header
      class={`terminal-header ${borderColorClass()} ${props.class || ''}`}
      role="banner"
    >
      {/* Title bar */}
      <div class="terminal-title-bar">
        <span>┌─[</span>
        <span style={{ 'font-weight': 700 }}>{props.title}</span>
        <span>]</span>
        <Show when={props.statusInfo}>
          <span>────────────────────[</span>
          <span class="terminal-status-info">{props.statusInfo}</span>
          <span>]</span>
        </Show>
        <span>─┐</span>
      </div>

      {/* Optional children (like FilterBar) */}
      <Show when={props.children}>
        {props.children}
      </Show>
    </header>
  );
};

export default TerminalHeader;
