import { Component } from 'solid-js';

interface IconProps {
  class?: string;
  'aria-hidden'?: boolean;
}

export const HomeIcon: Component<IconProps> = (props) => (
  <svg 
    class={props.class} 
    aria-hidden={props['aria-hidden']}
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    stroke-width="2"
    stroke-linecap="square"
    stroke-linejoin="miter"
  >
    <path d="M3 9L12 2L21 9V20A2 2 0 0 1 19 22H5A2 2 0 0 1 3 20V9Z" />
    <polyline points="9,22 9,12 15,12 15,22" />
  </svg>
);

export const LibraryIcon: Component<IconProps> = (props) => (
  <svg 
    class={props.class} 
    aria-hidden={props['aria-hidden']} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    stroke-width="2" 
    stroke-linecap="square" 
    stroke-linejoin="miter"
  >
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20V22H6.5A2.5 2.5 0 0 1 4 19.5V4.5A2.5 2.5 0 0 1 6.5 2Z" />
    <circle cx="10" cy="8" r="1" />
    <path d="M15 7V13" />
    <path d="M13 9.5A1.5 1.5 0 0 0 14.5 11A1.5 1.5 0 0 0 16 9.5" />
  </svg>
);

export const StatsIcon: Component<IconProps> = (props) => (
  <svg 
    class={props.class} 
    aria-hidden={props['aria-hidden']} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    stroke-width="2" 
    stroke-linecap="square" 
    stroke-linejoin="miter"
  >
    <polyline points="22,12 18,12 15,21 9,3 6,12 2,12" />
  </svg>
);

export const ProfileIcon: Component<IconProps> = (props) => (
  <svg 
    class={props.class} 
    aria-hidden={props['aria-hidden']} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    stroke-width="2" 
    stroke-linecap="square" 
    stroke-linejoin="miter"
  >
    <path d="M20 21V19A4 4 0 0 0 16 15H8A4 4 0 0 0 4 19V21" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

export const ExpandIcon: Component<IconProps> = (props) => (
  <svg 
    class={props.class} 
    aria-hidden={props['aria-hidden']} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    stroke-width="2" 
    stroke-linecap="square" 
    stroke-linejoin="miter"
  >
    <path d="M9 18l6-6-6-6" />
  </svg>
);

export const CollapseIcon: Component<IconProps> = (props) => (
  <svg 
    class={props.class} 
    aria-hidden={props['aria-hidden']} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    stroke-width="2" 
    stroke-linecap="square" 
    stroke-linejoin="miter"
  >
    <path d="M18 6L6 18" />
    <path d="M6 6l12 12" />
  </svg>
);