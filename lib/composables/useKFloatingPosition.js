import { createPopper } from '@popperjs/core';

// Map of floating element IDs to their Popper instances
// { <floating id>: <Popper 2 instance> }
const instances = {};

/**
 * Positions floating elements.
 * Uses Popper 2
 * https://popper.js.org/docs/v2/
 *
 * @returns {Object} { initPosition, disablePosition, destroyPosition }
 */
export default function useKFloatingPosition() {
  /**
   * Positions a floating element relative to the anchor element.
   *
   * @param {String} floatingId - Unique ID of the floating element
   * @param {Element} floatingEl - Floating element
   * @param {Element} anchorEl - Anchor element
   * @param {Object} options - Popper 2 options (https://popper.js.org/docs/v2/constructors/#options)
   */
  function initPosition(floatingId, floatingEl, anchorEl, options) {
    // TODO parameter validation

    const instance = instances[floatingId];
    if (instance) {
      enablePosition(floatingId);
      return instance;
    }

    const popper = createPopper(anchorEl, floatingEl, options);
    instances[floatingId] = popper;
    return popper;
  }

  /**
   * Manually update the position of the floating element.
   * https://popper.js.org/docs/v2/lifecycle/#manual-update
   *
   * This shouldn't be needed frequently, especially as long as this
   * guidance is followed: "Avoid the need to reposition your popper
   * when its reference element moves on the page by attaching the popper
   * DOM node right next to the reference DOM node"
   * https://popper.js.org/docs/v2/modifiers/event-listeners/
   */
  /* function updatePosition(floatingId) {
    const instance = instances[floatingId];
    if (instance) {
      return instance.update();
    }
  } */

  /**
   * Disables position updates for the floating element.
   * Always call when the floating element is not active
   * to prevent unnecessary performance cost.
   * https://popper.js.org/docs/v2/tutorial/#performance
   * (Popper adds 'resize' and 'scroll' event listeners,
   * this removes them).
   *
   * @param {String} floatingId - Floating element ID
   */
  function disablePosition(floatingId) {
    const instance = instances[floatingId];
    if (instance) {
      instance.setOptions(options => ({
        ...options,
        modifiers: [...(options.modifiers || []), { name: 'eventListeners', enabled: false }],
      }));
    }
  }

  /**
   * Enables position updates for the floating element.
   * Call when the floating element becomes active again.
   * https://popper.js.org/docs/v2/tutorial/#performance
   *
   * @param {String} floatingId - Unique ID of the floating element
   */
  function enablePosition(floatingId) {
    const instance = instances[floatingId];
    if (instance) {
      instance.setOptions(options => ({
        ...options,
        modifiers: [...(options.modifiers || []), { name: 'eventListeners', enabled: true }],
      }));
      // instance.update();
      // Despite Popper's performance tutorial having it, doesn't seem
      // to be needed - haven't observed any issues so far without it
      // Also here `setOptions` is said to update the position
      // https://popper.js.org/docs/v2/lifecycle/#set-new-options
    }
  }

  /**
   * Destroys position instance associated with the floating element.
   * Always call when removing the floating element from the DOM.
   * (this will also remove Popper's 'resize' and 'scroll' event listeners)
   * @param {String} floatingId - Unique ID of the floating element
   */
  function destroyPosition(floatingId) {
    const instance = instances[floatingId];
    if (instance) {
      instance.destroy();
      delete instances[floatingId];
    }
  }

  return {
    initPosition,
    disablePosition,
    destroyPosition,
  };
}
