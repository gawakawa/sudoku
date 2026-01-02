import { useImmer } from "use-immer";
import type { CellValue, Grid, Position } from "../types/Sudoku";
import { generateInitialGrid } from "../utils/generateInitialGrid";

type GameState = {
  grid: Grid;
  errors: boolean[][];
};

const indices = [0, 1, 2, 3, 4, 5, 6, 7, 8] as const;
const offsets = [0, 1, 2] as const;

const getAffectedPositions = (pos: Position): Position[] => {
  const blockRowStart = Math.floor(pos.row / 3) * 3;
  const blockColStart = Math.floor(pos.col / 3) * 3;
  const positions: Position[] = [];
  const seen = new Set<string>();

  const add = (row: number, col: number) => {
    const key = `${row}-${col}`;
    if (!seen.has(key)) {
      seen.add(key);
      positions.push({ row, col });
    }
  };

  // Row, Column, Block
  for (const i of indices) {
    add(pos.row, i);
    add(i, pos.col);
  }
  for (const dr of offsets) {
    for (const dc of offsets) {
      add(blockRowStart + dr, blockColStart + dc);
    }
  }
  return positions;
};

const calculateCellError = (grid: Grid, row: number, col: number): boolean => {
  const value = grid[row][col].value;
  if (value === undefined) return false;

  // Row check
  for (const c of indices) {
    if (c !== col && grid[row][c].value === value) return true;
  }
  // Column check
  for (const r of indices) {
    if (r !== row && grid[r][col].value === value) return true;
  }
  // Block check
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

export function useSudokuGame() {
  const [state, updateState] = useImmer<GameState>(() => ({
    grid: generateInitialGrid(),
    errors: Array.from({ length: 9 }, () => Array(9).fill(false)),
  }));

  const updateCell = (pos: Position, value: CellValue) => {
    updateState((draft) => {
      draft.grid[pos.row][pos.col].value = value;
      const affected = getAffectedPositions(pos);
      for (const p of affected) {
        draft.errors[p.row][p.col] = calculateCellError(
          draft.grid,
          p.row,
          p.col,
        );
      }
    });
  };

  const hasError = (row: number, col: number): boolean =>
    state.errors[row][col];

  return { grid: state.grid, hasError, updateCell };
}
