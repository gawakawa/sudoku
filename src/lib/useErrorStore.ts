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

/**
 * Get affected cell positions for error recalculation
 * @param pos - Position of the changed cell
 * @returns Set of positions (row + column + block = max 21 unique cells)
 */
const getAffectedPositions = (pos: PositionType): Set<PositionType> => {
  const blockRowStart = Math.floor(pos.row / 3) * 3;
  const blockColStart = Math.floor(pos.col / 3) * 3;

  return Set([
    ...indices.map((col) => Position({ row: pos.row, col })),
    ...indices.map((row) => Position({ row, col: pos.col })),
    ...offsets.flatMap((dr) =>
      offsets.map((dc) =>
        Position({ row: blockRowStart + dr, col: blockColStart + dc })
      )
    ),
  ]);
};

/**
 * Calculate if a cell has a duplicate value in its row, column, or block
 * @param grid - Sudoku grid
 * @param row - Row index of the cell
 * @param col - Column index of the cell
 * @returns True if the cell has a duplicate value
 */
const calculateCellError = (grid: Grid, row: number, col: number): boolean => {
  const value = grid[row][col].value;
  if (value === undefined) return false;

  const blockRowStart = Math.floor(row / 3) * 3;
  const blockColStart = Math.floor(col / 3) * 3;

  return (
    indices.some((c) => c !== col && grid[row][c].value === value) ||
    indices.some((r) => r !== row && grid[r][col].value === value) ||
    offsets.some((dr) =>
      offsets.some((dc) => {
        const r = blockRowStart + dr;
        const c = blockColStart + dc;
        return (r !== row || c !== col) && grid[r][c].value === value;
      })
    )
  );
};

/**
 * Create a store for tracking cell error states
 * @returns Object with hasError and updateErrors functions
 */
export const useErrorStore = (): UseErrorStoreResult => {
  const [errorStore, setErrorStore] = createStore<ErrorStore>(
    indices.map(() => indices.map(() => false)),
  );

  /**
   * Check if a cell has a duplicate error
   * @param row - Row index
   * @param col - Column index
   * @returns True if the cell has a duplicate value in its row, column, or block
   */
  const hasError = (row: number, col: number): boolean => errorStore[row][col];

  /**
   * Recalculate error states for cells affected by a change
   * @param pos - Position of the changed cell
   * @param grid - Current grid state
   */
  const updateErrors = (pos: PositionType, grid: Grid): void => {
    getAffectedPositions(pos).forEach((p) => {
      setErrorStore(p.row, p.col, calculateCellError(grid, p.row, p.col));
    });
  };

  return { hasError, updateErrors };
};
