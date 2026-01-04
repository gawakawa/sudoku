import { Set } from "immutable";
import { makePosition } from "../types/Sudoku.ts";
import type { Position } from "../types/Sudoku.ts";

export const indices = [0, 1, 2, 3, 4, 5, 6, 7, 8] as const;
export const offsets = [0, 1, 2] as const;

/** 同じ行の全位置を取得 */
export const getRowPositions = (pos: Position): Set<Position> =>
  Set(indices.map((col) => makePosition({ row: pos.row, col })));

/** 同じ列の全位置を取得 */
export const getColPositions = (pos: Position): Set<Position> =>
  Set(indices.map((row) => makePosition({ row, col: pos.col })));

/** 同じブロックの全位置を取得 */
export const getBlockPositions = (pos: Position): Set<Position> => {
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

/** 影響を受ける全位置 (行 + 列 + ブロック) */
export const getAffectedPositions = (pos: Position): Set<Position> =>
  getRowPositions(pos)
    .union(getColPositions(pos))
    .union(getBlockPositions(pos));
