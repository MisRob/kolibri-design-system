import { shallowRef, computed, onMounted, onBeforeUnmount, onUnmounted, nextTick } from 'vue';
import { isNuxtServerSideRendering } from '../../utils';
import globalThemeState from '../../styles/globalThemeState';

// ==================================================================
// Activator elements
//
// Activator elements are handed over via the 'activatorRef' option
// and indexed in a WeakMap keyed by the element. Handlers resolve
// events against the index: delegated (document-level) handlers by
// walking the ancestors of the event target - O(depth of the target)
// regardless of how many floating elements are registered - and
// non-delegated handlers, which sit on the activator element itself,
// by looking up their own 'currentTarget'. No markup contract is
// needed - neither a 'data-floating-id' attribute on the activator
// element nor an 'id' on the floating element.
//
// The refs are read lazily and never watched: a ref may be populated
// late, and bridge refs built over non-reactive sources never notify
// (e.g. a 'customRef' reading '$refs', which is how KTooltip's
// 'reference'/'refs' props are supported). Anything that would need
// a notification to stay correct is reconciled on demand - on events
// for the index (see 'reconcileActivators'), and on a coarse
// interval for non-delegated listener bindings (see
// 'onMaintenanceTick').

// { <activator element>: <floating element id> }
export const _activatorToId = new WeakMap();

// How long a reconcile suppresses further reconciles (about a frame),
// see 'resolveActivatorFromEvent'
const RECONCILE_THROTTLE_MS = 16;

// Cadence of the maintenance watch, see 'onMaintenanceTick'
const MAINTENANCE_INTERVAL_MS = 150;

// Reads the current activator element of a caller. Unwraps component
// instances to their root element, so 'activatorRef' may hold either
// a DOM element or a component instance.
function readActivatorEl(caller) {
  const raw = caller.activatorRef.value;
  if (!raw) {
    return null;
  }
  const el = raw.$el !== undefined ? raw.$el : raw;
  return el instanceof Element ? el : null;
}

// Resolves the activator element associated with a DOM node by
// walking its ancestors against the index. The walk is needed to not
// miss when children of the activator element are interacted with.
function matchActivator(node) {
  let el = node;
  while (el) {
    const floatingId = _activatorToId.get(el);
    if (floatingId !== undefined) {
      return { activatorEl: el, floatingId };
    }
    el = el.parentElement;
  }
  return null;
}

// ==================================================================
// Document-level listeners state
//
// The deactivation listeners of click and touch sit on the document
// and are shared by all floating elements configured with the
// associated interactions

let documentHasClickListener = false;
let documentHasTouchListener = false;

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
  [EVENTS.FOCUS]: onFocusDeactivate,
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
// Active area
//
// A floating element's active area is the area of the activator
// element and the floating element. Interactions staying within the
// active area don't deactivate the floating element.

// Whether an interaction's deactivation listener is attached
// to the active area. Click and touch attach their deactivation
// listeners to the document instead, as they are dismissed by an
// interaction anywhere outside.
function deactivatesOnActiveArea(interaction) {
  return interaction !== INTERACTIONS.CLICK && interaction !== INTERACTIONS.TOUCH;
}

// Whether a DOM node is inside the active area
function isInsideActiveArea(node, activatorEl, floatingEl) {
  return Boolean(
    (activatorEl && activatorEl.contains(node)) || (floatingEl && floatingEl.contains(node)),
  );
}

// ==================================================================
// Registry that keeps data related to floating elements and their
// activator elements
//
// {
//   <floating element id>: {
//     activeInteractions: shallowRef([ <interaction>, ... ]),
//     activeActivatorEl: shallowRef(<element>),
//     registeredActivatorEl: <element>,
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
//     floatingRef,
//     activatorRef,
//     activateOn: [ <interaction>, ... ],
//     delegate: <boolean>,
//     activateEvents: [ <event type>, ... ],
//   }
//
// - 'activeInteractions' - The interactions currently holding the
//                          floating element active
// - 'activeActivatorEl' - The activator element the floating element
//                         was activated by
// - 'registeredActivatorEl' - The activator element currently indexed
//                             in '_activatorToId' for this floating
//                             ID, so that the index can be kept exact
//                             (a WeakMap can't be iterated)
// - 'attachedListeners' - Which activation event types are attached
//                         and to which activator element
// - 'callers' - Caller = one composable invocation.
//               Depending on lifecycle timing, for a brief moment
//               there might be more than one associated with the
//               same floating ID (re-creation via ':key',
//               v-if, ...). Used to prevent races between callers
//               (e.g. an outgoing caller's unmount clearing
//               an entry an incoming one just set up).
// - 'currentCaller' - The caller whose configuration is in force
export const _registry = {};

