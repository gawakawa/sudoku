/// <reference lib="deno.ns" />
import type { Digit } from "../../src/types/Sudoku.ts";
import type { BlockConfig } from "./types.ts";
import { evaluateConfig } from "./evaluate.ts";

/** Swap two positions in a block and return a new array. */
const swapInBlock = (
  block: readonly Digit[],
  i: number,
  j: number,
): Digit[] => {
  const newBlock = [...block] as Digit[];
  [newBlock[i], newBlock[j]] = [newBlock[j], newBlock[i]];
  return newBlock;
};

/**
 * Exhaustive neighbor search to verify local optimum.
 *
 * Usage:
 *   deno run --allow-env exhaustiveNeighbor.ts
 *
 * Environment variables:
 *   STEP_LIMIT - Step limit for evaluation (default: 15000)
 */

const BEST_CONFIG: BlockConfig = [
  [5, 1, 4, 9, 3, 6, 7, 2, 8],
  [1, 8, 6, 9, 4, 5, 7, 2, 3],
  [6, 7, 8, 2, 3, 9, 4, 5, 1],
];

const STEP_LIMIT = Number(Deno.env.get("STEP_LIMIT")) || 15_000;

const main = (): void => {
  console.log("Checking all 108 neighbors of best config...");
  console.log(`Step limit: ${STEP_LIMIT}`);

  const baseResult = evaluateConfig(BEST_CONFIG, STEP_LIMIT);
  console.log(`Base config: ${baseResult.stepsUsed} steps\n`);

  let maxSteps = baseResult.stepsUsed;
  let maxConfig: BlockConfig | null = null;
  let checked = 0;
  const betterNeighbors: Array<{
    config: BlockConfig;
    steps: number;
    blockIdx: number;
    i: number;
    j: number;
  }> = [];

  for (let blockIdx = 0; blockIdx < 3; blockIdx++) {
    for (let i = 0; i < 9; i++) {
      for (let j = i + 1; j < 9; j++) {
        // Create neighbor by swapping positions i and j in block blockIdx
        const neighbor: BlockConfig = [
          blockIdx === 0
            ? swapInBlock(BEST_CONFIG[0], i, j)
            : [...BEST_CONFIG[0]],
          blockIdx === 1
            ? swapInBlock(BEST_CONFIG[1], i, j)
            : [...BEST_CONFIG[1]],
          blockIdx === 2
            ? swapInBlock(BEST_CONFIG[2], i, j)
            : [...BEST_CONFIG[2]],
        ] as BlockConfig;

        const result = evaluateConfig(neighbor, STEP_LIMIT);
        checked++;

        if (result.stepsUsed > baseResult.stepsUsed) {
          betterNeighbors.push({
            config: neighbor,
            steps: result.stepsUsed,
            blockIdx,
            i,
            j,
          });
          console.log(
            `Found better: block${blockIdx} swap(${i},${j}) = ${result.stepsUsed}`,
          );
        }

        if (result.stepsUsed > maxSteps) {
          maxSteps = result.stepsUsed;
          maxConfig = neighbor;
        }
      }
    }
    console.log(`Block ${blockIdx} complete (${(blockIdx + 1) * 36}/108)`);
  }

  console.log(`\nChecked ${checked} neighbors`);
  console.log(`Max steps found: ${maxSteps}`);

  if (betterNeighbors.length > 0) {
    console.log(`\n${betterNeighbors.length} neighbors with more steps:`);
    betterNeighbors.sort((a, b) => b.steps - a.steps);
    betterNeighbors.forEach(({ config, steps, blockIdx, i, j }) => {
      console.log(`  ${steps}: block${blockIdx} swap(${i},${j})`);
      console.log(`    ${JSON.stringify(config)}`);
    });

    if (maxConfig) {
      console.log(`\nBest neighbor config:`);
      console.log(JSON.stringify(maxConfig));
    }
  } else {
    console.log(
      `\nNo better neighbors found - ${baseResult.stepsUsed} is a local optimum`,
    );
  }
};

main();
