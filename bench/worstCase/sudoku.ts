/**
 * Minimal Sudoku model for the worst-case search tools.
 *
 * Kept self-contained so these tools run on plain Node without the app source.
 */

import { Record, Set } from "immutable";

export const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const;
export const ROW_INDICES = [0, 1, 2, 3, 4, 5, 6, 7, 8] as const;
export const COL_INDICES = [0, 1, 2, 3, 4, 5, 6, 7, 8] as const;

export type Digit = (typeof DIGITS)[number];
export type CellValue = Digit | undefined;
export type Cell = { value: CellValue; isInitial: boolean };

export const makePosition = Record({ row: 0, col: 0 });
export type Position = ReturnType<typeof makePosition>;

export type Grid = Cell[][];

export const initCell = (): Cell => ({ value: undefined, isInitial: false });
export const initGrid = (): Grid => DIGITS.map(() => DIGITS.map(() => initCell()));

const offsets = [0, 1, 2] as const;

/** The 21 positions sharing a row, column or block with `pos` (including `pos` itself). */
export const getPeers = (pos: Position): Set<Position> => {
  const blockRowStart = Math.floor(pos.row / 3) * 3;
  const blockColStart = Math.floor(pos.col / 3) * 3;
  const rowPeers = COL_INDICES.map((col) => makePosition({ row: pos.row, col }));
  const colPeers = ROW_INDICES.map((row) => makePosition({ row, col: pos.col }));
  const blockPeers = offsets.flatMap((dr) =>
    offsets.map((dc) => makePosition({ row: blockRowStart + dr, col: blockColStart + dc })),
  );
  return Set([...rowPeers, ...colPeers, ...blockPeers]);
};
