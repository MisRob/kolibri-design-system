// Levels correspond to https://design-system.learningequality.org/layout/#responsiveness

const LEVEL_0 = 'level-0';
const LEVEL_1 = 'level-1';
const LEVEL_2 = 'level-2';
const LEVEL_3 = 'level-3';
const LEVEL_4 = 'level-4';
const LEVEL_5 = 'level-5';
const LEVEL_6 = 'level-6';
const LEVEL_7 = 'level-7';

const gridConfigLevelCommon = {
  columnGap: '30px',
  rowGap: '30px',
  rowHeight: 'auto', // seems to be better than min-content that seemed to be breaking layouts - thumbnails then don't respect their percentage value)
  skeletonCount: '3',
  skeletonHeight: '300px',
  skeletonLayout: 'horizontal',
  skeletonThumbnailDisplay: 'none',
  skeletonThumbnailAlign: 'left',
};

const CONFIG_GRID_1_2 = {
  [LEVEL_0]: {
    columns: 1,
    ...gridConfigLevelCommon,
  },
  [LEVEL_1]: {
    columns: 1,
    ...gridConfigLevelCommon,
  },
  [LEVEL_2]: {
    columns: 2,
    ...gridConfigLevelCommon,
  },
  [LEVEL_3]: {
    columns: 2,
    ...gridConfigLevelCommon,
  },
  [LEVEL_4]: {
    columns: 2,
    ...gridConfigLevelCommon,
  },
  [LEVEL_5]: {
    columns: 2,
    ...gridConfigLevelCommon,
  },
  [LEVEL_6]: {
    columns: 2,
    ...gridConfigLevelCommon,
  },
  [LEVEL_7]: {
    columns: 2,
    ...gridConfigLevelCommon,
  },
};

const CONFIG_GRID_1_2_3 = {
  [LEVEL_0]: {
    columns: 1,
    ...gridConfigLevelCommon,
  },
  [LEVEL_1]: {
    columns: 1,
    ...gridConfigLevelCommon,
  },
  [LEVEL_2]: {
    columns: 2,
    ...gridConfigLevelCommon,
  },
  [LEVEL_3]: {
    columns: 2,
    ...gridConfigLevelCommon,
  },
  [LEVEL_4]: {
    columns: 3,
    ...gridConfigLevelCommon,
  },
  [LEVEL_5]: {
    columns: 3,
    ...gridConfigLevelCommon,
  },
  [LEVEL_6]: {
    columns: 3,
    ...gridConfigLevelCommon,
  },
  [LEVEL_7]: {
    columns: 3,
    ...gridConfigLevelCommon,
  },
};

export const GRID_KIND_1_2 = '1-2';
export const GRID_KIND_1_2_3 = '1-2-3';
export const LEVELS = {
  0: LEVEL_0,
  1: LEVEL_1,
  2: LEVEL_2,
  3: LEVEL_3,
  4: LEVEL_4,
  5: LEVEL_5,
  6: LEVEL_6,
  7: LEVEL_7,
};
export const GRID_CONFIGS = {
  [GRID_KIND_1_2]: CONFIG_GRID_1_2,
  [GRID_KIND_1_2_3]: CONFIG_GRID_1_2_3,
};
