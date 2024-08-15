<template>

  <!-- use KCard under the hood so we cen achieve skeletons that look similarly to the cards -->
  <KCard
    aria-hidden="true"
    :style="{ height: height }"
    :layout="layout"
    :thumbnailDisplay="thumbnailDisplay"
    :thumbnailAlign="thumbnailAlign"
    :headingLevel="2"
    :to="{ name: '/' }"
    isSkeleton
  >
    <template #title>
      <div :style="{ backgroundColor: $themePalette.grey.v_50, height: '40px', width: '100%' }">
        <span :style="{ display: 'none' }">title</span>
      </div>
    </template>
  </KCard>

</template>

<script>

  import { inject } from '@vue/composition-api';

  export default {
    name: 'SkeletonLoadingCard',
    /* setup() {
      const cardGridStyle = inject('cardGridStyle');
      return {
        cardGridStyle,
      };
    }, */
    props: {
      height: {
        required: false,
        type: String,
        default: '300px',
      },
      // same as KCard's 'layout'
      layout: {
        required: false,
        type: String,
        default: 'horizontal',
      },
      // same as KCard's 'thumbnailDisplay'
      thumbnailDisplay: {
        required: false,
        type: String,
        default: 'none',
      },
      // same as KCard's 'thumbnailAlign'
      thumbnailAlign: {
        required: false,
        type: String,
        default: 'left',
      },
    },
  };

</script>

<style lang="scss" scoped>

</style>