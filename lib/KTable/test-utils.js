import { screen } from '@testing-library/vue';
import { expect } from '@jest/globals';

/**
 * Asserts that the table has the expected headers and rows. The cell
 * contents are converted to strings before comparison.
 * @param {Array} headers - The expected headers
 * @param {Array} rows - The expected rows
 */
export const assertTableContent = (headers, rows) => {
  const table = screen.getByRole('grid');
  expect(table).toBeInTheDocument();

  const headerCols = screen.getAllByRole('columnheader');
  expect(headerCols.length).toBe(headers.length);
  headers.forEach((header, index) => {
    expect(headerCols[index]).toHaveTextContent(header);
  });

  const gridCells = screen.getAllByRole('gridcell');
  const cellContents = rows.flat().map(cell => cell.toString());
  expect(gridCells.length).toBe(cellContents.length);
  cellContents.forEach((content, index) => {
    expect(gridCells[index]).toHaveTextContent(content);
  });
};
