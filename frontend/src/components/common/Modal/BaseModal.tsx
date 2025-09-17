import { Component, JSXElement, onMount, onCleanup, createEffect, Show } from 'solid-js';
import { Portal } from 'solid-js/web';
import ModalBackdrop from './ModalBackdrop';
import { modalAnimations } from '../../../utils/animations';
import './modal.css';

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: JSXElement;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showCloseButton?: boolean;
  closeOnBackdropClick?: boolean;
  closeOnEscape?: boolean;
  className?: string;
}

const BaseModal: Component<BaseModalProps> = (props) => {
  let modalRef: HTMLDivElement | undefined;
  let backdropRef: HTMLDivElement | undefined;
  let focusTrapCleanup: (() => void) | undefined;

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && props.closeOnEscape !== false && props.isOpen) {
      props.onClose();
    }
  };

  const createFocusTrap = (modalElement: HTMLElement) => {
    const focusableElements = modalElement.querySelectorAll(
      'button:not([disabled]), input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>;
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };
    
    modalElement.addEventListener('keydown', handleTabKey);
    
    // Auto-focus first element when modal opens
    if (props.isOpen && firstElement) {
      firstElement.focus();
    }
    
    return () => modalElement.removeEventListener('keydown', handleTabKey);
  };

  createEffect(() => {
    if (props.isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
      
      // Trigger entry animations after modal is rendered
      setTimeout(() => {
        if (modalRef && backdropRef) {
          modalAnimations.enter(modalRef, backdropRef);
          focusTrapCleanup = createFocusTrap(modalRef);
        }
      }, 50);
    } else {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
      focusTrapCleanup?.();
    }
  });

  onCleanup(() => {
    document.removeEventListener('keydown', handleKeyDown);
    document.body.style.overflow = '';
    focusTrapCleanup?.();
  });

  const getSizeClass = () => {
    switch (props.size) {
      case 'sm': return 'modal-sm';
      case 'lg': return 'modal-lg';
      case 'xl': return 'modal-xl';
      default: return 'modal-md';
    }
  };

  const getCloseButtonHandler = () => {
    return props.closeOnBackdropClick !== false ? props.onClose : undefined;
  };

  return (
    <Show when={props.isOpen}>
      <Portal>
        <div class="modal-portal">
          <div
            ref={backdropRef}
            class={`modal-backdrop visible`}
            onClick={getCloseButtonHandler()}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              background: 'rgba(0, 0, 0, 0.65)',
              opacity: 0,
              'z-index': 1000,
              cursor: getCloseButtonHandler() ? 'pointer' : 'default'
            }}
          />
          <div 
            class="modal-container"
            onClick={getCloseButtonHandler()}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              display: 'flex',
              'align-items': 'center',
              'justify-content': 'center',
              'z-index': 1001,
              padding: '20px',
              cursor: getCloseButtonHandler() ? 'pointer' : 'default'
            }}
          >
            {props.showCloseButton !== false && (
              <button
                class="modal-close-button"
                onClick={props.onClose}
                aria-label="Close modal"
              >
                X
              </button>
            )}
            <div
              ref={modalRef}
              class={`base-modal ${getSizeClass()} ${props.className || ''}`}
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-title"
              onClick={(e) => e.stopPropagation()}
              style={{
                'max-width': '90vw',
                'max-height': '90vh',
                'overflow-y': 'auto',
                position: 'relative'
              }}
            >
              
              <h2 id="modal-title" class="sr-only">{props.title}</h2>
              
              {props.children}
            </div>
          </div>
        </div>
      </Portal>
    </Show>
  );
};

export default BaseModal;