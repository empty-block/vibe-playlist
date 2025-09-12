import { Component } from 'solid-js';
import './LibrarySidebarHeader.css';

interface LibrarySidebarHeaderProps {
  title?: string;
  onClose?: () => void;
}

const LibrarySidebarHeader: Component<LibrarySidebarHeaderProps> = (props) => {
  return (
    <div class="sidebar-header">
      <h2 class="sidebar-title">{props.title || 'LIBRARY_DATA'}</h2>
    </div>
  );
};

export default LibrarySidebarHeader;