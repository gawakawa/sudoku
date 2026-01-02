import { Map, Set } from "immutable";
import type { Digit, Grid, Position } from "../types/Sudoku.ts";

type Candidates = Map<Position, Set<Digit>>;

const calcCandidates = (_grid: Grid): Candidates => Map();

/**
 * Selects the next cell to fill using the MRV (Minimum Remaining Values) heuristic.
 * Choosing the cell with the fewest candidates reduces the search branching factor.
 * @param candidates Map of cell positions to their candidate digit sets
 * @returns Position of the cell with fewest candidates, or undefined if map is empty
 */
const findMRVCell = (candidates: Candidates): Position | undefined =>
  candidates.entrySeq().minBy(([_, set]) => set.size)?.[0];

const setCell = (_grid: Grid, _pos: Position, _value: Digit): Grid => _grid;

const updateCandidates = (
  candidates: Candidates,
  _pos: Position,
  _digit: Digit,
): Candidates => candidates;

const backtrack = (
  grid: Grid,
  candidates: Candidates,
): Grid | undefined => {
  const pos = findMRVCell(candidates);

  if (pos === undefined) {
    return grid;
  }

  const cellCandidates = candidates.get(pos) ?? Set();

  if (cellCandidates.size === 0) {
    return undefined;
  }

  for (const digit of cellCandidates) {
    const newGrid = setCell(grid, pos, digit);
    const newCandidates = updateCandidates(candidates, pos, digit);

    const result = backtrack(newGrid, newCandidates);
    if (result !== undefined) {
      return result;
    }
  }

  return undefined;
};

export const solve = (grid: Grid): Grid | undefined => {
  const candidates = calcCandidates(grid);
  return backtrack(grid, candidates);
};
