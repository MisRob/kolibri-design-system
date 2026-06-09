import { reactive, onMounted, onUnmounted, computed, nextTick } from 'vue';
import { isNuxtServerSideRendering } from '../../utils';
import globalThemeState from '../../styles/globalThemeState';

const ATTR_FLOATING_ID = 'data-floating-id';
const SELECTOR_FLOATING_ID = `[${ATTR_FLOATING_ID}]`;

const SUPPORTED_INTERACTIONS = ['hover', 'touch', 'focus', 'keyboardfocus', 'click'];
const DEFAULT_INTERACTIONS = ['hover'];

const MOUSEENTER = 'mouseenter';
const MOUSELEAVE = 'mouseleave';
const TOUCHSTART = 'touchstart';
const TOUCHEND = 'touchend';
const FOCUS = 'focus';
const BLUR = 'blur';
const CLICK = 'click';

const INTERACTIONS_TO_EVENTS = {
  hover: MOUSEENTER,
  touch: TOUCHSTART,
  focus: FOCUS,
  keyboardfocus: FOCUS,
  click: CLICK,
};

const EVENTS_TO_INTERACTIONS = {
  [MOUSEENTER]: 'hover',
  [TOUCHSTART]: 'touch',
  [FOCUS]: 'focus',
  [CLICK]: 'click',
};

const DELEGATE_ROOT = 'root';

const ENTER_TO_LEAVE_EVENT = {
  [MOUSEENTER]: MOUSELEAVE,
  [TOUCHSTART]: TOUCHEND,
  [FOCUS]: BLUR,
  [CLICK]: CLICK,
};

// { <floating id>: { activateOn: [...] } }
export const _floatingInteractions = {};

// { <floating id>: { <selector>: <element> } }
export const _floatingCache = {};

// { <delegate id>: { <event type>: <count> } }
export const _delegateUsage = {};

const activeFloatingElements = reactive({});

function getFloatingId(activatorEl) {
  return activatorEl?.dataset?.floatingId;
}

// Deviation from PoC: Array.isArray guard added before .every() call
function areInteractionsValid(interactions) {
  return Array.isArray(interactions) && interactions.every(i => SUPPORTED_INTERACTIONS.includes(i));
}

function addFloatingInteractions(floatingId, activateOn) {
  _floatingInteractions[floatingId] = { activateOn };
}

function getFloatingInteractions(floatingId) {
  return _floatingInteractions[floatingId]?.activateOn;
}

function removeFloatingInteractions(floatingId) {
  delete _floatingInteractions[floatingId];
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
  if (!usage) return 0;
  usage[eventType] -= 1;
  if (usage[eventType] === 0) {
    delete usage[eventType];
    if (Object.keys(usage).length === 0) {
      delete _delegateUsage[delegateTo];
    }
    return 0;
  }
  return usage[eventType];
}

function getFloatingCache(floatingId) {
  if (!_floatingCache[floatingId]) {
    _floatingCache[floatingId] = {};
  }
  return _floatingCache[floatingId];
}

function removeFloatingCache(floatingId) {
  delete _floatingCache[floatingId];
}

function getCachedEl(floatingId, cacheKey, queryFn) {
  const cache = getFloatingCache(floatingId);
  if (cache[cacheKey]) return cache[cacheKey];
  const el = queryFn();
  if (el) cache[cacheKey] = el;
  return el;
}

// Deviation from PoC: direct object references instead of string keys,
// eliminating the string-comparison branch. Safe because this is only
// called inside onMounted/onUnmounted which are guarded by isNuxtServerSideRendering().
function getDelegateTarget(floatingId, delegateTo, eventType) {
  if (!delegateTo) {
    return undefined;
  }
  if (delegateTo === DELEGATE_ROOT) {
    return eventType === FOCUS ? window : document;
  }
  return getCachedEl(floatingId, delegateTo, () => document.getElementById(delegateTo));
}

function getActivatorEl(floatingId) {
  const selector = `[${ATTR_FLOATING_ID}="${floatingId}"]`;
  return getCachedEl(floatingId, selector, () => document.querySelector(selector));
}

