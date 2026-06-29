import { shallowRef, computed, onMounted, onBeforeUnmount, onUnmounted, nextTick } from 'vue';
import { isNuxtServerSideRendering } from '../../utils';
import globalThemeState from '../../styles/globalThemeState';

// ==================================================================
// Listeners shared by all floating elements, attached only while
// there is anything that depends on them
let documentHasClickListener = false;
let documentHasTouchListener = false;

// ==================================================================
// Attribute to be applied on an activator element
// Its value is ID of the associated floating element
const ATTR_FLOATING_ID = 'data-floating-id';
const SELECTOR_ACTIVATOR = `[${ATTR_FLOATING_ID}]`;

function getFloatingId(activatorEl) {
  if (!activatorEl.dataset || !activatorEl.dataset.floatingId) {
    throw new Error(
      `[useKFloatingInteraction] Activator element is missing the required attribute "${ATTR_FLOATING_ID}"`,
    );
  }
  return activatorEl.dataset.floatingId;
}

// ==================================================================
// Interactions and associated events

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

// The DOM event an interaction activates on. 'keyboardfocus' resolves to the
// same event as 'focus': it narrows when to activate, not what to listen for.
const INTERACTION_TO_ACTIVATE_EVENT = {
  [INTERACTIONS.HOVER]: EVENTS.MOUSEENTER,
  [INTERACTIONS.TOUCH]: EVENTS.TOUCHSTART,
  [INTERACTIONS.FOCUS]: EVENTS.FOCUS,
  [INTERACTIONS.KEYBOARDFOCUS]: EVENTS.FOCUS,
  [INTERACTIONS.CLICK]: EVENTS.CLICK,
};

// The DOM event an interaction deactivates on. For click and touch that is the
// same event type that activates them, observed on the document rather than on
// the activator element, see 'deactivatesOnZones'.
const INTERACTION_TO_DEACTIVATE_EVENT = {
  [INTERACTIONS.HOVER]: EVENTS.MOUSELEAVE,
  [INTERACTIONS.TOUCH]: EVENTS.TOUCHSTART,
  [INTERACTIONS.FOCUS]: EVENTS.BLUR,
  [INTERACTIONS.KEYBOARDFOCUS]: EVENTS.BLUR,
  [INTERACTIONS.CLICK]: EVENTS.CLICK,
};

// Whether an interaction deactivates on one of its floating element's zones —
// its activator element or the floating element itself, see 'isInsideZones' —
// and so has a deactivation listener attached to them for as long as it is
// active. Click and touch don't: they stay active until an interaction outside
// both zones, which only the document sees, so nothing is ever attached to or
// removed from a zone for them.
function deactivatesOnZones(interaction) {
  return interaction !== INTERACTIONS.CLICK && interaction !== INTERACTIONS.TOUCH;
}

function getActivateEventForInteraction(interaction) {
  return INTERACTION_TO_ACTIVATE_EVENT[interaction];
}

function getDeactivateEventForInteraction(interaction) {
  return INTERACTION_TO_DEACTIVATE_EVENT[interaction];
}

// The DOM event types an interaction list activates on. Deduplicated, as 'focus'
// and 'keyboardfocus' both activate on the 'focus' event.
function activateEventsFor(interactions) {
  return [...new Set(interactions.map(getActivateEventForInteraction))];
}

