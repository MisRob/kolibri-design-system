<template>

  <div
    v-if="shouldRender"
    :id="id"
    ref="tooltip"
    role="tooltip"
    class="k-tooltip"
    :style="{
      backgroundColor: $themeTokens.text,
      color: $themeTokens.textInverted,
    }"
  >
    <!-- If text prop is provided, display the text -->
    <template v-if="text">
      {{ text }}
    </template>
    <!-- @slot Slot alternative to `text` prop -->
    <slot v-else></slot>
  </div>

</template>


<script>

  import { onMounted, onUnmounted, ref, watch, nextTick } from 'vue';
  import useKFloatingInteraction from '../../composables/useKFloatingInteraction';
  import useKFloatingPosition from '../../composables/useKFloatingPosition';
  import _useOverlay from '../../composables/_useOverlay';
  import { getPositionOptions } from './positionOptions';

  export default {
    name: 'KTooltip',
    setup(props) {
      const tooltipId = props.id;
      const placement = props.placement;
      const positionOptions = props.positionOptions;
      const tooltipRef = ref(null);

      const { appendToOverlay, removeFromOverlay } = _useOverlay();
      const { isActive, triggerEl } = useKFloatingInteraction(
        tooltipId,
        props.activateOn,
        props.delegateTo,
      );
      const { initPosition, disablePosition, destroyPosition } = useKFloatingPosition();

      const options = getPositionOptions(positionOptions, placement);

      function show() {
        shouldRender.value = true;

        nextTick(() => {
          const tooltipEl = tooltipRef.value;
          // TODO throw error if not found
          const anchorEl = props.anchorId
            ? document.getElementById(props.anchorId)
            : triggerEl.value;
          initPosition(tooltipId, tooltipEl, anchorEl, options);
          // Significantly better performance compared
          // to using common Vue features to apply styles
          Object.assign(tooltipEl.style, {
            opacity: '1',
            pointerEvents: 'auto',
          });
        });
      }

      function hide() {
        const tooltipEl = tooltipRef.value;
        // Always hide via CSS first so transition
        // can take effect
        Object.assign(tooltipEl.style, {
          opacity: '0',
          pointerEvents: 'none',
        });
        if (props.lazy) {
          // Wait for the 0.25s transition to complete
          setTimeout(() => {
            shouldRender.value = false;
            nextTick(() => {
              destroyPosition(tooltipId);
            });
          }, 250);
        } else {
          disablePosition(tooltipId);
        }
      }

      const shouldRender = ref(false);
      watch([isActive, () => props.disabled], ([active, disabled]) => {
        if (disabled || !active) {
          hide();
        } else {
          show();
        }
      });

      onMounted(() => {
        if (!props.lazy) {
          // Attach to DOM, but don't initialize position
          // until it's needed - that would create many
          // unnecessary Popper instances
          // TODO add this, and other recommendations,
          // to useKFloatingPosition documentation page
          shouldRender.value = true;
        }
        if (!props.disabled && !props.lazy && props.appendToOverlay) {
          appendToOverlay(tooltipRef.value);
        }
      });

      onUnmounted(() => {
        destroyPosition(tooltipId);
        if (props.appendToOverlay) {
          removeFromOverlay(tooltipRef.value);
        }
      });

      if (props.lazy && props.appendToOverlay) {
        watch(shouldRender, val => {
          nextTick(() => {
            val ? appendToOverlay(tooltipRef.value) : removeFromOverlay(tooltipRef.value);
          });
        });
      }

      return {
        shouldRender,
        tooltip: tooltipRef,
      };
    },
    // TODO Add 'delay' prop and feature (needed in Studio)
    props: {
      /**
       * Unique element ID
       */
      id: {
        type: String,
        required: true,
        default: null,
      },
      /**
       * Text of the tooltip
       */
      text: {
        type: String,
        default: null,
      },
      /**
       * One of Popper 2 placements, such as 'bottom',
       * 'left', 'right-end', and many others.
       * https://popper.js.org/docs/v2/constructors/#options
       */
      placement: {
        type: String,
        default: 'bottom',
      },
      /**
       * Popper 2 options
       * https://popper.js.org/docs/v2/constructors/#options
       * Overrides 'placement'
       */
      positionOptions: {
        type: Object,
        default: null,
      },
      /**
       * Whether or not tooltip is disabled
       */
      disabled: {
        type: Boolean,
        default: false,
      },
      /**
       * If true, tooltip element won't be present in the DOM
       * when an associated trigger element is not interacted with.
       */
      lazy: {
        type: Boolean,
        default: false,
      },
      /**
       * Tooltip will be positioned relative
       * to an element with this ID. If not provided,
       * trigger element will be used as anchor.
       */
      anchorId: {
        type: String,
        required: false,
        default: null,
      },
      /**
       * Array of interactions to activate the tooltip.
       * Supported interactions: 'hover', 'touch', 'focus', 'keyboardfocus'.
       * Default: ['hover'].
       */
      activateOn: {
        type: Array,
        default: () => ['hover'],
      },
      /**
       * 'root' or ID of the element to delegate events to.
       * 'root' will delegate events to the document or window.
       * Use to optimize performance on pages with many tooltips.
       * If not provided, event listeners will be attached
       * to the trigger element.
       */
      delegateTo: {
        type: String,
        default: null,
      },
      /**
       * Whether or not the tooltip should be moved
       * to the overlay container element `#k-overlay`.
       * To be used when the tooltip needs to be rendered
       * outside of its normal DOM hierarchy.
       * Use only when necessary.
       */
      appendToOverlay: {
        type: Boolean,
        default: false,
      },
    },
  };

</script>


<style lang="scss" scoped>

  @import '../../styles/definitions';

  .k-tooltip {
    @extend %dropshadow-1dp;

    position: absolute;
    top: 0;
    left: 0;
    // TODO return to 24 (fix KDS docs side panel z-index)
    // z-index: 24;
    z-index: 90;
    width: max-content;
    min-width: 75px;
    padding: 8px;
    font-size: 12px;
    font-weight: normal;
    line-height: 1.4;
    text-align: center;
    pointer-events: none;
    border-radius: 8px;
    opacity: 0;
    transition: opacity 0.25s ease; // same transition duration used in hide()
  }

</style>
