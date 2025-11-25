import type { Component } from "solid-js";
import { For } from "solid-js";
import type { Digit, Grid } from "../types/Sudoku";
import { SudokuCell } from "./SudokuCell";

type SudokuGridProps = {
  grid: Grid;
  onChange: (row: number, col: number, value: Digit | undefined) => void;
};

export const SudokuGrid: Component<SudokuGridProps> = (props) => {
  return (
    <div class="sudoku-grid">
      <For each={props.grid}>
        {(row, rowIndex) => (
          <div class="sudoku-row">
            <For each={row}>
              {(cell, colIndex) => (
                <SudokuCell
                  cell={cell}
                  onChange={(value) =>
                    props.onChange(rowIndex(), colIndex(), value)}
                />
              )}
            </For>
          </div>
        )}
      </For>
    </div>
  );
};
