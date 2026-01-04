import type { Cell, Grid } from "../types/Sudoku.ts";
import { DIGITS } from "../const.ts";

export const initCell = (): Cell => ({
  value: undefined,
  isInitial: false,
});

const initRow = (): Cell[] => DIGITS.map(() => initCell());

export const initGrid = (): Grid => DIGITS.map(() => initRow());
