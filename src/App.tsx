import { createStore } from "solid-js/store";
import type { Component } from "solid-js";
import { SudokuGrid } from "./components/SudokuGrid.tsx";
import type { CellValue, Grid, Position } from "./types/Sudoku.ts";
import { generateInitialGrid } from "./utils/generateInitialGrid.ts";

export const App: Component = () => {
  const [grid, setGrid] = createStore<Grid>(generateInitialGrid());

  /**
   * Find cells with duplicate values in rows
   * @param _grid - Sudoku grid
   * @returns Set of positions with duplicates
   */
  const findRowDuplicates = (_grid: Grid): Set<Position> => {
    // TODO: Check for row duplicates
    return new Set();
  };

  /**
   * Find cells with duplicate values in columns
   * @param _grid - Sudoku grid
   * @returns Set of positions with duplicates
   */
  const findColumnDuplicates = (_grid: Grid): Set<Position> => {
    // TODO: Check for column duplicates
    return new Set();
  };

  /**
   * Find cells with duplicate values in 3x3 blocks
   * @param _grid - Sudoku grid
   * @returns Set of positions with duplicates
   */
  const findBlockDuplicates = (_grid: Grid): Set<Position> => {
    // TODO: Check for block duplicates
    return new Set();
  };

  /**
   * Find all cells with duplicate values by integrating row, column, and block checks
   * @param grid - Sudoku grid
   * @returns Set of positions with duplicates
   */
  const findDuplicateCells = (grid: Grid): Set<Position> => {
    return findRowDuplicates(grid)
      .union(findColumnDuplicates(grid))
      .union(findBlockDuplicates(grid));
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
