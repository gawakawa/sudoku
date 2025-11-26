import { Set } from "immutable";
import { Position } from "../types/Sudoku.ts";
import type { Grid } from "../types/Sudoku.ts";

/**
 * Find cells with duplicate values in rows
 * @param grid - Sudoku grid
 * @returns Set of positions with duplicates
 */
export const findRowDuplicates = (grid: Grid): Set<Position> => {
  return Set(
    grid.flatMap((row, rowIndex) =>
      row.flatMap((cell, colIndex) =>
        row.flatMap((cell_, colIndex_) =>
          colIndex < colIndex_ &&
            cell.value !== undefined &&
            cell.value === cell_.value
            ? [
              Position({ row: rowIndex, col: colIndex }),
              Position({ row: rowIndex, col: colIndex_ }),
            ]
            : []
        )
      )
    ),
  );
};

/**
 * Find cells with duplicate values in columns
 * @param _grid - Sudoku grid
 * @returns Set of positions with duplicates
 */
export const findColumnDuplicates = (_grid: Grid): Set<Position> => {
  // TODO: Check for column duplicates
  return Set();
};

/**
 * Find cells with duplicate values in 3x3 blocks
 * @param _grid - Sudoku grid
 * @returns Set of positions with duplicates
 */
export const findBlockDuplicates = (_grid: Grid): Set<Position> => {
  // TODO: Check for block duplicates
  return Set();
};

/**
 * Find all cells with duplicate values by integrating row, column, and block checks
 * @param grid - Sudoku grid
 * @returns Set of positions with duplicates
 */
export const findDuplicates = (grid: Grid): Set<Position> => {
  return findRowDuplicates(grid)
    .union(findColumnDuplicates(grid))
    .union(findBlockDuplicates(grid));
};
