import { Component, createSignal } from 'solid-js';
import BaseModal from '../common/Modal/BaseModal';
import SongInputForm from '../common/SongInputForm';
import './addTrackModal.css';

interface AddTrackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { songUrl: string; comment: string }) => void;
  initialData?: { songUrl?: string; comment?: string };
  title?: string; // Optional title override
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

  const modalTitle = props.title || "Add Track to Library";

  return (
    <BaseModal
      isOpen={props.isOpen}
      onClose={props.onClose}
      title={modalTitle}
      size="md"
      className="add-track-modal"
      showCloseButton={true}
    >
      <div class="modal-form-content">
        <SongInputForm
          onSubmit={handleFormSubmit}
          submitLabel="Add Track"
          initialSongUrl={props.initialData?.songUrl}
          initialComment={props.initialData?.comment}
          disabled={isSubmitting()}
        />
      </div>
    </BaseModal>
  );
};

export default AddTrackModal;
