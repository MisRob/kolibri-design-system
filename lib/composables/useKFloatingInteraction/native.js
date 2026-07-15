/**
 * EXPERIMENTAL - the engine behind 'useKFloatingInteraction', with no Vue and no
 * other dependencies. 'index.js' is a thin adapter over it.
 *
 * Same behaviour, same structure, same names, so the two can be read side by
 * side. What a framework has to supply, and what this does without one:
 *
 * - Reactivity - an entry keeps plain values, and 'subscribe' reports changes.
 *   'setActiveInteractions' only reports when something a caller can see has
 *   actually changed, which is what Vue's refs did for free.
 *
 * - Lifecycle - the caller says when, by creating and by calling 'destroy'.
 *   This collapses the two teardown hooks a Vue version needs into one: that
 *   split exists only because Vue clears the floating element's ref between
 *   them. Here the caller destroys while its floating element still exists.
 *
 * - Scheduling - the 'defer' option, for waiting until a lazily rendered
 *   floating element exists. Defaults to a microtask, which is right when a
 *   subscriber renders synchronously; a framework passes its own (Vue passes
 *   'nextTick', which waits for a re-render).
 *
 * - Input modality - the 'isKeyboardModality' option, for 'keyboardfocus'.
 *   Defaults to tracking it here. A design system that already tracks it passes
 *   its own; it may return a promise.
 *
 * Usage:
 *
 *   const tooltip = createKFloatingInteraction('save-tip', () => floatingEl, {
 *     activateOn: ['hover'],
 *   });
 *   const unsubscribe = tooltip.subscribe(({ isActive, activatorEl }) => { ... });
 *   ...
 *   unsubscribe();
 *   tooltip.destroy();
 *
 * ==================================================================
 * Browser support
 *
 * Chrome >= 54, Firefox >= 49, Safari >= 10.1, Edge >= 17.
 *
 * Set by the newest APIs used:
 *
 * - 'Object.values'       Chrome 54, Firefox 47, Safari 10.1, Edge 14
 * - 'Node.isConnected'    Chrome 51, Firefox 49, Safari 10,   Edge 17
 * - 'Element.closest'     Chrome 41, Firefox 35, Safari 9,    Edge 15
 * - 'Promise', 'Set'      Chrome 38, Firefox 29, Safari 8,    Edge 12
 * - 'MutationObserver'    Chrome 26, Firefox 14, Safari 6.1,  Edge 12
 *
 * 'element.dataset', capture-phase listeners, 'MouseEvent.relatedTarget', and
 * the 'keydown' / 'mousedown' / 'touchstart' events are older than all of these.
 *
 * ES2015+ syntax, so it expects to be transpiled. No built-in is polyfilled
 * here, so the four above have to exist.
 */

// The scheduler used when a caller doesn't supply one. A microtask, so that a
// subscriber that renders its floating element synchronously has done so.
const deferToMicrotask = fn => Promise.resolve().then(fn);

// ==================================================================
// For document-level listeners

let documentHasClickListener = false;
let documentHasTouchListener = false;

// The deactivation listeners of click and touch sit on the document
// and are shared by all floating elements configured with the
// interactions. This cleans them up when no floating element relies
// on them anymore.
function removeUnusedDocumentListeners() {
  if (documentHasClickListener && !isInteractionActiveAnywhere(INTERACTIONS.CLICK)) {
    document.removeEventListener(EVENTS.CLICK, onClickDeactivate, true);
    documentHasClickListener = false;
  }
  if (documentHasTouchListener && !isInteractionActiveAnywhere(INTERACTIONS.TOUCH)) {
    document.removeEventListener(EVENTS.TOUCHSTART, onTouchDeactivate, true);
    documentHasTouchListener = false;
  }
}

// ==================================================================
// Input modality
//
// Stands in for a design system's own tracking, when no 'isKeyboardModality' is
// supplied. Both listeners are in the capture phase and the events they watch
// precede 'focus', so the answer is ready by the time a focus arrives.

let lastInputWasKeyboard = false;
let isTrackingInputModality = false;

function trackInputModality() {
  if (isTrackingInputModality) {
    return;
  }
  document.addEventListener('keydown', () => (lastInputWasKeyboard = true), true);
  document.addEventListener('mousedown', () => (lastInputWasKeyboard = false), true);
  document.addEventListener('touchstart', () => (lastInputWasKeyboard = false), true);
  isTrackingInputModality = true;
}

// ==================================================================
// Data attribute applied on an activator element
// Its value is ID of the associated floating element

