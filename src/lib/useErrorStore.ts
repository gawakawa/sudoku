import { createStore } from "solid-js/store";
import type { Grid, Position } from "../types/Sudoku.ts";
import { getAffectedPositions, indices, offsets } from "../utils/position.ts";

type ErrorStore = boolean[][];

type UseErrorStoreResult = {
  hasError: (pos: Position) => boolean;
  updateErrors: (pos: Position, grid: Grid) => void;
};

/**
 * Calculate if a cell has a duplicate value in its row, column, or block
 * @param grid - Sudoku grid
 * @param pos - Position of the cell
 * @returns True if the cell has a duplicate value
 */
const calculateCellError = (grid: Grid, pos: Position): boolean => {
  const value = grid[pos.row][pos.col].value;
  if (value === undefined) return false;

  const blockRowStart = Math.floor(pos.row / 3) * 3;
  const blockColStart = Math.floor(pos.col / 3) * 3;

  return (
    indices.some((c) => c !== pos.col && grid[pos.row][c].value === value) ||
    indices.some((r) => r !== pos.row && grid[r][pos.col].value === value) ||
    offsets.some((dr) =>
      offsets.some((dc) => {
        const r = blockRowStart + dr;
        const c = blockColStart + dc;
        return (r !== pos.row || c !== pos.col) && grid[r][c].value === value;
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
   * @param pos - Position of the cell
   * @returns True if the cell has a duplicate value in its row, column, or block
   */
  const hasError = (pos: Position): boolean => errorStore[pos.row][pos.col];

  /**
   * Recalculate error states for cells affected by a change
   * @param pos - Position of the changed cell
   * @param grid - Current grid state
   */
  const updateErrors = (pos: Position, grid: Grid): void => {
    getAffectedPositions(pos).forEach((p) => {
      setErrorStore(p.row, p.col, calculateCellError(grid, p));
    });
  };

  return { hasError, updateErrors };
};