// ==================================================================
// For each floating ID, the state of the DOM contract it names: the
// 'data-floating-id' <-> 'id' pairing between an activator element and
// a floating element.
//
// { <floating element id>: {
//     activeInteractions,  // interactions currently holding the floating element
//                          //   active; empty means inactive. Drives 'isActive'.
//     activeActivatorEl,   // the activator element the floating element was
//                          //   activated by, and is positioned against
//     cachedActivatorEl,   // the activator element lookup cache, see 'getActivatorEl'
//     attachedListeners,   // the activation listeners currently attached, and the
//                          //   element they sit on, see 'syncActivationListeners'
//     callers,             // the composable's callers using this floating ID; more
//                          //   than one only while a floating element is replaced
//     current,             // the caller whose configuration is in force, one of
//                          //   'callers', see 'setCurrent'
//   } }
//
// A caller is a single 'useKFloatingInteraction' call:
// { floatingRef, activateOn, delegate, activateEvents }, the last being the DOM
// events the interactions in 'activateOn' resolve to, precomputed so that
// 'syncActivationListeners' can compare by reference rather than derive them on
// every mutation record.
//
// Lifetimes: everything but 'current' describes the DOM contract, which the
// user's pointer and focus follow and which doesn't care that Vue re-created
// the component. Only 'current' belongs to a single caller. An entry
// therefore outlives any of its callers, and a floating element re-created
// with the same floating ID takes over one that is already active and stays
// active, with no state to hand over.
//
// An entry always has a caller, and so always has a 'current' one: it is
// created by the first to attach and deleted by the last to detach, rather than
// left behind empty. A floating element that unmounts while its activator
// element stays in the DOM is that last one detaching, so events go on firing
// for an activator element whose floating ID has no entry at all, which is what
// 'isRegistered' answers.
//
// Not reactive on its own: each entry has its own refs, which the computed
// properties of its callers subscribe to. A single reactive store would make
// interacting with one floating element re-render all the others, as the
// subscribers of a computed property are notified whenever any of its
// dependencies changes, no matter its own value.
export const _registry = {};

// ==================================================================
// Indexes over the registry: floating IDs only, never state. Both answer a
// question asked far more often than it changes — 'syncActivatorsObserver' asks
// on every activation and deactivation, and the observer callback on every
// mutation record — and the registry is the wrong place to ask it, as pages that
// mount many floating elements are exactly the ones meant to delegate: scanning
// them all to find the few that are active, or the few that aren't delegated,
// costs the most where there is the least to find.
//
// While an entry lives each index has a single write point: '_active' is written
// only by 'setActiveInteractions', '_nonDelegated' only by 'setCurrent'. Neither
// is written anywhere else, and 'deleteEntry' clears both, so no entry can leave
// its floating ID behind in one.
export const _active = new Set(); // floating IDs with a non-empty 'activeInteractions'
export const _nonDelegated = new Set(); // floating IDs whose 'current' binds to its activator element

// Created with its first caller already current, so that an entry is never in
// the registry without one, see 'setCurrent'
function createEntry(caller) {
  return {
    activeInteractions: shallowRef([]),
    activeActivatorEl: shallowRef(null),
    cachedActivatorEl: undefined,
    attachedListeners: null,
    callers: new Set(),
    current: caller,
  };
}

// Takes an entry's floating ID out of the indexes along with the entry itself,
// which is the whole of what keeps them from outliving it
function deleteEntry(floatingId) {
  delete _registry[floatingId];
  _active.delete(floatingId);
  _nonDelegated.delete(floatingId);
}

// Only ever asked of a registered floating element: an unregistered one has no
// configuration to fall back on, and the default belongs to the option the
// caller left out, not to the lookup, see 'useKFloatingInteraction'
function getActivateOn(floatingId) {
  return _registry[floatingId].current.activateOn;
}

// Whether a floating element is configured to be activated by an interaction
function isConfiguredFor(floatingId, interaction) {
  return getActivateOn(floatingId).includes(interaction);
}

// Whether a floating element is currently mounted. Its caller attaches in setup
// and detaches on unmount, so this doubles as a "still mounted" check.
function isRegistered(floatingId) {
  return Boolean(_registry[floatingId]);
}

function getFloatingEl(floatingId) {
  const entry = _registry[floatingId];
  return entry ? entry.current.floatingRef.value : undefined;
}

// ==================================================================
// Active state
//
// The refs are only ever replaced, never mutated, as 'shallowRef' tracks their
// value's identity alone.

