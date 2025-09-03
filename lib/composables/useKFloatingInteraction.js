import { ref, onMounted, onUnmounted, computed, nextTick } from 'vue';
import { isNuxtServerSideRendering } from '../utils';
import globalThemeState from '../styles/globalThemeState';

// Attribute to be applied on a trigger element
// Its value is ID of the associated floating element
const ATTR_FLOATING_ID = 'data-floating-id';

// TODO Add click
// TODO Look into 'touchstart' browser support
const SUPPORTED_INTERACTIONS = ['hover', 'touch', 'focus', 'keyboardfocus'];
const DEFAULT_INTERACTIONS = ['hover'];

const MOUSEENTER = 'mouseenter';
const MOUSELEAVE = 'mouseleave';
const TOUCHSTART = 'touchstart';
const TOUCHEND = 'touchend';
const FOCUS = 'focus';
const BLUR = 'blur';

const INTERACTIONS_TO_EVENTS = {
  hover: MOUSEENTER,
  touch: TOUCHSTART,
  focus: FOCUS,
  keyboardfocus: FOCUS,
};

const EVENT_HANDLERS = {
  [MOUSEENTER]: onMouseEnter,
  [TOUCHSTART]: onTouchStart,
  [FOCUS]: onFocus,
};

// If 'delegateTo' is 'root', this map is used to decide
// whether an event should be attached to Document or Window
const DELEGATE_ROOT = 'root';
const DELEGATE_ROOT_TARGET = {
  [MOUSEENTER]: 'document',
  [TOUCHSTART]: 'document',
  [FOCUS]: 'window',
};

// For each mounted floating element stores
// configured interactions
// { <floating element id>: { activateOn: [ ... ] } }
export const _floatingInteractions = {};

// For each mounted floating element stores elements cache
// for its trigger (and delegate if provided) element:
// { <floating element id> : { <selector>: <element> } }
// Used to avoid repeated DOM queries.
export const _floatingCache = {};

// For each delegate element stores types of events
// attached to it and the number of related mounted
// floating elements depending on each event type:
// { <delegate element id>: { <event type> : <mounted floating elements count> } } }
// Used to determine when to remove listeners from delegates.
export const _delegateUsage = {};

// Currently active floating elements and their
// trigger elements { <floating element id>: <trigger element> }
const activeFloatingElements = ref({});

function getFloatingId(triggerEl) {
  return triggerEl?.dataset?.floatingId;
}

function areInteractionsValid(interactions) {
  return interactions.every(i => SUPPORTED_INTERACTIONS.includes(i));
}

function getInteractionFromEvent(eventType) {
  return Object.keys(INTERACTIONS_TO_EVENTS).find(key => INTERACTIONS_TO_EVENTS[key] === eventType);
}

function addFloatingInteractions(floatingId, activateOn) {
  _floatingInteractions[floatingId] = { activateOn };
}

function getFloatingInteractions(floatingId) {
  return _floatingInteractions[floatingId]?.activateOn;
}

function removeFloatingInteractions(floatingId) {
  if (_floatingInteractions[floatingId]) {
    delete _floatingInteractions[floatingId];
  }
}

function getDelegateUsage(delegateTo, eventType) {
  if (!_delegateUsage[delegateTo]) {
    return 0;
  }
  return _delegateUsage[delegateTo][eventType] || 0;
}

function incrementDelegateUsage(delegateTo, eventType) {
  let usage = _delegateUsage[delegateTo];
  if (!usage) {
    usage = _delegateUsage[delegateTo] = {};
  }
  usage[eventType] = (usage[eventType] || 0) + 1;
}

function decreaseDelegateUsage(delegateTo, eventType) {
  const usage = _delegateUsage[delegateTo];
  if (usage) {
    usage[eventType] -= 1;
    if (usage[eventType] === 0) {
      delete usage[eventType];
    }
    if (Object.keys(usage).length === 0) {
      delete _delegateUsage[delegateTo];
    }
  }
}

function getFloatingCache(floatingId) {
  if (!_floatingCache[floatingId]) {
    _floatingCache[floatingId] = {};
  }
  return _floatingCache[floatingId];
}

function removeFloatingCache(floatingId) {
  if (_floatingCache[floatingId]) {
    delete _floatingCache[floatingId];
  }
}

function getDelegateTarget(floatingId, delegateTo, eventType) {
  if (!delegateTo) {
    return undefined;
  }
  if (delegateTo === DELEGATE_ROOT) {
    const target = DELEGATE_ROOT_TARGET[eventType];
    return target === 'window' ? window : document;
  }

  const floatingCache = getFloatingCache(floatingId);
  const cacheEl = floatingCache[delegateTo];
  if (cacheEl) {
    return cacheEl;
  }

  const delegateEl = document.getElementById(delegateTo);
  if (delegateEl) {
    floatingCache[delegateTo] = delegateEl;
    return delegateEl;
  }

  return undefined;
}

