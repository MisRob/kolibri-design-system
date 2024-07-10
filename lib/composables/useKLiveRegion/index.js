const LIVE_REGION_WRAPPER_ID = 'k-live-region';
const POLITE_LIVE_REGION_SELECTOR = `#${LIVE_REGION_WRAPPER_ID} [aria-live="polite"]`;
const ASSERTIVE_LIVE_REGION_SELECTOR = `#${LIVE_REGION_WRAPPER_ID} [aria-live="assertive"]`;

let storedRootEl;
let storedPoliteEl;
let storedAssertiveEl;

/**
 * Exposes 'sendPoliteMessage' and 'sendAssertiveMessage' functions
 * that can be used to update polite/assertive aria-live regions.
 *
 * Also provides '_mountLiveRegion' that inserts the regions to
 * an application's DOM.
 */
export default function useKLiveRegion() {
  /**
   * Adds assertive and polite live regions to the DOM.
   * Needs to be called when initializing an app,
   * typically in the `mounted` hook of the root app component.
   *
   * @param {HTMLElement} rootEl Vue app's root element.
   * he live regions' wrapper <div>
   *                             will be inserted as a first child
   *                             to this element.
   */
  function _mountLiveRegion(rootEl) {
    const politeLiveRegion = document.querySelector(POLITE_LIVE_REGION_SELECTOR);
    const assertiveLiveRegion = document.querySelector(ASSERTIVE_LIVE_REGION_SELECTOR);

    // Already mounted, so don't mount again.
    if (politeLiveRegion && assertiveLiveRegion) {
      storedPoliteEl = politeLiveRegion;
      storedAssertiveEl = assertiveLiveRegion;
      return;
    }

    const wrapperEl = document.createElement('div');
    wrapperEl.id = LIVE_REGION_WRAPPER_ID;
    wrapperEl.className = 'visuallyhidden';

    const politeEl = document.createElement('div');
    politeEl.setAttribute('aria-live', 'polite');

    const assertiveEl = document.createElement('div');
    assertiveEl.setAttribute('aria-live', 'assertive');

    wrapperEl.appendChild(politeEl);
    wrapperEl.appendChild(assertiveEl);

    rootEl.insertBefore(wrapperEl, rootEl.firstChild);

    // save for later use just in case we need to remount
    storedRootEl = rootEl;
    // save for later use so that we don't need to query
    // every time we call the 'sendPoliteMessage'/'sendAssertiveMessage'.
    storedPoliteEl = politeEl;
    storedAssertiveEl = assertiveEl;
  }

  /**
   * Updates the polite aria live region with the provided message.
   */
  function sendPoliteMessage(message) {
    _sendMessage(message, storedPoliteEl);
  }

  function _sendMessage(message, el) {
    const send = () => {
      el.textContent = message;
      // empty the live region
      // recommended in https://www.sarasoueidan.com/blog/accessible-notifications-with-aria-live-regions-part-2/
      setTimeout(() => {
        el.textContent = '';
      }, 350);
    };

    // In most of the situations, the live region should be
    // mounted before a message is sent. There's few cases that could
    // theoretically be a problem during the first few moments of loading
    // an app, so here we catch error just in case the live region
    // is not yet mounted. If error, shows a warning since it could potentially
    // reveal something suspicious, then mounts the live region and sends
    // the message one more time.
    try {
      send();
    } catch (error) {
      console.warn('[useKLiveRegion] Could not send the message:', error);
      if (storedRootEl) {
        _mountLiveRegion(storedRootEl);
        send();
      }
    }
  }

  /**
   * Updates the assertive aria live region with the provided message.
   */
  function sendAssertiveMessage(message) {
    _sendMessage(message, storedAssertiveEl);
  }

  return {
    _mountLiveRegion,
    sendPoliteMessage,
    sendAssertiveMessage,
  };
}