// The single write point for active state, so that neither the '_active' index
// nor the activator element can be left behind by it. An entry torn down while
// active is deactivated before it goes, so this is also what takes it out of the
// index, see 'removeCaller'.
function setActiveInteractions(floatingId, interactions) {
  const entry = _registry[floatingId];
  entry.activeInteractions.value = interactions;

  if (interactions.length) {
    _active.add(floatingId);
  } else {
    _active.delete(floatingId);
    entry.activeActivatorEl.value = null;
  }
  syncActivatorsObserver();
}

// Whether anything currently holds a floating element active. Its activator
// element is set for exactly as long, see 'setActiveInteractions'.
function isEntryActive(entry) {
  return entry.activeInteractions.value.length > 0;
}

// A snapshot, as deactivating writes to '_active' while this is iterated over
// to deactivate
function activeFloatingIds() {
  return [..._active];
}

function isInteractionActive(floatingId, interaction) {
  const entry = _registry[floatingId];
  return Boolean(entry && entry.activeInteractions.value.includes(interaction));
}

function hasActiveInteraction(interaction) {
  for (const floatingId of _active) {
    if (isInteractionActive(floatingId, interaction)) {
      return true;
    }
  }
  return false;
}

function addActiveInteraction(floatingId, activatorEl, interaction) {
  const entry = _registry[floatingId];
  if (!entry || entry.activeInteractions.value.includes(interaction)) {
    return;
  }
  entry.activeActivatorEl.value = activatorEl;
  setActiveInteractions(floatingId, [...entry.activeInteractions.value, interaction]);
}

// Stops interactions and removes their deactivation listeners, the one place
// that knows the two go together. Called by the deactivation handlers for the
// interaction that ended, by 'observeActivators' and 'removeCaller' for all of
// them, and by 'setCurrent' for those an incoming caller isn't configured for.
function deactivateInteractions(floatingId, interactions) {
  const entry = _registry[floatingId];
  if (!entry || !interactions.length) {
    return;
  }

  const floatingEl = getFloatingEl(floatingId);
  interactions.filter(deactivatesOnZones).forEach(interaction => {
    const deactivateEvent = getDeactivateEventForInteraction(interaction);
    removeDeactivationListeners(
      entry.activeActivatorEl.value,
      floatingEl,
      deactivateEvent,
      DEACTIVATION_EVENT_HANDLERS[deactivateEvent],
    );
  });

  setActiveInteractions(
    floatingId,
    entry.activeInteractions.value.filter(i => !interactions.includes(i)),
  );
  removeUnusedDocumentListeners();
}

// Deactivation listeners of 'click' and 'touch' are attached to the document
// and shared by all floating elements using the interaction, so they can only
// be removed once no floating element is active through it anymore.
function removeUnusedDocumentListeners() {
  if (documentHasClickListener && !hasActiveInteraction(INTERACTIONS.CLICK)) {
    document.removeEventListener(EVENTS.CLICK, onClickDeactivate, true);
    documentHasClickListener = false;
  }
  if (documentHasTouchListener && !hasActiveInteraction(INTERACTIONS.TOUCH)) {
    document.removeEventListener(EVENTS.TOUCHSTART, onTouchDeactivate, true);
    documentHasTouchListener = false;
  }
}

