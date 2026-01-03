/// <reference lib="deno.ns" />
import { generateInitialGrid } from "../src/generator/generateInitialGrid.ts";

Deno.bench("generateInitialGrid", () => {
  generateInitialGrid();
});