// Performance optimization - the maintenance watch asks for these on
// every tick, too often to scan the whole registry each time.
//
// '_active' - IDs of active floating elements
// '_nonDelegated' - IDs of non-delegated floating elements
//
// Sets for easier implementation (too few IDs for the lookup cost
// to matter - '_active' has a handful, and '_nonDelegated'
// shouldn't be large either as long as the guidance to use
// delegation for higher amounts of floating elements on a page is
// followed)
export const _active = new Set();
export const _nonDelegated = new Set();

function isRegistered(floatingId) {
  return Boolean(_registry[floatingId]);
}

function getFloatingEl(floatingId) {
  if (!isRegistered(floatingId)) {
    return null;
  }
  return _registry[floatingId].currentCaller.floatingRef.value;
}

// All interactions configured to activate a floating element
function getActivateOn(floatingId) {
  return _registry[floatingId].currentCaller.activateOn;
}

// Whether an interaction is configured to activate a floating element
function activatesOn(floatingId, interaction) {
  return getActivateOn(floatingId).includes(interaction);
}

// Whether an interaction is currently holding a floating element
// active
function isInteractionActive(floatingId, interaction) {
  const entry = _registry[floatingId];
  return Boolean(entry && entry.activeInteractions.value.includes(interaction));
}

// Whether an interaction is currently holding any floating element
// active
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
    activeInteractions: shallowRef([]),
    activeActivatorEl: shallowRef(null),
    registeredActivatorEl: null,
    attachedListeners: null,
    callers: new Set(),
    currentCaller,
  };
}

function deleteRegistryEntry(floatingId) {
  const entry = _registry[floatingId];
  if (entry && entry.registeredActivatorEl) {
    _activatorToId.delete(entry.registeredActivatorEl);
  }
  delete _registry[floatingId];
  _active.delete(floatingId);
  _nonDelegated.delete(floatingId);
}

// Updates interactions keeping a floating element
// active + related syncs and clean-ups
function setActiveInteractions(floatingId, interactions) {
  const entry = _registry[floatingId];
  entry.activeInteractions.value = interactions;

  if (interactions.length) {
    _active.add(floatingId);
  } else {
    _active.delete(floatingId);
    entry.activeActivatorEl.value = null;
  }

  syncMaintenanceWatch();
}

// Adds an interaction to those keeping a floating element active
// and records the activator element it was activated by
function addActiveInteraction(floatingId, activatorEl, interaction) {
  const entry = _registry[floatingId];
  if (entry.activeInteractions.value.includes(interaction)) {
    return;
  }

  const newInteractions = [...entry.activeInteractions.value, interaction];

  entry.activeActivatorEl.value = activatorEl;
  setActiveInteractions(floatingId, newInteractions);
}

// Removes interactions from those keeping a floating element
// active + related clean-ups
function deactivateInteractions(floatingId, interactions) {
  if (!interactions.length) {
    return;
  }

  const entry = _registry[floatingId];
  const activatorEl = entry.activeActivatorEl.value;
  const floatingEl = getFloatingEl(floatingId);

  // Filter out click and touch first - they never attach a
  // deactivation listener to the active area (= activator element +
  // floating element), so there is none to remove for them)
  interactions.filter(deactivatesOnActiveArea).forEach(interaction => {
    const deactivateEvent = getDeactivateEvent(interaction);
    const deactivateHandler = DEACTIVATION_EVENT_HANDLERS[deactivateEvent];

    activatorEl.removeEventListener(deactivateEvent, deactivateHandler, true);
    if (floatingEl) {
      floatingEl.removeEventListener(deactivateEvent, deactivateHandler, true);
    }
  });

  const remainingInteractions = entry.activeInteractions.value.filter(
    i => !interactions.includes(i),
  );
  setActiveInteractions(floatingId, remainingInteractions);

  removeUnusedDocumentListeners();
}

// ==================================================================
// Activators index reconciliation
//
// Activator elements can appear later, be replaced, or removed, and
// their refs never notify about it (see the top of the file). The
// index is instead reconciled on demand: cheaply (per registered
// floating element, one ref read and one identity compare - no DOM
// queries), and only when something suggests it may be stale.

let lastReconcileAt = -Infinity;

