import type { Digit, Grid } from "../../src/types/Sudoku.ts";
import { createEmptyGrid } from "../../src/generator/createEmptyGrid.ts";
import { solveWithMetrics } from "./solve.ts";
import type { BlockConfig } from "./types.ts";

/**
 * All valid Sudoku digits.
 */
const digits: readonly Digit[] = [1, 2, 3, 4, 5, 6, 7, 8, 9];

/**
 * Fill a 3x3 block in the grid with given values.
 */
const fillBlock = (
  grid: Grid,
  startRow: number,
  startCol: number,
  values: readonly Digit[],
): Grid => {
  const offsets = [0, 1, 2];
  const newGrid = grid.map((row) => [...row]);
  offsets.forEach((dr) =>
    offsets.forEach((dc) => {
      newGrid[startRow + dr][startCol + dc] = {
        value: values[dr * 3 + dc],
        isInitial: true,
      };
    })
  );
  return newGrid;
};

/**
 * Create a grid with three diagonal blocks filled from config.
 */
export const createGridFromBlocks = (config: BlockConfig): Grid => {
  const blockStarts = [0, 3, 6];
  return blockStarts.reduce(
    (grid, start, idx) => fillBlock(grid, start, start, config[idx]),
    createEmptyGrid(),
  );
};

/**
 * Result of evaluating a configuration.
 */
export type EvalResultWithLimit = {
  stepsUsed: number;
  hitLimit: boolean;
};

/**
 * Evaluate a block configuration and return the number of steps used.
 * @param config - The block configuration to evaluate
 * @param stepLimit - Maximum steps before timeout
 * @returns Steps used and whether the limit was hit
 */
export const evaluateConfig = (
  config: BlockConfig,
  stepLimit: number,
): EvalResultWithLimit => {
  const grid = createGridFromBlocks(config);
  const result = solveWithMetrics(grid, stepLimit);
  return {
    stepsUsed: result.metrics.stepsUsed,
    hitLimit: result.tag === "timeout",
  };
};

/**
 * Generate a shuffled array of digits 1-9 using Fisher-Yates algorithm.
 */
export const shuffleDigits = (): Digit[] => {
  const arr = [...digits];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

/**
 * Generate a random block configuration.
 */
export const generateRandomConfig = (): BlockConfig => [
  shuffleDigits(),
  shuffleDigits(),
  shuffleDigits(),
];
