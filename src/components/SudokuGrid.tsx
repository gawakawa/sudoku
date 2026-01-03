import type { Component } from "solid-js";
import { For } from "solid-js";
import { makePosition } from "../types/Sudoku.ts";
import type { CellValue, Grid, Position } from "../types/Sudoku.ts";
import { SudokuCell } from "./SudokuCell.tsx";
import { incrementGridRender } from "../lib/metrics.ts";

export type NavigationDirection = "up" | "down" | "left" | "right";

type SudokuGridProps = {
  grid: Grid;
  onChange: (pos: Position, value: CellValue) => void;
  hasError: (pos: Position) => boolean;
};

/**
 * Grid component that renders a 9x9 Sudoku board
 * @param props - Grid properties including cell data and callbacks
 */
export const SudokuGrid: Component<SudokuGridProps> = (props) => {
  // Track component initialization for performance metrics
  incrementGridRender();

  const cellRefs: (HTMLInputElement | undefined)[][] = Array.from(
    { length: 9 },
    () => Array(9).fill(undefined),
  );

  /**
   * Handle arrow key navigation between cells
   * @param pos - Current cell position
   * @param direction - Navigation direction
   */
  const handleNavigate = (
    pos: Position,
    direction: NavigationDirection,
  ): void => {
    switch (direction) {
      case "up":
        cellRefs[Math.max(0, pos.row - 1)][pos.col]?.focus();
        break;
      case "down":
        cellRefs[Math.min(8, pos.row + 1)][pos.col]?.focus();
        break;
      case "left":
        cellRefs[pos.row][Math.max(0, pos.col - 1)]?.focus();
        break;
      case "right":
        cellRefs[pos.row][Math.min(8, pos.col + 1)]?.focus();
        break;
    }
  };

  return (
    <div class="inline-block border-2 border-gray-900">
      <div
        class="grid"
        style={{ "grid-template-columns": "repeat(9, var(--cell-size))" }}
      >
        <For each={props.grid}>
          {(row, rowIndex) => (
            <For each={row}>
              {(cell, colIndex) => (
                <SudokuCell
                  cell={cell}
                  cellId={rowIndex() * 9 + colIndex()}
                  pos={makePosition({ row: rowIndex(), col: colIndex() })}
                  hasError={() =>
                    props.hasError(
                      makePosition({ row: rowIndex(), col: colIndex() }),
                    )}
                  ref={(el) => {
                    if (!cellRefs[rowIndex()]) {
                      cellRefs[rowIndex()] = [];
                    }
                    cellRefs[rowIndex()][colIndex()] = el;
                  }}
                  onChange={(value: CellValue) =>
                    props.onChange(
                      makePosition({ row: rowIndex(), col: colIndex() }),
                      value,
                    )}
                  onNavigate={(direction) =>
                    handleNavigate(
                      makePosition({ row: rowIndex(), col: colIndex() }),
                      direction,
                    )}
                />
              )}
            </For>
          )}
        </For>
      </div>
    </div>
  );
};
