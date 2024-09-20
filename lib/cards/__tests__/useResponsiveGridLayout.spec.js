/* import { ref } from '@vue/composition-api'; */

/* import useKResponsiveWindow from '../../composables/useKResponsiveWindow'; */
import useResponsiveGridLayout from '../useResponsiveGridLayout';

/* jest.mock('../../composables/useKResponsiveWindow');
 */
jest.mock('../../composables/useKResponsiveWindow', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    windowBreakpoint: 7,
  })),
}));

describe('useResponsiveGridLayout', () => {
  /*  beforeAll(() => {
    useKResponsiveWindow.mockImplementation(() => ({
      windowBreakpoint: ref(7),
    }));
  });
 */
  it('returns a correct base layout config for the current breakpoint', () => {
    const { currentBreakpointConfig } = useResponsiveGridLayout({ layout: '1-2-3' });
    expect(currentBreakpointConfig.value).toEqual({
      cardsPerRow: 3,
      columnGap: '30px',
      rowGap: '30px',
    });
  });
});
