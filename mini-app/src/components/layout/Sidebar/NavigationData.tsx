import { Component } from 'solid-js';

// Navigation section types
export type SectionColor = 'blue' | 'cyan' | 'green' | 'pink';
export type SectionId = 'home' | 'library' | 'activity' | 'stats' | 'profile';

// SVG Icon Components
export interface IconProps {
  class?: string;
}

// Home Icon (House) - Standard home symbol
export const HomeIcon: Component<IconProps> = (props) => (
  <svg class={`home-icon ${props.class || ''}`} width="28" height="28" viewBox="0 0 28 28" fill="none">
    {/* House outline */}
    <path 
      d="M4 12L14 3L24 12V23C24 23.5523 23.5523 24 23 24H5C4.44772 24 4 23.5523 4 23V12Z" 
      stroke="currentColor" 
      stroke-width="2" 
      fill="none"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    
    {/* Door */}
    <path 
      d="M10 24V15H18V24" 
      stroke="currentColor" 
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    
    {/* Window */}
    <rect 
      x="11" 
      y="8" 
      width="6" 
      height="5" 
      stroke="currentColor" 
      stroke-width="1.5" 
      fill="none"
      rx="0.5"
    />
    
    {/* Window cross */}
    <line x1="14" y1="8" x2="14" y2="13" stroke="currentColor" stroke-width="1"/>
    <line x1="11" y1="10.5" x2="17" y2="10.5" stroke="currentColor" stroke-width="1"/>
  </svg>
);

// Library Icon (Music Collection) - Stacked albums/records
export const LibraryIcon: Component<IconProps> = (props) => (
  <svg class={`library-icon ${props.class || ''}`} width="28" height="28" viewBox="0 0 28 28" fill="none">
    {/* Back album */}
    <rect 
      x="3" 
      y="6" 
      width="16" 
      height="16" 
      rx="1" 
      fill="currentColor" 
      opacity="0.6"
      class="album-back"
    />
    
    {/* Middle album */}
    <rect 
      x="5" 
      y="4" 
      width="16" 
      height="16" 
      rx="1" 
      fill="currentColor" 
      opacity="0.8"
      class="album-middle"
    />
    
    {/* Front album */}
    <rect 
      x="7" 
      y="2" 
      width="16" 
      height="16" 
      rx="1" 
      fill="currentColor" 
      opacity="1"
      class="album-front"
    />
    
    {/* Center holes for record aesthetic */}
    <circle cx="11" cy="14" r="1" fill="#0a0a0a" opacity="0.8"/>
    <circle cx="13" cy="12" r="1" fill="#0a0a0a" opacity="0.8"/>
    <circle cx="15" cy="10" r="1" fill="#0a0a0a" opacity="0.8"/>
    
    {/* Subtle groove lines */}
    <circle cx="15" cy="10" r="4" fill="none" stroke="#0a0a0a" stroke-width="0.5" opacity="0.3"/>
    <circle cx="15" cy="10" r="6" fill="none" stroke="#0a0a0a" stroke-width="0.5" opacity="0.2"/>
  </svg>
);

// Stats Icon (Chart/Analytics) - Line chart with data points
export const StatsIcon: Component<IconProps> = (props) => (
  <svg class={`stats-icon ${props.class || ''}`} width="28" height="28" viewBox="0 0 28 28" fill="none">
    {/* Chart line */}
    <path 
      d="M4 20L9 12L14 15L20 7L24 10" 
      stroke="currentColor" 
      stroke-width="2.5" 
      fill="none"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="chart-line"
    />
    
    {/* Data points */}
    <circle cx="4" cy="20" r="2.5" fill="currentColor" class="data-point"/>
    <circle cx="9" cy="12" r="2.5" fill="currentColor" class="data-point"/>
    <circle cx="14" cy="15" r="2.5" fill="currentColor" class="data-point"/>
    <circle cx="20" cy="7" r="2.5" fill="currentColor" class="data-point"/>
    <circle cx="24" cy="10" r="2.5" fill="currentColor" class="data-point"/>
    
    {/* Axis lines */}
    <line x1="3" y1="23" x2="25" y2="23" stroke="currentColor" stroke-width="1" opacity="0.4"/>
    <line x1="3" y1="23" x2="3" y2="5" stroke="currentColor" stroke-width="1" opacity="0.4"/>
    
    {/* Grid dots for data feel */}
    <circle cx="3" cy="18" r="0.5" fill="currentColor" opacity="0.3"/>
    <circle cx="3" cy="15" r="0.5" fill="currentColor" opacity="0.3"/>
    <circle cx="3" cy="12" r="0.5" fill="currentColor" opacity="0.3"/>
    <circle cx="3" cy="9" r="0.5" fill="currentColor" opacity="0.3"/>
  </svg>
);