// Reconciles the whole index against the callers' refs. Throttled,
// as it runs when a document-level event resolves to no activator
// element, which is most events on the page (see
// 'resolveActivatorFromEvent' for why that is sound); 'force' is for
// the rare non-event callers that know something changed.
function reconcileActivators(force = false) {
  const now = performance.now();
  if (!force && now - lastReconcileAt < RECONCILE_THROTTLE_MS) {
    return false;
  }
  lastReconcileAt = now;
  Object.keys(_registry).forEach(syncActivatorRegistration);
  return true;
}

// Reconciles a single floating element's index registration with its
// current caller's ref.
//
// An empty ref read doesn't unregister: it may simply not be
// populated yet (refs are allowed to be lazy), and the registered
// element - if there is one - remains the best candidate until the
// ref resolves to a different element. An element left registered
// this way can't act for a caller whose ref has moved on, as hits
// are verified against the ref, see 'isCurrentActivator'.
function syncActivatorRegistration(floatingId) {
  const entry = _registry[floatingId];
  if (!entry) {
    return;
  }
  const el = readActivatorEl(entry.currentCaller);
  if (!el || el === entry.registeredActivatorEl) {
    return;
  }
  if (entry.registeredActivatorEl) {
    _activatorToId.delete(entry.registeredActivatorEl);
  }
  _activatorToId.set(el, floatingId);
  entry.registeredActivatorEl = el;
}

// Whether a hit doesn't contradict its caller's current ref. An
// empty read can't contradict it, see 'syncActivatorRegistration'.
function isCurrentActivator(hit) {
  const entry = _registry[hit.floatingId];
  if (!entry) {
    return false;
  }
  const el = readActivatorEl(entry.currentCaller);
  return !el || el === hit.activatorEl;
}

// Resolves the activator element and floating ID associated with an
// activation event, or null when the event didn't happen on a
// currently registered activator element.
//
// Non-delegated activation listeners sit on the activator element
// itself, so for them 'currentTarget' resolves directly. Delegated
// listeners sit on the document (or the window) and resolve by
// walking the ancestors of the event target.
//
// On the walk path, a miss may just mean the index is stale - refs
// are never watched, so a replaced activator element is only picked
// up here, on the first event after the replacement. Reconciling on
// every miss would make non-activator events (the vast majority) pay
// for it, so it is throttled to about once a frame: the only
// interaction that can be dropped is one landing on a replaced
// element within the same frame as both the replacement and another
// reconcile, which human input doesn't do; the next event resolves
// correctly.
function resolveActivatorFromEvent(event) {
  // A non-delegated listener: its own element is the activator
  if (event.currentTarget instanceof Element) {
    const floatingId = _activatorToId.get(event.currentTarget);
    if (floatingId === undefined) {
      return null;
    }
    const hit = { activatorEl: event.currentTarget, floatingId };
    return isCurrentActivator(hit) ? hit : null;
  }

  // A delegated listener: resolve the event target against the index
  // Not every event target is an element, e.g. the document or the
  // window can be one for events dispatched programmatically
  if (!(event.target instanceof Element)) {
    return null;
  }
  let hit = matchActivator(event.target);
  if (hit && isCurrentActivator(hit)) {
    return hit;
  }
  // A stale hit forces the reconcile - the index provably no longer
  // matches the refs
  if (!reconcileActivators(Boolean(hit))) {
    return null;
  }
  hit = matchActivator(event.target);
  return hit && isCurrentActivator(hit) ? hit : null;
}

// ==================================================================
// Maintenance watch
//
// One shared interval that takes over the two duties of what used to
// be a document-wide MutationObserver, gated by the same condition
// (something is active, or non-delegated floating elements exist):
//
// (1) for active floating elements, deactivate those whose activator
// element left the DOM. No event ever says so (browsers fire no
// 'mouseleave'/'blur' for removed elements), which would otherwise
// leave e.g. a stuck open tooltip after its 'v-if' button
// disappears.
//
// (2) for non-delegated floating elements, (re)bind their activation
// listeners to whichever element their caller's ref currently reads
// (e.g. an unresponsive activator after a ':key' change replaces its
// element). The per-tick fast path is one ref read and one identity
// compare per non-delegated floating element.
//
// The trade against the observer: a fixed, tiny cost per tick
// instead of a cost on every DOM mutation batch, at the price of
// latency - a removed activator deactivates, and a replaced one
// becomes responsive, within an interval rather than a microtask.

let maintenanceWatchId = null;

