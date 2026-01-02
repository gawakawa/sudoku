import { type Accessor, createMemo } from "solid-js";
import { Set } from "immutable";
import { Position } from "../types/Sudoku.ts";
import type { Cell, Grid } from "../types/Sudoku.ts";

const indices = [0, 1, 2, 3, 4, 5, 6, 7, 8] as const;
const offsets = [0, 1, 2] as const;
const blockStarts = [0, 3, 6] as const;

type DuplicateMemos = {
  hasError: (row: number, col: number) => boolean;
};

type PositionedCell = {
  pos: Position;
  cell: Cell;
};

const findDuplicatePositions = (cells: PositionedCell[]): Set<Position> =>
  Set(
    cells.flatMap(({ pos, cell }, i) =>
      cells.flatMap(({ pos: pos_, cell: cell_ }, j) =>
        i < j && cell.value !== undefined && cell.value === cell_.value
          ? [pos, pos_]
          : []
      )
    ),
  );

const getRowCells = (grid: Grid, row: number): PositionedCell[] =>
  indices.map((col) => ({ pos: Position({ row, col }), cell: grid[row][col] }));

const getColumnCells = (grid: Grid, col: number): PositionedCell[] =>
  indices.map((row) => ({ pos: Position({ row, col }), cell: grid[row][col] }));

const getBlockCells = (
  grid: Grid,
  blockRow: number,
  blockCol: number,
): PositionedCell[] =>
  offsets.flatMap((dr) =>
    offsets.map((dc) => ({
      pos: Position({ row: blockRow + dr, col: blockCol + dc }),
      cell: grid[blockRow + dr][blockCol + dc],
    }))
  );

export const useDuplicateMemos = (grid: Grid): DuplicateMemos => {
  const rowDuplicates: Accessor<Set<Position>>[] = indices.map((row) =>
    createMemo(() => findDuplicatePositions(getRowCells(grid, row)))
  );

  const colDuplicates: Accessor<Set<Position>>[] = indices.map((col) =>
    createMemo(() => findDuplicatePositions(getColumnCells(grid, col)))
  );

  const blockDuplicates: Accessor<Set<Position>>[] = blockStarts.flatMap(
    (blockRow) =>
      blockStarts.map((blockCol) =>
        createMemo(() =>
          findDuplicatePositions(getBlockCells(grid, blockRow, blockCol))
        )
      ),
  );

  const hasError = (row: number, col: number): boolean => {
    const pos = Position({ row, col });
    const blockIndex = Math.floor(row / 3) * 3 + Math.floor(col / 3);
    return (
      rowDuplicates[row]().has(pos) ||
      colDuplicates[col]().has(pos) ||
      blockDuplicates[blockIndex]().has(pos)
    );
  };

  return { hasError };
};
