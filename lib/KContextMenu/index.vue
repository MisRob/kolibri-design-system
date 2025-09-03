<template>

  <div
    v-if="isActive"
    :id="menuId"
    ref="menu"
    class="k-context-menu"
  >
    <slot></slot>
  </div>

</template>


<script>

  import { watch, nextTick, ref } from 'vue';
  import useKFloatingPosition from '../composables/useKFloatingPosition';
  import useKContextMenu from '../composables/_useKContextMenu';

  function generateGetBoundingClientRect(x = 0, y = 0) {
    return function () {
      return {
        x,
        y,
        top: y,
        left: x,
        right: x,
        bottom: y,
        width: 0,
        height: 0,
      };
    };
  }

  const options = {
    placement: 'right',
    modifiers: [
      {
        name: 'offset',
        options: {
          offset: [50, 0],
        },
      },
    ],
  };

  export default {
    name: 'KContextMenu',
    setup() {
      const { initPosition, destroyPosition } = useKFloatingPosition();
      const { clientX, clientY, isActive } = useKContextMenu();
      const menuId = 'menu-demo';
      const menuRef = ref(null);

      watch(isActive, active => {
        if (active) {
          const virtualReference = {
            getBoundingClientRect: generateGetBoundingClientRect(clientX.value, clientY.value),
          };
          nextTick(() => {
            initPosition(menuId, menuRef.value, virtualReference, options);
          });
        } else {
          nextTick(() => {
            destroyPosition(menuId);
          });
        }
      });

      return {
        isActive,
        menu: menuRef,
        menuId,
      };
    },
  };

</script>


<style scoped scss>

  .k-context-menu {
    position: absolute;
    z-index: 100;
    display: block;
    min-width: 220px;
    min-height: 120px;
    padding: 8px 16px;
    text-align: center;
    background: #ffffff;
    border: 1px solid #eeeeee;
    border-radius: 4px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

</style>
