import type { Grid } from "../types/Sudoku.ts";
import { Position } from "../types/Sudoku.ts";
import { emptyCell } from "./createEmptyBoard.ts";

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
      hasError: false,
    }))
  );
};

/**
 * Generate random positions to remove from the grid
 * TODO: Implement random generation
 * @returns Array of positions to remove
 */
const generateRandomPositions = (): Position[] => {
  return [
    Position({ row: 0, col: 2 }),
    Position({ row: 0, col: 3 }),
    Position({ row: 0, col: 5 }),
    Position({ row: 0, col: 6 }),
    Position({ row: 0, col: 7 }),
    Position({ row: 0, col: 8 }),
    Position({ row: 1, col: 1 }),
    Position({ row: 1, col: 2 }),
    Position({ row: 1, col: 6 }),
    Position({ row: 1, col: 7 }),
    Position({ row: 1, col: 8 }),
    Position({ row: 2, col: 0 }),
    Position({ row: 2, col: 3 }),
    Position({ row: 2, col: 4 }),
    Position({ row: 2, col: 5 }),
    Position({ row: 2, col: 6 }),
    Position({ row: 2, col: 8 }),
    Position({ row: 3, col: 1 }),
    Position({ row: 3, col: 2 }),
    Position({ row: 3, col: 3 }),
    Position({ row: 3, col: 5 }),
    Position({ row: 3, col: 6 }),
    Position({ row: 3, col: 7 }),
    Position({ row: 4, col: 1 }),
    Position({ row: 4, col: 2 }),
    Position({ row: 4, col: 4 }),
    Position({ row: 4, col: 6 }),
    Position({ row: 4, col: 7 }),
    Position({ row: 5, col: 1 }),
    Position({ row: 5, col: 2 }),
    Position({ row: 5, col: 3 }),
    Position({ row: 5, col: 5 }),
    Position({ row: 5, col: 6 }),
    Position({ row: 5, col: 7 }),
    Position({ row: 6, col: 0 }),
    Position({ row: 6, col: 2 }),
    Position({ row: 6, col: 3 }),
    Position({ row: 6, col: 4 }),
    Position({ row: 6, col: 5 }),
    Position({ row: 6, col: 8 }),
    Position({ row: 7, col: 0 }),
    Position({ row: 7, col: 1 }),
    Position({ row: 7, col: 2 }),
    Position({ row: 7, col: 6 }),
    Position({ row: 7, col: 7 }),
    Position({ row: 8, col: 0 }),
    Position({ row: 8, col: 1 }),
    Position({ row: 8, col: 2 }),
    Position({ row: 8, col: 3 }),
    Position({ row: 8, col: 5 }),
    Position({ row: 8, col: 6 }),
  ];
};

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
export function generateInitialGrid(): Grid {
  const completeGrid = generateCompleteGrid();
  const positions = generateRandomPositions();
  return removeCells(completeGrid, positions);
}
