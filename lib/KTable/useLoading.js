import { ref, watch, computed, onMounted, onBeforeUnmount } from 'vue';

/**
 * Manages `KTable`'s loading state and visibility:
 * - Suppress loader if loading finishes within loadingDelay (300ms)
 * - If shown, keep loader visible for at least minVisibleMs (350ms)
 * - Reserve the wrapper height (minHeightPx or last stable table height) while loader visible
 * - Measures stable height via ResizeObserver only when loader isn't visible/delayed
 */
export default function useLoading(
  props,
  { wrapperRef, loadingDelay = 300, minVisibleMs = 350, minHeightPx = 120 } = {},
) {
  const loaderVisible = ref(false); // Determines whether to display table loader
  const delayActive = ref(false); // True during the delay window
  let delayTimer = null; // setTimeout id for delay
  let holdTimer = null; // setTimeout id for min visible time
  let loadingStartTime = null; // Timestamp when loader actually becames visible
  const lastStableHeight = ref(0);
  let resizeObserver = null;

  const canRecordHeight = () => !loaderVisible.value && !delayActive.value;

  const wrapperInlineStyle = computed(() => {
    if (!loaderVisible.value) return {};
    const height = Math.max(lastStableHeight.value, minHeightPx);
    return { minHeight: `${height}px` };
  });

  watch(
    () => props.dataLoading,
    isLoading => {
      if (delayTimer) {
        clearTimeout(delayTimer);
        delayTimer = null;
      }
      if (holdTimer) {
        clearTimeout(holdTimer);
        holdTimer = null;
      }
      // Start delay window, loader isn't displayed yet
      if (isLoading) {
        delayActive.value = true;
        loadingStartTime = null;

        delayTimer = setTimeout(() => {
          // Delay elapsed and still loading, show loader
          if (props.dataLoading) {
            loaderVisible.value = true;
            delayActive.value = false;
            loadingStartTime = Date.now();
          } else {
            // Loading ended during delay — loader will never show
            delayActive.value = false;
            loaderVisible.value = false;
          }
          delayTimer = null;
        }, loadingDelay);
      } else {
        delayActive.value = false;

        if (loaderVisible.value && loadingStartTime) {
          const elapsed = Date.now() - loadingStartTime;
          const remaining = Math.max(0, minVisibleMs - elapsed);
          holdTimer = setTimeout(() => {
            loaderVisible.value = false;
            loadingStartTime = null;
            holdTimer = null;
          }, remaining);
        } else {
          loaderVisible.value = false;
          loadingStartTime = null;
        }
      }
    },
    { immediate: true },
  );

  onMounted(() => {
    // Initialize ResizeObserver if browser supports it
    if (typeof window !== 'undefined' && window.ResizeObserver) {
      resizeObserver = new ResizeObserver(entries => {
        requestAnimationFrame(() => {
          if (canRecordHeight() && entries[0]) {
            lastStableHeight.value = wrapperRef.value.offsetHeight || 0;
          }
        });
      });
      if (wrapperRef?.value) resizeObserver.observe(wrapperRef.value);
    }
  });

  onBeforeUnmount(() => {
    if (resizeObserver) resizeObserver.disconnect();
    if (delayTimer) clearTimeout(delayTimer);
    if (holdTimer) clearTimeout(holdTimer);
  });

  return {
    loaderVisible,
    wrapperInlineStyle,
  };
}
