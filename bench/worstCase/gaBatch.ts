/// <reference lib="deno.ns" />
import type { BlockConfig } from "./types.ts";
import { evolve } from "./geneticAlgorithm.ts";

/**
 * Genetic Algorithm batch script for worst-case search.
 *
 * Usage:
 *   deno run --allow-write --allow-env gaBatch.ts <outputPath> [seedConfigJson]
 *
 * Environment variables:
 *   GA_POPULATION   - Population size (default: 20)
 *   GA_GENERATIONS  - Number of generations (default: 50)
 *   GA_CROSSOVER    - Crossover rate (default: 0.7)
 *   GA_MUTATION     - Mutation rate (default: 0.3)
 *   GA_TOURNAMENT   - Tournament size (default: 3)
 *   GA_ELITE        - Elite count (default: 2)
 *   GA_STEP_LIMIT   - Step limit for evaluation (default: 12000)
 */

const POPULATION = Number(Deno.env.get("GA_POPULATION")) || 20;
const GENERATIONS = Number(Deno.env.get("GA_GENERATIONS")) || 50;
const CROSSOVER = Number(Deno.env.get("GA_CROSSOVER")) || 0.7;
const MUTATION = Number(Deno.env.get("GA_MUTATION")) || 0.3;
const TOURNAMENT = Number(Deno.env.get("GA_TOURNAMENT")) || 3;
const ELITE = Number(Deno.env.get("GA_ELITE")) || 2;
const STEP_LIMIT = Number(Deno.env.get("GA_STEP_LIMIT")) || 12_000;

const main = async (): Promise<void> => {
  const args = Deno.args;

  if (args.length < 1) {
    console.error(
      "Usage: deno run --allow-write --allow-env gaBatch.ts <outputPath> [seedConfigJson]",
    );
    Deno.exit(1);
  }

  const outputPath = args[0];
  const seedConfig = args[1] ? (JSON.parse(args[1]) as BlockConfig) : null;

  console.log(
    `Starting GA with ${POPULATION} individuals, ${GENERATIONS} generations...`,
  );
  if (seedConfig) {
    console.log(`Seed config: ${JSON.stringify(seedConfig)}`);
  }

  const startTime = performance.now();

  const result = evolve(seedConfig, {
    populationSize: POPULATION,
    generations: GENERATIONS,
    crossoverRate: CROSSOVER,
    mutationRate: MUTATION,
    tournamentSize: TOURNAMENT,
    eliteCount: ELITE,
    stepLimit: STEP_LIMIT,
  });

  const durationMs = Math.round(performance.now() - startTime);

  console.log(`Completed in ${durationMs}ms`);
  console.log(`Best: ${result.bestFitness} steps`);
  console.log(`Evaluations: ${result.evaluations}`);

  const output = {
    best: result.best,
    bestFitness: result.bestFitness,
    generations: result.generations,
    evaluations: result.evaluations,
    durationMs,
  };

  await Deno.writeTextFile(outputPath, JSON.stringify(output, null, 2));
  console.log(`Results saved to: ${outputPath}`);
};

main().catch(console.error);
