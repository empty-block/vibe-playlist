import { Component, JSX } from 'solid-js';

interface CommandPromptProps {
  path: string;
  command: string;
  additionalContent?: JSX.Element;
}

const CommandPrompt: Component<CommandPromptProps> = (props) => {
  return (
    <div class="terminal-content-area">
      {/* Single row: User + Path and Command side by side */}
      <div class="terminal-prompt-line">
        {props.additionalContent}
        <span class="terminal-user">user@jamzy</span>
        <span class="terminal-colon">:</span>
        <span class="terminal-path">{props.path}</span>
        <span class="terminal-dollar">$</span>
        <span class="terminal-command">{props.command}</span>
      </div>
    </div>
  );
};

export default CommandPrompt;
