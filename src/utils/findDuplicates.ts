import { Set } from "immutable";
import { makePosition } from "../types/Sudoku.ts";
import type { Grid, Position } from "../types/Sudoku.ts";

/**
 * Transpose a grid (swap rows and columns)
 * @param grid - Sudoku grid
 * @returns Transposed grid
 */
export const transpose = (grid: Grid): Grid => {
  return grid[0].map((_, colIndex) => grid.map((row) => row[colIndex]));
};

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
              makePosition({ row: rowIndex, col: colIndex }),
              makePosition({ row: rowIndex, col: colIndex_ }),
            ]
            : []
        )
      )
    ),
  );
};

/**
 * Find cells with duplicate values in columns
 * @param grid - Sudoku grid
 * @returns Set of positions with duplicates
 */
export const findColumnDuplicates = (grid: Grid): Set<Position> => {
  return findRowDuplicates(transpose(grid)).map((pos) =>
    makePosition({ row: pos.col, col: pos.row })
  );
};

/**
 * Find cells with duplicate values in 3x3 blocks
 * @param grid - Sudoku grid
 * @returns Set of positions with duplicates
 */
export const findBlockDuplicates = (grid: Grid): Set<Position> => {
  const offsets = [0, 1, 2];
  const blockStarts = [0, 3, 6];

  return Set(
    blockStarts.flatMap((blockRow) =>
      blockStarts.flatMap((blockCol) => {
        const blockCells = offsets.flatMap((dr) =>
          offsets.map((dc) => {
            const pos = { row: blockRow + dr, col: blockCol + dc };
            return {
              pos: { row: blockRow + dr, col: blockCol + dc },
              cell: grid[pos.row][pos.col],
            };
          })
        );

        return blockCells.flatMap(({ pos, cell }, index) =>
          blockCells.flatMap(({ pos: pos_, cell: cell_ }, index_) =>
            index < index_ &&
              cell.value !== undefined &&
              cell.value === cell_.value
              ? [makePosition(pos), makePosition(pos_)]
              : []
          )
        );
      })
    ),
  );
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
