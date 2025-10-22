import { Component } from 'solid-js';
import { allTracks } from '../../stores/libraryStore';
import './LibraryFooter.css';

interface LibraryFooterProps {
  mode?: 'library' | 'profile';
  personalTracks?: any[];
}

const LibraryFooter: Component<LibraryFooterProps> = (props) => {
  
  const getTrackCount = () => {
    if (props.mode === 'profile' && props.personalTracks) {
      return props.personalTracks.length;
    }
    return allTracks().length;
  };

  return (
    <div class="winamp-library-footer">
      <div class="footer-status">
        <span class="network-status">
          TRACKS: {getTrackCount()}
        </span>
      </div>
    </div>
  );
};

export default LibraryFooter;