function syncMaintenanceWatch() {
  const isNeeded = Boolean(_active.size || _nonDelegated.size);
  if (isNeeded && maintenanceWatchId === null) {
    maintenanceWatchId = setInterval(onMaintenanceTick, MAINTENANCE_INTERVAL_MS);
  }
  if (!isNeeded && maintenanceWatchId !== null) {
    clearInterval(maintenanceWatchId);
    maintenanceWatchId = null;
  }
}

function onMaintenanceTick() {
  // (1) disconnected activators of active floating elements
  // A copy of '_active', as deactivating below takes floating IDs
  // out of it
  [..._active].forEach(floatingId => {
    const entry = _registry[floatingId];
    const activatorEl = entry.activeActivatorEl.value;
    if (activatorEl && activatorEl.isConnected) {
      return;
    }
    deactivateInteractions(floatingId, entry.activeInteractions.value);
    syncActivatorRegistration(floatingId);
  });

  // (2) listener bindings of non-delegated floating elements
  _nonDelegated.forEach(syncActivationListeners);
}

// ==================================================================
// Activation listeners
//
// Attached to the activator element of a non-delegated floating element, and
// re-attached whenever the caller's ref reads a different element.

// Reconciles the listeners that should be attached with those that are:
// derives the binding wanted from the entry's current state, compares it
// against the one recorded, and fixes the difference. Idempotent, so every call
// of it is the same one, and nothing calling it has to know what went stale, or
// whether anything did. Called from a caller's mount, from 'setCurrentCaller',
// and on every maintenance tick.
//
// This is why 'attachedListeners' records the events it attached rather than
// the detaching re-deriving them: the paths that detach (activator element
// replaced, 'currentCaller' swapped, last caller gone) would each need a different
// 'activateOn' to detach with, and the wrong one strands listeners on the
// element for as long as it lives.
function syncActivationListeners(floatingId) {
  const entry = _registry[floatingId];
  if (!entry) {
    return;
  }

  // A delegated caller listens on the delegate element, never on the activator
  const el = entry.currentCaller.delegate ? null : readActivatorEl(entry.currentCaller);
  const events = el ? entry.currentCaller.activateEvents : null;

  // Hot path: called for every non-delegated floating element on every
  // maintenance tick, so nothing is derived or allocated to find out nothing
  // changed
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

  // The listeners resolve their floating ID through the index, so it
  // has to know the element they are now attached to
  syncActivatorRegistration(floatingId);
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
    // Don't add listener to the delegate element in case it already listens
    // for this event type (strictly speaking, browsers prevent from duplicate
    // event listeners with the same signature, but _delegateUsage
    // logic needs to be in place anyway to know when to clean up,
    // so it's utilized here too for explicit check)
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
    // Don't remove listener from the delegate element
    // in case there are still elements that depend on it
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
//
// More than one caller can share a floating ID, as a floating element replaced
// by another one with the same ID is two separate 'useKFloatingInteraction'
// calls against the same entry. For example when re-created by a changing key:
//
//   <KTooltip :key="currentLanguage" floatingId="save-tip" :activateOn="['keyboardfocus']">
//     {{ $tr('saveHint') }}
//   </KTooltip>
//
// Attaching and detaching may interleave in any order, and the entry outlives
// every order of them: it stands while it has any caller at all, and is torn
// down by whichever detaches last. Nothing can strand it or tear it down early.
// That much is the refcount's doing, and holds whatever Vue does.
//
// Carrying the active state across a replacement asks for more than that: the
// two callers have to overlap, as an entry left without any is torn down and
// its state with it. Vue creating an instance before destroying the one it
// replaces is what makes them overlap, and is the one thing here worth knowing
// is depended on. It is left at that rather than engineered around because
// losing it degrades benignly: a floating element replaced mid-interaction
// would go inactive, which is where it was before any of this, while the
// refcount still keeps anything from leaking or being stranded.
//
// The entry belongs to whichever caller attached last, which is what taking it
// over means: events resolve floating elements through the entry, so from
// that point on they are its. Its active state is deliberately left alone, so
// that a floating element replaced mid-interaction stays active: the pointer is
// still where it was, and no fresh 'mouseenter' would ever fire to activate it
// again.
function addCaller(floatingId, caller) {
  const isNewEntry = !_registry[floatingId];
  if (isNewEntry) {
    _registry[floatingId] = createRegistryEntry(caller);
  }
  const entry = _registry[floatingId];
  entry.callers.add(caller);
  setCurrentCaller(floatingId, caller, isNewEntry);
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
  deactivateInteractions(floatingId, entry.activeInteractions.value);
  detachActivationListeners(floatingId);

  deleteRegistryEntry(floatingId);
  syncMaintenanceWatch();
}

// Puts a caller's configuration in force. Only assigns and lets the
// reconcilers work out the rest, so there is no order to get right.
function setCurrentCaller(floatingId, caller, isNewEntry = false) {
  const entry = _registry[floatingId];
  entry.currentCaller = caller;

  // Delegation is the incoming caller's to decide, so the index follows it here
  // and nowhere else while the entry lives
  if (caller.delegate) {
    _nonDelegated.delete(floatingId);
  } else {
    _nonDelegated.add(floatingId);
  }

  // An interaction the incoming caller doesn't activate on has no business
  // holding its floating element active. Hover and focus would at least let go
  // of it on their deactivating event, which only asks whether they are active.
  // Click and touch never would: deactivating them is gated on 'activatesOn',
  // so they would hold the floating element active, and their document listener
  // alive, for as long as the activator element stays in the DOM.
  deactivateInteractions(
    floatingId,
    entry.activeInteractions.value.filter(i => !caller.activateOn.includes(i)),
  );

  // The deactivation listeners of the interactions still in progress sit on the
  // floating element of whichever caller was current when they activated, and
  // this one is a different element. Without its own, an interaction that moved
  // onto it would never be seen leaving it again, as the activator element's
  // listener declines to deactivate while the interaction is in the active area.
  // Attaching is deferred to the next tick, by which the floating element
  // exists; on a first attach nothing is active yet and this does nothing.
  entry.activeInteractions.value.filter(deactivatesOnActiveArea).forEach(interaction => {
    const deactivateEvent = getDeactivateEvent(interaction);
    const deactivateHandler = DEACTIVATION_EVENT_HANDLERS[deactivateEvent];
    listenOnFloatingEl(floatingId, interaction, deactivateEvent, deactivateHandler);
  });

  // A new entry has nothing to reconcile - nothing is attached yet, its ref
  // isn't populated during 'setup', and the caller's own mount syncs it.
  // The incoming caller of an existing entry may point at a different
  // activator element, or differ in delegation, so both the listener binding
  // and the index are reconciled right away.
  if (!isNewEntry) {
    syncActivationListeners(floatingId);
    syncActivatorRegistration(floatingId);
  }
  syncMaintenanceWatch();
}

// ==================================================================
// For each event type delegated to the root, the number of delegating callers
// depending on it. Counted against the deduplicated event types a caller
// resolves to, so one configured for both 'focus' and 'keyboardfocus' counts
// once, see 'getActivateEvents'.
// Used to determine when to remove listeners from the root.
// { <event type> : <delegating callers count> }
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

// The activator element a floating element is currently associated
// with: the one it was activated by while it is active, otherwise
// whichever its caller's ref (or the index) currently holds.
function getActivatorEl(floatingId) {
  const entry = _registry[floatingId];
  if (!entry) {
    return null;
  }
  return (
    entry.activeActivatorEl.value ||
    readActivatorEl(entry.currentCaller) ||
    entry.registeredActivatorEl
  );
}

// ==================================================================
// Activation and deactivation of floating elements

// Activation handlers update the active state of a floating element and set
// deactivation listeners on the activator element. Deactivation handlers clear
// the state and clean those listeners up.
//
// Depending on event type and delegation configuration, these can be called
// frequently => proceed from simple to complex one and exit early.

// Clean click and touch deactivation listeners when no floating element relies on them anymore
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

  // Don't deactivate when hovering and mouse still inside
  // the activator element (happens when interacting with
  // children of the activator element), or when the pointer
  // moves onto the floating element itself
  if (isInsideActiveArea(event.relatedTarget, activatorEl, floatingEl)) return;

  deactivateInteractions(floatingId, [INTERACTIONS.HOVER]);
}

