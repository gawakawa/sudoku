import type { Digit } from "../../src/types/Sudoku.ts";
import type { BlockConfig } from "./types.ts";
import { evaluateConfig, generateRandomConfig } from "./evaluate.ts";

/**
 * Individual in the population.
 */
export type Individual = {
  config: BlockConfig;
  fitness: number;
};

/**
 * GA options.
 */
export type GAOptions = {
  populationSize: number;
  generations: number;
  crossoverRate: number;
  mutationRate: number;
  tournamentSize: number;
  eliteCount: number;
  stepLimit: number;
};

/**
 * GA result.
 */
export type GAResult = {
  best: BlockConfig;
  bestFitness: number;
  generations: number;
  evaluations: number;
};

/**
 * Evaluate fitness of a configuration (higher = harder to solve = better).
 */
const evaluateFitness = (config: BlockConfig, stepLimit: number): number =>
  evaluateConfig(config, stepLimit).stepsUsed;

/**
 * Initialize population with seed config and random configs.
 */
const initPopulation = (
  size: number,
  seed: BlockConfig | null,
  stepLimit: number,
): Individual[] => {
  const population: Individual[] = [];

  // Add seed config if provided
  if (seed) {
    population.push({
      config: seed,
      fitness: evaluateFitness(seed, stepLimit),
    });
  }

  // Fill rest with random configs
  while (population.length < size) {
    const config = generateRandomConfig();
    population.push({
      config,
      fitness: evaluateFitness(config, stepLimit),
    });
  }

  return population;
};

/**
 * Tournament selection: pick k random individuals, return the best.
 */
const tournamentSelect = (population: Individual[], k: number): Individual => {
  let best: Individual | null = null;

  for (let i = 0; i < k; i++) {
    const idx = Math.floor(Math.random() * population.length);
    const candidate = population[idx];
    if (!best || candidate.fitness > best.fitness) {
      best = candidate;
    }
  }

  return best!;
};

/**
 * Crossover: for each block, randomly choose from parent1 or parent2.
 */
const crossover = (p1: BlockConfig, p2: BlockConfig): BlockConfig =>
  [
    Math.random() < 0.5 ? [...p1[0]] : [...p2[0]],
    Math.random() < 0.5 ? [...p1[1]] : [...p2[1]],
    Math.random() < 0.5 ? [...p1[2]] : [...p2[2]],
  ] as BlockConfig;

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

/** Mutate: with given probability, swap two positions in a random block. */
const mutate = (config: BlockConfig, rate: number): BlockConfig => {
  if (Math.random() >= rate) return config;

  const blockIdx = Math.floor(Math.random() * 3) as 0 | 1 | 2;
  const i = Math.floor(Math.random() * 9);
  let j = Math.floor(Math.random() * 8);
  if (j >= i) j++;

  return [
    blockIdx === 0 ? swapInBlock(config[0], i, j) : [...config[0]],
    blockIdx === 1 ? swapInBlock(config[1], i, j) : [...config[1]],
    blockIdx === 2 ? swapInBlock(config[2], i, j) : [...config[2]],
  ] as BlockConfig;
};

/**
 * Run genetic algorithm to find worst-case configurations.
 */
export const evolve = (
  seed: BlockConfig | null,
  options: GAOptions,
): GAResult => {
  const {
    populationSize,
    generations,
    crossoverRate,
    mutationRate,
    tournamentSize,
    eliteCount,
    stepLimit,
  } = options;

  let population = initPopulation(populationSize, seed, stepLimit);
  let evaluations = populationSize;

  // Track global best
  let globalBest = population.reduce((a, b) => a.fitness > b.fitness ? a : b);

  for (let gen = 0; gen < generations; gen++) {
    // Sort by fitness (descending)
    population.sort((a, b) => b.fitness - a.fitness);

    // Update global best
    if (population[0].fitness > globalBest.fitness) {
      globalBest = population[0];
      console.log(`Gen ${gen}: New best = ${globalBest.fitness}`);
    }

    // Create next generation
    const nextGen: Individual[] = [];

    // Elitism: keep top individuals
    for (let i = 0; i < eliteCount && i < population.length; i++) {
      nextGen.push(population[i]);
    }

    // Fill rest with offspring
    while (nextGen.length < populationSize) {
      const parent1 = tournamentSelect(population, tournamentSize);
      const parent2 = tournamentSelect(population, tournamentSize);

      let offspring: BlockConfig;
      if (Math.random() < crossoverRate) {
        offspring = crossover(parent1.config, parent2.config);
      } else {
        offspring = [...parent1.config] as BlockConfig;
      }

      offspring = mutate(offspring, mutationRate);

      const fitness = evaluateFitness(offspring, stepLimit);
      evaluations++;

      nextGen.push({ config: offspring, fitness });
    }

    population = nextGen;
  }

  return {
    best: globalBest.config,
    bestFitness: globalBest.fitness,
    generations,
    evaluations,
  };
};
