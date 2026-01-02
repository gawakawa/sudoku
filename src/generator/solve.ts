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
  | { tag: "found"; position: Position; candidates: Candidates };

const calcDomain = (_grid: Grid): Domain => Map();

/**
 * Selects the next cell to fill using the MRV (Minimum Remaining Values) heuristic.
 * Choosing the cell with the fewest candidates reduces the search branching factor.
 * Only considers undetermined cells (size > 1); singletons are already determined.
 */
const findMRVCell = (domain: Domain): MRVResult => {
  const entry = domain
    .filter((candidates) => candidates.size > 1)
    .entrySeq()
    .minBy(([_, candidates]) => candidates.size);

  return entry === undefined
    ? { tag: "solved" }
    : { tag: "found", position: entry[0], candidates: entry[1] };
};

const setCell = (_grid: Grid, _pos: Position, _value: Digit): Grid => _grid;

type UpdateDomainResult =
  | { tag: "ok"; domain: Domain }
  | { tag: "contradiction" };

/** Returns contradiction if any cell has no candidates after propagation. */
const updateDomain = (
  _domain: Domain,
  _pos: Position,
  _digit: Digit,
): UpdateDomainResult => ({ tag: "ok", domain: _domain });

export type SolveResult =
  | { tag: "solved"; grid: Grid }
  | { tag: "unsolvable" };

const backtrack = (grid: Grid, domain: Domain): SolveResult => {
  const mrvResult = findMRVCell(domain);

  if (mrvResult.tag === "solved") {
    return { tag: "solved", grid };
  }

  for (const digit of mrvResult.candidates) {
    const newGrid = setCell(grid, mrvResult.position, digit);
    const updateDomainResult = updateDomain(domain, mrvResult.position, digit);

    // Pruning: skip if contradiction detected
    if (updateDomainResult.tag === "contradiction") {
      continue;
    }

    const solveResult = backtrack(newGrid, updateDomainResult.domain);
    if (solveResult.tag === "solved") {
      return solveResult;
    }
  }

  return { tag: "unsolvable" };
};

export const solve = (grid: Grid): SolveResult => {
  const domain = calcDomain(grid);
  return backtrack(grid, domain);
};
