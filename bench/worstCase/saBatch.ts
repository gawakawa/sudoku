/// <reference lib="deno.ns" />
import type { BlockConfig } from "./types.ts";
import { generateRandomConfig } from "./evaluate.ts";
import { simulatedAnnealing } from "./simulatedAnnealing.ts";

/**
 * Simulated Annealing batch script for sub-agent parallel execution.
 *
 * Usage:
 *   deno run --allow-write --allow-env saBatch.ts <outputPath> [startConfigJson]
 *
 * Environment variables:
 *   SA_ITERATIONS   - Number of iterations (default: 10000)
 *   SA_COOLING_RATE - Cooling rate (default: 0.9995)
 *   SA_STEP_LIMIT   - Step limit for solver (default: 10000)
 *   SA_INITIAL_TEMP - Initial temperature (default: 500)
 *   SA_MULTI_BLOCK  - Use multi-block neighbor (default: false)
 *
 * Examples:
 *   deno run --allow-write --allow-env saBatch.ts /tmp/sa_1.json
 *   SA_ITERATIONS=5000 deno run --allow-write --allow-env saBatch.ts /tmp/sa_2.json '[...]'
 */

const STEP_LIMIT = Number(Deno.env.get("SA_STEP_LIMIT")) || 10_000;
const INITIAL_TEMP = Number(Deno.env.get("SA_INITIAL_TEMP")) || 500;
const COOLING_RATE = Number(Deno.env.get("SA_COOLING_RATE")) || 0.9995;
const ITERATIONS = Number(Deno.env.get("SA_ITERATIONS")) || 10_000;
const MULTI_BLOCK = Deno.env.get("SA_MULTI_BLOCK") === "true";

const main = async (): Promise<void> => {
  const args = Deno.args;

  if (args.length < 1) {
    console.error(
      "Usage: deno run --allow-write saBatch.ts <outputPath> [startConfigJson]",
    );
    Deno.exit(1);
  }

  const outputPath = args[0];
  const startConfig = args[1] ? (JSON.parse(args[1]) as BlockConfig) : null;

  const initial = startConfig || generateRandomConfig();

  console.log(`Starting SA with ${ITERATIONS} iterations...`);
  console.log(`Initial config: ${JSON.stringify(initial)}`);

  const startTime = performance.now();

  const result = simulatedAnnealing(initial, STEP_LIMIT, {
    initialTemp: INITIAL_TEMP,
    coolingRate: COOLING_RATE,
    iterations: ITERATIONS,
    multiBlock: MULTI_BLOCK,
  });

  const durationMs = Math.round(performance.now() - startTime);

  console.log(`Completed in ${durationMs}ms`);
  console.log(`Best: ${result.bestSteps} steps`);
  console.log(`Accepted worse: ${result.acceptedWorse} times`);

  const output = {
    best: result.best,
    bestSteps: result.bestSteps,
    iterations: result.iterations,
    acceptedWorse: result.acceptedWorse,
    durationMs,
  };

  await Deno.writeTextFile(outputPath, JSON.stringify(output, null, 2));
  console.log(`Results saved to: ${outputPath}`);
};

main().catch(console.error);
