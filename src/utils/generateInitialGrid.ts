import type { Grid } from "../types/Sudoku.ts";
import { Position } from "../types/Sudoku.ts";
import { emptyCell } from "./createEmptyGrid.ts";

/**
 * Generate random subarray using bit mask
 * @param arr Array to sample from
 * @returns Random subarray
 */
const randomSubarray = <T>(arr: T[]): T[] => {
  const r1 = Math.floor(Math.random() * 2 ** 53);
  const r2 = Math.floor(Math.random() * 2 ** 53);
  const mask = BigInt(r1) | (BigInt(r2) << 53n);
  return arr.filter((_, i) => (mask >> BigInt(i)) & 1n);
};

/**
 * Generate a complete valid Sudoku grid (all cells filled)
 * TODO: Implement random generation algorithm
 * @returns Complete Sudoku grid with all 81 cells filled
 */
const generateCompleteGrid = (): Grid => {
  const pattern = [
    [1, 2, 3, 4, 5, 6, 7, 8, 9],
    [4, 5, 6, 7, 8, 9, 1, 2, 3],
    [7, 8, 9, 1, 2, 3, 4, 5, 6],
    [2, 3, 4, 5, 6, 7, 8, 9, 1],
    [5, 6, 7, 8, 9, 1, 2, 3, 4],
    [8, 9, 1, 2, 3, 4, 5, 6, 7],
    [3, 4, 5, 6, 7, 8, 9, 1, 2],
    [6, 7, 8, 9, 1, 2, 3, 4, 5],
    [9, 1, 2, 3, 4, 5, 6, 7, 8],
  ] as const;

  return pattern.map((row) =>
    row.map((value) => ({
      value,
      isInitial: true,
    }))
  );
};

/**
 * Generate random positions to remove from the grid
 * @returns Array of random positions to remove
 */
const generateRandomPositions = (): Position[] =>
  randomSubarray(Array.from({ length: 81 }, (_, i) => i)).map((index) =>
    Position({
      row: Math.floor(index / 9),
      col: index % 9,
    })
  );

/**
 * Remove cells from a complete grid to create a puzzle
 * @param grid Complete Sudoku grid
 * @param positions Positions of cells to remove
 * @returns Puzzle grid with specified cells removed
 */
export const removeCells = (grid: Grid, positions: Position[]): Grid => {
  return grid.map((row, rowIndex) =>
    row.map((cell, colIndex) =>
      positions.some((pos) => pos.row === rowIndex && pos.col === colIndex)
        ? { ...emptyCell }
        : cell
    )
  );
};

/**
 * Generate an initial Sudoku grid
 * TODO: In the future, this will generate random puzzles
 * @returns Initial Sudoku grid
 */
export const generateInitialGrid = (): Grid => {
  const completeGrid = generateCompleteGrid();
  const positions = generateRandomPositions();
  return removeCells(completeGrid, positions);
};