const ATTR_FLOATING_ID = 'data-floating-id';
const SELECTOR_ACTIVATOR = `[${ATTR_FLOATING_ID}]`;

// Reads the floating ID from 'data-floating-id' attribute
// of an activator element
function getFloatingId(activatorEl) {
  if (!activatorEl.dataset || !activatorEl.dataset.floatingId) {
    throw new Error(
      `[useKFloatingInteraction] Activator element is missing the required attribute "${ATTR_FLOATING_ID}"`,
    );
  }
  return activatorEl.dataset.floatingId;
}

// ==================================================================
// Interactions and associated DOM events

const INTERACTIONS = {
  HOVER: 'hover',
  CLICK: 'click',
  TOUCH: 'touch',
  FOCUS: 'focus',
  KEYBOARDFOCUS: 'keyboardfocus',
};

const DEFAULT_INTERACTIONS = [INTERACTIONS.HOVER];

function areInteractionsValid(interactions) {
  return (
    Array.isArray(interactions) && interactions.every(i => Object.values(INTERACTIONS).includes(i))
  );
}

const EVENTS = {
  CLICK: 'click',
  FOCUS: 'focus',
  BLUR: 'blur',
  MOUSEENTER: 'mouseenter',
  MOUSELEAVE: 'mouseleave',
  TOUCHSTART: 'touchstart',
};

const ACTIVATION_EVENT_HANDLERS = {
  [EVENTS.CLICK]: onClickActivate,
  [EVENTS.FOCUS]: onFocusActivate,
  [EVENTS.MOUSEENTER]: onHoverActivate,
  [EVENTS.TOUCHSTART]: onTouchActivate,
};

const DEACTIVATION_EVENT_HANDLERS = {
  [EVENTS.CLICK]: onClickDeactivate,
  [EVENTS.BLUR]: onFocusDeactivate,
  [EVENTS.MOUSELEAVE]: onHoverDeactivate,
  [EVENTS.TOUCHSTART]: onTouchDeactivate,
};

const INTERACTION_TO_ACTIVATE_EVENT = {
  [INTERACTIONS.HOVER]: EVENTS.MOUSEENTER,
  [INTERACTIONS.TOUCH]: EVENTS.TOUCHSTART,
  [INTERACTIONS.FOCUS]: EVENTS.FOCUS,
  [INTERACTIONS.KEYBOARDFOCUS]: EVENTS.FOCUS,
  [INTERACTIONS.CLICK]: EVENTS.CLICK,
};

const INTERACTION_TO_DEACTIVATE_EVENT = {
  [INTERACTIONS.HOVER]: EVENTS.MOUSELEAVE,
  [INTERACTIONS.TOUCH]: EVENTS.TOUCHSTART,
  [INTERACTIONS.FOCUS]: EVENTS.BLUR,
  [INTERACTIONS.KEYBOARDFOCUS]: EVENTS.BLUR,
  [INTERACTIONS.CLICK]: EVENTS.CLICK,
};

// Whether an interaction's deactivation listener is attached
// to the active area (= activator element + floating element).
// Click and touch attach their deactivation listeners to the
// document instead, as they are dismissed by an interaction
// anywhere outside.
function deactivatesOnActiveArea(interaction) {
  return interaction !== INTERACTIONS.CLICK && interaction !== INTERACTIONS.TOUCH;
}

// The DOM event type the given interaction activates on
function getActivateEvent(interaction) {
  return INTERACTION_TO_ACTIVATE_EVENT[interaction];
}

// The DOM event types the given interactions activate on
function getActivateEvents(interactions) {
  // Deduplicate, as 'focus' and 'keyboardfocus' both activate
  // on the 'focus' event
  return [...new Set(interactions.map(getActivateEvent))];
}

// The DOM event type the given interaction deactivates on
function getDeactivateEvent(interaction) {
  return INTERACTION_TO_DEACTIVATE_EVENT[interaction];
}

