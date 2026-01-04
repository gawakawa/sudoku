import type { Digit, Grid, Position } from "../types/Sudoku.ts";
import { makePosition } from "../types/Sudoku.ts";
import { initGrid } from "../grid/initGrid.ts";
import { solve } from "../solver/solve.ts";
import { DIGITS } from "../const.ts";

/**
 * Generate a shuffled array of digits 1-9 using Fisher-Yates algorithm
 * @returns Randomly shuffled array of digits 1-9
 */
const shuffleDigits = (): Digit[] => {
  const digits: Digit[] = [...DIGITS];
  const factorial = digits.reduce<number>((a, b) => a * b, 1);
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
 * @param startPos Top-left position of the block
 * @param values Array of 9 digits to fill the block
 * @returns New grid with the block filled
 */
const fillBlock = (grid: Grid, startPos: Position, values: Digit[]): Grid => {
  const offsets = [0, 1, 2] as const;
  const newGrid = grid.map((row) => [...row]);
  offsets.forEach((dr) =>
    offsets.forEach((dc) => {
      newGrid[startPos.row + dr][startPos.col + dc] = {
        value: values[dr * 3 + dc],
        isInitial: true,
      };
    })
  );
  return newGrid;
};

/**
 * Generate a grid with three diagonal blocks filled
 * Applies fillBlock three times at positions (0,0), (3,3), (6,6)
 * @returns Grid with diagonal blocks filled with random permutations
 */
const generateDiagonalBlocks = (): Grid => {
  const blockStarts = [0, 3, 6] as const;
  return blockStarts.reduce(
    (grid, start) =>
      fillBlock(
        grid,
        makePosition({ row: start, col: start }),
        shuffleDigits(),
      ),
    initGrid(),
  );
};

/**
 * Fallback pattern used when solve times out
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
 * Fallback grid used when solve times out
 */
const fallbackGrid: Grid = fallbackPattern.map((row) =>
  row.map((value) => ({ value: value as Digit, isInitial: true }))
);

/**
 * Generate a complete valid Sudoku grid using diagonal block initialization
 * and backtracking with MRV heuristic
 * @returns Complete Sudoku grid with all 81 cells filled
 */
export const generateCompleteGrid = (): Grid => {
  const withDiagonals = generateDiagonalBlocks();
  const solveResult = solve(withDiagonals, 1000);
  return solveResult.tag === "solved" ? solveResult.grid : fallbackGrid;
};
