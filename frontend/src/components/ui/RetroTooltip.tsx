import { createSignal, Show, onMount, onCleanup } from 'solid-js';
import { Portal } from 'solid-js/web';

interface RetroTooltipProps {
  content: string;
  children: any;
  delay?: number;
  maxWidth?: number;
}

export default function RetroTooltip(props: RetroTooltipProps) {
  const [showTooltip, setShowTooltip] = createSignal(false);
  const [position, setPosition] = createSignal({ x: 0, y: 0 });
  
  let tooltipRef: HTMLDivElement | undefined;
  let triggerRef: HTMLDivElement | undefined;
  let timeoutId: number | undefined;

  const handleMouseEnter = (e: MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    
    // Calculate tooltip position
    const tooltipX = rect.left + rect.width / 2;
    const tooltipY = rect.top - 10; // Position above the element
    
    setPosition({ x: tooltipX, y: tooltipY });
    
    // Delay showing tooltip
    timeoutId = window.setTimeout(() => {
      setShowTooltip(true);
    }, props.delay || 500);
  };

  const handleMouseLeave = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    setShowTooltip(false);
  };

  onCleanup(() => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  });

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        class="cursor-help"
      >
        {props.children}
      </div>
      
      <Show when={showTooltip() && props.content}>
        <Portal>
          <div
            ref={tooltipRef}
            class="retro-tooltip fixed pointer-events-none"
            style={{
              left: `${position().x}px`,
              top: `${position().y}px`,
              transform: 'translate(-50%, -100%)',
              'max-width': `${props.maxWidth || 300}px`,
              background: 'linear-gradient(145deg, #0d0d0d, #1d1d1d)',
              border: '1px solid #04caf4',
              color: '#ffffff',
              'font-family': 'Courier New, monospace',
              'font-size': '12px',
              padding: '8px 12px',
              'border-radius': '4px',
              'box-shadow': `
                0 0 10px rgba(4, 202, 244, 0.3),
                inset 0 1px 0 rgba(255, 255, 255, 0.1)
              `,
              'z-index': '1000',
              'white-space': 'pre-wrap'
            }}
          >
            {/* Retro scan lines overlay */}
            <div 
              class="absolute inset-0 pointer-events-none opacity-20"
              style={{
                background: `repeating-linear-gradient(
                  0deg,
                  transparent 0px,
                  transparent 1px,
                  rgba(4, 202, 244, 0.1) 2px,
                  rgba(4, 202, 244, 0.1) 3px
                )`
              }}
            />
            
            {/* Terminal-style content with blinking cursor */}
            <div class="relative flex items-center gap-1">
              <span class="text-neon-cyan">{'>'}</span>
              <span>{props.content}</span>
              <span 
                class="animate-pulse text-neon-cyan"
                style={{ animation: 'pulse 1s infinite' }}
              >
                _
              </span>
            </div>
          </div>
        </Portal>
      </Show>
    </>
  );
}