import merge from 'lodash/merge';
import { watch, ref, computed } from '@vue/composition-api';

import useKResponsiveWindow from '../composables/useKResponsiveWindow';

import { GRID_CONFIGS, LEVELS } from './gridConfigs';

// TODO: Improve clarity
export default function useGridConfig(props) {
  const finalConfig = ref({});

  const { windowBreakpoint } = useKResponsiveWindow();

  function mergeConfigs(baseConfig, props, breakpoint) {
    const config1 = { ...baseConfig }; // make sure base config is not mutated, otherwise all grids on a page will be affected
    let config2 = {};
    let config3 = {};

    if (props.columnGap) {
      config2.columnGap = props.columnGap;
    }
    if (props.rowGap) {
      config2.rowGap = props.rowGap;
    }
    if (props.rowHeight) {
      config2.rowHeight = props.rowHeight;
    }
    if (props.skeletonHeight) {
      config2.skeletonHeight = props.skeletonHeight;
    }
    if (props.skeletonCount) {
      config2.skeletonCount = props.skeletonCount;
    }
    if (props.skeletonLayout) {
      config2.skeletonLayout = props.skeletonLayout;
    }
    if (props.skeletonThumbnailDisplay) {
      config2.skeletonThumbnailDisplay = props.skeletonThumbnailDisplay;
    }
    if (props.skeletonThumbnailAlign) {
      config2.skeletonThumbnailAlign = props.skeletonThumbnailAlign;
    }

    // has prop config contains settings for the current breakpoint?
    if (
      props.config &&
      Object.keys(props.config).length > 0 &&
      LEVELS[breakpoint] in props.config
    ) {
      const breakpointConfig = props.config[LEVELS[breakpoint]];
      if (breakpointConfig.columns) {
        config3.columns = breakpointConfig.columns;
      }
      if (breakpointConfig.columnGap) {
        config3.columnGap = breakpointConfig.columnGap;
      }
      if (breakpointConfig.rowGap) {
        config3.rowGap = breakpointConfig.rowGap;
      }
      if (breakpointConfig.rowHeight) {
        config3.rowHeight = breakpointConfig.rowHeight;
      }
      if (breakpointConfig.skeletonHeight) {
        config3.skeletonHeight = breakpointConfig.skeletonHeight;
      }
      if (breakpointConfig.skeletonCount) {
        config3.skeletonCount = breakpointConfig.skeletonCount;
      }
      if (breakpointConfig.skeletonLayout) {
        config3.skeletonLayout = breakpointConfig.skeletonLayout;
      }
      if (breakpointConfig.skeletonThumbnailDisplay) {
        config3.skeletonThumbnailDisplay = breakpointConfig.skeletonThumbnailDisplay;
      }
      if (breakpointConfig.skeletonThumbnailAlign) {
        config3.skeletonThumbnailAlign = breakpointConfig.skeletonThumbnailAlign;
      }
    }

    return merge({}, config1, config2, config3);
  }

  /* TODO: Why reactivity when using 'computed' approach instead of 'watch' doesn't work? */
  watch(
    windowBreakpoint,
    (newBreakpoint, oldBreakpoint) => {
      if (newBreakpoint === null) {
        return;
      }
      if (newBreakpoint !== oldBreakpoint) {
        const baseConfig = GRID_CONFIGS[props.kind][LEVELS[newBreakpoint]];
        finalConfig.value = mergeConfigs(baseConfig, props, newBreakpoint);
      }
    },
    { immediate: true }
  );

  return { config: finalConfig };
}