function addActiveFloatingEl(floatingId, activatorEl) {
  if (!(floatingId in activeFloatingElements)) {
    activeFloatingElements[floatingId] = activatorEl;
  }
}

function removeActiveFloatingEl(floatingId) {
  delete activeFloatingElements[floatingId];
}

function isFloatingElActive(floatingId) {
  return floatingId in activeFloatingElements;
}

function shouldEventActivate(floatingId, eventType) {
  const activateOn = getFloatingInteractions(floatingId);
  if (!activateOn) {
    return Promise.resolve(false);
  }

  if (
    eventType === 'focus' &&
    activateOn.includes('keyboardfocus') &&
    !activateOn.includes('focus')
  ) {
    return new Promise(resolve => {
      // requestAnimationFrame waits for the focus modality tracker to finish updating
      requestAnimationFrame(() => {
        resolve(globalThemeState.inputModality === 'keyboard');
      });
    });
  }
  return Promise.resolve(activateOn.includes(EVENTS_TO_INTERACTIONS[eventType]));
}

async function handleActivate(event, leaveEventType, leaveHandler) {
  if (!(event.target instanceof Element)) {
    return;
  }

  const activatorEl = event.target.closest(SELECTOR_FLOATING_ID);
  if (!activatorEl) {
    return;
  }

  const floatingId = getFloatingId(activatorEl);

  if (isFloatingElActive(floatingId)) {
    return;
  }

  const should = await shouldEventActivate(floatingId, event.type);
  if (!should) {
    return;
  }

  // Guard against component having unmounted while shouldEventActivate was awaiting
  if (!getFloatingInteractions(floatingId)) {
    return;
  }

  activatorEl.addEventListener(leaveEventType, leaveHandler, true);
  addActiveFloatingEl(floatingId, activatorEl);
}

function handleDeactivate(event, leaveEventType, leaveHandler) {
  let activatorEl = event.target;

  if (!activatorEl.hasAttribute(ATTR_FLOATING_ID)) {
    activatorEl = activatorEl.closest(SELECTOR_FLOATING_ID);
  }
  if (!activatorEl) {
    return;
  }

  if (leaveEventType === MOUSELEAVE && activatorEl.contains(event.relatedTarget)) {
    return;
  }

  activatorEl.removeEventListener(leaveEventType, leaveHandler, true);

  const floatingId = getFloatingId(activatorEl);
  removeActiveFloatingEl(floatingId);
}

// Stable function references required by addEventListener/removeEventListener.
// Arrow functions defined after handleActivate/handleDeactivate; self-references in
// LEAVE_HANDLERS are resolved at call time (after module initialization).
const LEAVE_HANDLERS = {
  [MOUSELEAVE]: event => handleDeactivate(event, MOUSELEAVE, LEAVE_HANDLERS[MOUSELEAVE]),
  [TOUCHEND]: event => handleDeactivate(event, TOUCHEND, LEAVE_HANDLERS[TOUCHEND]),
  [BLUR]: event => handleDeactivate(event, BLUR, LEAVE_HANDLERS[BLUR]),
  [CLICK]: event => handleDeactivate(event, CLICK, LEAVE_HANDLERS[CLICK]),
};

const EVENT_HANDLERS = {
  [MOUSEENTER]: event => handleActivate(event, MOUSELEAVE, LEAVE_HANDLERS[MOUSELEAVE]),
  [TOUCHSTART]: event => handleActivate(event, TOUCHEND, LEAVE_HANDLERS[TOUCHEND]),
  [FOCUS]: event => handleActivate(event, BLUR, LEAVE_HANDLERS[BLUR]),
  [CLICK]: event => handleActivate(event, CLICK, LEAVE_HANDLERS[CLICK]),
};