// Kept synchronous: as a delegated handler it runs for every focus event on
// the page, and an 'async' function would allocate a promise on each of them
// even when exiting early. Only the modality check, reached solely for focus
// events on activator elements, goes async.
function onFocusActivate(event) {
  const activation = resolveActivation(event, INTERACTIONS.FOCUS);
  if (!activation) return;
  const { activatorEl, floatingId } = activation;

  const activateOn = getActivateOn(floatingId);
  // Need to check input modality if configured to
  // be activated only on keyboard focus
  if (activateOn.includes(INTERACTIONS.KEYBOARDFOCUS) && !activateOn.includes(INTERACTIONS.FOCUS)) {
    activateFocusIfKeyboardModality(floatingId, activatorEl);
    return;
  }
  if (!activateOn.includes(INTERACTIONS.FOCUS)) {
    return;
  }

  activateFocus(floatingId, activatorEl);
}

async function activateFocusIfKeyboardModality(floatingId, activatorEl) {
  if (!(await isKeyboardModality())) return;
  // Bail if the floating element was unmounted during the await
  if (!isRegistered(floatingId)) return;
  // Focus may have left the activator during the await (e.g. tabbed away
  // while waiting for the keyboardfocus modality check); don't activate then.
  if (!activatorEl.contains(document.activeElement)) return;

  activateFocus(floatingId, activatorEl);
}

