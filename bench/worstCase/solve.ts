/**
 * Instrumented Sudoku solver for benchmarking.
 *
 * This is a copy of src/generator/solve.ts with step tracking for
 * measuring solver effort. Keep this separate from the main solver
 * to avoid polluting production code with benchmarking logic.
 */

import { Map, Set } from "immutable";
import { makePosition } from "../../src/types/Sudoku.ts";
import type { Digit, Grid, Position } from "../../src/types/Sudoku.ts";
import { getPeers } from "../../src/grid/getPeers.ts";
import { COL_INDICES, DIGITS, ROW_INDICES } from "../../src/const.ts";

type Candidates = Set<Digit>;
type Domain = Map<Position, Candidates>;

const allDigits: Candidates = Set(DIGITS);

const calcDomain = (grid: Grid): Domain => {
  const entries: [Position, Candidates][] = ROW_INDICES.flatMap((row) =>
    COL_INDICES.flatMap((col) => {
      if (grid[row][col].value !== undefined) return [];

      const pos = makePosition({ row, col });
      const peerValues: Candidates = Set(
        getPeers(pos)
          .toArray()
          .flatMap((p) => {
            const value = grid[p.row][p.col].value;
            return value !== undefined ? [value] : [];
          }),
      );

      const entry: [Position, Candidates] = [
        pos,
        allDigits.subtract(peerValues),
      ];
      return [entry];
    })
  );
  return Map(entries);
};

type UpdateDomainResult =
  | { tag: "ok"; domain: Domain }
  | { tag: "contradiction" };

const updateDomain = (
  domain: Domain,
  pos: Position,
  digit: Digit,
): UpdateDomainResult => {
  const peers = getPeers(pos);
  const updated = domain
    .remove(pos)
    .map((candidates, p) =>
      peers.has(p) ? candidates.remove(digit) : candidates
    );

  if (updated.some((candidates) => candidates.isEmpty())) {
    return { tag: "contradiction" };
  }

  return { tag: "ok", domain: updated };
};

const setCell = (grid: Grid, pos: Position, digit: Digit): Grid =>
  grid.map((row, r) =>
    row.map((cell, c) =>
      r === pos.row && c === pos.col ? { value: digit, isInitial: true } : cell
    )
  );

const findMRVCell = (
  domain: Domain,
): { position: Position; candidates: Candidates } => {
  const entry = domain.entrySeq().minBy(([_, candidates]) => candidates.size);
  return { position: entry![0], candidates: entry![1] };
};

type BacktrackResult =
  | { tag: "found"; grid: Grid; remainingSteps: number }
  | { tag: "notFound"; remainingSteps: number };

const backtrack = (
  grid: Grid,
  domain: Domain,
  remainingSteps: number,
): BacktrackResult => {
  if (remainingSteps <= 0) {
    return { tag: "notFound", remainingSteps: 0 };
  }

  if (domain.size === 0) {
    return { tag: "found", grid, remainingSteps };
  }

  const mrvCell = findMRVCell(domain);
  const candidates = mrvCell.candidates.toArray();
  let steps = remainingSteps;

  for (const digit of candidates) {
    if (steps <= 0) break;

    const updateResult = updateDomain(domain, mrvCell.position, digit);
    if (updateResult.tag === "contradiction") continue;

    const newGrid = setCell(grid, mrvCell.position, digit);
    const childResult = backtrack(newGrid, updateResult.domain, steps - 1);

    if (childResult.tag === "found") {
      return childResult;
    }

    steps = childResult.remainingSteps;
  }

  return { tag: "notFound", remainingSteps: steps };
};

export type SolveMetrics = {
  stepsUsed: number;
};

export type SolveResultWithMetrics =
  | { tag: "solved"; grid: Grid; metrics: SolveMetrics }
  | { tag: "timeout"; metrics: SolveMetrics };

/**
 * Solves a Sudoku puzzle and returns detailed metrics about solver effort.
 *
 * @param grid - The Sudoku puzzle to solve
 * @param stepLimit - Maximum backtracking steps before timeout
 * @returns Solved grid with metrics, or timeout with metrics
 */
export const solveWithMetrics = (
  grid: Grid,
  stepLimit: number,
): SolveResultWithMetrics => {
  const domain = calcDomain(grid);
  const result = backtrack(grid, domain, stepLimit);
  const stepsUsed = stepLimit - result.remainingSteps;
  const metrics: SolveMetrics = { stepsUsed };

  return result.tag === "found"
    ? { tag: "solved", grid: result.grid, metrics }
    : { tag: "timeout", metrics };
};
