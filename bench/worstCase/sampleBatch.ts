/// <reference lib="deno.ns" />
import type { BlockConfig, DistributionStats } from "./types.ts";
import { evaluateConfig, generateRandomConfig } from "./evaluate.ts";

/**
 * Batch sampling script for sub-agent parallel execution.
 *
 * Usage: deno run --allow-write sampleBatch.ts <sampleCount> <outputPath>
 *
 * Output JSON format:
 * {
 *   hardCandidates: BlockConfig[],
 *   distribution: DistributionStats,
 *   sampleCount: number,
 *   durationMs: number
 * }
 */

const SCREENING_STEP_LIMIT = 2_000;

export type BatchResult = {
  hardCandidates: BlockConfig[];
  distribution: DistributionStats;
  sampleCount: number;
  durationMs: number;
};

const runBatch = (sampleCount: number): BatchResult => {
  const startTime = performance.now();
  const hardCandidates: BlockConfig[] = [];
  const allSteps: number[] = [];

  for (let i = 0; i < sampleCount; i++) {
    const config = generateRandomConfig();
    const result = evaluateConfig(config, SCREENING_STEP_LIMIT);
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

  const durationMs = Math.round(performance.now() - startTime);

  return {
    hardCandidates,
    distribution,
    sampleCount,
    durationMs,
  };
};

// CLI entry point
if (import.meta.main) {
  const args = Deno.args;

  if (args.length < 2) {
    console.error(
      "Usage: deno run --allow-write sampleBatch.ts <count> <output>",
    );
    console.error(
      "Example: deno run --allow-write sampleBatch.ts 10000 /tmp/batch1.json",
    );
    Deno.exit(1);
  }

  const sampleCount = parseInt(args[0], 10);
  const outputPath = args[1];

  if (isNaN(sampleCount) || sampleCount <= 0) {
    console.error("Error: sample count must be a positive integer");
    Deno.exit(1);
  }

  console.log(`Starting batch sampling: ${sampleCount} samples...`);
  const result = runBatch(sampleCount);

  console.log(`Completed in ${result.durationMs}ms`);
  console.log(`Found ${result.hardCandidates.length} hard candidates`);
  console.log(
    `Distribution: min=${result.distribution.min}, max=${result.distribution.max}, mean=${result.distribution.mean}`,
  );

  await Deno.writeTextFile(outputPath, JSON.stringify(result, null, 2));
  console.log(`Results saved to: ${outputPath}`);
}
