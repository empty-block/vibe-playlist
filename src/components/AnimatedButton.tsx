import { Component, JSX, onMount } from 'solid-js';
import { buttonHover, socialButtonClick, playButtonPulse, iconSpin } from '../utils/animations';

interface AnimatedButtonProps {
  children: JSX.Element;
  onClick?: () => void;
  class?: string;
  classList?: Record<string, boolean>;
  title?: string;
  disabled?: boolean;
  animationType?: 'default' | 'social' | 'play' | 'spin';
  spinIcon?: boolean;
}

const AnimatedButton: Component<AnimatedButtonProps> = (props) => {
  let buttonRef: HTMLButtonElement;

  onMount(() => {
    if (buttonRef && !props.disabled) {
      // Add hover animations
      buttonRef.addEventListener('mouseenter', () => {
        if (props.animationType !== 'play') {
          buttonHover.enter(buttonRef);
        }
      });

      buttonRef.addEventListener('mouseleave', () => {
        if (props.animationType !== 'play') {
          buttonHover.leave(buttonRef);
        }
      });

      // Add click animations
      buttonRef.addEventListener('click', () => {
        switch (props.animationType) {
          case 'social':
            socialButtonClick(buttonRef);
            break;
          case 'play':
            playButtonPulse(buttonRef);
            break;
          case 'spin':
            if (props.spinIcon) {
              const icon = buttonRef.querySelector('i');
              if (icon) iconSpin(icon as HTMLElement);
            } else {
              iconSpin(buttonRef);
            }
            break;
          default:
            socialButtonClick(buttonRef);
        }
      });
    }
  });

  const handleClick = () => {
    props.onClick?.();
  };

  return (
    <button
      ref={buttonRef!}
      onClick={handleClick}
      class={props.class}
      classList={props.classList}
      title={props.title}
      disabled={props.disabled}
      style={{
        transition: 'none', // Disable CSS transitions since we're using anime.js
        transform: 'translateZ(0)', // Enable hardware acceleration
      }}
    >
      {props.children}
    </button>
  );
};

export default AnimatedButton;