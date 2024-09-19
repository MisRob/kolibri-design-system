/**
 * Contains configurations for the base card grid layouts
 * corresponding to the most commonly used grids in our designs.
 */

// Settings common to all breakpoint levels
const breakpointCommon = {
  columnGap: '30px',
  rowGap: '30px',
};

/**
 * Configuration for '1-1-1' grid,
 * that is a grid with 1 card per row
 * on all screen sizes.
 *
 * Organized by breakpoint levels as defined in
 * https://design-system.learningequality.org/layout/#responsiveness
 */
const LAYOUT_CONFIG_1_1_1 = {
  0: {
    cardsPerRow: 1,
    ...breakpointCommon,
  },
  1: {
    cardsPerRow: 1,
    ...breakpointCommon,
  },
  2: {
    cardsPerRow: 1,
    ...breakpointCommon,
  },
  3: {
    cardsPerRow: 1,
    ...breakpointCommon,
  },
  4: {
    cardsPerRow: 1,
    ...breakpointCommon,
  },
  5: {
    cardsPerRow: 1,
    ...breakpointCommon,
  },
  6: {
    cardsPerRow: 1,
    ...breakpointCommon,
  },
  7: {
    cardsPerRow: 1,
    ...breakpointCommon,
  },
};

/**
 * Configuration for '1-2-2' grid,
 * that is a grid with
 * - 1 card per row on smaller screens
 * - 2 cards per row on medium screens
 * - 2 cards per row on larger screens
 *
 * Organized by breakpoint levels as defined in
 * https://design-system.learningequality.org/layout/#responsiveness
 */
const LAYOUT_CONFIG_1_2_2 = {
  0: {
    cardsPerRow: 1,
    ...breakpointCommon,
  },
  1: {
    cardsPerRow: 1,
    ...breakpointCommon,
  },
  2: {
    cardsPerRow: 2,
    ...breakpointCommon,
  },
  3: {
    cardsPerRow: 2,
    ...breakpointCommon,
  },
  4: {
    cardsPerRow: 2,
    ...breakpointCommon,
  },
  5: {
    cardsPerRow: 2,
    ...breakpointCommon,
  },
  6: {
    cardsPerRow: 2,
    ...breakpointCommon,
  },
  7: {
    cardsPerRow: 2,
    ...breakpointCommon,
  },
};

/**
 * Configuration for '1-2-3' grid,
 * that is a grid with
 * - 1 card per row on smaller screens
 * - 2 cards per row on medium screens
 * - 3 cards per row on larger screens
 *
 * Organized by breakpoint levels as defined in
 * https://design-system.learningequality.org/layout/#responsiveness
 */
const LAYOUT_CONFIG_1_2_3 = {
  0: {
    cardsPerRow: 1,
    ...breakpointCommon,
  },
  1: {
    cardsPerRow: 1,
    ...breakpointCommon,
  },
  2: {
    cardsPerRow: 2,
    ...breakpointCommon,
  },
  3: {
    cardsPerRow: 2,
    ...breakpointCommon,
  },
  4: {
    cardsPerRow: 3,
    ...breakpointCommon,
  },
  5: {
    cardsPerRow: 3,
    ...breakpointCommon,
  },
  6: {
    cardsPerRow: 3,
    ...breakpointCommon,
  },
  7: {
    cardsPerRow: 3,
    ...breakpointCommon,
  },
};

export const LAYOUT_1_1_1 = '1-1-1';
export const LAYOUT_1_2_2 = '1-2-2';
export const LAYOUT_1_2_3 = '1-2-3';

export const LAYOUT_CONFIGS = {
  [LAYOUT_1_1_1]: LAYOUT_CONFIG_1_1_1,
  [LAYOUT_1_2_2]: LAYOUT_CONFIG_1_2_2,
  [LAYOUT_1_2_3]: LAYOUT_CONFIG_1_2_3,
};
