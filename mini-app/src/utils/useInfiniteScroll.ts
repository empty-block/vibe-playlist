import { createEffect, onCleanup, Accessor } from 'solid-js';

/**
 * A reusable hook for implementing infinite scroll using IntersectionObserver
 *
 * @param sentinelRef - A ref to the sentinel element (element at bottom of list)
 * @param hasMore - Signal indicating if there are more items to load
 * @param isLoading - Signal indicating if data is currently being loaded
 * @param onLoadMore - Callback function to load more data
 * @param options - Optional IntersectionObserver options
 *
 * @example
 * ```tsx
 * const [hasMore, setHasMore] = createSignal(true);
 * const [isLoading, setIsLoading] = createSignal(false);
 * let sentinelRef: HTMLDivElement | undefined;
 *
 * useInfiniteScroll(
 *   () => sentinelRef,
 *   hasMore,
 *   isLoading,
 *   () => loadMoreData()
 * );
 *
 * return (
 *   <div>
 *     {items().map(item => <Item data={item} />)}
 *     <div ref={sentinelRef} />
 *   </div>
 * );
 * ```
 */
export function useInfiniteScroll(
  sentinelRef: Accessor<HTMLElement | undefined>,
  hasMore: Accessor<boolean>,
  isLoading: Accessor<boolean>,
  onLoadMore: () => void | Promise<void>,
  options: IntersectionObserverInit = {}
) {
  createEffect(() => {
    const sentinel = sentinelRef();

    if (!sentinel) {
      return;
    }

    // Find the scrollable parent container
    let scrollContainer: HTMLElement | null = sentinel.parentElement;
    while (scrollContainer) {
      const overflowY = window.getComputedStyle(scrollContainer).overflowY;
      if (overflowY === 'auto' || overflowY === 'scroll') {
        break;
      }
      scrollContainer = scrollContainer.parentElement;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];

        // If sentinel is visible, has more data, and not currently loading
        if (entry.isIntersecting && hasMore() && !isLoading()) {
          onLoadMore();
        }
      },
      {
        root: scrollContainer, // Use the scrollable container, or null for viewport
        rootMargin: '100px', // Trigger 100px before sentinel is visible
        threshold: 0.1, // Trigger when 10% of sentinel is visible
        ...options,
      }
    );

    observer.observe(sentinel);

    // Cleanup on unmount or when sentinel changes
    onCleanup(() => {
      observer.disconnect();
    });
  });
}