// ==================================================================
// Registry that keeps data related to floating elements and their
// activator elements
//
// {
//   <floating element id>: {
//     activeInteractions: [ <interaction>, ... ],
//     activeActivatorEl: <element>,
//     cachedActivatorEl: <element>,
//     attachedListeners: {
//       el: <element>,
//       events: [ <event type>, ... ]
//     },
//     callers: Set([ <caller>, ... ]),
//     currentCaller: <caller>,
//   },
//   ...
// }
//
// where
//
//   <caller>: {
//     readFloatingEl,
//     subscribers: Set([ <function>, ... ]),
//     isKeyboardModality,
//     defer,
//     activateOn: [ <interaction>, ... ],
//     delegate: <boolean>,
//     activateEvents: [ <event type>, ... ],
//   }
//
// - 'activeInteractions' - The interactions currently holding the
//                          floating element active
// - 'activeActivatorEl' - The activator element the floating element
//                         was activated by
// - 'cachedActivatorEl' - The activator element found by the last
//                         document query
// - 'attachedListeners' - Which activation event types are attached
//                         and to which activator element
// - 'callers' - Caller = one 'createKFloatingInteraction' call.
//               Depending on lifecycle timing, for a brief moment
//               there might be more than one associated with the
//               same floating ID (re-creation via ':key',
//               v-if, ...). Used to prevent races between callers
//               (e.g. an outgoing caller's destroy tearing down
//               an entry an incoming one just set up).
// - 'currentCaller' - The caller whose configuration is in force
export const _registry = {};

// Performance optimization - the activators observer logic asks
// for these too often to scan the whole registry each time.
// '_active' - IDs of active floating elements
// '_nonDelegated' - IDs of non-delegated floating elements
export const _active = new Set();
export const _nonDelegated = new Set();

function isRegistered(floatingId) {
  return Boolean(_registry[floatingId]);
}

function getFloatingEl(floatingId) {
  if (!isRegistered(floatingId)) {
    return null;
  }
  return _registry[floatingId].currentCaller.readFloatingEl() || null;
}

// All interactions configured to activate a floating element
function getActivateOn(floatingId) {
  return _registry[floatingId].currentCaller.activateOn;
}

// Whether an interaction is configured to activate a floating element
function activatesOn(floatingId, interaction) {
  return getActivateOn(floatingId).includes(interaction);
}

// Whether an interaction is currently holding a floating element active
function isInteractionActive(floatingId, interaction) {
  const entry = _registry[floatingId];
  return Boolean(entry && entry.activeInteractions.includes(interaction));
}

// Whether an interaction is currently holding any floating element active
function isInteractionActiveAnywhere(interaction) {
  for (const floatingId of _active) {
    if (isInteractionActive(floatingId, interaction)) {
      return true;
    }
  }
  return false;
}

function createRegistryEntry(currentCaller) {
  return {
    activeInteractions: [],
    activeActivatorEl: null,
    cachedActivatorEl: null,
    attachedListeners: null,
    callers: new Set(),
    currentCaller,
  };
}

// Removes a floating element from the registry, along with its floating ID
// in the indexes
function deleteRegistryEntry(floatingId) {
  delete _registry[floatingId];

  // Need to be in sync with the registry
  _active.delete(floatingId);
  _nonDelegated.delete(floatingId);
}

// What a subscriber of a floating element sees
function getPublicState(entry) {
  return {
    isActive: entry.activeInteractions.length > 0,
    activatorEl: entry.activeActivatorEl,
  };
}

// Reports to every subscriber of every caller of an entry. Stands in for the
// computed properties a framework adapter would expose.
function notifySubscribers(entry) {
  const state = getPublicState(entry);
  entry.callers.forEach(caller => {
    caller.subscribers.forEach(subscriber => subscriber(state));
  });
}

// The only place that changes which interactions keep a floating element
// active, keeping the index, the activator element, and the observer in step
function setActiveInteractions(floatingId, interactions) {
  const entry = _registry[floatingId];
  const wasActive = entry.activeInteractions.length > 0;
  const previousActivatorEl = entry.activeActivatorEl;

  entry.activeInteractions = interactions;

  if (interactions.length) {
    _active.add(floatingId);
  } else {
    _active.delete(floatingId);
    entry.activeActivatorEl = null;
  }

  syncActivatorsObserver();

  // Only when a subscriber could tell the difference, as a reactive ref would
  const isActive = entry.activeInteractions.length > 0;
  if (isActive !== wasActive || entry.activeActivatorEl !== previousActivatorEl) {
    notifySubscribers(entry);
  }
}

// Adds an interaction to those keeping a floating element active,
// and records the activator element it was activated by
function addActiveInteraction(floatingId, activatorEl, interaction) {
  const entry = _registry[floatingId];

  // Two focus events can both get past 'resolveActivation' before either
  // finishes awaiting the input modality, and only the first may add it
  if (entry.activeInteractions.includes(interaction)) {
    return;
  }

  const newInteractions = [...entry.activeInteractions, interaction];

  entry.activeActivatorEl = activatorEl;
  setActiveInteractions(floatingId, newInteractions);
}

