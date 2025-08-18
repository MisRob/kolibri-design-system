<template>

  <div class="visual-test-layout">
    <slot></slot>
  </div>

</template>


<script>

  import { onBeforeUnmount, ref } from 'vue';
  import { isNuxtServerSideRendering } from '~~/lib/utils';

  export default {
    name: 'VisualTestLayout',
    setup() {
      const prevStyle = ref('');

      if (!isNuxtServerSideRendering()) {
        prevStyle.value = document.body.style.cssText;
        document.body.style.backgroundColor = '#e5e5e5';
        document.body.style.margin = '0';
        document.body.style.padding = '0';
        document.body.style.minWidth = '100vw';
        document.body.style.minHeight = '100vh';
      }

      onBeforeUnmount(() => {
        if (!isNuxtServerSideRendering()) {
          // Restore previous styles on unmount
          document.body.style.cssText = prevStyle.value;
        }
      });
    },
  };

</script>


<style>

  .visual-test-layout {
    display: flex;
    flex-direction: column;
    gap: 20px;
    align-items: flex-start;
  }

</style>
