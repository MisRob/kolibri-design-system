import { render, screen } from '@testing-library/vue';

import userEvent from '@testing-library/user-event';
import VueRouter from 'vue-router';
import KTable from '../index.vue';
import {
  assertTableContent,
  getRenderedGridCells,
  getRenderedHeaders,
  assertFocusWithKeyPresses,
} from '../test-utils';

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
const defaultHeaderNames = defaultHeaders.map(header => header.label);

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

describe('KTable.vue', () => {
  beforeEach(() => {
    // Since our primary concern in this test suite is checking focus management rather
    // than actual scrolling behavior, mocking scrollIntoView allows the test to
    // focus on the relevant aspects without getting interrupted
    // by unsupported methods in the test environment.
    window.HTMLElement.prototype.scrollIntoView = jest.fn();
  });

  it('should mount the component', () => {
    renderComponent();
    expect(screen.getByRole('grid')).toBeInTheDocument();
  });

  it('renders the correct content in rows and columns', () => {
    renderComponent();
    assertTableContent(defaultHeaderNames, defaultRows);
  });

  describe('should respect the defaultSort attribute', () => {
    it('should not sort the rows by default', () => {
      renderComponent();
      assertTableContent(defaultHeaderNames, defaultRows);
    });

    it('should sort the rows correctly in ascending order', () => {
      renderComponent({
        defaultSort: {
          columnId: 'age',
          direction: 'asc',
        },
      });

      const sortedRows = defaultRows.slice().sort((a, b) => a[1] - b[1]);
      assertTableContent(defaultHeaderNames, sortedRows);
    });

    it('should sort the rows correctly in descending order', () => {
      renderComponent({
        defaultSort: {
          columnId: 'age',
          direction: 'desc',
        },
      });

      const sortedRows = defaultRows.slice().sort((a, b) => b[1] - a[1]);
      assertTableContent(defaultHeaderNames, sortedRows);
    });
  });

  describe('should handle disableBuiltinSorting correctly', () => {
    it('should not sort the rows', () => {
      renderComponent({
        disableBuiltinSorting: true,
        sortable: true,
      });
      assertTableContent(defaultHeaderNames, defaultRows);
    });

    it('should not sort even if default sort is provided', () => {
      renderComponent({
        disableBuiltinSorting: true,
        sortable: true,
        defaultSort: { columnId: 'age', direction: 'asc' },
      });
      assertTableContent(defaultHeaderNames, defaultRows);
    });

    it('should emit changeSort event when sortable column is clicked', async () => {
      const { emitted } = renderComponent({
        sortable: true,
        disableBuiltinSorting: true,
      });

      const ageHeaderCell = screen.getByRole('columnheader', { name: /age/i });
      expect(ageHeaderCell).toBeInTheDocument();
      await userEvent.click(ageHeaderCell);

      expect(emitted()).toHaveProperty('changeSort');
      expect(emitted().changeSort[0]).toEqual([1, null]);
    });
  });

  it('should handle sticky headers and columns', async () => {
    renderComponent();

    const headerCells = screen.getAllByRole('columnheader');
    headerCells.forEach(headerCell => {
      expect(headerCell).toHaveClass('sticky-header');
    });

    defaultRows.forEach(row => {
      const firstColumnCell = screen.getByRole('gridcell', { name: row[0] });
      expect(firstColumnCell).toHaveClass('sticky-column');
    });
  });

  describe('keyboard navigation with arrow keys', () => {
    it('should handle keyboard navigation within the data cells', async () => {
      renderComponent();
      const gridCells = getRenderedGridCells(defaultHeaders.length, defaultRows.length);

      // Focus of the first cell
      gridCells[0][0].focus();
      expect(gridCells[0][0]).toHaveFocus();

      const keyPresses = [
        { key: 'ArrowRight', nextCell: gridCells[0][1] },
        { key: 'ArrowRight', nextCell: gridCells[0][2] },
        { key: 'ArrowDown', nextCell: gridCells[1][2] },
        { key: 'ArrowDown', nextCell: gridCells[2][2] },
        { key: 'ArrowLeft', nextCell: gridCells[2][1] },
        { key: 'ArrowLeft', nextCell: gridCells[2][0] },
        { key: 'ArrowUp', nextCell: gridCells[1][0] },
        { key: 'ArrowUp', nextCell: gridCells[0][0] },
      ];
      assertFocusWithKeyPresses(keyPresses);
    });

    it('should handle keyboard navigation within the header cells', async () => {
      renderComponent();
      const headerCells = getRenderedHeaders();

      // Focus on the first header cell
      headerCells[0].focus();
      expect(headerCells[0]).toHaveFocus();

      const keyPresses = [
        { key: 'ArrowRight', nextCell: headerCells[1] },
        { key: 'ArrowRight', nextCell: headerCells[2] },
        { key: 'ArrowLeft', nextCell: headerCells[1] },
        { key: 'ArrowLeft', nextCell: headerCells[0] },
      ];
      assertFocusWithKeyPresses(keyPresses);
    });

    it('should handle the navigation between header and data cells', async () => {
      renderComponent();
      const headerCells = getRenderedHeaders();
      const gridCells = getRenderedGridCells(defaultHeaders.length, defaultRows.length);

      // Focus on the first header cell
      headerCells[0].focus();
      expect(headerCells[0]).toHaveFocus();

      // Record the key presses and the expected next cell
      const keyPresses = [
        { key: 'ArrowDown', nextCell: gridCells[0][0] },
        { key: 'ArrowRight', nextCell: gridCells[0][1] },
        { key: 'ArrowUp', nextCell: headerCells[1] },
        { key: 'ArrowLeft', nextCell: headerCells[0] },
      ];
      assertFocusWithKeyPresses(keyPresses);
    });
  });
});
