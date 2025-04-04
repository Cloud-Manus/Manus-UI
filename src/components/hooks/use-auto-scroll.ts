import { useEffect, useRef, useState, useCallback } from "react";

// How many pixels from the bottom of the container to enable auto-scroll
const ACTIVATION_THRESHOLD = 150; // Increased threshold for better detection
// Debounce time in ms for scroll position checks
const SCROLL_DEBOUNCE = 150;

export function useAutoScroll(dependencies: React.DependencyList) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const previousScrollTop = useRef<number | null>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Use refs to avoid stale closures and get current values
  const shouldAutoScrollRef = useRef(true);
  
  // Keep the ref in sync with the state
  useEffect(() => {
    shouldAutoScrollRef.current = shouldAutoScroll;
  }, [shouldAutoScroll]);

  const scrollToBottom = useCallback(() => {
    if (containerRef.current) {
      // Use requestAnimationFrame for smoother scrolling
      requestAnimationFrame(() => {
        if (containerRef.current) {
          containerRef.current.scrollTop = containerRef.current.scrollHeight;
          
          // Set auto-scroll with a small delay to avoid detecting this as a manual scroll
          setTimeout(() => {
            setShouldAutoScroll(true);
            shouldAutoScrollRef.current = true;
          }, 50);
        }
      });
    }
  }, []);

  const updateScrollState = useCallback((value: boolean) => {
    // Clear any existing timer to prevent multiple updates
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    // Only update if the value is changing to avoid unnecessary renders
    if (value !== shouldAutoScrollRef.current) {
      debounceTimerRef.current = setTimeout(() => {
        setShouldAutoScroll(value);
        shouldAutoScrollRef.current = value;
        debounceTimerRef.current = null;
      }, SCROLL_DEBOUNCE);
    }
  }, []);

  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;
    
    // Calculate scroll position
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    
    // Determine scroll direction
    const isScrollingUp = previousScrollTop.current != null && 
                          scrollTop < previousScrollTop.current;
    
    // Save current scroll position for next comparison
    previousScrollTop.current = scrollTop;
    
    if (isScrollingUp) {
      // When scrolling up and significantly away from bottom, disable auto-scroll
      if (distanceFromBottom > ACTIVATION_THRESHOLD) {
        updateScrollState(false);
      }
    } else {
      // When scrolling down or near bottom, check if close enough to bottom
      const isNearBottom = distanceFromBottom < ACTIVATION_THRESHOLD;
      
      if (isNearBottom) {
        updateScrollState(true);
      }
    }
  }, [updateScrollState]);

  const handleTouchStart = useCallback(() => {
    // Disable auto-scroll when user touches the screen
    updateScrollState(false);
  }, [updateScrollState]);

  // Initialize scroll position tracking
  useEffect(() => {
    if (containerRef.current) {
      previousScrollTop.current = containerRef.current.scrollTop;
    }
    
    // Cleanup timers on unmount
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Auto-scroll when dependencies change (e.g., messages)
  useEffect(() => {
    if (shouldAutoScrollRef.current && containerRef.current) {
      // Ensure DOM has updated before attempting to scroll
      requestAnimationFrame(scrollToBottom);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  return {
    containerRef,
    scrollToBottom,
    handleScroll,
    shouldAutoScroll,
    handleTouchStart,
  };
}