import { Map, Set } from "immutable";
import type { Digit, Grid, Position } from "../types/Sudoku.ts";

/**
 * Possible digits for a cell: undetermined (size > 1), determined (singleton), or impossible (empty).
 * @example Set([1, 3, 7]) // undetermined
 * @example Set([5])       // determined
 * @example Set()          // impossible
 */
type Candidates = Set<Digit>;

/**
 * All 81 cells mapped to their candidates. Solved when all singletons; unsolvable if any empty.
 * @example
 * Map({
 *   Position({row: 0, col: 0}): Set([5]),       // determined
 *   Position({row: 0, col: 1}): Set([1, 3, 7]), // undetermined
 *   // ... all 81 cells
 * })
 */
type Domain = Map<Position, Candidates>;

/** Result of finding the next cell to fill using MRV heuristic. */
type MRVResult =
  | { tag: "solved" }
  | { tag: "found"; position: Position };

const calcDomain = (_grid: Grid): Domain => Map();

/**
 * Selects the next cell to fill using the MRV (Minimum Remaining Values) heuristic.
 * Choosing the cell with the fewest candidates reduces the search branching factor.
 * Only considers undetermined cells (size > 1); singletons are already determined.
 */
const findMRVCell = (domain: Domain): MRVResult => {
  const pos = domain
    .filter((candidates) => candidates.size > 1)
    .entrySeq()
    .minBy(([_, candidates]) => candidates.size)?.[0];

  return pos === undefined
    ? { tag: "solved" }
    : { tag: "found", position: pos };
};

const setCell = (_grid: Grid, _pos: Position, _value: Digit): Grid => _grid;

/** Returns undefined if a contradiction is detected (any cell has no candidates). */
const updateDomain = (
  domain: Domain,
  _pos: Position,
  _digit: Digit,
): Domain | undefined => domain;

const backtrack = (grid: Grid, domain: Domain): Grid | undefined => {
  const mrvResult = findMRVCell(domain);

  if (mrvResult.tag === "solved") {
    return grid;
  }

  // Safe: Domain contains all 81 positions
  const candidates = domain.get(mrvResult.position)!;

  for (const digit of candidates) {
    const newGrid = setCell(grid, mrvResult.position, digit);
    const newDomain = updateDomain(domain, mrvResult.position, digit);

    // Pruning: skip if contradiction detected
    if (newDomain === undefined) {
      continue;
    }

    const result = backtrack(newGrid, newDomain);
    if (result !== undefined) {
      return result;
    }
  }

  return undefined;
};

export const solve = (grid: Grid): Grid | undefined => {
  const domain = calcDomain(grid);
  return backtrack(grid, domain);
};
