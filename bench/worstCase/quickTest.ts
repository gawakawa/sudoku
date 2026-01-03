/// <reference lib="deno.ns" />
import { evaluateHardCandidates, fastScreening, hillClimb } from "./search.ts";

const SCREENING_LIMIT = 2_000;
const DEEP_LIMIT = 10_000;

console.log("Quick test with 10,000 samples...");
const { hardCandidates, distribution } = fastScreening(10_000, SCREENING_LIMIT);
console.log(`Found ${hardCandidates.length} hard candidates`);
console.log("Distribution:", distribution);

if (hardCandidates.length > 0) {
  console.log("\nDeep evaluation of hard candidates...");
  const evaluated = evaluateHardCandidates(hardCandidates, DEEP_LIMIT);
  console.log(
    "Top step counts:",
    evaluated.slice(0, 5).map((r) => r.stepsUsed),
  );

  console.log("\nHill climbing from best...");
  const result = hillClimb(evaluated[0].config, DEEP_LIMIT, 50);
  console.log("After hill climb:", result.stepsUsed, "steps");
  console.log("Config:", result.best);
} else {
  console.log("No hard candidates found.");
}
