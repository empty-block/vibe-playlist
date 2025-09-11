import { Component } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import './WinampSidebarHeader.css';

const WinampSidebarHeader: Component = () => {
  const navigate = useNavigate();

  return (
    <div class="winamp-sidebar-header">
      {/* ADD_TRACK Button - restored to original header location */}
      <button 
        class="sidebar-add-track-btn"
        onClick={() => navigate('/add')}
        aria-label="Add new track to library"
        title="Add new track to your library"
      >
        <span class="add-text">+ ADD_TRACK</span>
      </button>
    </div>
  );
};

export default WinampSidebarHeader;