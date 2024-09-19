<template>

  <ul
    class="card-grid"
    :style="gridStyle"
  >
    <template v-if="isLoading">
      <SkeletonCard
        v-for="i in skeletonCount"
        :key="i"
        :style="{ height: skeletonHeight, backgroundColor: 'blue' }"
        :orientation="skeletonOrientation"
        :thumbnailDisplay="skeletonThumbnailDisplay"
        :thumbnailAlign="skeletonThumbnailAlign"
      />
    </template>
    <!-- TODO v-show? -->
    <template v-else>
      <!-- @slot Slot for `KCard`s -->
      <slot></slot>
    </template>
  </ul>

</template>


<script>

  import { watch, ref, provide } from '@vue/composition-api';

  import { LAYOUT_1_1_1, LAYOUT_1_2_2, LAYOUT_1_2_3 } from './gridBaseLayouts';
  import useResponsiveGridLayout from './useResponsiveGridLayout';
  import useLoadingSkeletons from './useLoadingSkeletons';
  import SkeletonCard from './SkeletonCard';

  /**
   * Displays a grid of cards `KCard`.
   *
   * Offers default behavior corresponding to the most
   * commonly used grids, as well as advance configuration
   * via `useKCardGrid` to customize a base grid layout
   * or even completely override it.
   */
  export default {
    name: 'KCardGrid',
    components: {
      SkeletonCard,
    },

    setup(props) {
      const { currentLevelConfig } = useResponsiveGridLayout(props);
      const {
        isLoading,
        skeletonCount,
        skeletonHeight,
        skeletonOrientation,
        skeletonThumbnailDisplay,
        skeletonThumbnailAlign,
      } = useLoadingSkeletons(props);

      const gridStyle = ref({});
      const gridItemStyle = ref({});

      watch(
        currentLevelConfig,
        newValue => {
          if (!newValue) {
            return;
          }
          const { cardsPerRow, columnGap, rowGap } = newValue;

          gridStyle.value = {
            'column-gap': columnGap,
            'row-gap': rowGap,
          };
          gridItemStyle.value = {
            // remove all column gaps widths from the available width and then divide by the number of cards per row to get a single card width
            'flex-basis': `calc((100% - ${cardsPerRow - 1} * ${columnGap}) / ${cardsPerRow})`,
          };
        },
        {
          immediate: true,
        }
      );

      // provide to `KCard`
      provide('gridItemStyle', gridItemStyle);

      return {
        gridStyle,
        isLoading,
        skeletonCount,
        skeletonHeight,
        skeletonOrientation,
        skeletonThumbnailDisplay,
        skeletonThumbnailAlign,
      };
    },
    props: {
      /**
       * Sets the base grid layout.
       *
       * Options: `'1-1-1'`, `'1-2-2'`, and `'1-2-3'`.
       *
       * `'1-1-1'` grid shows 1 card per row on all screen sizes.
       *
       * `'1-2-2'` grid shows 1 card per row on smaller screens
       * and 2 cards per row on medium and larger screens.
       *
       * `'1-2-3'` grid shows 1 card per row on smaller screens,
       * 2 cards per row on medium screens, and 3 cards per row
       * on larger screens.
       */
      // eslint-disable-next-line kolibri/vue-no-unused-properties
      layout: {
        required: false,
        type: String,
        default: '1-2-2',
        validator: value => {
          return [LAYOUT_1_1_1, LAYOUT_1_2_2, LAYOUT_1_2_3].includes(value);
        },
      },
      // eslint-enable-next-line kolibri/vue-no-unused-properties
      /**
       * Overrides the base grid `layout` for chosen breakpoints levels
       */
      // eslint-disable-next-line kolibri/vue-no-unused-properties
      layoutOverride: {
        type: Object,
        required: false,
        default: null,
      },
      // eslint-enable-next-line kolibri/vue-no-unused-properties
      loading: {
        type: Boolean,
        required: false,
        default: true,
      },
      /**
       * Configures how loading skeletons look
       * like for each breakpoint level
       */
      // TODO: validation all breakpoint levels, format of sub-objects
      // { count, height, orientation, thumbnailDisplay, thumbnailAlign }
      skeletonsConfig: {
        type: Object,
        required: true,
      },
    },
  };

</script>


<style lang="scss" scoped>

  .card-grid {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: stretch;
    padding: 0;
    margin: 0;
    list-style: none;
  }

</style>