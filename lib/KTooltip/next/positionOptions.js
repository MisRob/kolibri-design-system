// Popper 2 options
// https://popper.js.org/docs/v2/constructors/#options
/* const DEFAULT_POSITION_OPTIONS = {
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
}; */

// Floating UI version
// https://floating-ui.com/docs/position
// Since it's not possible to use an object to configure
// options anymore, customizing KTooltip, and any other
// future floating elements, from components that call them
// would most likely be fairly cumbersome and harder to abstract
// from the library. We could implement some logic to make it
//  easier, but from the principle it will be more complex
// than simply using Popper 2 configuration object.
import { offset, flip, shift } from '@floating-ui/dom';

const DEFAULT_POSITION_OPTIONS = {
  placement: 'bottom',
  middleware: [
    offset({
      mainAxis: 8,
    }),
    flip({
      fallbackPlacements: ['top'],
    }),
    shift({
      padding: 8,
    }),
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
