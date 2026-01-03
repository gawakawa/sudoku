import type { Digit } from "../../src/types/Sudoku.ts";
import type { BlockConfig } from "./types.ts";
import { evaluateConfig } from "./evaluate.ts";

/**
 * Result of simulated annealing optimization.
 */
export type SAResult = {
  best: BlockConfig;
  bestSteps: number;
  iterations: number;
  acceptedWorse: number;
};

/**
 * Generate a random neighbor by swapping two digits within a random block.
 */
const getRandomNeighbor = (config: BlockConfig): BlockConfig => {
  const blockIdx = Math.floor(Math.random() * 3);
  const block = [...config[blockIdx]] as Digit[];

  // Pick two distinct positions to swap
  const i = Math.floor(Math.random() * 9);
  let j = Math.floor(Math.random() * 8);
  if (j >= i) j++;

  [block[i], block[j]] = [block[j], block[i]];

  const newConfig = [...config] as [Digit[], Digit[], Digit[]];
  newConfig[blockIdx] = block;
  return newConfig;
};

/**
 * Generate a random neighbor by swapping digits in ALL 3 blocks simultaneously.
 * This allows escaping deep local optima.
 */
const getMultiBlockNeighbor = (config: BlockConfig): BlockConfig => {
  const newConfig = config.map((block) => {
    const newBlock = [...block] as Digit[];
    const i = Math.floor(Math.random() * 9);
    let j = Math.floor(Math.random() * 8);
    if (j >= i) j++;
    [newBlock[i], newBlock[j]] = [newBlock[j], newBlock[i]];
    return newBlock;
  }) as [Digit[], Digit[], Digit[]];
  return newConfig;
};

/**
 * Simulated Annealing optimization to find worst-case configurations.
 *
 * @param initial - Starting configuration
 * @param stepLimit - Step limit for solver evaluation
 * @param options - SA parameters
 * @returns Best configuration found and statistics
 */
export const simulatedAnnealing = (
  initial: BlockConfig,
  stepLimit: number,
  options: {
    initialTemp: number;
    coolingRate: number;
    iterations: number;
    multiBlock?: boolean;
  },
): SAResult => {
  const { initialTemp, coolingRate, iterations, multiBlock = false } = options;
  const neighborFn = multiBlock ? getMultiBlockNeighbor : getRandomNeighbor;

  let current = initial;
  let currentSteps = evaluateConfig(current, stepLimit).stepsUsed;
  let best = current;
  let bestSteps = currentSteps;
  let temp = initialTemp;
  let acceptedWorse = 0;

  for (let i = 0; i < iterations; i++) {
    const neighbor = neighborFn(current);
    const neighborSteps = evaluateConfig(neighbor, stepLimit).stepsUsed;

    const delta = neighborSteps - currentSteps;

    if (delta > 0) {
      // Improvement: always accept
      current = neighbor;
      currentSteps = neighborSteps;
    } else if (Math.random() < Math.exp(delta / temp)) {
      // Worse: accept with probability
      current = neighbor;
      currentSteps = neighborSteps;
      acceptedWorse++;
    }

    if (currentSteps > bestSteps) {
      best = current;
      bestSteps = currentSteps;
    }

    temp *= coolingRate;
  }

  return { best, bestSteps, iterations, acceptedWorse };
};