// Removes interactions from those keeping a floating element
// active + related clean-ups
function deactivateInteractions(floatingId, interactions) {
  if (!interactions.length) {
    return;
  }

  const entry = _registry[floatingId];
  const activatorEl = entry.activeActivatorEl;
  // Already gone when a caller destroyed after removing its floating element
  const floatingEl = getFloatingEl(floatingId);

  // Filter out click and touch first - they never attach a
  // deactivation listener to the active area (= activator element +
  // floating element), so there is none to remove for them
  interactions.filter(deactivatesOnActiveArea).forEach(interaction => {
    const deactivateEvent = getDeactivateEvent(interaction);
    const deactivateHandler = DEACTIVATION_EVENT_HANDLERS[deactivateEvent];

    activatorEl.removeEventListener(deactivateEvent, deactivateHandler, true);
    if (floatingEl) {
      floatingEl.removeEventListener(deactivateEvent, deactivateHandler, true);
    }
  });

  const remainingInteractions = entry.activeInteractions.filter(i => !interactions.includes(i));
  setActiveInteractions(floatingId, remainingInteractions);

  removeUnusedDocumentListeners();
}

// ==================================================================
// Detection of activator elements removed from the DOM
//
// Browsers fire no deactivating event for a removed element, so an activator
// element removed while active would hold its floating element active forever.
// An activator element can also appear or be replaced at any time, and a
// non-delegated floating element needs its listeners moved when it does.

let activatorsObserver = null;

function syncActivatorsObserver() {
  if (typeof window === 'undefined' || !window.MutationObserver) {
    return;
  }
  const isNeeded = Boolean(_active.size || _nonDelegated.size);
  if (isNeeded && !activatorsObserver) {
    observeActivators();
  } else if (!isNeeded && activatorsObserver) {
    stopObservingActivators();
  }
}

function observeActivators() {
  activatorsObserver = new MutationObserver(() => {
    // The first case, over the only floating elements it can apply to. A copy
    // of '_active', as deactivating below takes floating IDs out of it.
    [..._active].forEach(floatingId => {
      const entry = _registry[floatingId];
      // Set for exactly as long as the floating element is active, so being in
      // '_active' is being able to read it here, see 'setActiveInteractions'
      const activatorEl = entry.activeActivatorEl;
      if (activatorEl.isConnected) {
        return;
      }

      // No deactivating event will ever fire for the removed activator element,
      // so its deactivation listeners are removed here instead. The floating
      // element outlives it and keeps them attached.
      deactivateInteractions(floatingId, entry.activeInteractions);
      // The cache would keep returning the removed activator element
      entry.cachedActivatorEl = null;
    });

    // The second case. A delegated floating element binds nothing to its
    // activator element and so has nothing to re-attach, which is why the index
    // holds only the others.
    _nonDelegated.forEach(syncActivationListeners);
  });
  activatorsObserver.observe(document, { childList: true, subtree: true });
}

function stopObservingActivators() {
  activatorsObserver.disconnect();
  activatorsObserver = null;
}

// ==================================================================
// Activation listeners

// Reconciles the listeners that should be attached with those that are
function syncActivationListeners(floatingId) {
  const entry = _registry[floatingId];
  if (!entry) {
    return;
  }

  // A delegated caller listens on the delegate element, never on the activator
  const el = entry.currentCaller.delegate ? null : getActivatorEl(floatingId);
  const events = el ? entry.currentCaller.activateEvents : null;

  const attached = entry.attachedListeners;
  if (attached ? attached.el === el && attached.events === events : !el) {
    return;
  }

  detachActivationListeners(floatingId);
  if (!el) {
    return;
  }

  events.forEach(event => el.addEventListener(event, ACTIVATION_EVENT_HANDLERS[event], true));
  entry.attachedListeners = { el, events };
}

function detachActivationListeners(floatingId) {
  const entry = _registry[floatingId];
  if (!entry || !entry.attachedListeners) {
    return;
  }
  const { el, events } = entry.attachedListeners;
  events.forEach(event => el.removeEventListener(event, ACTIVATION_EVENT_HANDLERS[event], true));
  entry.attachedListeners = null;
}

function addDelegateListeners(caller) {
  caller.activateEvents.forEach(eventType => {
    if (getDelegateUsage(eventType) === 0) {
      getDelegateEl(eventType).addEventListener(
        eventType,
        ACTIVATION_EVENT_HANDLERS[eventType],
        true,
      );
    }
    incrementDelegateUsage(eventType);
  });
}

function removeDelegateListeners(caller) {
  caller.activateEvents.forEach(eventType => {
    if (decrementDelegateUsage(eventType) === 0) {
      getDelegateEl(eventType).removeEventListener(
        eventType,
        ACTIVATION_EVENT_HANDLERS[eventType],
        true,
      );
    }
  });
}

