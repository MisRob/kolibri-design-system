import { screen } from '@testing-library/vue';
import userEvent from '@testing-library/user-event';
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

/**
 * Returns the rendered headers
 * @returns {Array} - The rendered headers
 */
export const getRenderedHeaders = () => {
  return screen.getAllByRole('columnheader');
};

/**
 * Returns the rendered grid cells as a 2D array.
 * Also asserts that the number of rendered cells is equal to the number
 * of columns multiplied by the number of rows.
 * @param {number} columnsLength - The number of columns
 * @param {number} rowsLength - The number of rows
 * @returns {Array} - The rendered grid cells
 */
export const getRenderedGridCells = (columnsLength, rowsLength) => {
  const gridCells = screen.getAllByRole('gridcell');
  expect(gridCells.length).toBe(columnsLength * rowsLength);

  // Create a 2D array of the grid cells
  const grid = gridCells.reduce((acc, cell, index) => {
    const rowIndex = Math.floor(index / columnsLength);
    if (!acc[rowIndex]) {
      acc[rowIndex] = [];
    }
    acc[rowIndex].push(cell);
    return acc;
  }, []);
  return grid;
};

/**
 * Simulates focus management by typing the specified keys and asserting that
 * the expected cell has focus after each key press.
 * @param {Array} keyPresses - An array of objects containing the key to press
 * and the expected next cell to have focus
 */
export const assertFocusWithKeyPresses = async keyPresses => {
  for (const { key, nextCell } of keyPresses) {
    await nextCell.focus();
    await userEvent.type(nextCell, key);
    expect(nextCell).toHaveFocus();
  }
};
