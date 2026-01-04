import type { Grid, Position } from "../types/Sudoku.ts";
import { indices, offsets } from "./getPeers.ts";

/**
 * Calculate if a cell has a duplicate value in its row, column, or block
 * @param grid - Sudoku grid
 * @param pos - Position of the cell
 * @returns True if the cell has a duplicate value
 */
export const calculateCellError = (grid: Grid, pos: Position): boolean => {
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
