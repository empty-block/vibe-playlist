import { Component } from 'solid-js';

interface ModalBackdropProps {
  isVisible: boolean;
  onClick?: () => void;
  className?: string;
}

const ModalBackdrop: Component<ModalBackdropProps> = (props) => {
  return (
    <div 
      class={`modal-backdrop ${props.className || ''}`}
      classList={{ 'visible': props.isVisible }}
      onClick={props.onClick}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(0, 0, 0, 0.85)',
        opacity: props.isVisible ? 1 : 0,
        'z-index': 1000,
        transition: 'opacity 0.3s ease',
        cursor: props.onClick ? 'pointer' : 'default'
      }}
    />
  );
};

export default ModalBackdrop;