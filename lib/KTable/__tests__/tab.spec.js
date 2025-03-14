import { render } from '@testing-library/vue';
import userEvent from '@testing-library/user-event';
import VueRouter from 'vue-router';
import KTable from '../index.vue';
import { getAllRenderedCells, assertActiveBackground } from '../test-utils';

const defaultHeaders = [
  { label: 'Name', dataType: 'string', columnId: 'name' },
  { label: 'Age', dataType: 'number', columnId: 'age' },
  { label: 'City', dataType: 'string', columnId: 'city' },
];
const defaultRows = [
  ['John', 30, 'New York'],
  ['Alice', 25, 'Los Angeles'],
  ['Bob', 35, 'San Francisco'],
];
const rowCount = defaultRows.length;
const columnCount = defaultHeaders.length;

const renderComponent = props =>
  render(KTable, {
    props: {
      headers: defaultHeaders,
      rows: defaultRows,
      caption: 'Test Table',
      ...props,
    },
    routes: new VueRouter(),
  });

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

      const allCells = getAllRenderedCells(columnCount, rowCount);

      for (let rowIdx = 0; rowIdx <= rowCount; rowIdx++) {
        for (let colIdx = 0; colIdx < columnCount; colIdx++) {
          // Press tab to move to the foucs to the current cell
          await userEvent.tab();

          expect(allCells[rowIdx][colIdx]).toHaveFocus();
          assertActiveBackground(rowIdx, colIdx, allCells);
        }
      }
    });

    it('shift + tab navigation', async () => {
      renderComponent();
      const allCells = getAllRenderedCells(columnCount, rowCount);

      for (let rowIdx = rowCount; rowIdx >= 0; rowIdx--) {
        for (let colIdx = columnCount - 1; colIdx >= 0; colIdx--) {
          // Press tab to move to the foucs to the current cell
          await userEvent.tab({ shift: true });

          expect(allCells[rowIdx][colIdx]).toHaveFocus();
          assertActiveBackground(rowIdx, colIdx, allCells);
        }
      }
    });
  });
});
