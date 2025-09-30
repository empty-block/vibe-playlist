import { Component, createSignal, createEffect } from 'solid-js';
import BaseModal from '../common/Modal/BaseModal';
import SongInputForm from '../common/SongInputForm';
import { modalAnimations } from '../../utils/animations';
import './addTrackModal.css';

interface AddTrackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { songUrl: string; comment: string }) => void;
  initialData?: { songUrl?: string; comment?: string };
}

const AddTrackModal: Component<AddTrackModalProps> = (props) => {
  const [isSubmitting, setIsSubmitting] = createSignal(false);
  let headerRef: HTMLDivElement | undefined;
  let formRef: HTMLDivElement | undefined;

  const handleFormSubmit = async (data: { songUrl: string; comment: string }) => {
    setIsSubmitting(true);
    try {
      await props.onSubmit(data);
      props.onClose();
    } catch (error) {
      console.error('Error submitting track:', error);
      // Error handling could be improved with toast notifications
    } finally {
      setIsSubmitting(false);
    }
  };


  // Trigger terminal boot sequence when modal opens
  createEffect(() => {
    if (props.isOpen && headerRef && formRef) {
      setTimeout(() => {
        modalAnimations.terminalBootSequence(headerRef!, formRef!);
      }, 400); // After modal entry animation
    }
  });

  return (
    <BaseModal 
      isOpen={props.isOpen}
      onClose={props.onClose}
      title="Add Track to Library"
      size="md"
      className="add-track-modal"
      showCloseButton={false}
    >
      <div class="modal-content-wrapper">
        <div class="terminal-header" ref={headerRef}>
          <div class="terminal-path-container">
            <span class="terminal-prefix">JAMZY://</span>
            <span class="terminal-path"></span>
          </div>
          <button
            class="terminal-close-button"
            onClick={props.onClose}
            aria-label="Close modal"
          >
            X
          </button>
        </div>
        
        <div ref={formRef}>
          <SongInputForm
            onSubmit={handleFormSubmit}
            submitLabel="[ EXECUTE ADD ]"
            initialSongUrl={props.initialData?.songUrl}
            initialComment={props.initialData?.comment}
            disabled={isSubmitting()}
          />
        </div>
        
        <div class="modal-footer">
          <div class="terminal-status">
            STATUS: READY FOR INPUT • PRESS ESC TO EXIT
          </div>
        </div>
      </div>
    </BaseModal>
  );
};

export default AddTrackModal;