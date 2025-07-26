<template>
  <div>
    <h1>Vuetify 1.5 VTooltip (with lazy)</h1>
    <p>
      These tooltips are rendered lazily, meaning they are only added to the DOM when they are activated.
    </p>
    <button @click="startHovering">Start Hovering</button>
    <!--
      To measure and compare performance, use your browser's developer tools.

      1. Memory Usage:
         - Open the Performance tab in your browser's developer tools.
         - Click the "Memory" checkbox.
         - Click the "Record" button and interact with the tooltips on the page.
         - Stop recording and analyze the memory usage graph. Look for significant increases in memory usage when tooltips are shown and check if memory is released when they are hidden.

      2. Rendering Performance:
         - Open the Performance tab in your browser's developer tools.
         - Click the "Record" button and hover over the tooltips to trigger them.
         - Stop recording and analyze the timeline. Look for long-running tasks, layout shifts, and other performance bottlenecks.

      3. Interactivity:
         - Use the Performance tab to measure the time it takes for tooltips to appear and disappear.
         - Pay attention to any jank or stuttering when interacting with the tooltips.
    -->
    <div v-for="n in 1000" :key="`v-tooltip-lazy-${n}`">
      <VTooltip top lazy>
        <template v-slot:activator="{ on }">
          <span v-on="on">Tooltip {{ n }}</span>
        </template>
        <span>This is a Vuetify tooltip with lazy loading.</span>
      </VTooltip>
    </div>
  </div>
</template>

<script>
import { VTooltip } from 'vuetify/lib';

export default {
  name: 'VTooltipLazy',
  components: {
    VTooltip,
  },
  methods: {
    startHovering() {
      const tooltips = this.$el.querySelectorAll('span[aria-haspopup="true"]');
      let i = 0;
      const interval = setInterval(() => {
        if (i < tooltips.length) {
          tooltips[i].dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
          i++;
        } else {
          clearInterval(interval);
        }
      }, 500);
    },
  },
};
</script>

<style scoped>
div {
  display: inline-block;
  margin: 4px;
}
</style>
