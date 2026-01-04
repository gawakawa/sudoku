import { Record } from "immutable";
import { DIGITS } from "../const.ts";

/**
 * Digit value in a cell (1-9)
 */
export type Digit = (typeof DIGITS)[number];

/**
 * Value that can be assigned to a cell (Digit or empty)
 */
export type CellValue = Digit | undefined;

/**
 * Single cell in the Sudoku grid
 */
export type Cell = {
  value: CellValue;
  isInitial: boolean;
};

/**
 * Position in the grid
 */
export const makePosition = Record({ row: 0, col: 0 });
export type Position = ReturnType<typeof makePosition>;

/**
 * 9x9 Sudoku grid
 * First index is row (0-8), second index is column (0-8)
 * Access pattern: grid[row][col]
 */
export type Grid = Cell[][];

/**
 * 9x9 error grid tracking duplicate errors
 * First index is row (0-8), second index is column (0-8)
 */
export type ErrorGrid = boolean[][];
