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

  const getAsciiSymbol = () => {
    switch (props.id) {
      case 'home': return '[♥]';
      case 'library': return '[♪]';
      case 'stats': return '[■]';
      case 'profile': return '[♠]';
      default: return '[►]';
    }
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
          sidebar-section
          ${isExpanded() ? '' : 'justify-center'}
          text-gray-400
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
        {!isExpanded() && (
          <div ref={iconRef!} class="sidebar-section-icon w-6 h-6 flex-shrink-0">
            <props.icon aria-hidden={true} />
          </div>
        )}
        {isExpanded() && (
          <span 
            class="sidebar-section-label ml-3 whitespace-nowrap overflow-hidden font-mono text-xs tracking-wider"
          >
            <span class="text-current opacity-60">{getAsciiSymbol()}</span>
            <span class="ml-1 text-current">{props.label.toUpperCase()}</span>
            <span class="ml-1 text-current opacity-40">[►]</span>
          </span>
        )}
        
        {/* Active state indicator */}
        {isActive() && (
          <div 
            class="absolute left-0 top-0 bottom-0 w-0.5 bg-current"
            style={{ "box-shadow": "0 0 8px currentColor" }}
          />
        )}
        
      </A>
    </li>
  );
};

export default SidebarSection;