import type { Component } from "solid-js";
import { For } from "solid-js";
import { Position } from "../types/Sudoku.ts";
import type { CellValue, Grid } from "../types/Sudoku.ts";
import { SudokuCell } from "./SudokuCell.tsx";

type SudokuGridProps = {
  grid: Grid;
  onChange: (pos: Position, value: CellValue) => void;
};

export const SudokuGrid: Component<SudokuGridProps> = (props) => {
  const cellRefs: (HTMLInputElement | undefined)[][] = Array.from(
    { length: 9 },
    () => Array(9).fill(undefined),
  );

  const handleNavigate = (row: number, col: number, direction: string) => {
    switch (direction) {
      case "up":
        cellRefs[Math.max(0, row - 1)]?.[col]?.focus();
        break;
      case "down":
        cellRefs[Math.min(8, row + 1)]?.[col]?.focus();
        break;
      case "left":
        cellRefs[row]?.[Math.max(0, col - 1)]?.focus();
        break;
      case "right":
        cellRefs[row]?.[Math.min(8, col + 1)]?.focus();
        break;
    }
  };

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
                    ref={(el) => {
                      if (!cellRefs[rowIndex()]) {
                        cellRefs[rowIndex()] = [];
                      }
                      cellRefs[rowIndex()][colIndex()] = el;
                    }}
                    onChange={(value: CellValue) =>
                      props.onChange(
                        Position({ row: rowIndex(), col: colIndex() }),
                        value,
                      )}
                    onNavigate={(direction) =>
                      handleNavigate(rowIndex(), colIndex(), direction)}
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
