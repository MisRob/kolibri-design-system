import '../composables/composition-api'; // TODO: Remove as soon as not needed
import cloneDeep from 'lodash/cloneDeep';
import { reactive, ref, watch, onBeforeUnmount } from '@vue/composition-api';

import useKResponsiveWindow from '../composables/useKResponsiveWindow';

import { LAYOUT_CONFIGS } from './gridBaseLayouts';

/**
 * Stores grids configurations
 * { <gridId>: { gridId: ..., layoutConfig: { ... } }}
 * where layoutConfig has format as defined in LAYOUT_CONFIGS
 */
const gridConfigs = reactive({});

export function setCardsPerRow({ gridId, cards, breakpoints }) {
  for (const breakpoint of breakpoints) {
    const breakpointConfig = getBreakpointConfig(gridId, breakpoint);
    if (breakpointConfig) {
      breakpointConfig.cardsPerRow = cards;
    }
  }
}

export function setColumnGap({ gridId, columnGap, breakpoints }) {
  for (const breakpoint of breakpoints) {
    const breakpointConfig = getBreakpointConfig(gridId, breakpoint);
    if (breakpointConfig) {
      breakpointConfig.columnGap = columnGap;
    }
  }
}

export function setRowGap({ gridId, rowGap, breakpoints }) {
  for (const breakpoint of breakpoints) {
    const breakpointConfig = getBreakpointConfig(gridId, breakpoint);
    if (breakpointConfig) {
      breakpointConfig.rowGap = rowGap;
    }
  }
}

/**
 * Returns part of the grid configuration for the given breakpoint
 */
function getBreakpointConfig(gridId, breakpoint) {
  let breakpointConfig = null;
  try {
    const layoutConfig = gridConfigs[gridId].layoutConfig;
    breakpointConfig = layoutConfig[breakpoint];
  } catch {
    console.error('[useGridConfig] Grid configuration not found');
  }

  return breakpointConfig;
}

/**
 * Private for use from 'KCardGrid' only. Contains logic related
 * to grids configurations:
 *
 * - When 'KCardGrid' instance is initialized, stores its
 * base layout configuration to the global `gridConfigs`
 * so that it can be later customized via `useKCardGrid`
 * (this is one part of a robust approach that accounts
 * for `useKCardGrid` being called on a page that has more
 * than one `KCardGrid`)
 *
 * - Observes window size and returns the final grid configuration
 * to 'KCardGrid' for the current breakpoint
 */
export default function useGridConfig(props) {
  const currentBreakpointConfig = ref({});
  const { windowBreakpoint } = useKResponsiveWindow();

  const gridId = props.gridId; // TODO: Document not reactive
  const layout = props.layout; // TODO: Document not reactive

  // retrieve definition and save the whole base layout
  // configuration object for a chosen KCardGrid's layout
  // ('cloneDeep' to secure LAYOUT_CONFIGS from overrides)
  const baseLayoutConfig = cloneDeep(LAYOUT_CONFIGS[layout]);
  if (!Object.keys(gridConfigs).includes(gridId)) {
    gridConfigs[gridId] = { gridId, layoutConfig: {} };
  }
  gridConfigs[gridId].layoutConfig = baseLayoutConfig;

  watch(
    [windowBreakpoint, gridConfigs],
    ([newBreakpoint, _]) => {
      if (newBreakpoint === null || newBreakpoint === undefined) {
        currentBreakpointConfig.value = getBreakpointConfig(gridId, 0);
      }
      currentBreakpointConfig.value = getBreakpointConfig(gridId, newBreakpoint);
    },
    { immediate: true, deep: true }
  );

  onBeforeUnmount(() => {
    delete gridConfigs[gridId];
  });

  return {
    currentBreakpointConfig,
  };
}
