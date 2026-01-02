import type { Component } from "solid-js";
import { For } from "solid-js";
import { Position } from "../types/Sudoku.ts";
import type { CellValue, Grid } from "../types/Sudoku.ts";
import { SudokuCell } from "./SudokuCell.tsx";
import { incrementGridRender } from "../lib/metrics.ts";

export type NavigationDirection = "up" | "down" | "left" | "right";

type SudokuGridProps = {
  grid: Grid;
  onChange: (pos: Position, value: CellValue) => void;
  hasError: (row: number, col: number) => boolean;
};

export const SudokuGrid: Component<SudokuGridProps> = (props) => {
  // Track component initialization for performance metrics
  incrementGridRender();

  const cellRefs: (HTMLInputElement | undefined)[][] = Array.from(
    { length: 9 },
    () => Array(9).fill(undefined),
  );

  const handleNavigate = (
    row: number,
    col: number,
    direction: NavigationDirection,
  ) => {
    switch (direction) {
      case "up":
        cellRefs[Math.max(0, row - 1)][col]?.focus();
        break;
      case "down":
        cellRefs[Math.min(8, row + 1)][col]?.focus();
        break;
      case "left":
        cellRefs[row][Math.max(0, col - 1)]?.focus();
        break;
      case "right":
        cellRefs[row][Math.min(8, col + 1)]?.focus();
        break;
    }
  };

  return (
    <div class="inline-block border-2 border-gray-900">
      <div class="grid grid-cols-9">
        <For each={props.grid}>
          {(row, rowIndex) => (
            <For each={row}>
              {(cell, colIndex) => (
                <div
                  classList={{
                    "border-r-2 border-r-gray-900": colIndex() === 2 ||
                      colIndex() === 5,
                    "border-b-2 border-b-gray-900": rowIndex() === 2 ||
                      rowIndex() === 5,
                  }}
                >
                  <SudokuCell
                    cell={cell}
                    cellId={rowIndex() * 9 + colIndex()}
                    hasError={() => props.hasError(rowIndex(), colIndex())}
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
