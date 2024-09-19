import Vue from 'vue';
import { ref, watch, onMounted } from '@vue/composition-api';

import useKResponsiveWindow from '../composables/useKResponsiveWindow';

import { LEVELS } from './gridBaseLayouts';

const MIN_LOADING_TIME = 5000;

export default function useLoadingSkeletons(props) {
  const { windowBreakpoint } = useKResponsiveWindow();

  const startTime = Date.now();
  const isLoading = ref(true);

  const skeletonCount = ref(3);
  const skeletonHeight = ref('200px');
  const skeletonOrientation = ref('horizontal');
  const skeletonThumbnailDisplay = ref('none');
  const skeletonThumbnailAlign = ref('left');

  onMounted(() => {
    Vue.nextTick(() => {
      const elapsedTime = Date.now() - startTime;
      let remainingLoadingTime = 0;
      if (elapsedTime < MIN_LOADING_TIME) {
        remainingLoadingTime = MIN_LOADING_TIME - elapsedTime;
      }
      setTimeout(() => {
        isLoading.value = false;
      }, remainingLoadingTime);
    });
  });

  watch(
    windowBreakpoint,
    (newBreakpoint, oldBreakpoint) => {
      // can happen very briefly before the breakpoint value gets calculated
      if (newBreakpoint === null) {
        return;
      }
      if (newBreakpoint !== oldBreakpoint) {
        const levelSkeletonConfig = props.skeletonsConfig[LEVELS[newBreakpoint]];
        if (levelSkeletonConfig) {
          skeletonCount.value = levelSkeletonConfig.count;
          skeletonHeight.value = levelSkeletonConfig.height;
          skeletonOrientation.value = levelSkeletonConfig.orientation;
          skeletonThumbnailDisplay.value = levelSkeletonConfig.thumbnailDisplay;
          skeletonThumbnailAlign.value = levelSkeletonConfig.thumbnailAlign;
        }
      }
    },
    { immediate: true }
  );

  return {
    isLoading,
    skeletonCount,
    skeletonHeight,
    skeletonOrientation,
    skeletonThumbnailDisplay,
    skeletonThumbnailAlign,
  };
}
