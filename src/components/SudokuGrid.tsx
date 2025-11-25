import type { Component } from "solid-js";
import { For } from "solid-js";
import type { CellValue, Grid } from "../types/Sudoku.ts";
import { SudokuCell } from "./SudokuCell.tsx";

type SudokuGridProps = {
  grid: Grid;
  onChange: (row: number, col: number, value: CellValue) => void;
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
                  onChange={(value: CellValue) =>
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
