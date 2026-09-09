import { useCallback } from 'react';

/**
 * Custom hook for triggering haptic feedback using the Web Vibration API.
 * Optimized for mobile viewport interactions.
 */
export const useHaptics = () => {
  const trigger = useCallback((pattern: number | number[] = 10) => {
    // Check if navigator.vibrate is supported
    if (
      typeof window !== 'undefined' &&
      'navigator' in window &&
      'vibrate' in navigator
    ) {
      try {
        // Subtle haptic pulse
        navigator.vibrate(pattern);
      } catch (error) {
        // Silently fail if vibration is blocked or unsupported
        console.warn('Haptic feedback failed:', error);
      }
    }
  }, []);

  const light = useCallback(() => trigger(10), [trigger]);
  const medium = useCallback(() => trigger(20), [trigger]);
  const heavy = useCallback(() => trigger(40), [trigger]);
  const success = useCallback(() => trigger([10, 30, 10]), [trigger]);
  const error = useCallback(() => trigger([50, 100, 50, 100, 50]), [trigger]);

  return {
    trigger,
    light,
    medium,
    heavy,
    success,
    error,
  };
};