/**
 * Observes user interactions with activator elements to determine
 * when the floating element should be considered active. Activator
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
 * @param {Array} [activateOn=['hover']] Array of interactions that activate
 *   the floating element. Supported: 'hover', 'touch', 'focus', 'keyboardfocus', 'click'.
 *
 * @param {String} [delegateTo] 'root' or ID of an ancestor element to delegate
 *   events to. 'root' delegates to document (or window for focus events).
 *   Use for performance optimization on pages with many floating elements.
 *
 * @returns {{ isActive: import('vue').ComputedRef<boolean>,
 *   activatorEl: import('vue').ComputedRef<Element|null> }}
 */
export default function useKFloatingInteraction(floatingId, activateOn, delegateTo) {
  if (!floatingId) {
    throw new Error(`[useKFloatingInteraction] 'floatingId' is required.`);
  }

  if (activateOn?.length && !areInteractionsValid(activateOn)) {
    throw new Error(
      `[useKFloatingInteraction] 'activateOn' contains unsupported interaction(s). Supported interactions are: ${SUPPORTED_INTERACTIONS.join(', ')}`,
    );
  }
  const interactions = activateOn?.length ? [...activateOn] : [...DEFAULT_INTERACTIONS];
  const uniqueEventTypes = [...new Set(interactions.map(i => INTERACTIONS_TO_EVENTS[i]))];

  addFloatingInteractions(floatingId, interactions);

  onMounted(() => {
    if (isNuxtServerSideRendering()) return;

    nextTick(() => {
      if (delegateTo) {
        uniqueEventTypes.forEach(eventType => {
          const delegateUsage = getDelegateUsage(delegateTo, eventType);

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
        const activatorEl = getActivatorEl(floatingId);
        if (!activatorEl) {
          throw new Error(
            `[useKFloatingInteraction] No activator element found for floating element '${floatingId}'`,
          );
        }

        uniqueEventTypes.forEach(eventType => {
          activatorEl.addEventListener(eventType, EVENT_HANDLERS[eventType], true);
        });
      }
    });
  });

  onUnmounted(() => {
    if (isNuxtServerSideRendering()) return;

    // Synchronously remove interactions so concurrent async handlers bail early via
    // the getFloatingInteractions guard, and to avoid a race where a new component
    // with the same floatingId mounts in the same tick: its addFloatingInteractions
    // call runs synchronously but a nextTick-deferred removal would delete it.
    removeFloatingInteractions(floatingId);

    // Clean up active state if the floating was still active when the component unmounts
    // (e.g. user was hovering when the parent was conditionally removed). Without this,
    // activeFloatingElements retains a stale entry and a detached leave-event listener.
    if (isFloatingElActive(floatingId)) {
      const activeActivatorEl = activeFloatingElements[floatingId];
      if (activeActivatorEl) {
        const uniqueLeaveEventTypes = [
          ...new Set(interactions.map(i => ENTER_TO_LEAVE_EVENT[INTERACTIONS_TO_EVENTS[i]])),
        ];
        uniqueLeaveEventTypes.forEach(leaveEvent => {
          activeActivatorEl.removeEventListener(leaveEvent, LEAVE_HANDLERS[leaveEvent], true);
        });
      }
      removeActiveFloatingEl(floatingId);
    }

    nextTick(() => {
      if (delegateTo) {
        uniqueEventTypes.forEach(eventType => {
          const delegateUsage = decreaseDelegateUsage(delegateTo, eventType);

          if (delegateUsage === 0) {
            const delegateTarget = getDelegateTarget(floatingId, delegateTo, eventType);
            // Deviation from PoC: existence check instead of throwing; the target may be
            // gone from the DOM before this component unmounts
            if (delegateTarget) {
              delegateTarget.removeEventListener(eventType, EVENT_HANDLERS[eventType], true);
            }
          }
        });
      } else {
        const activatorEl = getActivatorEl(floatingId);
        // Deviation from PoC: existence check instead of throwing
        if (activatorEl) {
          uniqueEventTypes.forEach(eventType => {
            activatorEl.removeEventListener(eventType, EVENT_HANDLERS[eventType], true);
          });
        }
      }

      removeFloatingCache(floatingId);
    });
  });

  const isActive = computed(() => isFloatingElActive(floatingId));

  const activatorEl = computed(() => activeFloatingElements[floatingId] || null);

  return { isActive, activatorEl };
}
