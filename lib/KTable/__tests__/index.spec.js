import { render, screen } from '@testing-library/vue';
import userEvent from '@testing-library/user-event';
import VueRouter from 'vue-router';
import KTable from '../index.vue';
import { assertTableContent } from '../test-utils';

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

  // it('should handle sticky headers and columns', async () => {
  //   const headers = [
  //     { label: 'Name', dataType: 'string', columnId: 'name' },
  //     { label: 'Age', dataType: 'number', columnId: 'age' },
  //   ];
  //   const rows = [
  //     ['John', 30],
  //     ['Jane', 25],
  //   ];

  //   const wrapper = mount(KTable, {
  //     propsData: { headers, rows, caption: 'Sticky Table' },
  //   });

  //   // Wait for the table to be fully rendered
  //   await wrapper.vm.$nextTick();

  //   const headerCells = wrapper.findAll('thead th');
  //   headerCells.wrappers.forEach(headerCell => {
  //     expect(headerCell.classes()).toContain('sticky-header');
  //   });

  //   const firstColumnCells = wrapper.findAll('tbody tr td:first-child');
  //   firstColumnCells.wrappers.forEach(cell => {
  //     expect(cell.classes()).toContain('sticky-column');
  //   });
  // });

  // beforeEach(() => {
  //   /*Since our primary concern in this test is checking focus management rather
  //   than actual scrolling behavior, mocking scrollIntoView allows the test to
  //   focus on the relevant aspects without getting interrupted
  //   by unsupported methods in the test environment.*/
  //   window.HTMLElement.prototype.scrollIntoView = jest.fn();
  // });

  // it('should handle keyboard navigation within the table', async () => {
  //   const headers = [
  //     { label: 'Name', dataType: 'string', columnId: 'name' },
  //     { label: 'Age', dataType: 'number', columnId: 'age' },
  //   ];
  //   const rows = [
  //     ['John', 30],
  //     ['Jane', 25],
  //   ];

  //   const wrapper = mount(KTable, {
  //     propsData: { headers, rows, caption: 'Keyboard Navigation Table' },
  //     attachTo: document.body, // Attach to document body to properly manage focus
  //   });

  //   await wrapper.vm.$nextTick(); // Ensure the component is fully rendered

  //   const firstCell = wrapper.find('tbody tr:first-child td:first-child');
  //   await firstCell.element.focus(); // Focus the first cell directly
  //   expect(firstCell.element).toHaveFocus(); // Check if the first cell is focused

  //   // Simulate ArrowRight key press
  //   await firstCell.trigger('keydown', { key: 'ArrowRight' });

  //   const secondCell = wrapper.find('tbody tr:first-child td:nth-child(2)');
  //   await secondCell.element.focus(); // Focus the second cell directly
  //   expect(secondCell.element).toHaveFocus(); // Check if the second cell is focused

  //   // Simulate ArrowDown key press
  //   await secondCell.trigger('keydown', { key: 'ArrowDown' });

  //   const thirdCell = wrapper.find('tbody tr:nth-child(2) td:nth-child(2)');
  //   await thirdCell.element.focus(); // Focus the third cell directly
  //   expect(thirdCell.element).toHaveFocus(); // Check if the third cell is focused

  //   // Cleanup: detach the wrapper from the document body after the test
  //   wrapper.destroy();
  // });
});
