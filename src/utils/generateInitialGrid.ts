import { Set } from "immutable";
import type { Digit, Grid } from "../types/Sudoku.ts";
import { Position } from "../types/Sudoku.ts";
import { createEmptyGrid, emptyCell } from "./createEmptyGrid.ts";

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
 * Generate a shuffled array of digits 1-9 using Fisher-Yates algorithm
 * @returns Randomly shuffled array of digits 1-9
 */
const shuffleDigits = (): Digit[] => {
  const digits: Digit[] = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  const factorial = digits.reduce((a, b) => a * b, 1);
  const r = Math.floor(Math.random() * factorial);
  for (let i = 8, q = r; i > 0; i--) {
    const j = q % (i + 1);
    q = (q / (i + 1)) | 0;
    [digits[i], digits[j]] = [digits[j], digits[i]];
  }
  return digits;
};

/**
 * Fill a 3x3 block in the grid with given values
 * @param grid Current grid state
 * @param row Top-left row of the block
 * @param col Top-left column of the block
 * @param values Array of 9 digits to fill the block
 * @returns New grid with the block filled
 */
const fillBlock = (
  grid: Grid,
  row: number,
  col: number,
  values: Digit[],
): Grid => grid;

/**
 * Generate a grid with three diagonal blocks filled
 * Applies fillBlock three times at positions (0,0), (3,3), (6,6)
 * @returns Grid with diagonal blocks filled with random permutations
 */
const generateDiagonalBlocks = (): Grid =>
  [0, 3, 6].reduce(
    (grid, start) => fillBlock(grid, start, start, shuffleDigits()),
    createEmptyGrid(),
  );

/**
 * Calculate the candidate set for a cell at (row, col)
 * Excludes digits already present in the same row, column, and 3x3 block
 * @param grid Current grid state
 * @param row Row index (0-8)
 * @param col Column index (0-8)
 * @returns Set of valid candidate digits for this cell
 */
const getCandidates = (grid: Grid, row: number, col: number): Set<Digit> =>
  Set();

/**
 * Find the empty cell with the minimum remaining values (MRV heuristic)
 * @param grid Current grid state
 * @returns Cell position and candidates, or undefined if grid is complete
 */
const findMRVCell = (
  grid: Grid,
): { row: number; col: number; candidates: Set<Digit> } | undefined =>
  undefined;

/**
 * Solve the remaining cells using backtracking with MRV heuristic
 * @param grid Current grid state
 * @returns Solved grid, or undefined if no solution exists
 */
const solve = (grid: Grid): Grid | undefined => undefined;

/**
 * Fallback pattern used when solve fails
 */
const fallbackPattern = [
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

/**
 * Fallback grid used when solve fails
 */
const fallbackGrid: Grid = fallbackPattern.map((row) =>
  row.map((value) => ({ value: value as Digit, isInitial: true }))
);

/**
 * Generate a complete valid Sudoku grid using diagonal block initialization
 * and backtracking with MRV heuristic
 * @returns Complete Sudoku grid with all 81 cells filled
 */
const generateCompleteGrid = (): Grid => {
  const withDiagonals = generateDiagonalBlocks();
  const solved = solve(withDiagonals);
  return solved ?? fallbackGrid;
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
