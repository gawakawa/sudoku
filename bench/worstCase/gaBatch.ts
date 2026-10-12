import { writeFile } from "node:fs/promises";
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

const POPULATION = Number(process.env.GA_POPULATION) || 20;
const GENERATIONS = Number(process.env.GA_GENERATIONS) || 50;
const CROSSOVER = Number(process.env.GA_CROSSOVER) || 0.7;
const MUTATION = Number(process.env.GA_MUTATION) || 0.3;
const TOURNAMENT = Number(process.env.GA_TOURNAMENT) || 3;
const ELITE = Number(process.env.GA_ELITE) || 2;
const STEP_LIMIT = Number(process.env.GA_STEP_LIMIT) || 12_000;

const main = async (): Promise<void> => {
  const args = process.argv.slice(2);

  if (args.length < 1) {
    console.error(
      "Usage: deno run --allow-write --allow-env gaBatch.ts <outputPath> [seedConfigJson]",
    );
    process.exit(1);
  }

  const outputPath = args[0];
  const seedConfig = args[1] ? (JSON.parse(args[1]) as BlockConfig) : null;

  console.log(`Starting GA with ${POPULATION} individuals, ${GENERATIONS} generations...`);
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

  await writeFile(outputPath, JSON.stringify(output, null, 2));
  console.log(`Results saved to: ${outputPath}`);
};

main().catch(console.error);