function getTriggerEl(floatingId) {
  const selector = `[data-floating-id="${floatingId}"]`;

  const floatingCache = getFloatingCache(floatingId);
  const cacheEl = floatingCache[selector];
  if (cacheEl) {
    return cacheEl;
  }

  const triggerEl = document.querySelector(selector);
  if (triggerEl) {
    floatingCache[selector] = triggerEl;
    return triggerEl;
  }

  return undefined;
}

function addActiveFloatingEl(floatingId, triggerEl) {
  if (!activeFloatingElements.value[floatingId]) {
    // Update reactively
    activeFloatingElements.value = {
      ...activeFloatingElements.value,
      [floatingId]: triggerEl,
    };
  }
}

function removeActiveFloatingEl(floatingId) {
  if (activeFloatingElements.value[floatingId]) {
    // Remove reactively
    const updated = { ...activeFloatingElements.value };
    delete updated[floatingId];
    activeFloatingElements.value = updated;
  }
}

function isFloatingElActive(floatingId) {
  return Object.keys(activeFloatingElements.value).includes(floatingId);
}

// Based on configured interactions and browser event type
// returns whether the floating element should become active
function shouldEventActivate(floatingId, eventType) {
  const activateOn = getFloatingInteractions(floatingId);

  // Need to check input modality if configured to
  // be activated only on keyboard focus
  if (
    eventType === 'focus' &&
    activateOn.includes('keyboardfocus') &&
    !activateOn.includes('focus')
  ) {
    return new Promise(resolve => {
      // requestAnimationFrame to wait for focus listener
      // in 'trackInputModality' to finish its updates
      requestAnimationFrame(() => {
        const isKeyboardModality = globalThemeState.inputModality === 'keyboard';
        resolve(isKeyboardModality);
      });
    });
  }
  const interaction = getInteractionFromEvent(eventType);
  return Promise.resolve(activateOn.includes(interaction));
}

// If the floating element should be activated,
// updates the store of active floating elements
// and sets leave event listeners on the trigger element.
async function handleActivate(event, leaveEventType, leaveHandler) {
  // Depending on event type and delegation
  // configuration, this function can be triggered
  // less or more frequently => proceed from simple
  // logic to more complex one and exit early
  if (!(event.target instanceof Element)) {
    return;
  }

  // 'closest' needed to not miss when children
  // of the trigger element are interacted with
  const triggerEl = event.target.closest(`[${ATTR_FLOATING_ID}]`);
  if (!triggerEl) {
    return;
  }

  const floatingId = getFloatingId(triggerEl);

  if (isFloatingElActive(floatingId)) {
    return;
  }

  const should = await shouldEventActivate(floatingId, event.type);
  if (!should) {
    return;
  }

  // Leave event listeners are attached only on trigger elements
  // associated with active floating elements (typically there
  // is just 1 or 2) to prevent from many unnecessary event
  // listeners on a page
  triggerEl.addEventListener(leaveEventType, leaveHandler, true);

  addActiveFloatingEl(floatingId, triggerEl);
}

// If the floating element should be deactivated,
// removes it from the store of active floating elements
// and cleans up leave event listeners from its trigger element.
function handleDeactivate(event, leaveEventType, leaveHandler) {
  // Depending on event type and delegation
  // configuration, this function can be triggered
  // less or more frequently => proceed from simple
  // logic to more complex one and exit early
  let triggerEl = event.target;

  // Leave handler is not run only on the trigger
  // element itself but also its children if any
  if (!triggerEl.hasAttribute(ATTR_FLOATING_ID)) {
    triggerEl = triggerEl.closest(`[${ATTR_FLOATING_ID}]`);
  }
  if (!triggerEl) {
    return;
  }

  // Don't deactivate if mouse still inside
  // the trigger element
  if (leaveEventType === MOUSELEAVE && triggerEl.contains(event.relatedTarget)) {
    return;
  }

  triggerEl.removeEventListener(leaveEventType, leaveHandler, true);

  const floatingId = getFloatingId(triggerEl);
  removeActiveFloatingEl(floatingId);
}

function onFocus(event) {
  handleActivate(event, BLUR, onBlur);
}

function onMouseEnter(event) {
  handleActivate(event, MOUSELEAVE, onMouseLeave);
}

function onTouchStart(event) {
  handleActivate(event, TOUCHEND, onTouchEnd);
}

function onBlur(event) {
  handleDeactivate(event, BLUR, onBlur);
}

function onMouseLeave(event) {
  handleDeactivate(event, MOUSELEAVE, onMouseLeave);
}

function onTouchEnd(event) {
  handleDeactivate(event, TOUCHEND, onTouchEnd);
}

