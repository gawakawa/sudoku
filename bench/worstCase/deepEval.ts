/// <reference lib="deno.ns" />
import type { BlockConfig } from "./types.ts";
import type { MergedResult } from "./mergeResults.ts";
import { evaluateConfig } from "./evaluate.ts";
import { hillClimb } from "./search.ts";

/**
 * Deep evaluation and hill climbing for hard candidates.
 *
 * Usage: deno run --allow-read --allow-write deepEval.ts <mergedResultsPath>
 */

const DEEP_EVAL_STEP_LIMIT = 100_000;
const HILL_CLIMB_ITERATIONS = 500;

const main = async (): Promise<void> => {
  const args = Deno.args;
  const inputPath = args[0] || "/tmp/merged_results.json";

  console.log(`Loading merged results from: ${inputPath}`);
  const content = await Deno.readTextFile(inputPath);
  const merged = JSON.parse(content) as MergedResult;

  console.log(`Found ${merged.hardCandidates.length} hard candidates\n`);

  if (merged.hardCandidates.length === 0) {
    console.log("No hard candidates to evaluate.");
    return;
  }

  // Phase B: Deep evaluation
  console.log(`[Phase B] Deep evaluation (limit=${DEEP_EVAL_STEP_LIMIT})...`);
  const evaluated = merged.hardCandidates.map((config, idx) => {
    const result = evaluateConfig(config as BlockConfig, DEEP_EVAL_STEP_LIMIT);
    console.log(`  Candidate ${idx + 1}: ${result.stepsUsed} steps`);
    return { config: config as BlockConfig, stepsUsed: result.stepsUsed };
  });

  // Sort by steps descending
  evaluated.sort((a, b) => b.stepsUsed - a.stepsUsed);
  console.log(`\nTop candidate: ${evaluated[0].stepsUsed} steps\n`);

  // Phase C: Hill Climbing
  console.log(
    `[Phase C] Hill climbing (iterations=${HILL_CLIMB_ITERATIONS})...`,
  );
  const startTime = performance.now();

  const result = hillClimb(
    evaluated[0].config,
    DEEP_EVAL_STEP_LIMIT,
    HILL_CLIMB_ITERATIONS,
    (iter, steps) => {
      if (iter % 10 === 0) {
        console.log(`  Iteration ${iter}: ${steps} steps`);
      }
    },
  );

  const duration = Math.round(performance.now() - startTime);
  console.log(`\nHill climbing completed in ${duration}ms`);

  // Results
  console.log("\n=== RESULT ===");
  console.log(`Worst-case steps: ${result.stepsUsed}`);
  console.log(`Block 0: [${result.best[0].join(", ")}]`);
  console.log(`Block 1: [${result.best[1].join(", ")}]`);
  console.log(`Block 2: [${result.best[2].join(", ")}]`);
  console.log(
    `Samples evaluated during hill climb: ${result.samplesEvaluated}`,
  );

  // Save result
  const output = {
    timestamp: new Date().toISOString(),
    stepsUsed: result.stepsUsed,
    best: result.best,
    samplesEvaluated: merged.totalSamples + merged.hardCandidates.length +
      result.samplesEvaluated,
    distribution: merged.distribution,
  };

  const outputPath = new URL("./results/latest.json", import.meta.url).pathname;
  await Deno.mkdir(new URL("./results", import.meta.url).pathname, {
    recursive: true,
  });
  await Deno.writeTextFile(outputPath, JSON.stringify(output, null, 2));
  console.log(`\nResults saved to: ${outputPath}`);
};

main().catch(console.error);
