import userEvent from '@testing-library/user-event';
import {
  getAllRenderedCells,
  assertActiveBackground,
  renderComponent,
  defaultRowCount,
  defaultColCount,
} from '../test-utils';

describe('KTable.vue Tab Navigation', () => {
  beforeEach(() => {
    // Since our primary concern in this test suite is checking focus management rather
    // than actual scrolling behavior, mocking scrollIntoView allows the test to
    // focus on the relevant aspects without getting interrupted
    // by unsupported methods in the test environment.
    window.HTMLElement.prototype.scrollIntoView = jest.fn();
  });

  describe('cells with text/numeric data', () => {
    it('tab navigation', async () => {
      renderComponent();

      const allCells = getAllRenderedCells();

      for (let rowIdx = 0; rowIdx <= defaultRowCount; rowIdx++) {
        for (let colIdx = 0; colIdx < defaultColCount; colIdx++) {
          // Press tab to move to the foucs to the current cell
          await userEvent.tab();

          expect(allCells[rowIdx][colIdx]).toHaveFocus();
          assertActiveBackground(rowIdx, colIdx, allCells);
        }
      }
    });

    it('shift + tab navigation', async () => {
      renderComponent();
      const allCells = getAllRenderedCells();

      for (let rowIdx = defaultRowCount; rowIdx >= 0; rowIdx--) {
        for (let colIdx = defaultColCount - 1; colIdx >= 0; colIdx--) {
          // Press tab to move to the foucs to the current cell
          await userEvent.tab({ shift: true });

          expect(allCells[rowIdx][colIdx]).toHaveFocus();
          assertActiveBackground(rowIdx, colIdx, allCells);
        }
      }
    });
  });
});
