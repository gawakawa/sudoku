import type { Cell, Grid } from "../types/Sudoku.ts";

/**
 * Empty cell with no value and not initial
 */
export const emptyCell: Cell = {
  value: undefined,
  isInitial: false,
};

/**
 * Creates an empty row of 9 cells
 */
export const createEmptyRow = (): Cell[] =>
  Array.from({ length: 9 }, () => ({ ...emptyCell }));

/**
 * Creates an empty 9x9 grid
 */
export const createEmptyGrid = (): Grid =>
  Array.from({ length: 9 }, () => createEmptyRow());
