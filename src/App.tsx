import { createStore } from "solid-js/store";
import type { Component } from "solid-js";
import { SudokuGrid } from "./components/SudokuGrid.tsx";
import type { CellValue, Grid, Position } from "./types/Sudoku.ts";
import { generateInitialGrid } from "./utils/generateInitialGrid.ts";
import { findDuplicates } from "./utils/findDuplicates.ts";

export const App: Component = () => {
  const [grid, setGrid] = createStore<Grid>(generateInitialGrid());

  /**
   * Update hasError flags based on duplicate check results
   * @param _duplicates - Set of positions with duplicates
   */
  const updateDuplicateErrors = (_duplicates: Set<Position>): void => {
    // TODO: Update hasError for all cells
  };

  /**
   * Handle cell value change
   * @param pos - Cell position
   * @param value - New cell value
   */
  const handleChange = (pos: Position, value: CellValue): void => {
    setGrid(pos.row, pos.col, "value", value);
    const duplicates = findDuplicates(grid);
    updateDuplicateErrors(duplicates);
  };

  return (
    <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-8">
      <h1 class="text-4xl font-bold text-gray-800 mb-8">数独</h1>
      <SudokuGrid grid={grid} onChange={handleChange} />
    </div>
  );
};
