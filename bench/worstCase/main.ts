/// <reference lib="deno.ns" />
import type { SearchOutput } from "./types.ts";
import {
  evaluateHardCandidates,
  fastScreening,
  multiStartHillClimb,
} from "./search.ts";

// Configuration
const SCREENING_SAMPLES = 1_000_000;
const SCREENING_STEP_LIMIT = 2_000; // Fast screening
const DEEP_EVAL_STEP_LIMIT = 100_000; // Deep evaluation
const TOP_K_FOR_HILL_CLIMB = 10;
const HILL_CLIMB_ITERATIONS = 500;

const formatDuration = (ms: number): string => {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${(ms / 60000).toFixed(1)}m`;
};

const main = async (): Promise<void> => {
  console.log("=== Worst-Case Sudoku Configuration Search ===\n");
  console.log("Parameters:");
  console.log(`  Screening samples: ${SCREENING_SAMPLES.toLocaleString()}`);
  console.log(
    `  Screening step limit: ${SCREENING_STEP_LIMIT.toLocaleString()}`,
  );
  console.log(
    `  Deep eval step limit: ${DEEP_EVAL_STEP_LIMIT.toLocaleString()}`,
  );
  console.log(`  Top K for hill climb: ${TOP_K_FOR_HILL_CLIMB}`);
  console.log(`  Hill climb iterations: ${HILL_CLIMB_ITERATIONS}`);
  console.log("");

  // Phase A: Fast Screening
  console.log(
    `[Phase A] Fast screening (${SCREENING_SAMPLES.toLocaleString()} configs, limit=${SCREENING_STEP_LIMIT})...`,
  );
  const screeningStart = performance.now();

  const { hardCandidates, distribution } = fastScreening(
    SCREENING_SAMPLES,
    SCREENING_STEP_LIMIT,
    (current, total, hardCount) => {
      const pct = Math.floor((current / total) * 100);
      console.log(
        `  Progress: ${current.toLocaleString()}/${total.toLocaleString()} (${pct}%) - Found ${hardCount} hard configs`,
      );
    },
  );

  const screeningDuration = performance.now() - screeningStart;
  console.log(`  Completed in ${formatDuration(screeningDuration)}`);
  console.log(`  Found ${hardCandidates.length} hard candidates (hit limit)`);
  console.log(
    `  Distribution: min=${distribution.min}, max=${distribution.max}, mean=${distribution.mean}, p95=${distribution.percentile95}`,
  );
  console.log("");

  if (hardCandidates.length === 0) {
    console.log("No hard candidates found. Try lowering SCREENING_STEP_LIMIT.");
    return;
  }

  // Phase B: Deep Evaluation
  console.log(
    `[Phase B] Deep evaluation of ${hardCandidates.length} candidates (limit=${DEEP_EVAL_STEP_LIMIT})...`,
  );
  const deepEvalStart = performance.now();

  const evaluated = evaluateHardCandidates(
    hardCandidates,
    DEEP_EVAL_STEP_LIMIT,
    (current, total) => {
      if (current % 100 === 0 || current === total - 1) {
        console.log(`  Progress: ${current}/${total}`);
      }
    },
  );

  const deepEvalDuration = performance.now() - deepEvalStart;
  console.log(`  Completed in ${formatDuration(deepEvalDuration)}`);
  console.log(
    `  Top step counts: [${
      evaluated.slice(0, 5).map((r) => r.stepsUsed).join(", ")
    }]`,
  );
  console.log("");

  // Phase C: Hill Climbing
  const topCandidates = evaluated.slice(0, TOP_K_FOR_HILL_CLIMB);
  console.log(
    `[Phase C] Hill climbing from top ${topCandidates.length} candidates...`,
  );
  const hillClimbStart = performance.now();

  const hillClimbResult = multiStartHillClimb(
    topCandidates,
    DEEP_EVAL_STEP_LIMIT,
    HILL_CLIMB_ITERATIONS,
    (climbIdx, total, currentBest) => {
      console.log(
        `  Hill climb ${climbIdx}/${total}, current best: ${currentBest} steps`,
      );
    },
  );

  const hillClimbDuration = performance.now() - hillClimbStart;
  console.log(`  Completed in ${formatDuration(hillClimbDuration)}`);
  console.log("");

  // Results
  const totalDuration = screeningDuration + deepEvalDuration +
    hillClimbDuration;
  console.log("=== RESULT ===");
  console.log(`Worst-case steps: ${hillClimbResult.stepsUsed}`);
  console.log(`Block 0: [${hillClimbResult.best[0].join(", ")}]`);
  console.log(`Block 1: [${hillClimbResult.best[1].join(", ")}]`);
  console.log(`Block 2: [${hillClimbResult.best[2].join(", ")}]`);
  console.log(
    `Total configs evaluated: ${
      (SCREENING_SAMPLES + hardCandidates.length +
        hillClimbResult.samplesEvaluated).toLocaleString()
    }`,
  );
  console.log(`Total time: ${formatDuration(totalDuration)}`);
  console.log("");

  // Save to JSON
  const output: SearchOutput = {
    timestamp: new Date().toISOString(),
    stepsUsed: hillClimbResult.stepsUsed,
    best: hillClimbResult.best,
    samplesEvaluated: SCREENING_SAMPLES + hardCandidates.length +
      hillClimbResult.samplesEvaluated,
    distribution,
  };

  const outputPath = new URL("./results/latest.json", import.meta.url).pathname;
  await Deno.writeTextFile(outputPath, JSON.stringify(output, null, 2));
  console.log(`Results saved to: ${outputPath}`);
};

main().catch(console.error);
