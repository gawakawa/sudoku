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

/** Initializes Domain with undetermined cells only (where grid value is undefined). */
const calcDomain = (_grid: Grid): Domain => Map();

type UpdateDomainResult =
  | { tag: "ok"; domain: Domain }
  | { tag: "contradiction" };

/**
 * Removes the assigned cell from Domain and propagates constraints to peers.
 * Returns contradiction if any cell has no candidates after propagation.
 */
const updateDomain = (
  _domain: Domain,
  _pos: Position,
  _digit: Digit,
): UpdateDomainResult => ({ tag: "ok", domain: _domain });

/** MRV heuristic: select the cell with fewest candidates. Requires non-empty domain. */
const findMRVCell = (
  domain: Domain,
): { position: Position; candidates: Candidates } => {
  const entry = domain.entrySeq().minBy(([_, candidates]) => candidates.size);
  return { position: entry![0], candidates: entry![1] };
};

const setCell = (_grid: Grid, _pos: Position, _value: Digit): Grid => _grid;

export type SolveResult = { tag: "solved"; grid: Grid } | { tag: "unsolvable" };

const backtrack = (grid: Grid, domain: Domain): SolveResult => {
  if (domain.size === 0) {
    return { tag: "solved", grid };
  }

  const mrvCell = findMRVCell(domain);

  for (const digit of mrvCell.candidates) {
    const newGrid = setCell(grid, mrvCell.position, digit);
    const updateDomainResult = updateDomain(domain, mrvCell.position, digit);

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
