import { createSignal, onCleanup, Accessor, onMount } from 'solid-js';

export interface ScrollDirectionOptions {
  threshold?: number; // Minimum scroll distance to trigger (default: 75px)
  onScrollDown?: (state: ScrollDirectionState) => void;
  onScrollUp?: (state: ScrollDirectionState) => void;
  onScrollStop?: (state: ScrollDirectionState) => void;
  stopDelay?: number; // Delay before triggering onScrollStop (default: 150ms)
}

export interface ScrollDirectionState {
  direction: 'up' | 'down' | 'idle';
  scrollY: number;
  isAtTop: boolean;
  isAtBottom: boolean;
}

/**
 * Detects scroll direction and provides callbacks for scroll events.
 * Similar to Reddit mobile app behavior - hide UI when scrolling down, show when scrolling up.
 *
 * @param scrollContainerRef - Accessor for the scroll container element
 * @param options - Configuration options for scroll detection
 */
export function useScrollDirection(
  scrollContainerRef: Accessor<HTMLElement | undefined>,
  options: ScrollDirectionOptions = {}
): Accessor<ScrollDirectionState> {
  const {
    threshold = 75, // Moderate threshold (50-100px range)
    onScrollDown,
    onScrollUp,
    onScrollStop,
    stopDelay = 150
  } = options;

  const [state, setState] = createSignal<ScrollDirectionState>({
    direction: 'idle',
    scrollY: 0,
    isAtTop: true,
    isAtBottom: false
  });

  let lastScrollY = 0;
  let scrollDelta = 0;
  let rafId: number | null = null;
  let stopTimeoutId: number | null = null;
  let isScrolling = false;

  const checkScrollPosition = (container: HTMLElement) => {
    const currentScrollY = container.scrollTop;
    const scrollHeight = container.scrollHeight;
    const clientHeight = container.clientHeight;

    const isAtTop = currentScrollY <= 10; // Within 10px of top
    const isAtBottom = currentScrollY + clientHeight >= scrollHeight - 10; // Within 10px of bottom

    setState(prev => ({
      ...prev,
      scrollY: currentScrollY,
      isAtTop,
      isAtBottom
    }));

    return { currentScrollY, isAtTop, isAtBottom };
  };

  const handleScroll = () => {
    const container = scrollContainerRef();
    if (!container) return;

    console.log('[useScrollDirection] handleScroll called');
    isScrolling = true;

    // Clear existing stop timeout
    if (stopTimeoutId !== null) {
      clearTimeout(stopTimeoutId);
      stopTimeoutId = null;
    }

    // Use RAF for smooth detection
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
    }

    rafId = requestAnimationFrame(() => {
      const { currentScrollY, isAtTop, isAtBottom } = checkScrollPosition(container);

      const delta = currentScrollY - lastScrollY;
      scrollDelta += delta;

      // Determine direction based on accumulated delta and threshold
      if (Math.abs(scrollDelta) >= threshold) {
        const newDirection: 'up' | 'down' = scrollDelta > 0 ? 'down' : 'up';
        const prevDirection = state().direction;

        // Only trigger callbacks if direction changed or moving from idle
        if (newDirection !== prevDirection || prevDirection === 'idle') {
          const newState = { direction: newDirection, scrollY: currentScrollY, isAtTop, isAtBottom };
          setState(newState);

          // Don't hide header if at top, don't hide footer if at bottom
          if (newDirection === 'down' && !isAtTop && onScrollDown) {
            onScrollDown(newState);
          } else if (newDirection === 'up' && onScrollUp) {
            onScrollUp(newState);
          }
        }

        // Reset delta after threshold crossed
        scrollDelta = 0;
      }

      lastScrollY = currentScrollY;

      // Set timeout to detect scroll stop
      stopTimeoutId = window.setTimeout(() => {
        isScrolling = false;
        const wasIdle = state().direction === 'idle';
        const idleState = { ...state(), direction: 'idle' as const };
        setState(idleState);

        if (!wasIdle && onScrollStop) {
          onScrollStop(idleState);
        }
      }, stopDelay);
    });
  };

  // Set up scroll listener after component mounts (refs are available)
  onMount(() => {
    const container = scrollContainerRef();
    if (!container) {
      console.warn('[useScrollDirection] Container ref not available after mount');
      return;
    }

    console.log('[useScrollDirection] Setting up scroll listener on:', container);

    // Initialize scroll position
    checkScrollPosition(container);
    lastScrollY = container.scrollTop;

    container.addEventListener('scroll', handleScroll, { passive: true });
    console.log('[useScrollDirection] Scroll listener attached');

    onCleanup(() => {
      container.removeEventListener('scroll', handleScroll);

      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }

      if (stopTimeoutId !== null) {
        clearTimeout(stopTimeoutId);
      }
    });
  });

  return state;
}
