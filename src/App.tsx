import { createStore } from "solid-js/store";
import type { Component } from "solid-js";
import { SudokuGrid } from "./components/SudokuGrid.tsx";
import type { CellValue, Grid, Position } from "./types/Sudoku.ts";
import { generateInitialGrid } from "./utils/generateInitialGrid.ts";
import { useErrorStore } from "./lib/useErrorStore.ts";
import { incrementAppRender, incrementStoreUpdate } from "./lib/metrics.ts";

/**
 * Main application component that manages the Sudoku game state
 */
export const App: Component = () => {
  // Track component initialization for performance metrics
  incrementAppRender();

  const [grid, setGrid] = createStore<Grid>(generateInitialGrid());
  const { hasError, updateErrors } = useErrorStore();

  /**
   * Handle cell value change
   * @param pos - Cell position
   * @param value - New cell value
   */
  const handleChange = (pos: Position, value: CellValue): void => {
    incrementStoreUpdate();
    setGrid(pos.row, pos.col, "value", value);
    updateErrors(pos, grid);
  };

  return (
    <div class="flex-1 bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-4 md:p-8 md:pr-72">
      <h1 class="text-2xl md:text-4xl font-bold text-gray-800 mb-4 md:mb-8">
        数独
      </h1>
      <SudokuGrid grid={grid} onChange={handleChange} hasError={hasError} />
    </div>
  );
};
