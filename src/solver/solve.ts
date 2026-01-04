import { Map, Set } from "immutable";
import { makePosition } from "../types/Sudoku.ts";
import type { Digit, Grid, Position } from "../types/Sudoku.ts";
import { getPeers, indices } from "../grid/getPeers.ts";
import { DIGITS } from "../const.ts";

/**
 * Possible digits for a cell: undetermined (size > 1), determined (singleton), or impossible (empty).
 * @example Set([1, 3, 7]) // undetermined
 * @example Set([5])       // determined
 * @example Set()          // impossible
 */
type CandidateSet = Set<Digit>;

/**
 * Undetermined cells mapped to their candidates. Solved when empty; unsolvable if any candidates empty.
 * Determined cells are removed from RemainingCandidateSets (their values exist in Grid).
 * @example
 * Map({
 *   Position({row: 0, col: 0}): Set([1, 3, 7]), // undetermined
 *   Position({row: 0, col: 2}): Set([2, 9]),    // undetermined
 *   // ... only undetermined cells
 * })
 */
type RemainingCandidateSets = Map<Position, CandidateSet>;

/** Set containing all digits, used as initial candidates for empty cells. */
const allDigits: CandidateSet = Set(DIGITS);

/** Initializes RemainingCandidateSets with undetermined cells only (where grid value is undefined). */
const getRemainingCandidateSets = (grid: Grid): RemainingCandidateSets => {
  const entries: [Position, CandidateSet][] = indices.flatMap((row) =>
    indices.flatMap((col) => {
      if (grid[row][col].value !== undefined) return [];

      const pos = makePosition({ row, col });
      const peerValues: CandidateSet = Set(
        getPeers(pos)
          .toArray()
          .flatMap((p) => {
            const value = grid[p.row][p.col].value;
            return value !== undefined ? [value] : [];
          }),
      );

      const entry: [Position, CandidateSet] = [
        pos,
        allDigits.subtract(peerValues),
      ];
      return [entry];
    })
  );
  return Map(entries);
};

/**
 * Result of updating remainingCandidateSets after assigning a digit to a cell.
 * - `ok`: Propagation succeeded, returns updated remainingCandidateSets
 * - `contradiction`: A cell has no remaining candidates (invalid assignment)
 */
type UpdateRemainingCandidateSetsResult =
  | { tag: "ok"; remainingCandidateSets: RemainingCandidateSets }
  | { tag: "contradiction" };

/**
 * Removes the assigned cell from RemainingCandidateSets and propagates constraints to peers.
 * Returns contradiction if any cell has no candidates after propagation.
 */
const updateRemainingCandidateSets = (
  remainingCandidateSets: RemainingCandidateSets,
  pos: Position,
  digit: Digit,
): UpdateRemainingCandidateSetsResult => {
  const peers = getPeers(pos);
  const updated = remainingCandidateSets
    .remove(pos)
    .map((candidates, p) =>
      peers.has(p) ? candidates.remove(digit) : candidates
    );

  if (updated.some((candidates) => candidates.isEmpty())) {
    return { tag: "contradiction" };
  }

  return { tag: "ok", remainingCandidateSets: updated };
};

/** Creates a new grid with the specified cell updated. */
const setCell = (grid: Grid, pos: Position, digit: Digit): Grid =>
  grid.map((row, r) =>
    row.map((cell, c) =>
      r === pos.row && c === pos.col ? { value: digit, isInitial: true } : cell
    )
  );

/** MRV heuristic: select the cell with fewest candidates. Requires non-empty remainingCandidateSets. */
const findMRVCell = (
  remainingCandidateSets: RemainingCandidateSets,
): { position: Position; candidates: CandidateSet } => {
  const entry = remainingCandidateSets.entrySeq().minBy(([_, candidates]) =>
    candidates.size
  );
  return { position: entry![0], candidates: entry![1] };
};

/**
 * Result of backtracking search in a subtree.
 * - `found`: A solution was found in this subtree
 * - `notFound`: No solution exists in this subtree, try other branches
 * - `timeout`: Step limit exceeded, search incomplete
 */
type BacktrackResult =
  | { tag: "found"; grid: Grid }
  | { tag: "notFound" }
  | { tag: "timeout" };

/**
 * Recursive backtracking search with constraint propagation.
 *
 * Uses MRV (Minimum Remaining Values) heuristic to select the next cell,
 * which minimizes branching factor by choosing the most constrained cell first.
 *
 * @param grid - Current grid state (immutable during recursion)
 * @param remainingCandidateSets - Map of undetermined cells to their candidate digits
 * @param remainingSteps - Steps remaining before timeout
 * @returns Found grid if solution exists in subtree, otherwise notFound
 */
const backtrack = (
  grid: Grid,
  remainingCandidateSets: RemainingCandidateSets,
  remainingSteps: number,
): BacktrackResult => {
  if (remainingSteps <= 0) {
    return { tag: "timeout" };
  }

  if (remainingCandidateSets.size === 0) {
    return { tag: "found", grid };
  }

  const mrvCell = findMRVCell(remainingCandidateSets);

  for (const digit of mrvCell.candidates) {
    const updateRemainingCandidateSetsResult = updateRemainingCandidateSets(
      remainingCandidateSets,
      mrvCell.position,
      digit,
    );

    // Pruning: skip if contradiction detected
    if (updateRemainingCandidateSetsResult.tag === "contradiction") {
      continue;
    }

    const newGrid = setCell(grid, mrvCell.position, digit);
    const childResult = backtrack(
      newGrid,
      updateRemainingCandidateSetsResult.remainingCandidateSets,
      remainingSteps - 1,
    );
    if (childResult.tag === "found" || childResult.tag === "timeout") {
      return childResult;
    }
  }

  return { tag: "notFound" };
};

/**
 * Result of solving a Sudoku puzzle.
 * - `solved`: A valid solution was found
 * - `timeout`: Step limit exceeded before finding a solution
 * - `unsolvable`: No solution exists (all branches exhausted)
 */
export type SolveResult =
  | { tag: "solved"; grid: Grid }
  | { tag: "timeout" }
  | { tag: "unsolvable" };

/**
 * Solves a Sudoku puzzle using constraint propagation and backtracking.
 *
 * Algorithm:
 * 1. Calculate initial remainingCandidateSets (possible candidates for each empty cell)
 * 2. Use backtracking with MRV heuristic to find a solution
 * 3. Propagate constraints after each assignment to prune search space
 *
 * @param grid - The Sudoku puzzle to solve (empty cells have undefined value)
 * @param stepLimit - Maximum backtracking steps before timeout (default: Infinity)
 * @returns Solved grid if solution exists, otherwise timeout
 *
 * @example
 * const result = solve(puzzle);
 * if (result.tag === "solved") {
 *   console.log(result.grid);
 * }
 */
export const solve = (
  grid: Grid,
  stepLimit: number = Infinity,
): SolveResult => {
  const remainingCandidateSets = getRemainingCandidateSets(grid);
  const result = backtrack(grid, remainingCandidateSets, stepLimit);
  switch (result.tag) {
    case "found":
      return { tag: "solved", grid: result.grid };
    case "timeout":
      return { tag: "timeout" };
    case "notFound":
      return { tag: "unsolvable" };
  }
};
