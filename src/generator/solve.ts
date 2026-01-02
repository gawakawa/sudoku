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

const digits: readonly Digit[] = [1, 2, 3, 4, 5, 6, 7, 8, 9];
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
  const updated = domain.remove(pos).map((candidates, p) =>
    peers.has(p) ? candidates.remove(digit) : candidates
  );

  if (updated.some((candidates) => candidates.isEmpty())) {
    return { tag: "contradiction" };
  }

  return { tag: "ok", domain: updated };
};

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