function activateFocus(floatingId, activatorEl) {
  activatorEl.addEventListener(EVENTS.BLUR, onFocusDeactivate, true);
  addActiveInteraction(floatingId, activatorEl, INTERACTIONS.FOCUS);
  listenOnFloatingEl(floatingId, INTERACTIONS.FOCUS, EVENTS.BLUR, onFocusDeactivate);
}

function onFocusDeactivate(event) {
  const deactivation = resolveDeactivation(event, INTERACTIONS.FOCUS);
  if (!deactivation) return;
  const { floatingId, activatorEl, floatingEl } = deactivation;

  // Don't deactivate when focus is still inside the activator element
  // (happens when moving focus between focusable children of the activator),
  // or when focus moves into the floating element itself
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
  // When the click landed on an activator element, its own floating
  // element is spared; every other click-activated one deactivates,
  // unless the click landed inside its active area (e.g. a button or
  // input in an open dropdown menu, or a nested activator opening a
  // submenu)
  const hit = resolveActivatorFromEvent(event);
  const hitId = hit ? hit.floatingId : null;

  // A copy of '_active', as deactivating below takes floating IDs out of it
  [..._active]
    .filter(id => id !== hitId)
    .forEach(id => {
      if (
        activatesOn(id, INTERACTIONS.CLICK) &&
        !isInsideActiveArea(event.target, getActivatorEl(id), getFloatingEl(id))
      ) {
        deactivateInteractions(id, [INTERACTIONS.CLICK]);
      }
    });

  // A clicked activator that activates re-attaches the document listener right
  // after (a listener added mid-dispatch does not fire for the current click)
  removeUnusedDocumentListeners();
}

function onTouchActivate(event) {
  const activation = resolveActivation(event, INTERACTIONS.TOUCH);
  if (!activation) return;
  const { activatorEl, floatingId } = activation;
  if (!activatesOn(floatingId, INTERACTIONS.TOUCH)) return;

  // Like click, a tap keeps the floating element active until an outside tap:
  // attach the deactivation handler to the document to detect taps elsewhere.
  // Attaching mid-dispatch means the activating tap won't dismiss it.
  if (!documentHasTouchListener) {
    document.addEventListener(EVENTS.TOUCHSTART, onTouchDeactivate, true);
    documentHasTouchListener = true;
  }
  addActiveInteraction(floatingId, activatorEl, INTERACTIONS.TOUCH);
}

function onTouchDeactivate(event) {
  // Mirrors 'onClickDeactivate', see there
  const hit = resolveActivatorFromEvent(event);
  const hitId = hit ? hit.floatingId : null;

  // A copy of '_active', as deactivating below takes floating IDs out of it
  [..._active]
    .filter(id => id !== hitId)
    .forEach(id => {
      if (
        activatesOn(id, INTERACTIONS.TOUCH) &&
        !isInsideActiveArea(event.target, getActivatorEl(id), getFloatingEl(id))
      ) {
        deactivateInteractions(id, [INTERACTIONS.TOUCH]);
      }
    });

  // A tapped activator that activates re-attaches the document listener right
  // after (a listener added mid-dispatch does not fire for the current tap)
  removeUnusedDocumentListeners();
}

// Whether the current input modality is keyboard. Asynchronous, as it needs
// to wait for 'trackInputModality' to finish its updates first.
function isKeyboardModality() {
  return new Promise(resolve => {
    // requestAnimationFrame to wait for focus listener
    // in 'trackInputModality' to finish its updates
    requestAnimationFrame(() => {
      resolve(globalThemeState.inputModality === 'keyboard');
    });
  });
}

