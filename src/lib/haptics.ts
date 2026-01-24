/**
 * Haptic feedback utility for mobile devices
 * Uses the Vibration API to provide tactile feedback during interactions
 */

export const haptics = {
  /**
   * Light haptic feedback for subtle interactions (e.g., touch start)
   */
  light: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  },

  /**
   * Medium haptic feedback for standard interactions (e.g., item swap)
   */
  medium: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(20);
    }
  },

  /**
   * Strong haptic feedback for important actions (e.g., drop/release)
   */
  strong: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(30);
    }
  },

  /**
   * Success pattern for positive confirmations
   */
  success: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([10, 50, 10]);
    }
  },

  /**
   * Selection pattern for picking up an item
   */
  selection: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([5, 10, 15]);
    }
  },
};
