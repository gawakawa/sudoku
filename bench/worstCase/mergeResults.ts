/// <reference lib="deno.ns" />
import type { BlockConfig, DistributionStats } from "./types.ts";
import type { BatchResult } from "./sampleBatch.ts";

/**
 * Merge multiple batch results into a single result.
 *
 * Usage: deno run --allow-read mergeResults.ts <file1> <file2> ...
 */

export type MergedResult = {
  hardCandidates: BlockConfig[];
  distribution: DistributionStats;
  totalSamples: number;
  totalDurationMs: number;
  batchCount: number;
};

export const mergeResults = (batches: BatchResult[]): MergedResult => {
  const allCandidates: BlockConfig[] = [];
  let totalSamples = 0;
  let totalDuration = 0;

  // Collect all hard candidates
  for (const batch of batches) {
    allCandidates.push(...batch.hardCandidates);
    totalSamples += batch.sampleCount;
    totalDuration += batch.durationMs;
  }

  // Weighted average for distribution stats
  const weightedMin = Math.min(...batches.map((b) => b.distribution.min));
  const weightedMax = Math.max(...batches.map((b) => b.distribution.max));
  const weightedMean = Math.round(
    batches.reduce((acc, b) => acc + b.distribution.mean * b.sampleCount, 0) /
      totalSamples,
  );
  const weightedP95 = Math.round(
    batches.reduce(
      (acc, b) => acc + b.distribution.percentile95 * b.sampleCount,
      0,
    ) / totalSamples,
  );

  return {
    hardCandidates: allCandidates,
    distribution: {
      min: weightedMin,
      max: weightedMax,
      mean: weightedMean,
      percentile95: weightedP95,
    },
    totalSamples,
    totalDurationMs: totalDuration,
    batchCount: batches.length,
  };
};

// CLI entry point
if (import.meta.main) {
  const args = Deno.args;

  if (args.length < 1) {
    console.error(
      "Usage: deno run --allow-read mergeResults.ts <file1> <file2> ...",
    );
    Deno.exit(1);
  }

  const batches: BatchResult[] = [];

  for (const filePath of args) {
    try {
      const content = await Deno.readTextFile(filePath);
      const batch = JSON.parse(content) as BatchResult;
      batches.push(batch);
      console.log(
        `Loaded ${filePath}: ${batch.hardCandidates.length} candidates`,
      );
    } catch (e) {
      console.error(`Failed to load ${filePath}:`, e);
      Deno.exit(1);
    }
  }

  const merged = mergeResults(batches);

  console.log("\n=== Merged Results ===");
  console.log(`Total samples: ${merged.totalSamples}`);
  console.log(`Total hard candidates: ${merged.hardCandidates.length}`);
  console.log(
    `Total duration: ${merged.totalDurationMs}ms (sum of all batches)`,
  );
  console.log(
    `Distribution: min=${merged.distribution.min}, max=${merged.distribution.max}, mean=${merged.distribution.mean}, p95=${merged.distribution.percentile95}`,
  );

  // Output merged JSON
  const outputPath = "/tmp/merged_results.json";
  await Deno.writeTextFile(outputPath, JSON.stringify(merged, null, 2));
  console.log(`\nMerged results saved to: ${outputPath}`);
}
