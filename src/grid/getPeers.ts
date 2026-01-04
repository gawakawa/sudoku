import { Set } from "immutable";
import { makePosition } from "../types/Sudoku.ts";
import type { Position } from "../types/Sudoku.ts";
import { COL_INDICES, ROW_INDICES } from "../const.ts";

export const offsets = [0, 1, 2] as const;

/** 同じ行のピアを取得 */
export const getRowPeers = (pos: Position): Set<Position> =>
  Set(COL_INDICES.map((col) => makePosition({ row: pos.row, col })));

/** 同じ列のピアを取得 */
export const getColPeers = (pos: Position): Set<Position> =>
  Set(ROW_INDICES.map((row) => makePosition({ row, col: pos.col })));

/** 同じブロックのピアを取得 */
export const getBlockPeers = (pos: Position): Set<Position> => {
  const blockRowStart = Math.floor(pos.row / 3) * 3;
  const blockColStart = Math.floor(pos.col / 3) * 3;
  return Set(
    offsets.flatMap((dr) =>
      offsets.map((dc) =>
        makePosition({ row: blockRowStart + dr, col: blockColStart + dc })
      )
    ),
  );
};

/** 全ピアを取得 (行 + 列 + ブロック) */
export const getPeers = (pos: Position): Set<Position> =>
  getRowPeers(pos).union(getColPeers(pos)).union(getBlockPeers(pos));
