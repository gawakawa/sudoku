import type { Digit } from "../../src/types/Sudoku.ts";

/**
 * Configuration of three diagonal 3x3 blocks.
 * Each block contains a permutation of digits 1-9.
 */
export type BlockConfig = readonly [
  readonly Digit[],
  readonly Digit[],
  readonly Digit[],
];

/**
 * Result of evaluating a single configuration.
 */
export type EvalResult = {
  config: BlockConfig;
  stepsUsed: number;
};

/**
 * Result of a search algorithm.
 */
export type SearchResult = {
  best: BlockConfig;
  stepsUsed: number;
  samplesEvaluated: number;
};

/**
 * Distribution statistics from sampling.
 */
export type DistributionStats = {
  min: number;
  max: number;
  mean: number;
  percentile95: number;
};

/**
 * Final output format for JSON results.
 */
export type SearchOutput = {
  timestamp: string;
  stepsUsed: number;
  best: BlockConfig;
  samplesEvaluated: number;
  distribution: DistributionStats;
};
