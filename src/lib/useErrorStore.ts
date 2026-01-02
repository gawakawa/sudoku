import { createStore } from "solid-js/store";
import { Set } from "immutable";
import { Position } from "../types/Sudoku.ts";
import type { Grid, Position as PositionType } from "../types/Sudoku.ts";

const indices = [0, 1, 2, 3, 4, 5, 6, 7, 8] as const;
const offsets = [0, 1, 2] as const;

type ErrorStore = boolean[][];

type UseErrorStoreResult = {
  hasError: (row: number, col: number) => boolean;
  updateErrors: (pos: PositionType, grid: Grid) => void;
};

/** Get affected cell positions (row + col + block = max 21 unique cells) */
const getAffectedPositions = (pos: PositionType): Set<PositionType> => {
  const blockRowStart = Math.floor(pos.row / 3) * 3;
  const blockColStart = Math.floor(pos.col / 3) * 3;

  return Set([
    // Row
    ...indices.map((col) => Position({ row: pos.row, col })),
    // Column
    ...indices.map((row) => Position({ row, col: pos.col })),
    // Block
    ...offsets.flatMap((dr) =>
      offsets.map((dc) =>
        Position({ row: blockRowStart + dr, col: blockColStart + dc })
      )
    ),
  ]);
};

/** Calculate if a cell has duplicate error */
const calculateCellError = (grid: Grid, row: number, col: number): boolean => {
  const value = grid[row][col].value;
  if (value === undefined) return false;

  // Check row
  for (const c of indices) {
    if (c !== col && grid[row][c].value === value) return true;
  }
  // Check column
  for (const r of indices) {
    if (r !== row && grid[r][col].value === value) return true;
  }
  // Check block
  const blockRowStart = Math.floor(row / 3) * 3;
  const blockColStart = Math.floor(col / 3) * 3;
  for (const dr of offsets) {
    for (const dc of offsets) {
      const r = blockRowStart + dr;
      const c = blockColStart + dc;
      if ((r !== row || c !== col) && grid[r][c].value === value) return true;
    }
  }
  return false;
};

export const useErrorStore = (): UseErrorStoreResult => {
  const [errorStore, setErrorStore] = createStore<ErrorStore>(
    indices.map(() => indices.map(() => false)),
  );

  const hasError = (row: number, col: number): boolean => errorStore[row][col];

  const updateErrors = (pos: PositionType, grid: Grid): void => {
    const affected = getAffectedPositions(pos);
    for (const p of affected) {
      const error = calculateCellError(grid, p.row, p.col);
      setErrorStore(p.row, p.col, error);
    }
  };

  return { hasError, updateErrors };
};
