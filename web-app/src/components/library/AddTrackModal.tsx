import { Component, createSignal } from 'solid-js';
import BaseModal from '../common/Modal/BaseModal';
import SongInputForm from '../common/SongInputForm';
import './addTrackModal.css';

interface AddTrackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { songUrl: string; comment: string }) => void;
  initialData?: { songUrl?: string; comment?: string };
}

const AddTrackModal: Component<AddTrackModalProps> = (props) => {
  const [isSubmitting, setIsSubmitting] = createSignal(false);

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
        {/* Retro Windows-style title bar */}
        <div class="retro-titlebar">
          <div class="titlebar-left">
            <i class="fas fa-music titlebar-icon"></i>
            <span class="titlebar-title">Add Track to Library</span>
          </div>
          <div class="titlebar-controls">
            <button
              class="titlebar-button minimize-btn"
              onClick={props.onClose}
              aria-label="Minimize"
              disabled
            >
              _
            </button>
            <button
              class="titlebar-button maximize-btn"
              onClick={props.onClose}
              aria-label="Maximize"
              disabled
            >
              □
            </button>
            <button
              class="titlebar-button close-btn"
              onClick={props.onClose}
              aria-label="Close"
            >
              ×
            </button>
          </div>
        </div>

        <div class="modal-form-content">
          <SongInputForm
            onSubmit={handleFormSubmit}
            submitLabel="Add Track"
            initialSongUrl={props.initialData?.songUrl}
            initialComment={props.initialData?.comment}
            disabled={isSubmitting()}
          />
        </div>
      </div>
    </BaseModal>
  );
};

export default AddTrackModal;