// ==================================================================
// Callers of an entry

function addCaller(floatingId, caller) {
  const entry = _registry[floatingId] || (_registry[floatingId] = createRegistryEntry(caller));
  entry.callers.add(caller);
  setCurrentCaller(floatingId, caller);
  return entry;
}

function removeCaller(floatingId, caller) {
  const entry = _registry[floatingId];
  if (!entry) {
    return;
  }
  entry.callers.delete(caller);

  // Another caller is still using the entry, which is now theirs
  if (entry.callers.size) {
    if (entry.currentCaller === caller) {
      setCurrentCaller(floatingId, entry.callers.values().next().value);
    }
    return;
  }

  // Last one out: there is no floating element left to show, so nothing may
  // stay active, and no listener attached on its behalf may stay attached
  deactivateInteractions(floatingId, entry.activeInteractions);
  detachActivationListeners(floatingId);

  deleteRegistryEntry(floatingId);
  syncActivatorsObserver();
}

// Puts a caller's configuration in force
function setCurrentCaller(floatingId, caller) {
  const entry = _registry[floatingId];
  entry.currentCaller = caller;

  if (caller.delegate) {
    _nonDelegated.delete(floatingId);
  } else {
    _nonDelegated.add(floatingId);
  }

  // An interaction the incoming caller doesn't activate on could never be
  // deactivated again, as dismissing click and touch is gated on 'activatesOn'
  deactivateInteractions(
    floatingId,
    entry.activeInteractions.filter(i => !caller.activateOn.includes(i)),
  );

  // The deactivation listeners of the interactions still in progress sit on the
  // floating element of whichever caller was current when they activated, and
  // this one is a different element
  entry.activeInteractions.filter(deactivatesOnActiveArea).forEach(interaction => {
    const deactivateEvent = getDeactivateEvent(interaction);
    const deactivateHandler = DEACTIVATION_EVENT_HANDLERS[deactivateEvent];
    listenOnFloatingEl(floatingId, interaction, deactivateEvent, deactivateHandler);
  });

  syncActivationListeners(floatingId);
  syncActivatorsObserver();
}

// ==================================================================
// For each event type delegated to the root, the number of delegating callers
// depending on it

export const _delegateUsage = {};

function getDelegateUsage(eventType) {
  return _delegateUsage[eventType] || 0;
}

function incrementDelegateUsage(eventType) {
  _delegateUsage[eventType] = (_delegateUsage[eventType] || 0) + 1;
  return _delegateUsage[eventType];
}

function decrementDelegateUsage(eventType) {
  if (!_delegateUsage[eventType]) {
    return 0;
  }
  _delegateUsage[eventType] -= 1;
  if (_delegateUsage[eventType] < 1) {
    delete _delegateUsage[eventType];
    return 0;
  }
  return _delegateUsage[eventType];
}

// ==================================================================
// Elements retrieval

function getDelegateEl(eventType) {
  return eventType === EVENTS.FOCUS ? window : document;
}

function getActivatorEl(floatingId) {
  const entry = _registry[floatingId];
  const cachedEl = entry && entry.cachedActivatorEl;
  // 'isConnected' so that an activator element replaced in the DOM isn't kept
  // returned, see 'observeActivators'
  if (cachedEl && cachedEl.isConnected) {
    return cachedEl;
  }

  const activatorEl = document.querySelector(`[${ATTR_FLOATING_ID}="${floatingId}"]`);
  if (entry) {
    entry.cachedActivatorEl = activatorEl;
  }
  return activatorEl;
}

// ==================================================================
// Activation and deactivation of floating elements

function onHoverActivate(event) {
  const activation = resolveActivation(event, INTERACTIONS.HOVER);
  if (!activation) return;
  const { activatorEl, floatingId } = activation;
  if (!activatesOn(floatingId, INTERACTIONS.HOVER)) return;

  activatorEl.addEventListener(EVENTS.MOUSELEAVE, onHoverDeactivate, true);
  addActiveInteraction(floatingId, activatorEl, INTERACTIONS.HOVER);
  listenOnFloatingEl(floatingId, INTERACTIONS.HOVER, EVENTS.MOUSELEAVE, onHoverDeactivate);
}

function onHoverDeactivate(event) {
  const deactivation = resolveDeactivation(event, INTERACTIONS.HOVER);
  if (!deactivation) return;
  const { floatingId, activatorEl, floatingEl } = deactivation;

  // Don't deactivate when the pointer is still inside the activator element
  // (happens when interacting with its children), or when it moves onto the
  // floating element itself
  if (isInsideActiveArea(event.relatedTarget, activatorEl, floatingEl)) return;

  deactivateInteractions(floatingId, [INTERACTIONS.HOVER]);
}

