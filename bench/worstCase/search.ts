import type { Digit } from "../../src/types/Sudoku.ts";
import type {
  BlockConfig,
  DistributionStats,
  EvalResult,
  SearchResult,
} from "./types.ts";
import { evaluateConfig, generateRandomConfig } from "./evaluate.ts";

/**
 * Generate all neighbors of a configuration by swapping two digits within a block.
 * Each block has C(9,2) = 36 possible swaps, so 3 blocks = 108 neighbors.
 */
export const getNeighbors = (config: BlockConfig): BlockConfig[] => {
  const neighbors: BlockConfig[] = [];

  config.forEach((block, blockIdx) => {
    for (let i = 0; i < 9; i++) {
      for (let j = i + 1; j < 9; j++) {
        const newBlock = [...block] as Digit[];
        [newBlock[i], newBlock[j]] = [newBlock[j], newBlock[i]];

        const newConfig = [...config] as [Digit[], Digit[], Digit[]];
        newConfig[blockIdx] = newBlock;
        neighbors.push(newConfig);
      }
    }
  });

  return neighbors;
};

/**
 * Phase A: Fast screening to find hard configurations.
 * Returns only configurations that hit the step limit (i.e., are "hard").
 */
export const fastScreening = (
  n: number,
  stepLimit: number,
  progressCallback?: (
    current: number,
    total: number,
    hardCount: number,
  ) => void,
): { hardCandidates: BlockConfig[]; distribution: DistributionStats } => {
  const hardCandidates: BlockConfig[] = [];
  const allSteps: number[] = [];

  for (let i = 0; i < n; i++) {
    if (progressCallback && i % 100000 === 0) {
      progressCallback(i, n, hardCandidates.length);
    }

    const config = generateRandomConfig();
    const result = evaluateConfig(config, stepLimit);
    allSteps.push(result.stepsUsed);

    if (result.hitLimit) {
      hardCandidates.push(config);
    }
  }

  // Calculate distribution statistics
  allSteps.sort((a, b) => a - b);
  const sum = allSteps.reduce((acc, v) => acc + v, 0);
  const distribution: DistributionStats = {
    min: allSteps[0],
    max: allSteps[allSteps.length - 1],
    mean: Math.round(sum / allSteps.length),
    percentile95: allSteps[Math.floor(allSteps.length * 0.95)],
  };

  return { hardCandidates, distribution };
};

/**
 * Phase B: Deep evaluation of hard candidates with higher step limit.
 * Returns results sorted by steps (descending).
 */
export const evaluateHardCandidates = (
  candidates: BlockConfig[],
  stepLimit: number,
  progressCallback?: (current: number, total: number) => void,
): EvalResult[] => {
  const results: EvalResult[] = candidates.map((config, idx) => {
    if (progressCallback && idx % 10 === 0) {
      progressCallback(idx, candidates.length);
    }

    const result = evaluateConfig(config, stepLimit);
    return { config, stepsUsed: result.stepsUsed };
  });

  return results.sort((a, b) => b.stepsUsed - a.stepsUsed);
};

/**
 * Hill climbing from a starting configuration.
 * Explores all neighbors and moves to the best one if it improves.
 */
export const hillClimb = (
  initial: BlockConfig,
  stepLimit: number,
  maxIterations: number = 500,
  progressCallback?: (iteration: number, currentSteps: number) => void,
): SearchResult => {
  let current = initial;
  let currentSteps = evaluateConfig(current, stepLimit).stepsUsed;
  let totalEvaluated = 1;

  for (let iter = 0; iter < maxIterations; iter++) {
    if (progressCallback) {
      progressCallback(iter, currentSteps);
    }

    const neighbors = getNeighbors(current);
    let bestNeighbor = current;
    let bestSteps = currentSteps;

    for (const neighbor of neighbors) {
      const result = evaluateConfig(neighbor, stepLimit);
      totalEvaluated++;

      if (result.stepsUsed > bestSteps) {
        bestNeighbor = neighbor;
        bestSteps = result.stepsUsed;
      }
    }

    if (bestSteps <= currentSteps) {
      // Local maximum reached
      break;
    }

    current = bestNeighbor;
    currentSteps = bestSteps;
  }

  return {
    best: current,
    stepsUsed: currentSteps,
    samplesEvaluated: totalEvaluated,
  };
};

/**
 * Multi-start hill climbing from multiple initial configurations.
 */
export const multiStartHillClimb = (
  initialConfigs: EvalResult[],
  stepLimit: number,
  maxIterationsPerClimb: number = 500,
  progressCallback?: (
    climbIdx: number,
    total: number,
    currentBest: number,
  ) => void,
): SearchResult => {
  let overallBest: SearchResult = {
    best: initialConfigs[0].config,
    stepsUsed: initialConfigs[0].stepsUsed,
    samplesEvaluated: 0,
  };

  initialConfigs.forEach((initial, idx) => {
    if (progressCallback) {
      progressCallback(idx + 1, initialConfigs.length, overallBest.stepsUsed);
    }

    const result = hillClimb(initial.config, stepLimit, maxIterationsPerClimb);

    if (result.stepsUsed > overallBest.stepsUsed) {
      overallBest = {
        best: result.best,
        stepsUsed: result.stepsUsed,
        samplesEvaluated: overallBest.samplesEvaluated +
          result.samplesEvaluated,
      };
    } else {
      overallBest.samplesEvaluated += result.samplesEvaluated;
    }
  });

  return overallBest;
};
