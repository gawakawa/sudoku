import { Map, Set } from "immutable";
import { makePosition } from "../types/Sudoku.ts";
import type { Digit, Grid, Position } from "../types/Sudoku.ts";
import { getAffectedPositions, indices } from "../utils/position.ts";

/**
 * Possible digits for a cell: undetermined (size > 1), determined (singleton), or impossible (empty).
 * @example Set([1, 3, 7]) // undetermined
 * @example Set([5])       // determined
 * @example Set()          // impossible
 */
type Candidates = Set<Digit>;

/**
 * Undetermined cells mapped to their candidates. Solved when empty; unsolvable if any candidates empty.
 * Determined cells are removed from Domain (their values exist in Grid).
 * @example
 * Map({
 *   Position({row: 0, col: 0}): Set([1, 3, 7]), // undetermined
 *   Position({row: 0, col: 2}): Set([2, 9]),    // undetermined
 *   // ... only undetermined cells
 * })
 */
type Domain = Map<Position, Candidates>;

/** All valid Sudoku digits (1-9). */
const digits: readonly Digit[] = [1, 2, 3, 4, 5, 6, 7, 8, 9];

/** Set containing all digits, used as initial candidates for empty cells. */
const allDigits: Candidates = Set(digits);

/** Initializes Domain with undetermined cells only (where grid value is undefined). */
const calcDomain = (grid: Grid): Domain => {
  const entries: [Position, Candidates][] = indices.flatMap((row) =>
    indices.flatMap((col) => {
      if (grid[row][col].value !== undefined) return [];

      const pos = makePosition({ row, col });
      const peerValues: Candidates = Set(
        getAffectedPositions(pos)
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

/**
 * Result of updating domain after assigning a digit to a cell.
 * - `ok`: Propagation succeeded, returns updated domain
 * - `contradiction`: A cell has no remaining candidates (invalid assignment)
 */
type UpdateDomainResult =
  | { tag: "ok"; domain: Domain }
  | { tag: "contradiction" };

/**
 * Removes the assigned cell from Domain and propagates constraints to peers.
 * Returns contradiction if any cell has no candidates after propagation.
 */
const updateDomain = (
  domain: Domain,
  pos: Position,
  digit: Digit,
): UpdateDomainResult => {
  const peers = getAffectedPositions(pos);
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

/** Creates a new grid with the specified cell updated. */
const setCell = (grid: Grid, pos: Position, digit: Digit): Grid =>
  grid.map((row, r) =>
    row.map((cell, c) =>
      r === pos.row && c === pos.col ? { value: digit, isInitial: true } : cell
    )
  );

/** MRV heuristic: select the cell with fewest candidates. Requires non-empty domain. */
const findMRVCell = (
  domain: Domain,
): { position: Position; candidates: Candidates } => {
  const entry = domain.entrySeq().minBy(([_, candidates]) => candidates.size);
  return { position: entry![0], candidates: entry![1] };
};

/**
 * Result of solving a Sudoku puzzle.
 * - `solved`: A valid solution was found
 * - `unsolvable`: No valid solution exists for the given puzzle
 */
export type SolveResult = { tag: "solved"; grid: Grid } | { tag: "unsolvable" };

/**
 * Recursive backtracking search with constraint propagation.
 *
 * Uses MRV (Minimum Remaining Values) heuristic to select the next cell,
 * which minimizes branching factor by choosing the most constrained cell first.
 *
 * @param grid - Current grid state (immutable during recursion)
 * @param domain - Map of undetermined cells to their candidate digits
 * @returns Solved grid if solution exists, otherwise unsolvable
 */
const backtrack = (grid: Grid, domain: Domain): SolveResult => {
  if (domain.size === 0) {
    return { tag: "solved", grid };
  }

  const mrvCell = findMRVCell(domain);

  for (const digit of mrvCell.candidates) {
    const updateDomainResult = updateDomain(domain, mrvCell.position, digit);

    // Pruning: skip if contradiction detected
    if (updateDomainResult.tag === "contradiction") {
      continue;
    }

    const newGrid = setCell(grid, mrvCell.position, digit);
    const solveResult = backtrack(newGrid, updateDomainResult.domain);
    if (solveResult.tag === "solved") {
      return solveResult;
    }
  }

  return { tag: "unsolvable" };
};

/**
 * Solves a Sudoku puzzle using constraint propagation and backtracking.
 *
 * Algorithm:
 * 1. Calculate initial domain (possible candidates for each empty cell)
 * 2. Use backtracking with MRV heuristic to find a solution
 * 3. Propagate constraints after each assignment to prune search space
 *
 * @param grid - The Sudoku puzzle to solve (empty cells have undefined value)
 * @returns Solved grid if solution exists, otherwise unsolvable
 *
 * @example
 * const result = solve(puzzle);
 * if (result.tag === "solved") {
 *   console.log(result.grid);
 * }
 */
export const solve = (grid: Grid): SolveResult => {
  const domain = calcDomain(grid);
  return backtrack(grid, domain);
};