async function onFocusActivate(event) {
  const activation = resolveActivation(event, INTERACTIONS.FOCUS);
  if (!activation) return;
  const { activatorEl, floatingId } = activation;

  const activateOn = getActivateOn(floatingId);
  // Need to check input modality if configured to
  // be activated only on keyboard focus
  if (activateOn.includes(INTERACTIONS.KEYBOARDFOCUS) && !activateOn.includes(INTERACTIONS.FOCUS)) {
    if (!(await _registry[floatingId].currentCaller.isKeyboardModality())) return;
    // Bail if the floating element was destroyed during the await
    if (!isRegistered(floatingId)) return;
    // Focus may have left the activator during the await (e.g. tabbed away
    // while waiting for the modality check); don't activate then.
    if (!activatorEl.contains(document.activeElement)) return;
  } else if (!activateOn.includes(INTERACTIONS.FOCUS)) {
    return;
  }

  activatorEl.addEventListener(EVENTS.BLUR, onFocusDeactivate, true);
  addActiveInteraction(floatingId, activatorEl, INTERACTIONS.FOCUS);
  listenOnFloatingEl(floatingId, INTERACTIONS.FOCUS, EVENTS.BLUR, onFocusDeactivate);
}

function onFocusDeactivate(event) {
  const deactivation = resolveDeactivation(event, INTERACTIONS.FOCUS);
  if (!deactivation) return;
  const { floatingId, activatorEl, floatingEl } = deactivation;

  // Don't deactivate when focus is still inside the activator element (happens
  // when moving between its focusable children), or when it moves into the
  // floating element itself
  if (isInsideActiveArea(event.relatedTarget, activatorEl, floatingEl)) return;

  // Both 'focus' and 'keyboardfocus' are tracked as the 'focus' interaction;
  // 'keyboardfocus' only gates activation, it is never stored as active.
  deactivateInteractions(floatingId, [INTERACTIONS.FOCUS]);
}

function onClickActivate(event) {
  const activation = resolveActivation(event, INTERACTIONS.CLICK);
  if (!activation) return;
  const { activatorEl, floatingId } = activation;
  if (!activatesOn(floatingId, INTERACTIONS.CLICK)) return;

  // Click stays active until an outside click: attach the deactivation handler
  // to the document to detect clicks elsewhere (once). Attaching mid-dispatch
  // means the activating click won't dismiss it.
  if (!documentHasClickListener) {
    document.addEventListener(EVENTS.CLICK, onClickDeactivate, true);
    documentHasClickListener = true;
  }
  addActiveInteraction(floatingId, activatorEl, INTERACTIONS.CLICK);
}

function onClickDeactivate(event) {
  const activatorEl = getActivatorFromEvent(event);

  if (!activatorEl) {
    // Clicked on a non-activator element => deactivate all
    // floating elements with click interaction.
    // A copy of '_active', as deactivating below takes floating IDs out of it.
    [..._active].forEach(id => {
      // Keep the floating element active when the click landed inside its
      // active area (e.g. a button or input in an open dropdown menu)
      if (
        activatesOn(id, INTERACTIONS.CLICK) &&
        !isInsideActiveArea(event.target, getActivatorEl(id), getFloatingEl(id))
      ) {
        deactivateInteractions(id, [INTERACTIONS.CLICK]);
      }
    });
  } else {
    // Clicked on an activator element => deactivate all other
    // floating elements with click interaction
    const floatingId = getFloatingId(activatorEl);
    [..._active]
      .filter(id => id !== floatingId)
      .forEach(id => {
        // Keep the floating element active when the clicked activator is inside
        // its active area (e.g. a nested activator opening a submenu)
        if (
          activatesOn(id, INTERACTIONS.CLICK) &&
          !isInsideActiveArea(event.target, getActivatorEl(id), getFloatingEl(id))
        ) {
          deactivateInteractions(id, [INTERACTIONS.CLICK]);
        }
      });
  }

  // A clicked activator that activates re-attaches the document listener right
  // after (a listener added mid-dispatch does not fire for the current click)
  removeUnusedDocumentListeners();
}

function onTouchActivate(event) {
  const activation = resolveActivation(event, INTERACTIONS.TOUCH);
  if (!activation) return;
  const { activatorEl, floatingId } = activation;
  if (!activatesOn(floatingId, INTERACTIONS.TOUCH)) return;

  // Like click, a tap keeps the floating element active until an outside tap
  if (!documentHasTouchListener) {
    document.addEventListener(EVENTS.TOUCHSTART, onTouchDeactivate, true);
    documentHasTouchListener = true;
  }
  addActiveInteraction(floatingId, activatorEl, INTERACTIONS.TOUCH);
}

