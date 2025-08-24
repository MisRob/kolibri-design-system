// Floating UI
// Visit https://floating-ui.com/docs/migration to learn
// how it compares to Popper 2

import { computePosition, autoUpdate } from '@floating-ui/dom';

// Map of floating element IDs to their cleanup functions
// { <floating id>: <cleanup function> }
const cleanups = {};

/**
 * Positions floating elements.
 * Uses Floating UI
 * https://floating-ui.com
 *
 * @returns {Object} { initPosition, destroyPosition }
 */
export default function useKFloatingPosition() {
  /**
   * Positions a floating element relative to the anchor element.
   *
   * @param {String} floatingId - Unique ID of the floating element
   * @param {Element} floatingEl - Floating element
   * @param {Element} anchorEl - Anchor element
   * @param {Object} options - Floating UI options (https://floating-ui.com/docs/computePosition#options)
   */
  function initPosition(floatingId, floatingEl, anchorEl, options) {
    const cleanup = autoUpdate(anchorEl, floatingEl, () => {
      // Nice feature of Floating UI is that rather than calling
      // Object.assign here in useKFloatingPosition, `initPosition`
      // could just return reactive x and y and then let components
      // apply them in whatever way they need
      computePosition(anchorEl, floatingEl, options).then(({ x, y }) => {
        Object.assign(floatingEl.style, {
          left: `${x}px`,
          top: `${y}px`,
        });
      });
    });
    cleanups[floatingId] = cleanup;
  }

  /**
   * Destroys position updates associated with the floating element.
   * Always call when removing the floating element from the DOM.
   *
   * @param {String} floatingId - Unique ID of the floating element
   */
  function destroyPosition(floatingId) {
    const cleanup = cleanups[floatingId];
    if (cleanup) {
      cleanup();
      delete cleanups[floatingId];
    }
  }

  return {
    initPosition,
    destroyPosition,
  };
}
