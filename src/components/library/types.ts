// Type definitions for Winamp Library Layout components

export interface SidebarItem {
  id: string;
  label: string;
  icon?: string;
  count?: number;
}

export interface SidebarSection {
  id: string;
  label: string;
  icon: string;
  children: SidebarItem[];
  isExpandable: boolean;
}

export interface LibraryFilter {
  section: string;
  filter?: any;
}

export interface WinampLibraryLayoutProps {
  mode?: 'library' | 'profile';
  userId?: string;
  initialSection?: string;
  personalTracks?: any[];
  personalLoading?: boolean;
  personalFilter?: string;
  onPersonalFilterChange?: (filter: string) => void;
  onAddMusic?: () => void;
}

export interface WinampSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: 'library' | 'profile';
  userId?: string;
  initialSection?: string;
}

export interface WinampSidebarSectionProps {
  section: SidebarSection;
  isExpanded: boolean;
  activeItem: string;
  onToggle: () => void;
  onItemClick: (itemId: string) => void;
  onKeyDown: (event: KeyboardEvent, itemId: string) => void;
}

export interface WinampMainContentProps {
  mode?: 'library' | 'profile';
  onSidebarToggle: () => void;
  isSidebarOpen: boolean;
  personalTracks?: any[];
  personalLoading?: boolean;
  personalFilter?: string;
  onPersonalFilterChange?: (filter: string) => void;
  onAddMusic?: () => void;
  userId?: string;
}

export interface MobileSidebarToggleProps {
  onToggle: () => void;
  isOpen: boolean;
}