// ==================================================================
// Detection of activator elements removed from the DOM
//
// Browsers fire no deactivating event for a removed element, so an activator
// removed while its floating element is active would hold it active forever,
// with no way to deactivate it. For example, hovering the button below
// activates the tooltip, and clicking it removes the button from the DOM while
// still hovered, so 'mouseleave' never fires:
//
//   <button
//     v-if="canDelete"
//     data-floating-id="delete-tip"
//     @click="deleteItem"
//   >
//     Delete
//   </button>
//
//   <KTooltip floatingId="delete-tip">Permanently deletes the item</KTooltip>
//
// The tooltip itself stays mounted here, so its 'onUnmounted' clean-up
// doesn't kick in either.
//
// Secondly, a non-delegated floating element attaches its activation listeners
// to the activator element on mount. An activator element rendered later, or
// replaced by a 'v-if' or a changing ':key', would be left without them, unable
// to ever activate its floating element. Delegated ones are unaffected: their
// listeners sit on the delegate element and resolve activator elements per
// event, so nothing is ever bound to a particular activator element.
//
// Cost: only added and removed nodes are observed, so the attribute and text
// changes that most re-renders consist of are not reported at all. Mutation
// records are not inspected either: re-checking the floating elements is cheaper
// than walking all the reported nodes, and for one whose activator element is in
// the DOM the check is an 'isConnected' read and a reference comparison.
//
// One whose activator element is absent re-queries the document on every record,
// as an activator element that has just appeared and one that was never there
// look the same until looked for. That is the price of catching the former, and
// only non-delegated floating elements whose activator element is conditionally
// rendered and currently gone pay it — usually none of them.
//
// Observing is needed while a floating element is active (first case), and
// while a non-delegated one is registered (second case). The latter keeps the
// observer connected for as long as such a floating element is mounted, rather
// than only while one is active. This is affordable precisely because pages
// with many activator elements are the ones meant to delegate, leaving the
// continuous observation to pages with only a few of them.
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
    // The first case, over the only floating elements it can apply to
    activeFloatingIds().forEach(floatingId => {
      const entry = _registry[floatingId];
      // Set for exactly as long as the floating element is active, so being in
      // '_active' is being able to read it here, see 'setActiveInteractions'
      const activatorEl = entry.activeActivatorEl.value;
      if (activatorEl.isConnected) {
        return;
      }

      // No deactivating event will ever fire for the removed activator element,
      // so its deactivation listeners are removed here instead. The floating
      // element outlives it and keeps them attached.
      deactivateInteractions(floatingId, entry.activeInteractions.value);
      // The cache would keep returning the removed activator element
      entry.cachedActivatorEl = undefined;
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
//
// Attached to the activator element of a non-delegated floating element, and
// re-attached whenever it is replaced by another one.

// Reconciles the listeners that should be attached with those that are:
// derives the binding wanted from the entry's current state, compares it
// against the one recorded, and fixes the difference. Idempotent, so every call
// of it is the same one, and nothing calling it has to know what went stale, or
// whether anything did. Called from a caller's setup and mount, and whenever a
// mutation record suggests its activator element may have come or gone.
//
// This is why 'attachedListeners' records the events it attached rather than
// the detaching re-deriving them: the paths that detach (activator element
// replaced, 'current' swapped, last caller gone) would each need a different
// 'activateOn' to detach with, and the wrong one strands listeners on the
// element for as long as it lives.
function syncActivationListeners(floatingId) {
  const entry = _registry[floatingId];
  if (!entry) {
    return;
  }

  // A delegated caller listens on the delegate element, never on the activator
  const el = entry.current.delegate ? null : getActivatorEl(floatingId);
  const events = el ? entry.current.activateEvents : null;

  // Hot path: called for every non-delegated floating element on every mutation
  // record, so nothing is derived or allocated to find out nothing changed
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
// over means: events resolve floating elements by their floating ID, so from
// that point on they are its. Its active state is deliberately left alone, so
// that a floating element replaced mid-interaction stays active: the pointer is
// still where it was, and no fresh 'mouseenter' would ever fire to activate it
// again.
function addCaller(floatingId, caller) {
  const entry = _registry[floatingId] || (_registry[floatingId] = createEntry(caller));
  entry.callers.add(caller);
  setCurrent(floatingId, caller);
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
    if (entry.current === caller) {
      setCurrent(floatingId, entry.callers.values().next().value);
    }
    return;
  }

  // Last one out: there is no floating element left to show, so nothing may
  // stay active, and no listener attached on its behalf may stay attached
  deactivateInteractions(floatingId, entry.activeInteractions.value);
  detachActivationListeners(floatingId);

  deleteEntry(floatingId);
  syncActivatorsObserver();
}

// Puts a caller's configuration in force. Only assigns and lets the
// reconcilers work out the rest, so there is no order to get right.
function setCurrent(floatingId, caller) {
  const entry = _registry[floatingId];
  entry.current = caller;

  // Delegation is the incoming caller's to decide, so the index follows it here
  // and nowhere else while the entry lives
  if (caller.delegate) {
    _nonDelegated.delete(floatingId);
  } else {
    _nonDelegated.add(floatingId);
  }

  // An interaction the incoming caller isn't configured for has no business
  // holding its floating element active. Hover and focus would at least let go
  // of it on their deactivating event, which only asks whether they are active.
  // Click and touch never would: deactivating them is gated on 'isConfiguredFor',
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
  // listener declines to deactivate while the interaction is in either zone.
  // Attaching is deferred to the next tick, by which the floating element
  // exists; on a first attach nothing is active yet and this does nothing.
  entry.activeInteractions.value.filter(deactivatesOnZones).forEach(interaction => {
    const deactivateEvent = getDeactivateEventForInteraction(interaction);
    const deactivateHandler = DEACTIVATION_EVENT_HANDLERS[deactivateEvent];
    listenOnFloatingEl(floatingId, interaction, deactivateEvent, deactivateHandler);
  });

  syncActivationListeners(floatingId);
  syncActivatorsObserver();
}

// ==================================================================
// For each event type delegated to the root, the number of delegating callers
// depending on it. Counted against the deduplicated event types a caller
// resolves to, so one configured for both 'focus' and 'keyboardfocus' counts
// once, see 'activateEventsFor'.
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

function getActivatorEl(floatingId) {
  const entry = _registry[floatingId];
  const cachedEl = entry && entry.cachedActivatorEl;
  // 'isConnected' so that an activator element replaced in the DOM isn't kept
  // returned, see 'observeActivators'
  if (cachedEl && cachedEl.isConnected) {
    return cachedEl;
  }

  const activatorEl = document.querySelector(`[${ATTR_FLOATING_ID}="${floatingId}"]`) || undefined;
  if (entry) {
    entry.cachedActivatorEl = activatorEl;
  }
  return activatorEl;
}

// ==================================================================
// Activation and deactivation of floating elements

// Activation handlers update the active state of a floating element and set
// deactivation listeners on the activator element. Deactivation handlers clear
// the state and clean those listeners up.
//
// Depending on event type and delegation configuration, these can be called
// frequently => proceed from simple to complex one and exit early.

function onHoverActivate(event) {
  const activation = resolveActivation(event, INTERACTIONS.HOVER);
  if (!activation) return;
  const { activatorEl, floatingId } = activation;
  if (!isConfiguredFor(floatingId, INTERACTIONS.HOVER)) return;

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
  if (isInsideZones(event.relatedTarget, activatorEl, floatingEl)) return;

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
    if (!(await isKeyboardModality())) return;
    // Bail if the floating element was unmounted during the await
    if (!isRegistered(floatingId)) return;
    // Focus may have left the activator during the await (e.g. tabbed away
    // while waiting for the keyboardfocus modality check); don't activate then.
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

  // Don't deactivate when focus is still inside the activator element
  // (happens when moving focus between focusable children of the activator),
  // or when focus moves into the floating element itself
  if (isInsideZones(event.relatedTarget, activatorEl, floatingEl)) return;

  // Both 'focus' and 'keyboardfocus' are tracked as the 'focus' interaction;
  // 'keyboardfocus' only gates activation, it is never stored as active.
  deactivateInteractions(floatingId, [INTERACTIONS.FOCUS]);
}

function onClickActivate(event) {
  const activation = resolveActivation(event, INTERACTIONS.CLICK);
  if (!activation) return;
  const { activatorEl, floatingId } = activation;
  if (!isConfiguredFor(floatingId, INTERACTIONS.CLICK)) return;

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
    // floating elements with click interaction
    activeFloatingIds().forEach(id => {
      // Keep the floating element active when the click landed inside one of
      // its zones (e.g. a button or input in an open dropdown menu)
      if (
        isConfiguredFor(id, INTERACTIONS.CLICK) &&
        !isInsideZones(event.target, getActivatorEl(id), getFloatingEl(id))
      ) {
        deactivateInteractions(id, [INTERACTIONS.CLICK]);
      }
    });
  } else {
    // Clicked on an activator element => deactivate all other
    // floating elements with click interaction
    const floatingId = getFloatingId(activatorEl);
    activeFloatingIds()
      .filter(id => id !== floatingId)
      .forEach(id => {
        // Keep the floating element active when the clicked activator is inside
        // one of its zones (e.g. a nested activator opening a submenu)
        if (
          isConfiguredFor(id, INTERACTIONS.CLICK) &&
          !isInsideZones(event.target, getActivatorEl(id), getFloatingEl(id))
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
  if (!isConfiguredFor(floatingId, INTERACTIONS.TOUCH)) return;

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
  const activatorEl = getActivatorFromEvent(event);

  // Tapped a non-activator element => deactivate all
  // floating elements with touch interaction
  if (!activatorEl) {
    activeFloatingIds().forEach(id => {
      // Keep the floating element active when the tap landed inside one of
      // its zones (e.g. a button or input in an open dropdown menu)
      if (
        isConfiguredFor(id, INTERACTIONS.TOUCH) &&
        !isInsideZones(event.target, getActivatorEl(id), getFloatingEl(id))
      ) {
        deactivateInteractions(id, [INTERACTIONS.TOUCH]);
      }
    });
  } else {
    // Tapped an activator element => deactivate all other
    // floating elements with touch interaction
    const floatingId = getFloatingId(activatorEl);
    activeFloatingIds()
      .filter(id => id !== floatingId)
      .forEach(id => {
        // Keep the floating element active when the tapped activator is inside
        // one of its zones (e.g. a nested activator opening a submenu)
        if (
          isConfiguredFor(id, INTERACTIONS.TOUCH) &&
          !isInsideZones(event.target, getActivatorEl(id), getFloatingEl(id))
        ) {
          deactivateInteractions(id, [INTERACTIONS.TOUCH]);
        }
      });
  }

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

// Common preamble of activation handlers. Resolves the activator element and
// the floating element ID from an activation event, or returns null when the
// event shouldn't activate anything (it didn't happen on an activator element,
// its floating element isn't mounted, or the interaction is already active).
function resolveActivation(event, interaction) {
  const activatorEl = getActivatorFromEvent(event);
  if (!activatorEl) return null;

  const floatingId = getFloatingId(activatorEl);
  // An activator element can outlive its floating element, which may be behind
  // a 'v-if' of its own. Delegated activation listeners sit on the document and
  // go on firing for such an activator element, so rather than activating a
  // floating element that doesn't exist, bail out here.
  if (!isRegistered(floatingId)) return null;
  if (isInteractionActive(floatingId, interaction)) return null;

  return { activatorEl, floatingId };
}

// Listens for an interaction's deactivating event on the floating element
// itself, so that it stays active while the interaction is inside it and is
// deactivated once it leaves. Only for the interactions that deactivate on a
// zone, see 'deactivatesOnZones'. The floating element may be rendered only
// after activation (lazy), so the listener is attached on the next tick, once
// it exists.
function listenOnFloatingEl(floatingId, interaction, deactivateEvent, deactivateHandler) {
  nextTick(() => {
    if (!isInteractionActive(floatingId, interaction)) return;
    const floatingEl = getFloatingEl(floatingId);
    if (floatingEl) {
      floatingEl.addEventListener(deactivateEvent, deactivateHandler, true);
    }
  });
}

// Common preamble of the deactivation handlers that observe both zones. Their
// event fires either on the activator element (its 'data-floating-id' gives the
// floating element ID) or on the floating element itself (its id is the floating
// element ID). Returns null when the interaction isn't active for the resolved
// floating element.
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

// Whether a given DOM node is inside either of a floating element's zones:
// its activator element, or the floating element itself. Interactions staying
// within these zones don't deactivate the floating element.
function isInsideZones(node, activatorEl, floatingEl) {
  return Boolean(
    (activatorEl && activatorEl.contains(node)) || (floatingEl && floatingEl.contains(node)),
  );
}

function removeDeactivationListeners(activatorEl, floatingEl, deactivateEvent, deactivateHandler) {
  if (activatorEl) {
    activatorEl.removeEventListener(deactivateEvent, deactivateHandler, true);
  }
  if (floatingEl) {
    floatingEl.removeEventListener(deactivateEvent, deactivateHandler, true);
  }
}

/**
 * Observes user interactions with activator elements to determine
 * when the floating element should be considered active. Activator
 * elements are identified by the `data-floating-id` attribute with
 * a value pointing to the ID of the associated floating element.
 *
 * It does not directly set visibility, allowing components
 * to manage it depending on context.
 *
 * Typically called from a Vue component that represents
 * a floating element.
 *
 * Constraints:
 *
 * - The floating element is required to be rendered with an `id` attribute
 *   equal to `floatingId`.
 *
 * - Each floating element is activated by a single activator element. Several
 *   activator elements sharing one floating ID are not supported: a floating
 *   element has one active activator element at a time, which is what
 *   `activatorEl` returns and what the floating element is positioned against.
 *
 * - The activator element is not constrained otherwise, in either mode: it may
 *   be rendered conditionally, and be replaced at any point.
 *
 * - The floating element may likewise be replaced by another one with the same
 *   floating ID at any point, including while it is active, in which case the
 *   one left takes over and stays active. Interactions are tracked per floating
 *   ID rather than per component instance, so they survive the replacement.
 *
 * @param {String} floatingId Floating element ID. The floating element is
 *                required to be rendered with an `id` attribute of this value,
 *                so that events firing on it can be traced back to it.
 *
 * @param {Ref} floatingRef Vue ref to the floating element. Used to recognize
 *                interactions with the floating element's own content (e.g.
 *                clicking a button inside an open dropdown, or moving the pointer
 *                onto a hover popover) so they don't dismiss it. May be lazily
 *                populated; it is read at interaction time.
 *
 * @param {Object} [options]
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
 *                  its events are observed in the capture phase, so the activator
 *                  element lookup runs on every 'mouseenter' anywhere on the page.
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

  const { activateOn, delegate } = options;

  if (!floatingId) {
    throw new Error(`[useKFloatingInteraction] 'floatingId' is required.`);
  }
  if (!floatingRef) {
    throw new Error(`[useKFloatingInteraction] 'floatingRef' is required.`);
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
    activateOn: interactions,
    delegate: Boolean(delegate),
    activateEvents: activateEventsFor(interactions),
  };
  const entry = addCaller(floatingId, caller);

  // Determines if listeners should be added to activator
  // or delegate element associated with this floating element
  onMounted(() => {
    nextTick(() => {
      if (caller.delegate) {
        addDelegateListeners(caller);
      } else {
        // The activator element doesn't need to exist yet: 'observeActivators'
        // attaches the listeners whenever it appears or gets replaced
        syncActivationListeners(floatingId);
      }
    });
  });

  // Removes deactivation listeners from the floating element, in case it
  // unmounts while still active. Can't be done in 'onUnmounted', where the
  // reference to the floating element is already cleared.
  onBeforeUnmount(() => {
    // This call's own reference rather than the entry's, whose 'current' may
    // be another caller sharing the floating ID by now
    const floatingEl = floatingRef.value;
    if (!floatingEl) return;

    caller.activateOn.filter(deactivatesOnZones).forEach(interaction => {
      const deactivateEvent = getDeactivateEventForInteraction(interaction);
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
    return isEntryActive(entry);
  });

  const activatorEl = computed(() => {
    return entry.activeActivatorEl.value;
  });

  return {
    isActive,
    activatorEl,
  };
}
