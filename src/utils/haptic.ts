/**
 * Utility to trigger haptic feedback on supported mobile devices.
 * Uses the navigator.vibrate API.
 */
export const triggerHaptic = (pattern: number | number[] = 10) => {
  if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch (e) {
      // Ignore vibration errors (e.g. if blocked by browser)
    }
  }
};

/**
 * Common haptic patterns
 */
export const HapticPatterns = {
  light: 10,
  medium: 20,
  heavy: 40,
  success: [10, 30, 10],
  warning: [50, 100, 50],
  error: [100, 50, 100, 50, 100],
};
