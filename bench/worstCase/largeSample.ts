/// <reference lib="deno.ns" />
import type { BlockConfig } from "./types.ts";
import { evaluateConfig, generateRandomConfig } from "./evaluate.ts";

/**
 * Large-scale random sampling to find high-step configurations.
 *
 * Usage:
 *   deno run --allow-write --allow-env largeSample.ts <outputPath>
 *
 * Environment variables:
 *   SAMPLE_SIZE     - Number of configs to sample (default: 100000)
 *   STEP_LIMIT      - Step limit for evaluation (default: 15000)
 *   THRESHOLD       - Minimum steps to keep (default: 5000)
 *   TOP_K           - Number of top configs to save (default: 100)
 */

const SAMPLE_SIZE = Number(Deno.env.get("SAMPLE_SIZE")) || 100_000;
const STEP_LIMIT = Number(Deno.env.get("STEP_LIMIT")) || 15_000;
const THRESHOLD = Number(Deno.env.get("THRESHOLD")) || 5_000;
const TOP_K = Number(Deno.env.get("TOP_K")) || 100;

type SampleResult = {
  config: BlockConfig;
  steps: number;
};

const main = async (): Promise<void> => {
  const args = Deno.args;

  if (args.length < 1) {
    console.error(
      "Usage: deno run --allow-write --allow-env largeSample.ts <outputPath>",
    );
    Deno.exit(1);
  }

  const outputPath = args[0];

  console.log(`Sampling ${SAMPLE_SIZE} configs...`);
  console.log(`Step limit: ${STEP_LIMIT}, Threshold: ${THRESHOLD}`);

  const startTime = performance.now();
  const topConfigs: SampleResult[] = [];
  let maxSteps = 0;
  let maxConfig: BlockConfig | null = null;
  let aboveThreshold = 0;

  for (let i = 0; i < SAMPLE_SIZE; i++) {
    const config = generateRandomConfig();
    const result = evaluateConfig(config, STEP_LIMIT);
    const steps = result.stepsUsed;

    if (steps > maxSteps) {
      maxSteps = steps;
      maxConfig = config;
      console.log(`New max at ${i}: ${steps} steps`);
    }

    if (steps >= THRESHOLD) {
      aboveThreshold++;
      topConfigs.push({ config, steps });

      // Keep only top K
      if (topConfigs.length > TOP_K * 2) {
        topConfigs.sort((a, b) => b.steps - a.steps);
        topConfigs.length = TOP_K;
      }
    }

    // Progress every 10000
    if ((i + 1) % 10000 === 0) {
      console.log(`Progress: ${i + 1}/${SAMPLE_SIZE}, max so far: ${maxSteps}`);
    }
  }

  const durationMs = Math.round(performance.now() - startTime);

  // Final sort and trim
  topConfigs.sort((a, b) => b.steps - a.steps);
  topConfigs.length = Math.min(topConfigs.length, TOP_K);

  console.log(`\nCompleted in ${durationMs}ms`);
  console.log(`Max steps: ${maxSteps}`);
  console.log(`Above threshold (${THRESHOLD}): ${aboveThreshold}`);
  console.log(`Top configs saved: ${topConfigs.length}`);

  const output = {
    sampleSize: SAMPLE_SIZE,
    stepLimit: STEP_LIMIT,
    threshold: THRESHOLD,
    maxSteps,
    maxConfig,
    aboveThreshold,
    topConfigs,
    durationMs,
  };

  await Deno.writeTextFile(outputPath, JSON.stringify(output, null, 2));
  console.log(`Results saved to: ${outputPath}`);
};

main().catch(console.error);