function onTouchDeactivate(event) {
  const activatorEl = getActivatorFromEvent(event);

  // Tapped a non-activator element => deactivate all
  // floating elements with touch interaction
  if (!activatorEl) {
    // A copy of '_active', as deactivating below takes floating IDs out of it
    [..._active].forEach(id => {
      // Keep the floating element active when the tap landed inside its
      // active area (e.g. a button or input in an open dropdown menu)
      if (
        activatesOn(id, INTERACTIONS.TOUCH) &&
        !isInsideActiveArea(event.target, getActivatorEl(id), getFloatingEl(id))
      ) {
        deactivateInteractions(id, [INTERACTIONS.TOUCH]);
      }
    });
  } else {
    // Tapped an activator element => deactivate all other
    // floating elements with touch interaction
    const floatingId = getFloatingId(activatorEl);
    [..._active]
      .filter(id => id !== floatingId)
      .forEach(id => {
        // Keep the floating element active when the tapped activator is inside
        // its active area (e.g. a nested activator opening a submenu)
        if (
          activatesOn(id, INTERACTIONS.TOUCH) &&
          !isInsideActiveArea(event.target, getActivatorEl(id), getFloatingEl(id))
        ) {
          deactivateInteractions(id, [INTERACTIONS.TOUCH]);
        }
      });
  }

  removeUnusedDocumentListeners();
}

// Resolves the activator element associated with an event.
// 'closest' needed to not miss when children
// of the activator element are interacted with
function getActivatorFromEvent(event) {
  // Not every event target is an element, e.g. the document or the window can
  // be one for events dispatched programmatically
  if (!(event.target instanceof Element)) {
    return null;
  }
  let activatorEl = event.target;
  if (!activatorEl.hasAttribute(ATTR_FLOATING_ID)) {
    activatorEl = activatorEl.closest(SELECTOR_ACTIVATOR);
  }
  return activatorEl;
}

// Common preamble of activation handlers
function resolveActivation(event, interaction) {
  const activatorEl = getActivatorFromEvent(event);
  if (!activatorEl) return null;

  const floatingId = getFloatingId(activatorEl);
  // An activator element can outlive its floating element. Delegated activation
  // listeners sit on the document and go on firing for such an activator
  // element, so bail out rather than activate one that doesn't exist.
  if (!isRegistered(floatingId)) return null;
  if (isInteractionActive(floatingId, interaction)) return null;

  return { activatorEl, floatingId };
}

// Listens for an interaction's deactivating event on the floating element
// itself, so that it stays active while the interaction is inside it and is
// deactivated once it leaves. Only for the interactions that deactivate on the
// active area, see 'deactivatesOnActiveArea'. The floating element may be
// rendered only after activation (lazy), so this is deferred until it exists.
function listenOnFloatingEl(floatingId, interaction, deactivateEvent, deactivateHandler) {
  _registry[floatingId].currentCaller.defer(() => {
    if (!isInteractionActive(floatingId, interaction)) return;
    const floatingEl = getFloatingEl(floatingId);
    if (floatingEl) {
      floatingEl.addEventListener(deactivateEvent, deactivateHandler, true);
    }
  });
}

// Common preamble of the deactivation handlers that observe the active area
function resolveDeactivation(event, interaction) {
  let activatorEl = getActivatorFromEvent(event);
  let floatingId;
  if (activatorEl) {
    floatingId = getFloatingId(activatorEl);
  } else {
    // It fired on the floating element itself
    floatingId = event.currentTarget && event.currentTarget.id;
    if (!floatingId) {
      throw new Error(
        `[useKFloatingInteraction] Floating element is missing the required "id" attribute`,
      );
    }
  }

  if (!isInteractionActive(floatingId, interaction)) return null;

  // It may have fired on the floating element, in which case the activator
  // element still needs resolving to check and clean up its listener
  if (!activatorEl) activatorEl = getActivatorEl(floatingId);

  return { floatingId, activatorEl, floatingEl: getFloatingEl(floatingId) };
}

// Whether a given DOM node is inside a floating element's active area: its
// activator element, or the floating element itself. Interactions staying
// within the active area don't deactivate the floating element.
function isInsideActiveArea(node, activatorEl, floatingEl) {
  return Boolean(
    (activatorEl && activatorEl.contains(node)) || (floatingEl && floatingEl.contains(node)),
  );
}