// Common preamble of activation handlers. Resolves the activator element and
// the floating element ID from an activation event, or returns null when the
// event shouldn't activate anything (it didn't happen on a registered
// activator element, or the interaction is already active).
function resolveActivation(event, interaction) {
  const hit = resolveActivatorFromEvent(event);
  if (!hit) return null;

  if (isInteractionActive(hit.floatingId, interaction)) return null;

  return hit;
}

// Listens for an interaction's deactivating event on the floating element
// itself, so that it stays active while the interaction is inside it and is
// deactivated once it leaves. Only for the interactions that deactivate on the
// active area, see 'deactivatesOnActiveArea'. The floating element may be
// rendered only after activation (lazy), so the listener is attached on the next
// tick, once it exists.
function listenOnFloatingEl(floatingId, interaction, deactivateEvent, deactivateHandler) {
  nextTick(() => {
    if (!isInteractionActive(floatingId, interaction)) return;
    const floatingEl = getFloatingEl(floatingId);
    if (floatingEl) {
      floatingEl.addEventListener(deactivateEvent, deactivateHandler, true);
    }
  });
}

// Common preamble of the deactivation handlers that observe the active area.
// Their event fires on a listener attached at activation time, so
// 'currentTarget' is either the activator element or the floating element of
// an active floating element, and is matched among the active ones (at most a
// handful, so the scan is cheap and needs no 'id' on the floating element).
// Returns null when the interaction isn't active for the resolved floating
// element.
function resolveDeactivation(event, interaction) {
  const el = event.currentTarget;
  for (const floatingId of _active) {
    if (!isInteractionActive(floatingId, interaction)) continue;

    const entry = _registry[floatingId];
    const activatorEl = entry.activeActivatorEl.value;
    const floatingEl = getFloatingEl(floatingId);
    if (el === activatorEl || el === floatingEl) {
      return { floatingId, activatorEl, floatingEl };
    }
  }
  return null;
}

/**
 * Observes user interactions with an activator element to determine
 * when the floating element should be considered active. The
 * activator element is handed over via the `activatorRef` option;
 * no attributes or IDs are required on either element.
 *
 * It does not directly set visibility, allowing components
 * to manage it depending on context.
 *
 * Typically called from a Vue component that represents
 * a floating element.
 *
 * Constraints:
 *
 * - `activatorRef` is the only connection to the activator element. It may
 *   hold a DOM element or a component instance (unwrapped to its root
 *   element), may be lazily populated, and is read at interaction time -
 *   never watched. Non-notifying refs are fully supported: a `customRef`
 *   whose getter reads a live source (e.g. `$refs`, see KTooltip's
 *   `reference`/`refs` props) works, while a `computed` over a non-reactive
 *   source does not (it caches its first read).
 *
 * - Each floating element is activated by a single activator element: one
 *   ref holds one element. The element may be replaced at any point. In
 *   delegated mode the replacement is picked up on the next interaction; in
 *   non-delegated mode the replacement becomes responsive within the
 *   maintenance interval (~150ms).
 *
 * - The floating element may likewise be replaced by another one with the same
 *   floating ID at any point, including while it is active, in which case the
 *   one left takes over and stays active. Interactions are tracked per floating
 *   ID rather than per component instance, so they survive the replacement.
 *
 * - While a floating element is active, its activator element leaving the DOM
 *   is watched at the same coarse interval: a floating element whose activator
 *   disappears deactivates within ~150ms rather than instantly.
 *
 * @param {String} floatingId Floating element ID. Identifies the floating
 *                element in the shared registry, and is what lets a floating
 *                element replaced by another one with the same ID take over
 *                seamlessly. Not required to appear in the DOM.
 *
 * @param {Ref} floatingRef Vue ref to the floating element. Used to recognize
 *                interactions with the floating element's own content (e.g.
 *                clicking a button inside an open dropdown, or moving the pointer
 *                onto a hover popover) so they don't dismiss it. May be lazily
 *                populated; it is read at interaction time.
 *
 * @param {Object} options
 *
 * @param {Ref} options.activatorRef Vue ref to the activator element (or to a
 *                component instance, whose root element is then used). May be
 *                lazily populated; it is read at interaction time and never
 *                watched, so it doesn't need to notify about replacements.
 *
 * @param {Array} [options.activateOn=['hover']] Optional array of interactions
 *                that activate the floating element. Supported: 'hover',
 *                'click', 'focus', 'keyboardfocus', 'touch'.
 *
 *                'click' and 'touch' keep the floating element active until an
 *                interaction outside of it, rather than only while pressed.
 *                Configuring both 'focus' and 'keyboardfocus' activates on any
 *                focus, as 'keyboardfocus' only narrows 'focus' down to keyboard
 *                input.
 *
 * @param {Boolean} [options.delegate=false] Optional. When `true`, activation
 *                  events are listened for on the document (or the window for
 *                  focus events) rather than on the activator element, so that
 *                  all delegating floating elements share a single listener per
 *                  event type. Use for performance optimization on pages with
 *                  many activator elements.
 *
 *                  The trade-off differs per interaction: delegating 'click',
 *                  'focus' and 'touch' saves listeners at little cost, as their
 *                  events are rare. Delegating 'hover' saves listeners too, but
 *                  its events are observed in the capture phase, so the
 *                  activator element lookup runs on every 'mouseenter' anywhere
 *                  on the page.
 *
 * @returns {Object} { isActive, activatorEl }
 *
 *                   `isActive` is a computed property indicating if a
 *                   floating element is active (= user interacted with its
 *                   activator element as configured in `activateOn`).
 *
 *                   `activatorEl` is a computed property with the activator
 *                   element the floating element was activated by, and is to be
 *                   positioned against. `null` while it isn't active.
 *
 *                   Both are inert when server-side rendering.
 */
