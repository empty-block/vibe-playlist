import { Component, onMount, onCleanup } from 'solid-js';
import { A, useLocation } from '@solidjs/router';
import { isExpanded } from '../../../stores/sidebarStore';
import { sidebarSectionHover, iconHover } from '../../../utils/animations';

interface SidebarSectionProps {
  id: string;
  href: string;
  label: string;
  icon: Component;
  color: 'blue' | 'cyan' | 'pink';
  isPrimary?: boolean;
  index: number;
  focusedIndex: () => number;
  setFocusedIndex: (index: number) => void;
  onSectionClick?: () => void;
}

const SidebarSection: Component<SidebarSectionProps> = (props) => {
  const location = useLocation();
  let sectionRef: HTMLAnchorElement;
  let iconRef: HTMLElement;

  const isActive = () => {
    if (props.href === '/') {
      return location.pathname === '/';
    }
    if (props.href === '/library') {
      return location.pathname === '/library';
    }
    if (props.href === '/me') {
      return location.pathname === '/me' || location.pathname.startsWith('/profile');
    }
    return location.pathname === props.href;
  };

  const getColorClasses = () => {
    switch (props.color) {
      case 'blue':
        return {
          text: 'text-neon-blue',
          hover: 'hover:text-neon-blue hover:border-neon-blue hover:bg-neon-blue/10',
          active: 'border-neon-blue bg-neon-blue/15 text-neon-blue'
        };
      case 'cyan':
        return {
          text: 'text-neon-cyan',
          hover: 'hover:text-neon-cyan hover:border-neon-cyan hover:bg-neon-cyan/10',
          active: 'border-neon-cyan bg-neon-cyan/15 text-neon-cyan'
        };
      case 'pink':
        return {
          text: 'text-neon-pink',
          hover: 'hover:text-neon-pink hover:border-neon-pink hover:bg-neon-pink/10',
          active: 'border-neon-pink bg-neon-pink/15 text-neon-pink'
        };
    }
  };

  const colorClasses = getColorClasses();
  
  const getColorValue = () => {
    switch (props.color) {
      case 'blue': return '#3b00fd';
      case 'cyan': return '#04caf4';
      case 'pink': return '#f906d6';
    }
  };

  const handleMouseEnter = () => {
    if (sectionRef! && !isActive()) {
      sidebarSectionHover.enter(sectionRef, getColorValue());
    }
    if (iconRef!) {
      iconHover.enter(iconRef);
    }
  };

  const handleMouseLeave = () => {
    if (sectionRef! && !isActive()) {
      sidebarSectionHover.leave(sectionRef);
    }
    if (iconRef!) {
      iconHover.leave(iconRef);
    }
  };

  const handleClick = () => {
    props.onSectionClick?.();
  };

  const handleFocus = () => {
    props.setFocusedIndex(props.index);
  };

  onMount(() => {
    if (sectionRef!) {
      sectionRef.addEventListener('mouseenter', handleMouseEnter);
      sectionRef.addEventListener('mouseleave', handleMouseLeave);
    }
  });

  onCleanup(() => {
    if (sectionRef!) {
      sectionRef.removeEventListener('mouseenter', handleMouseEnter);
      sectionRef.removeEventListener('mouseleave', handleMouseLeave);
    }
  });

  return (
    <li class="relative">
      <A
        ref={sectionRef!}
        href={props.href}
        class={`
          relative flex items-center h-14
          ${isExpanded() ? 'px-4' : 'px-2 justify-center'}
          font-display text-sm font-medium uppercase tracking-wide
          text-gray-400 border-l-2 border-transparent
          transition-colors duration-200 cursor-pointer
          focus:outline-none focus:ring-2 focus:ring-neon-cyan focus:ring-offset-2 focus:ring-offset-black
          ${colorClasses.hover}
          ${isActive() ? colorClasses.active : ''}
        `}
        classList={{
          [colorClasses.active]: isActive()
        }}
        aria-current={isActive() ? 'page' : undefined}
        aria-describedby={isExpanded() ? undefined : `${props.id}-tooltip`}
        data-section-index={props.index}
        onClick={handleClick}
        onFocus={handleFocus}
      >
        <div ref={iconRef!} class="sidebar-section-icon w-6 h-6 flex-shrink-0">
          <props.icon aria-hidden={true} />
        </div>
        <span 
          class={`
            sidebar-section-label ml-3 whitespace-nowrap overflow-hidden 
            transition-opacity duration-200
            ${!isExpanded() ? 'opacity-0 pointer-events-none' : ''}
          `}
        >
          {props.label}
        </span>
        
        {/* Active state indicator */}
        {isActive() && (
          <div 
            class="absolute left-0 top-0 bottom-0 w-0.5 bg-current"
            style={{ "box-shadow": "0 0 8px currentColor" }}
          />
        )}
      </A>
      
      {/* Tooltip for collapsed state */}
      {!isExpanded() && (
        <div
          id={`${props.id}-tooltip`}
          class="
            absolute left-16 top-1/2 -translate-y-1/2 z-40
            px-2 py-1 bg-gray-900 border border-gray-700 text-xs text-white
            opacity-0 pointer-events-none transition-opacity duration-200
            hover:opacity-100
          "
          role="tooltip"
          aria-hidden="true"
        >
          {props.label}
        </div>
      )}
    </li>
  );
};

export default SidebarSection;