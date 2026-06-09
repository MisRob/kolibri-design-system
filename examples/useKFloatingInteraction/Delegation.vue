<template>

  <div
    id="delegation-demo-container"
    class="container"
  >
    <KButton data-floating-id="delegation-tooltip-1"> Button 1 </KButton>
    <KButton data-floating-id="delegation-tooltip-2"> Button 2 </KButton>
    <KButton data-floating-id="delegation-tooltip-3"> Button 3 </KButton>

    <div
      v-if="isActive1"
      ref="floatingRef1"
      class="tooltip"
      :style="{ color: $themeTokens.textInverted, background: $themeTokens.text }"
    >
      Tooltip 1
    </div>
    <div
      v-if="isActive2"
      ref="floatingRef2"
      class="tooltip"
      :style="{ color: $themeTokens.textInverted, background: $themeTokens.text }"
    >
      Tooltip 2
    </div>
    <div
      v-if="isActive3"
      ref="floatingRef3"
      class="tooltip"
      :style="{ color: $themeTokens.textInverted, background: $themeTokens.text }"
    >
      Tooltip 3
    </div>
  </div>

</template>


<script>

  import { ref, watch, onBeforeUnmount, nextTick } from 'vue';
  import useKFloatingInteraction from '../../lib/composables/useKFloatingInteraction';
  import useKFloatingPosition from '../../lib/composables/useKFloatingPosition';

  const DELEGATE_ID = 'delegation-demo-container';
  const INTERACTION = ['hover'];

  export default {
    setup() {
      const floatingRef1 = ref(null);
      const floatingRef2 = ref(null);
      const floatingRef3 = ref(null);

      const { isActive: isActive1, activatorEl: activatorEl1 } = useKFloatingInteraction(
        'delegation-tooltip-1',
        INTERACTION,
        DELEGATE_ID,
      );
      const { isActive: isActive2, activatorEl: activatorEl2 } = useKFloatingInteraction(
        'delegation-tooltip-2',
        INTERACTION,
        DELEGATE_ID,
      );
      const { isActive: isActive3, activatorEl: activatorEl3 } = useKFloatingInteraction(
        'delegation-tooltip-3',
        INTERACTION,
        DELEGATE_ID,
      );

      const { initPosition, destroyPosition, offset, flip } = useKFloatingPosition();

      function watchTooltip(isActive, floatingRef, activatorEl, id) {
        watch(isActive, active => {
          if (active) {
            nextTick(() => {
              initPosition(id, floatingRef.value, activatorEl.value, {
                placement: 'bottom',
                middleware: [offset(8), flip()],
              });
            });
          } else {
            destroyPosition(id);
          }
        });
      }

      watchTooltip(isActive1, floatingRef1, activatorEl1, 'delegation-tooltip-1');
      watchTooltip(isActive2, floatingRef2, activatorEl2, 'delegation-tooltip-2');
      watchTooltip(isActive3, floatingRef3, activatorEl3, 'delegation-tooltip-3');

      onBeforeUnmount(() => {
        destroyPosition('delegation-tooltip-1');
        destroyPosition('delegation-tooltip-2');
        destroyPosition('delegation-tooltip-3');
      });

      return { isActive1, isActive2, isActive3, floatingRef1, floatingRef2, floatingRef3 };
    },
  };

</script>


<style lang="scss" scoped>

  @import '../../lib/styles/definitions';

  .container {
    display: flex;
    gap: 8px;
  }

  .tooltip {
    @extend %dropshadow-1dp;

    position: absolute;
    top: 0;
    left: 0;
    width: max-content;
    min-width: 75px;
    padding: 8px;
    font-size: 12px;
    font-weight: normal;
    line-height: 1.4;
    text-align: center;
    pointer-events: none;
    border-radius: 8px;
  }

</style>
