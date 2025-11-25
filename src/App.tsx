import { createStore } from "solid-js/store";
import type { Component } from "solid-js";
import { SudokuGrid } from "./components/SudokuGrid";
import type { Digit, Grid } from "./types/Sudoku";

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

  const handleChange = (row: number, col: number, value: Digit | undefined) => {
    setGrid(row, col, "value", value);
  };

  return (
    <div>
      <h1>Sudoku</h1>
      <SudokuGrid grid={grid} onChange={handleChange} />
    </div>
  );
};
