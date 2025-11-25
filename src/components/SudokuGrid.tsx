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
    <div class="inline-block border-4 border-gray-900 shadow-lg">
      <div class="grid grid-cols-9">
        <For each={props.grid}>
          {(row, rowIndex) => (
            <For each={row}>
              {(cell, colIndex) => (
                <div
                  class={`
                    ${
                    colIndex() === 2 || colIndex() === 5
                      ? "border-r-4 border-r-gray-900"
                      : ""
                  }
                    ${
                    rowIndex() === 2 || rowIndex() === 5
                      ? "border-b-4 border-b-gray-900"
                      : ""
                  }
                  `}
                >
                  <SudokuCell
                    cell={cell}
                    onChange={(value: CellValue) =>
                      props.onChange(rowIndex(), colIndex(), value)}
                  />
                </div>
              )}
            </For>
          )}
        </For>
      </div>
    </div>
  );
};