export default function useKFloatingInteraction(floatingId, floatingRef, options = {}) {
  if (isNuxtServerSideRendering()) {
    // An inert shape rather than nothing, so that callers can destructure
    // the return value unconditionally
    return {
      isActive: computed(() => false),
      activatorEl: computed(() => null),
    };
  }

  const { activatorRef, activateOn, delegate } = options;

  if (!floatingId) {
    throw new Error(`[useKFloatingInteraction] 'floatingId' is required.`);
  }
  if (!floatingRef) {
    throw new Error(`[useKFloatingInteraction] 'floatingRef' is required.`);
  }
  if (!activatorRef) {
    throw new Error(`[useKFloatingInteraction] 'activatorRef' is required.`);
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

  const caller = {
    floatingRef,
    activatorRef,
    activateOn: interactions,
    delegate: Boolean(delegate),
    activateEvents: getActivateEvents(interactions),
  };
  const entry = addCaller(floatingId, caller);

  // Determines if listeners should be added to activator
  // or delegate element associated with this floating element
  onMounted(() => {
    nextTick(() => {
      if (caller.delegate) {
        addDelegateListeners(caller);
        syncActivatorRegistration(floatingId);
      } else {
        // The activator element doesn't need to exist yet: the maintenance
        // watch attaches the listeners whenever the ref reads one
        syncActivationListeners(floatingId);
      }
    });
  });

  // Removes deactivation listeners from the floating element, in case it
  // unmounts while still active. Can't be done in 'onUnmounted', where the
  // reference to the floating element is already cleared.
  onBeforeUnmount(() => {
    // This call's own reference rather than the entry's, whose 'currentCaller' may
    // be another caller sharing the floating ID by now
    const floatingEl = floatingRef.value;
    if (!floatingEl) return;

    caller.activateOn.filter(deactivatesOnActiveArea).forEach(interaction => {
      const deactivateEvent = getDeactivateEvent(interaction);
      const deactivateHandler = DEACTIVATION_EVENT_HANDLERS[deactivateEvent];
      floatingEl.removeEventListener(deactivateEvent, deactivateHandler, true);
    });
  });

  // Determines if listeners should be removed from activator
  // or delegate element associated with this floating element
  onUnmounted(() => {
    // Whether this instance is the last one using the floating ID, and so
    // whether anything keyed by it may be cleaned up, is the callers'
    // refcount to know, see 'removeCaller'
    removeCaller(floatingId, caller);

    nextTick(() => {
      // Delegate usage is counted per caller, each incrementing it on its own
      // mount, so each decrements its own here, independently of the entry
      if (caller.delegate) {
        removeDelegateListeners(caller);
      }
    });
  });

  // Subscribe to this floating element's own refs rather than to the whole
  // registry, so that interactions with other floating elements don't re-render.
  // They belong to the entry rather than to this call, so a caller sharing the
  // floating ID reads the very same ones, already reflecting an interaction in
  // progress if there is one.
  const isActive = computed(() => {
    return entry.activeInteractions.value.length > 0;
  });

  const activatorEl = computed(() => {
    return entry.activeActivatorEl.value;
  });

  return {
    isActive,
    activatorEl,
  };
}
