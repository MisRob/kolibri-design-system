<template>
  <div>
    <h1>KTooltip</h1>
    <p>
      This is the custom KTooltip component.
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
    <div v-for="n in 1000" :key="`k-tooltip-${n}`">
      <KTooltip
        :reference="`tooltip-span-${n}`"
        :refs="$refs"
      >
        This is a KTooltip {{ n }}
      </KTooltip>
      <span :ref="`tooltip-span-${n}`">
        Tooltip {{ n }}
      </span>
    </div>
  </div>
</template>

<script>
import KTooltip from '../../../lib/KTooltip';

export default {
  name: 'KTooltip',
  components: {
    KTooltip,
  },
  methods: {
    startHovering() {
      const tooltips = Object.values(this.$refs);
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
