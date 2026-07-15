import { shallowRef, computed, onBeforeUnmount, nextTick } from 'vue';
import { isNuxtServerSideRendering } from '../../utils';
import globalThemeState from '../../styles/globalThemeState';
import createKFloatingInteraction from './native.js';

// The registry and its indexes live in 'native.js'. Re-exported as this is
// where they are reached from.
export { _registry, _active, _nonDelegated, _delegateUsage } from './native.js';

// 'trackInputModality' keeps 'globalThemeState' up to date from its own 'focus'
// listener on 'document.body'. A frame is awaited to let that listener finish
// before the modality is read: a delegated activation listener sits on 'window'
// and would otherwise capture the focus first and read a stale value.
function isKeyboardModality() {
  return new Promise(resolve => {
    requestAnimationFrame(() => {
      resolve(globalThemeState.inputModality === 'keyboard');
    });
  });
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
 * A Vue adaptation of 'native.js', which holds the logic and the constraints.
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

  // 'floatingId' and 'activateOn' are validated by 'createKFloatingInteraction'
  if (!floatingRef) {
    throw new Error(`[useKFloatingInteraction] 'floatingRef' is required.`);
  }

  const state = shallowRef({ isActive: false, activatorEl: null });

  const interaction = createKFloatingInteraction(floatingId, () => floatingRef.value, {
    activateOn: options.activateOn,
    delegate: options.delegate,
    isKeyboardModality,
    // 'nextTick' rather than the default microtask, so that a floating element
    // rendered only once active exists by the time it is looked for
    defer: nextTick,
  });

  const unsubscribe = interaction.subscribe(next => (state.value = next));

  // 'onBeforeUnmount' rather than 'onUnmounted', as 'destroy' needs the floating
  // element to remove its deactivation listeners, and the ref is cleared by then
  onBeforeUnmount(() => {
    unsubscribe();
    interaction.destroy();
  });

  return {
    isActive: computed(() => state.value.isActive),
    activatorEl: computed(() => state.value.activatorEl),
  };
}
