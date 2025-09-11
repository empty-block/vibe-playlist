import { Component } from 'solid-js';
import { allTracks } from '../../../stores/libraryStore';
import { selectedNetwork } from '../../../stores/networkStore';
import './WinampLibraryFooter.css';

interface WinampLibraryFooterProps {
  mode?: 'library' | 'profile';
  personalTracks?: any[];
}

const WinampLibraryFooter: Component<WinampLibraryFooterProps> = (props) => {
  
  const getTrackCount = () => {
    if (props.mode === 'profile' && props.personalTracks) {
      return props.personalTracks.length;
    }
    return allTracks().length;
  };

  const getNetworkStatus = () => {
    const network = selectedNetwork();
    return network === 'personal' ? 'PERSONAL' : 
           network === 'extended' ? 'EXTENDED' : 
           network === 'community' ? 'COMMUNITY' : 'PERSONAL';
  };

  return (
    <div class="winamp-library-footer">
      {/* Network Status - Clean and minimal */}
      <div class="footer-status">
        <span class="network-status">
          NET: {getNetworkStatus()} • TRACKS: {getTrackCount()}
        </span>
      </div>
    </div>
  );
};

export default WinampLibraryFooter;