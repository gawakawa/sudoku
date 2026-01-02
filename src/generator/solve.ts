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

const calcDomain = (_grid: Grid): Domain => Map();

/**
 * Selects the next cell to fill using the MRV (Minimum Remaining Values) heuristic.
 * Choosing the cell with the fewest candidates reduces the search branching factor.
 * Only considers undetermined cells (size > 1); singletons are already determined.
 * @returns Position of the undetermined cell with fewest candidates, or undefined if all determined
 */
const findMRVCell = (domain: Domain): Position | undefined =>
  domain
    .filter((candidates) => candidates.size > 1)
    .entrySeq()
    .minBy(([_, candidates]) => candidates.size)?.[0];

const setCell = (_grid: Grid, _pos: Position, _value: Digit): Grid => _grid;

/** Returns undefined if a contradiction is detected (any cell has no candidates). */
const updateDomain = (
  domain: Domain,
  _pos: Position,
  _digit: Digit,
): Domain | undefined => domain;

const backtrack = (grid: Grid, domain: Domain): Grid | undefined => {
  const pos = findMRVCell(domain);

  // All cells are singletons = solved
  if (pos === undefined) {
    return grid;
  }

  // Safe: findMRVCell guarantees size > 1
  const candidates = domain.get(pos)!;

  for (const digit of candidates) {
    const newGrid = setCell(grid, pos, digit);
    const newDomain = updateDomain(domain, pos, digit);

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
