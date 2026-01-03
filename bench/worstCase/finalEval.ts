/// <reference lib="deno.ns" />
import type { BlockConfig } from "./types.ts";
import { evaluateConfig } from "./evaluate.ts";
import { hillClimb } from "./search.ts";

/**
 * Final evaluation of the best SA result.
 * Runs Hill Climbing and evaluates with high step limit.
 */

const DEEP_STEP_LIMIT = 100_000;
const HILL_CLIMB_ITERATIONS = 500;

const main = async (): Promise<void> => {
  // Best configuration from SA (7,114 steps at stepLimit=10,000)
  const bestConfig: BlockConfig = [
    [8, 2, 4, 6, 3, 9, 7, 5, 1],
    [9, 4, 1, 3, 5, 2, 7, 6, 8],
    [4, 6, 5, 1, 8, 9, 3, 7, 2],
  ];

  console.log("=== Final Evaluation ===\n");
  console.log("Best configuration from SA:");
  console.log(`Block 0: [${bestConfig[0].join(", ")}]`);
  console.log(`Block 1: [${bestConfig[1].join(", ")}]`);
  console.log(`Block 2: [${bestConfig[2].join(", ")}]`);

  // Phase 1: Deep evaluation
  console.log(`\n[Phase 1] Deep evaluation (limit=${DEEP_STEP_LIMIT})...`);
  const deepResult = evaluateConfig(bestConfig, DEEP_STEP_LIMIT);
  console.log(`Steps used: ${deepResult.stepsUsed}`);
  console.log(`Hit limit: ${deepResult.hitLimit}`);

  // Phase 2: Hill Climbing
  console.log(
    `\n[Phase 2] Hill climbing (iterations=${HILL_CLIMB_ITERATIONS})...`,
  );
  const startTime = performance.now();

  const hillResult = hillClimb(
    bestConfig,
    DEEP_STEP_LIMIT,
    HILL_CLIMB_ITERATIONS,
    (iter, steps) => {
      if (iter % 50 === 0) {
        console.log(`  Iteration ${iter}: ${steps} steps`);
      }
    },
  );

  const duration = Math.round(performance.now() - startTime);
  console.log(`\nHill climbing completed in ${duration}ms`);

  // Results
  console.log("\n=== FINAL RESULT ===");
  console.log(`Worst-case steps: ${hillResult.stepsUsed}`);
  console.log(`Block 0: [${hillResult.best[0].join(", ")}]`);
  console.log(`Block 1: [${hillResult.best[1].join(", ")}]`);
  console.log(`Block 2: [${hillResult.best[2].join(", ")}]`);
  console.log(`Samples evaluated: ${hillResult.samplesEvaluated}`);

  // Save result
  const output = {
    timestamp: new Date().toISOString(),
    stepsUsed: hillResult.stepsUsed,
    best: hillResult.best,
    samplesEvaluated: hillResult.samplesEvaluated,
    method: "SA + Hill Climbing",
  };

  const outputPath = new URL("./results/final.json", import.meta.url).pathname;
  await Deno.mkdir(new URL("./results", import.meta.url).pathname, {
    recursive: true,
  });
  await Deno.writeTextFile(outputPath, JSON.stringify(output, null, 2));
  console.log(`\nResults saved to: ${outputPath}`);
};

main().catch(console.error);
