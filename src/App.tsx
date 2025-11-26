import { createStore } from "solid-js/store";
import type { Component } from "solid-js";
import { SudokuGrid } from "./components/SudokuGrid.tsx";
import type { CellValue, Grid, Position } from "./types/Sudoku.ts";

// Sample Sudoku puzzle (easy difficulty)
const initialGrid: Grid = [
  [
    { value: 5, isInitial: true, hasError: false },
    { value: 3, isInitial: true, hasError: false },
    { value: undefined, isInitial: false, hasError: false },
    { value: undefined, isInitial: false, hasError: false },
    { value: 7, isInitial: true, hasError: false },
    { value: undefined, isInitial: false, hasError: false },
    { value: undefined, isInitial: false, hasError: false },
    { value: undefined, isInitial: false, hasError: false },
    { value: undefined, isInitial: false, hasError: false },
  ],
  [
    { value: 6, isInitial: true, hasError: false },
    { value: undefined, isInitial: false, hasError: false },
    { value: undefined, isInitial: false, hasError: false },
    { value: 1, isInitial: true, hasError: false },
    { value: 9, isInitial: true, hasError: false },
    { value: 5, isInitial: true, hasError: false },
    { value: undefined, isInitial: false, hasError: false },
    { value: undefined, isInitial: false, hasError: false },
    { value: undefined, isInitial: false, hasError: false },
  ],
  [
    { value: undefined, isInitial: false, hasError: false },
    { value: 9, isInitial: true, hasError: false },
    { value: 8, isInitial: true, hasError: false },
    { value: undefined, isInitial: false, hasError: false },
    { value: undefined, isInitial: false, hasError: false },
    { value: undefined, isInitial: false, hasError: false },
    { value: undefined, isInitial: false, hasError: false },
    { value: 6, isInitial: true, hasError: false },
    { value: undefined, isInitial: false, hasError: false },
  ],
  [
    { value: 8, isInitial: true, hasError: false },
    { value: undefined, isInitial: false, hasError: false },
    { value: undefined, isInitial: false, hasError: false },
    { value: undefined, isInitial: false, hasError: false },
    { value: 6, isInitial: true, hasError: false },
    { value: undefined, isInitial: false, hasError: false },
    { value: undefined, isInitial: false, hasError: false },
    { value: undefined, isInitial: false, hasError: false },
    { value: 3, isInitial: true, hasError: false },
  ],
  [
    { value: 4, isInitial: true, hasError: false },
    { value: undefined, isInitial: false, hasError: false },
    { value: undefined, isInitial: false, hasError: false },
    { value: 8, isInitial: true, hasError: false },
    { value: undefined, isInitial: false, hasError: false },
    { value: 3, isInitial: true, hasError: false },
    { value: undefined, isInitial: false, hasError: false },
    { value: undefined, isInitial: false, hasError: false },
    { value: 1, isInitial: true, hasError: false },
  ],
  [
    { value: 7, isInitial: true, hasError: false },
    { value: undefined, isInitial: false, hasError: false },
    { value: undefined, isInitial: false, hasError: false },
    { value: undefined, isInitial: false, hasError: false },
    { value: 2, isInitial: true, hasError: false },
    { value: undefined, isInitial: false, hasError: false },
    { value: undefined, isInitial: false, hasError: false },
    { value: undefined, isInitial: false, hasError: false },
    { value: 6, isInitial: true, hasError: false },
  ],
  [
    { value: undefined, isInitial: false, hasError: false },
    { value: 6, isInitial: true, hasError: false },
    { value: undefined, isInitial: false, hasError: false },
    { value: undefined, isInitial: false, hasError: false },
    { value: undefined, isInitial: false, hasError: false },
    { value: undefined, isInitial: false, hasError: false },
    { value: 2, isInitial: true, hasError: false },
    { value: 8, isInitial: true, hasError: false },
    { value: undefined, isInitial: false, hasError: false },
  ],
  [
    { value: undefined, isInitial: false, hasError: false },
    { value: undefined, isInitial: false, hasError: false },
    { value: undefined, isInitial: false, hasError: false },
    { value: 4, isInitial: true, hasError: false },
    { value: 1, isInitial: true, hasError: false },
    { value: 9, isInitial: true, hasError: false },
    { value: undefined, isInitial: false, hasError: false },
    { value: undefined, isInitial: false, hasError: false },
    { value: 5, isInitial: true, hasError: false },
  ],
  [
    { value: undefined, isInitial: false, hasError: false },
    { value: undefined, isInitial: false, hasError: false },
    { value: undefined, isInitial: false, hasError: false },
    { value: undefined, isInitial: false, hasError: false },
    { value: 8, isInitial: true, hasError: false },
    { value: undefined, isInitial: false, hasError: false },
    { value: undefined, isInitial: false, hasError: false },
    { value: 7, isInitial: true, hasError: false },
    { value: 9, isInitial: true, hasError: false },
  ],
];

export const App: Component = () => {
  const [grid, setGrid] = createStore<Grid>(initialGrid);

  /**
   * Find all cells with duplicate values
   * @param _grid - Sudoku grid
   * @returns Set of positions with duplicates
   */
  const findDuplicateCells = (_grid: Grid): Set<Position> => {
    // TODO: Check for duplicates and return set of positions
    return new Set();
  };

  /**
   * Update hasError flags based on duplicate check results
   * @param _duplicateCells - Set of positions with duplicates
   */
  const updateDuplicateErrors = (_duplicateCells: Set<Position>): void => {
    // TODO: Update hasError for all cells
  };

  /**
   * Handle cell value change
   * @param pos - Cell position
   * @param value - New cell value
   */
  const handleChange = (pos: Position, value: CellValue): void => {
    setGrid(pos.row, pos.col, "value", value);
    const duplicateCells = findDuplicateCells(grid);
    updateDuplicateErrors(duplicateCells);
  };

  return (
    <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-8">
      <h1 class="text-4xl font-bold text-gray-800 mb-8">数独</h1>
      <SudokuGrid grid={grid} onChange={handleChange} />
    </div>
  );
};
