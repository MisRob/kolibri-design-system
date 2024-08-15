<template>

  <ul :style="wrapperStyle">
    <template v-if="show('show-key', isLoading, minLoadingTime)">
      <SkeletonLoadingCard
        v-for="i in skeleton.count"
        :key="i"
        :height="skeleton.height"
        :layout="skeleton.layout"
        :thumbnailDisplay="skeleton.thumbnailDisplay"
        :thumbnailAlign="skeleton.thumbnailAlign"
      />
    </template>
    <slot v-else></slot>
  </ul>

</template>

<script>

  import { watch, ref, provide } from '@vue/composition-api';
  import useKShow from '../composables/useKShow';
  import useGridConfig from './useGridConfig';
  import SkeletonLoadingCard from './SkeletonLoadingCard';

  export default {
    name: 'KCardGrid',
    components: {
      SkeletonLoadingCard,
    },
    setup(props) {
      const { show } = useKShow();
      const { config } = useGridConfig(props);

      const cardGridStyle = ref({});
      const wrapperStyle = ref({});
      const skeleton = ref({});

      /* TODO: Why reactivity when using 'computed' approach instead of 'watch' doesn't work? */
      watch(
        config,
        newConfig => {
          if (Object.keys(newConfig).length === 0) {
            return;
          }
          cardGridStyle.value = {
            'flex-basis': `calc((100% - ${newConfig.columns - 1} * ${newConfig.columnGap}) / ${
              newConfig.columns
            })`,
            'flex-shrink': 1,
            height: newConfig.rowHeight,
          };
          wrapperStyle.value = {
            'column-gap': newConfig.columnGap,
            'row-gap': newConfig.rowGap,
          };

          skeleton.value = {
            count: newConfig.skeletonCount,
            height: newConfig.skeletonHeight,
            layout: newConfig.skeletonLayout,
            thumbnailDisplay: newConfig.skeletonThumbnailDisplay,
            thumbnailAlign: newConfig.skeletonThumbnailAlign,
          };
        },
        {
          immediate: true,
        }
      );

      provide('cardGridStyle', cardGridStyle);

      // prevent from showing loading state way too briefly
      // TODO: Discuss with designers what's suitable value
      // (the chosen value be applied in more general context,
      // if so, document)
      const minLoadingTime = 1200;

      return {
        minLoadingTime,
        show,
        wrapperStyle,
        skeleton,
      };
    },
    props: {
      kind: {
        required: false,
        type: String,
        default: '1-2',
      },
      isLoading: {
        required: false,
        type: Boolean,
        default: false,
      },
      // *********** start 'shortcut props' ***********
      // overrides column gap in all breakpoints
      // use 'config' to override it on a per-breakpoint basis
      columnGap: {
        required: false,
        type: String,
        default: '',
      },
      // overrides row gap in all breakpoints
      // use 'config' to override it on a per-breakpoint basis
      rowGap: {
        required: false,
        type: String,
        default: '',
      },
      // overrides row height in all breakpoints
      // use 'config' to override it on a per-breakpoint basis
      rowHeight: {
        required: false,
        type: String,
        default: '',
      },
      skeletonCount: {
        required: false,
        type: Number,
        default: 3,
      },
      skeletonHeight: {
        required: false,
        type: String,
        default: '300px',
      },
      // same as KCard's 'layout'
      skeletonLayout: {
        required: false,
        type: String,
        default: 'horizontal',
      },
      // same as KCard's 'thumbnailDisplay'
      skeletonThumbnailDisplay: {
        required: false,
        type: String,
        default: 'none',
      },
      // same as KCard's 'thumbnailDisplay'
      skeletonThumbnailAlign: {
        required: false,
        type: String,
        default: 'left',
      },
      // *********** end 'shortcut props' ***********
      // overrides the default grid config
      // also overrides 'columnGap', 'rowGap', 'rowHeight'
      config: {
        required: false,
        type: Object,
        default: null,
      },
    },
  };

</script>

<style lang="scss" scoped>

  ul {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    padding: 0;
    margin: 0;
    list-style: none;
  }

</style>