/**
 * Observes user interactions with trigger elements to determine
 * when the floating element should be considered active. Trigger
 * elements are identified by the `data-floating-id` attribute,
 * which matches the ID of the associated floating element.
 *
 * It does not directly set visibility, allowing components
 * to manage it depending on context.
 *
 * Typically called from a Vue component that represents
 * a floating element.
 *
 * @param {String} floatingId Floating element ID.
 *
 * @param {Array} activateOn Optional. Array of interactions  that activate
 *                           the floating element. Supported interactions:
 *                           'hover', 'touch', 'focus', 'keyboardfocus'.
 *                           Default: ['hover'].
 *
 * @param {String} delegateTo Optional. 'root' or ID of the element to delegate
 *                            events to. 'root' delegates events to the document
 *                            or window. Used to optimize performance on pages
 *                            with many floating elements. If not provided,
 *                            event listeners will be attached to the trigger
 *                            element.
 *
 * @returns {Object} { isActive, triggerEl }
 *
 *                   `isActive` is a computed property indicating if the
 *                   floating element is active (= user interacted with its
 *                   trigger element in the way specified by `activateOn`).
 *
 *                   `triggerEl` is the trigger element associated with
 *                   this floating element .
 */
export default function useKFloatingInteraction(floatingId, activateOn, delegateTo) {
  if (!floatingId) {
    throw new Error(`[useKFloatingInteraction] 'floatingId' is required.`);
  }

  let interactions;
  if (!activateOn || !activateOn.length) {
    interactions = [...DEFAULT_INTERACTIONS];
  } else if (!areInteractionsValid(activateOn)) {
    throw new Error(
      `[useKFloatingInteraction] 'activateOn' contains unsupported interaction(s). Supported interactions are: ${SUPPORTED_INTERACTIONS.join(', ')}`,
    );
  } else {
    interactions = [...activateOn];
  }

  addFloatingInteractions(floatingId, interactions);

  // Determines if new listeners should be added to the trigger
  // or the delegate elements associated with this floating element
  onMounted(() => {
    if (isNuxtServerSideRendering()) return;

    nextTick(() => {
      if (delegateTo) {
        interactions.forEach(interaction => {
          const eventType = INTERACTIONS_TO_EVENTS[interaction];
          const delegateUsage = getDelegateUsage(delegateTo, eventType);

          // Don't add listener to the delegate element
          // in case it already listens for this event type
          // (strictly speaking, browsers prevent from duplicate event
          // listeners with the same signature, but _delegateUsage
          // logic needs to be in place anyway to know when to clean up,
          // so it's utilized here too for explicit check)
          if (delegateUsage === 0) {
            const delegateTarget = getDelegateTarget(floatingId, delegateTo, eventType);
            if (!delegateTarget) {
              throw new Error(
                `[useKFloatingInteraction] Event delegation target '${delegateTo}' not found`,
              );
            }
            delegateTarget.addEventListener(eventType, EVENT_HANDLERS[eventType], true);
          }
          incrementDelegateUsage(delegateTo, eventType);
        });
      } else {
        const triggerEl = getTriggerEl(floatingId);
        if (!triggerEl) {
          throw new Error(
            `[useKFloatingInteraction] No trigger element found for floating element '${floatingId}'`,
          );
        }

        interactions.forEach(interaction => {
          const eventType = INTERACTIONS_TO_EVENTS[interaction];
          triggerEl.addEventListener(eventType, EVENT_HANDLERS[eventType], true);
        });
      }
    });
  });

  // Determines if listeners should be removed from the trigger
  // or the delegate elements associated with this floating element
  onUnmounted(() => {
    if (isNuxtServerSideRendering()) return;

    nextTick(() => {
      if (delegateTo) {
        interactions.forEach(interaction => {
          const eventType = INTERACTIONS_TO_EVENTS[interaction];
          decreaseDelegateUsage(delegateTo, eventType);
          const delegateUsage = getDelegateUsage(delegateTo, eventType);

          // Don't remove listener from the delegate element
          // in case there are still elements that depend on it
          if (delegateUsage === 0) {
            const delegateTarget = getDelegateTarget(floatingId, delegateTo, eventType);
            if (!delegateTarget) {
              throw new Error(
                `[useKFloatingInteraction] Event delegation target '${delegateTo}' not found`,
              );
            }
            delegateTarget.removeEventListener(eventType, EVENT_HANDLERS[eventType], true);
          }
        });
      } else {
        const triggerEl = getTriggerEl(floatingId);
        if (!triggerEl) {
          throw new Error(
            `[useKFloatingInteraction] No trigger element found for floating element '${floatingId}'`,
          );
        }

        interactions.forEach(interaction => {
          const eventType = INTERACTIONS_TO_EVENTS[interaction];
          triggerEl.removeEventListener(eventType, EVENT_HANDLERS[eventType], true);
        });
      }

      removeFloatingInteractions(floatingId);
      removeFloatingCache(floatingId);
    });
  });

  const isActive = computed(() => {
    return isFloatingElActive(floatingId);
  });

  const triggerEl = computed(() => {
    return activeFloatingElements.value[floatingId] || null;
  });

  return {
    isActive,
    triggerEl,
  };
}
