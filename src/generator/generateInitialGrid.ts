import type { Grid, Position } from "../types/Sudoku.ts";
import { makePosition } from "../types/Sudoku.ts";
import { emptyCell } from "./createEmptyGrid.ts";
import { generateCompleteGrid } from "./generateCompleteGrid.ts";

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
 * Generate random positions to remove from the grid
 * @returns Array of random positions to remove
 */
const generateRandomPositions = (): Position[] =>
  randomSubarray(Array.from({ length: 81 }, (_, i) => i)).map((index) =>
    makePosition({
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
 * @returns Initial Sudoku grid
 */
export const generateInitialGrid = (): Grid => {
  const completeGrid = generateCompleteGrid();
  const positions = generateRandomPositions();
  return removeCells(completeGrid, positions);
};