// Profile Icon (User) - Standard user profile symbol
export const ProfileIcon: Component<IconProps> = (props) => (
  <svg class={`profile-icon ${props.class || ''}`} width="28" height="28" viewBox="0 0 28 28" fill="none">
    {/* User head/avatar circle */}
    <circle 
      cx="14" 
      cy="10" 
      r="4.5" 
      stroke="currentColor" 
      stroke-width="2" 
      fill="none"
      stroke-linecap="round"
      class="profile-head"
    />
    
    {/* User body/shoulders */}
    <path 
      d="M6 23V21C6 17.6863 8.68629 15 12 15H16C19.3137 15 22 17.6863 22 21V23" 
      stroke="currentColor" 
      stroke-width="2" 
      fill="none"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="profile-body"
    />
    
    {/* Subtle inner details */}
    <circle cx="14" cy="10" r="2" fill="currentColor" opacity="0.2" class="profile-inner"/>
    
    {/* Avatar ring (will be replaced with actual user image later) */}
    <circle 
      cx="14" 
      cy="10" 
      r="6" 
      stroke="currentColor" 
      stroke-width="0.5" 
      fill="none" 
      opacity="0.3"
      class="profile-ring"
    />
  </svg>
);

// Activity Icon (Network Pulse) - Shows activity/network stream
export const ActivityIcon: Component<IconProps> = (props) => (
  <svg class={`activity-icon ${props.class || ''}`} width="28" height="28" viewBox="0 0 28 28" fill="none">
    {/* Network nodes */}
    <circle cx="14" cy="6" r="2" fill="currentColor"/>
    <circle cx="8" cy="14" r="2" fill="currentColor"/>
    <circle cx="20" cy="14" r="2" fill="currentColor"/>
    <circle cx="14" cy="22" r="2" fill="currentColor"/>

    {/* Connecting lines */}
    <line x1="14" y1="8" x2="14" y2="20" stroke="currentColor" stroke-width="1.5" opacity="0.6"/>
    <line x1="12" y1="7" x2="9" y2="12" stroke="currentColor" stroke-width="1.5" opacity="0.6"/>
    <line x1="16" y1="7" x2="19" y2="12" stroke="currentColor" stroke-width="1.5" opacity="0.6"/>

    {/* Pulse rings */}
    <circle cx="14" cy="6" r="4" stroke="currentColor" stroke-width="1" fill="none" opacity="0.3">
      <animate attributeName="r" values="4;6;4" dur="2s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="0.3;0;0.3" dur="2s" repeatCount="indefinite"/>
    </circle>
  </svg>
);

// Terminal Icon - Retro terminal/command prompt
export const TerminalIcon: Component<IconProps> = (props) => (
  <svg class={`terminal-icon ${props.class || ''}`} width="18" height="18" viewBox="0 0 18 18" fill="none">
    {/* Terminal window frame */}
    <rect 
      x="2" 
      y="3" 
      width="14" 
      height="11" 
      rx="1" 
      stroke="currentColor" 
      stroke-width="1.5" 
      fill="none"
    />
    
    {/* Terminal header bar */}
    <line x1="2" y1="6" x2="16" y2="6" stroke="currentColor" stroke-width="1"/>
    
    {/* Command prompt cursor */}
    <rect x="4" y="8" width="6" height="1" fill="currentColor"/>
    <rect x="10.5" y="7.5" width="1" height="2" fill="currentColor" class="cursor-blink">
      <animate attributeName="opacity" values="1;0;1" dur="1s" repeatCount="indefinite"/>
    </rect>
    
    {/* Additional command lines */}
    <rect x="4" y="10" width="4" height="0.8" fill="currentColor" opacity="0.6"/>
    <rect x="4" y="11.5" width="7" height="0.8" fill="currentColor" opacity="0.4"/>
    
    {/* Window controls dots */}
    <circle cx="4" cy="4.5" r="0.5" fill="currentColor" opacity="0.7"/>
    <circle cx="6" cy="4.5" r="0.5" fill="currentColor" opacity="0.7"/>
    <circle cx="8" cy="4.5" r="0.5" fill="currentColor" opacity="0.7"/>
  </svg>
);

// Navigation section interface
export interface SidebarSection {
  id: SectionId;
  href: string;
  label: string;
  icon: Component<IconProps>;
  color: SectionColor;
  isPrimary?: boolean;
}

// Shared navigation configuration - single source of truth
export const navigationSections: readonly SidebarSection[] = [
  {
    id: 'home',
    href: '/',
    label: 'Home',
    icon: HomeIcon,
    color: 'blue',
    isPrimary: true
  },
  {
    id: 'activity',
    href: '/activity',
    label: 'Activity',
    icon: ActivityIcon,
    color: 'cyan'
  },
  {
    id: 'profile',
    href: '/profile',
    label: 'Profile',
    icon: ProfileIcon,
    color: 'pink'
  }
] as const;

// CSS variable mappings for section colors
export const sectionColorVars = {
  blue: {
    primary: '#3b00fd',
    hover: 'rgba(59, 0, 253, 0.1)',
    active: 'rgba(59, 0, 253, 0.15)',
    glow: 'rgba(59, 0, 253, 0.3)'
  },
  cyan: {
    primary: '#04caf4',
    hover: 'rgba(4, 202, 244, 0.1)',
    active: 'rgba(4, 202, 244, 0.15)',
    glow: 'rgba(4, 202, 244, 0.3)'
  },
  green: {
    primary: '#00f92a',
    hover: 'rgba(0, 249, 42, 0.1)',
    active: 'rgba(0, 249, 42, 0.15)',
    glow: 'rgba(0, 249, 42, 0.3)'
  },
  pink: {
    primary: '#f906d6',
    hover: 'rgba(249, 6, 214, 0.1)',
    active: 'rgba(249, 6, 214, 0.15)',
    glow: 'rgba(249, 6, 214, 0.3)'
  }
} as const;