/**
 * Observes user interactions with an activator element to determine when a
 * floating element should be considered active.
 *
 * Constraints:
 *
 * - The floating element is required to be rendered with an `id` attribute
 *   equal to `floatingId`.
 *
 * - Each floating element is activated by a single activator element, which
 *   carries `data-floating-id` with that value. Several activator elements
 *   sharing one floating ID are not supported.
 *
 * - The activator element may be rendered conditionally and replaced at any
 *   point. So may the floating element, including while it is active, in which
 *   case the one left takes over and stays active.
 *
 * @param {String} floatingId Floating element ID
 *
 * @param {Function} readFloatingEl Returns the floating element, or a falsy
 *                   value while it isn't rendered. Read at interaction time, so
 *                   the floating element may be rendered lazily.
 *
 * @param {Object} [options]
 *
 * @param {Array} [options.activateOn=['hover']] Interactions that activate the
 *                floating element. Supported: 'hover', 'click', 'touch',
 *                'focus', 'keyboardfocus'.
 *
 * @param {Boolean} [options.delegate=false] Listen for activation events on the
 *                  document (or the window, for focus) rather than on the
 *                  activator element.
 *
 * @param {Function} [options.isKeyboardModality] Whether the user is navigating
 *                   with the keyboard, for 'keyboardfocus'. May return a
 *                   promise. Defaults to tracking it here.
 *
 * @param {Function} [options.defer] Runs a callback once a lazily rendered
 *                   floating element would exist. Defaults to a microtask.
 *
 * @returns {Object} { isActive, activatorEl, subscribe, destroy }
 *
 *                   `subscribe(fn)` calls `fn({ isActive, activatorEl })` right
 *                   away and on every change, and returns a function to stop.
 *
 *                   `destroy()` is to be called while the floating element still
 *                   exists, so that its deactivation listeners can be removed.
 */
export default function createKFloatingInteraction(floatingId, readFloatingEl, options = {}) {
  const { activateOn, delegate, isKeyboardModality, defer } = options;

  if (!floatingId) {
    throw new Error(`[useKFloatingInteraction] 'floatingId' is required.`);
  }
  if (typeof readFloatingEl !== 'function') {
    throw new Error(`[useKFloatingInteraction] 'readFloatingEl' must be a function.`);
  }

  // Validate and save configured interactions for this floating element
  let interactions;
  if (!activateOn || !activateOn.length) {
    interactions = [...DEFAULT_INTERACTIONS];
  } else if (!areInteractionsValid(activateOn)) {
    throw new Error(
      `[useKFloatingInteraction] 'activateOn' contains unsupported interaction(s). Supported interactions are: ${Object.values(INTERACTIONS).join(', ')}`,
    );
  } else {
    interactions = [...new Set(activateOn)]; // Also deduplicate
  }

  if (!isKeyboardModality && interactions.includes(INTERACTIONS.KEYBOARDFOCUS)) {
    trackInputModality();
  }

  const caller = {
    readFloatingEl,
    subscribers: new Set(),
    isKeyboardModality: isKeyboardModality || (() => lastInputWasKeyboard),
    defer: defer || deferToMicrotask,
    activateOn: interactions,
    delegate: Boolean(delegate),
    activateEvents: getActivateEvents(interactions),
  };
  const entry = addCaller(floatingId, caller);

  // 'addCaller' has already reconciled the activator element's listeners, and
  // the activators observer attaches them whenever it appears or gets replaced
  if (caller.delegate) {
    addDelegateListeners(caller);
  }

  return {
    get isActive() {
      return entry.activeInteractions.length > 0;
    },
    get activatorEl() {
      return entry.activeActivatorEl;
    },
    subscribe(fn) {
      caller.subscribers.add(fn);
      fn(getPublicState(entry));
      return () => caller.subscribers.delete(fn);
    },
    destroy() {
      // Removes deactivation listeners from this call's own floating element,
      // rather than the entry's, whose 'currentCaller' may be another caller
      // sharing the floating ID by now
      const floatingEl = readFloatingEl();
      if (floatingEl) {
        caller.activateOn.filter(deactivatesOnActiveArea).forEach(interaction => {
          const deactivateEvent = getDeactivateEvent(interaction);
          const deactivateHandler = DEACTIVATION_EVENT_HANDLERS[deactivateEvent];
          floatingEl.removeEventListener(deactivateEvent, deactivateHandler, true);
        });
      }

      removeCaller(floatingId, caller);
      caller.subscribers.clear();

      if (caller.delegate) {
        removeDelegateListeners(caller);
      }
    },
  };
}
