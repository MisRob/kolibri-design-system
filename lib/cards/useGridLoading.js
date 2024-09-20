import Vue from 'vue';
import { ref, watch, onMounted } from '@vue/composition-api';

import useKResponsiveWindow from '../composables/useKResponsiveWindow';
import { getBreakpointConfig } from './utils';

// Needs to be the same as `SkeletonCard`'s
// loading gradient animation duration
// (see below for details)
const LOADING_ANIMATION_DURATION = 1800;

// Loading state lasts for at least this duration.
// Needs to be a multiple of `LOADING_ANIMATION_DURATION`
// (see below for details)
// TODO: Coordinate value with designers
const MIN_LOADING_TIME = 2 * LOADING_ANIMATION_DURATION;

const DEFAULT_SKELETON = {
  count: 3,
  height: '200px',
  orientation: 'horizontal',
  thumbnailDisplay: 'none',
  thumbnailAlign: 'left',
};

/**
 * Manages `KCardGrid`'s loading state
 */
export default function useGridLoading(props) {
  const { windowBreakpoint } = useKResponsiveWindow();

  const skeletonCount = ref(DEFAULT_SKELETON.count);
  const skeletonHeight = ref(DEFAULT_SKELETON.height);
  const skeletonOrientation = ref(DEFAULT_SKELETON.orientation);
  const skeletonThumbnailDisplay = ref(DEFAULT_SKELETON.thumbnailDisplay);
  const skeletonThumbnailAlign = ref(DEFAULT_SKELETON.thumbnailAlign);

  // Used by `KCardGrid` to prevent flashes of unstyled content
  const finishedMounting = ref(false);
  onMounted(() => {
    Vue.nextTick(() => {
      finishedMounting.value = true;
    });
  });

  // Handles `KCardGrid`'s `loading` prop changes and returns
  // final `isLoading` state to be used by `KCardGrid`.
  //
  // After loading started, `isLoading` ensures that
  // loading state is truthy for at least `MIN_LOADING_TIME`
  // to avoid unexpected flashes during the transition.
  //
  // Also ensures that the transition to non-loading state
  // happens in the closest moment that's multiple
  // of `LOADING_ANIMATION_DURATION`. This is used to stop
  // loading only in a moment when the loading gradient
  // animation reaches the end of the card
  let loadingStartTime = null;
  let loadingElapsedTime = null;
  let remainingLoadingTime = 0;
  const isLoading = ref(false);

  watch(
    () => props.loading,
    (newLoading, oldLoading) => {
      if (newLoading === oldLoading) {
        return;
      }
      if (newLoading === true) {
        loadingStartTime = Date.now();
        isLoading.value = true;
      }
      if (newLoading === false) {
        // TODO: Move to `utils`
        loadingElapsedTime = Date.now() - loadingStartTime;

        if (loadingElapsedTime < MIN_LOADING_TIME) {
          remainingLoadingTime = MIN_LOADING_TIME - loadingElapsedTime;
        } else if (loadingElapsedTime === MIN_LOADING_TIME) {
          remainingLoadingTime = 0;
        } else {
          remainingLoadingTime =
            Math.ceil(loadingElapsedTime / LOADING_ANIMATION_DURATION) *
              LOADING_ANIMATION_DURATION -
            loadingElapsedTime;
        }

        setTimeout(() => {
          isLoading.value = false;
        }, remainingLoadingTime);
      }
    },
    { immediate: true }
  );

  // Observes window screen size and updates the loading
  // skeleton configuration for the current breakpoint
  watch(
    windowBreakpoint,
    newBreakpoint => {
      const breakpointSkeletonconfig = getBreakpointConfig(props.skeletonsConfig, newBreakpoint);
      if (breakpointSkeletonconfig) {
        if (breakpointSkeletonconfig.count) {
          skeletonCount.value = breakpointSkeletonconfig.count;
        }
        if (breakpointSkeletonconfig.height) {
          skeletonHeight.value = breakpointSkeletonconfig.height;
        }
        if (breakpointSkeletonconfig.orientation) {
          skeletonOrientation.value = breakpointSkeletonconfig.orientation;
        }
        if (breakpointSkeletonconfig.thumbnailDisplay) {
          skeletonThumbnailDisplay.value = breakpointSkeletonconfig.thumbnailDisplay;
        }
        if (breakpointSkeletonconfig.thumbnailAlign) {
          skeletonThumbnailAlign.value = breakpointSkeletonconfig.thumbnailAlign;
        }
      }
    },
    { immediate: true }
  );

  return {
    finishedMounting,
    isLoading,
    skeletonCount,
    skeletonHeight,
    skeletonOrientation,
    skeletonThumbnailDisplay,
    skeletonThumbnailAlign,
  };
}
