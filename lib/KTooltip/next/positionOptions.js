// Popper 2 options
// https://popper.js.org/docs/v2/constructors/#options
const DEFAULT_POSITION_OPTIONS = {
  placement: 'bottom',
  modifiers: [
    {
      name: 'offset',
      options: {
        offset: [0, 8],
      },
    },
    {
      name: 'flip',
      options: {
        fallbackPlacements: ['top'],
      },
    },
    {
      name: 'preventOverflow',
      options: {
        padding: 8,
      },
    },
  ],
};

/**
 * Generates final options from default options
 * and configuration provided via props.
 *
 * - 'positionOptions' overrides the default options
 * - if provided, 'positionOptions.placement' overrides 'placement'
 * - if provided, 'placement' overrides the default placement
 */
export function getPositionOptions(positionOptions, placement) {
  if (positionOptions) {
    if (!('placement' in positionOptions)) {
      return { ...positionOptions, placement };
    }
    return { ...positionOptions };
  }

  if (placement) {
    return { ...DEFAULT_POSITION_OPTIONS, placement };
  }

  return { ...DEFAULT_POSITION_OPTIONS };
}
