import { createStore } from "solid-js/store";
import type { Component } from "solid-js";
import { SudokuGrid } from "./components/SudokuGrid.tsx";
import type { CellValue, Grid } from "./types/Sudoku.ts";

// Sample Sudoku puzzle (easy difficulty)
const initialGrid: Grid = [
  [
    { value: 5, isInitial: true },
    { value: 3, isInitial: true },
    { value: undefined, isInitial: false },
    { value: undefined, isInitial: false },
    { value: 7, isInitial: true },
    { value: undefined, isInitial: false },
    { value: undefined, isInitial: false },
    { value: undefined, isInitial: false },
    { value: undefined, isInitial: false },
  ],
  [
    { value: 6, isInitial: true },
    { value: undefined, isInitial: false },
    { value: undefined, isInitial: false },
    { value: 1, isInitial: true },
    { value: 9, isInitial: true },
    { value: 5, isInitial: true },
    { value: undefined, isInitial: false },
    { value: undefined, isInitial: false },
    { value: undefined, isInitial: false },
  ],
  [
    { value: undefined, isInitial: false },
    { value: 9, isInitial: true },
    { value: 8, isInitial: true },
    { value: undefined, isInitial: false },
    { value: undefined, isInitial: false },
    { value: undefined, isInitial: false },
    { value: undefined, isInitial: false },
    { value: 6, isInitial: true },
    { value: undefined, isInitial: false },
  ],
  [
    { value: 8, isInitial: true },
    { value: undefined, isInitial: false },
    { value: undefined, isInitial: false },
    { value: undefined, isInitial: false },
    { value: 6, isInitial: true },
    { value: undefined, isInitial: false },
    { value: undefined, isInitial: false },
    { value: undefined, isInitial: false },
    { value: 3, isInitial: true },
  ],
  [
    { value: 4, isInitial: true },
    { value: undefined, isInitial: false },
    { value: undefined, isInitial: false },
    { value: 8, isInitial: true },
    { value: undefined, isInitial: false },
    { value: 3, isInitial: true },
    { value: undefined, isInitial: false },
    { value: undefined, isInitial: false },
    { value: 1, isInitial: true },
  ],
  [
    { value: 7, isInitial: true },
    { value: undefined, isInitial: false },
    { value: undefined, isInitial: false },
    { value: undefined, isInitial: false },
    { value: 2, isInitial: true },
    { value: undefined, isInitial: false },
    { value: undefined, isInitial: false },
    { value: undefined, isInitial: false },
    { value: 6, isInitial: true },
  ],
  [
    { value: undefined, isInitial: false },
    { value: 6, isInitial: true },
    { value: undefined, isInitial: false },
    { value: undefined, isInitial: false },
    { value: undefined, isInitial: false },
    { value: undefined, isInitial: false },
    { value: 2, isInitial: true },
    { value: 8, isInitial: true },
    { value: undefined, isInitial: false },
  ],
  [
    { value: undefined, isInitial: false },
    { value: undefined, isInitial: false },
    { value: undefined, isInitial: false },
    { value: 4, isInitial: true },
    { value: 1, isInitial: true },
    { value: 9, isInitial: true },
    { value: undefined, isInitial: false },
    { value: undefined, isInitial: false },
    { value: 5, isInitial: true },
  ],
  [
    { value: undefined, isInitial: false },
    { value: undefined, isInitial: false },
    { value: undefined, isInitial: false },
    { value: undefined, isInitial: false },
    { value: 8, isInitial: true },
    { value: undefined, isInitial: false },
    { value: undefined, isInitial: false },
    { value: 7, isInitial: true },
    { value: 9, isInitial: true },
  ],
];

export const App: Component = () => {
  const [grid, setGrid] = createStore<Grid>(initialGrid);

  const handleChange = (row: number, col: number, value: CellValue) => {
    setGrid(row, col, "value", value);
  };

  return (
    <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-8">
      <h1 class="text-4xl font-bold text-gray-800 mb-8">数独</h1>
      <SudokuGrid grid={grid} onChange={handleChange} />
    </div>
  );
};
