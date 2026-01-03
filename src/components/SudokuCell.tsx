import { type Component, createEffect } from "solid-js";
import type { Cell, CellValue, Digit, Position } from "../types/Sudoku.ts";
import type { NavigationDirection } from "./SudokuGrid.tsx";
import { incrementCellUpdate } from "../lib/metrics.ts";

type SudokuCellProps = {
  cell: Cell;
  cellId: number;
  pos: Position;
  hasError: () => boolean;
  onChange: (value: CellValue) => void;
  onNavigate?: (direction: NavigationDirection) => void;
  ref?: (el: HTMLInputElement) => void;
};

/**
 * Individual cell component for the Sudoku grid
 * @param props - Cell properties including value, error state, and callbacks
 */
export const SudokuCell: Component<SudokuCellProps> = (props) => {
  // Track reactive updates for performance metrics
  createEffect(() => {
    // Access reactive properties to subscribe to changes
    props.cell.value;
    props.hasError();
    props.cell.isInitial;
    incrementCellUpdate(props.cellId);
  });

  /**
   * Handle keyboard input for cell navigation and value entry
   * @param e - Keyboard event
   */
  const handleKeyDown = (e: KeyboardEvent): void => {
    // Handle Backspace and Delete - clear the cell regardless of cursor position
    if (e.key === "Backspace" || e.key === "Delete") {
      if (props.cell.isInitial) {
        e.preventDefault();
        return;
      }
      e.preventDefault();
      props.onChange(undefined);
      return;
    }

    // Handle arrow key navigation
    if (props.onNavigate) {
      switch (e.key) {
        case "ArrowUp":
          e.preventDefault();
          props.onNavigate("up");
          return;
        case "ArrowDown":
          e.preventDefault();
          props.onNavigate("down");
          return;
        case "ArrowLeft":
          e.preventDefault();
          props.onNavigate("left");
          return;
        case "ArrowRight":
          e.preventDefault();
          props.onNavigate("right");
          return;
      }
    }

    // Allow Tab key
    if (e.key === "Tab") return;

    // Handle digit input - replace the entire value regardless of cursor position
    if (/^[1-9]$/.test(e.key)) {
      if (props.cell.isInitial) {
        e.preventDefault();
        return;
      }
      e.preventDefault();
      props.onChange(parseInt(e.key, 10) as Digit);
      return;
    }

    // Block all other keys
    e.preventDefault();
  };

  /**
   * Handle direct input events (e.g., from mobile keyboards)
   * @param e - Input event
   */
  const handleInput = (e: InputEvent): void => {
    const value = (e.target as HTMLInputElement).value;
    if (value === "") return props.onChange(undefined);
    const num = parseInt(value, 10);
    if (Number.isNaN(num) || num < 1 || num > 9) return;
    props.onChange(num as Digit);
  };

  return (
    <input
      ref={props.ref}
      type="text"
      inputmode="numeric"
      pattern="[1-9]"
      maxLength={1}
      value={props.cell.value ?? ""}
      onKeyDown={handleKeyDown}
      onInput={handleInput}
      readonly={props.cell.isInitial}
      class={`
        w-[var(--cell-size)] h-[var(--cell-size)]
        border border-gray-300
        text-center text-[length:var(--cell-font-size)]
        caret-transparent
        focus:outline-none focus:bg-blue-50 focus:ring-2 focus:ring-blue-500
        ${
        props.pos.col === 2 || props.pos.col === 5
          ? "border-r-2 border-r-gray-900"
          : ""
      }
        ${
        props.pos.row === 2 || props.pos.row === 5
          ? "border-b-2 border-b-gray-900"
          : ""
      }
        ${
        props.hasError()
          ? "error bg-red-100 text-red-700 border-red-500"
          : props.cell.isInitial
          ? "initial font-bold text-gray-900 bg-gray-50 cursor-not-allowed"
          : "text-blue-600 bg-white"
      }
      `}
    />
  );
};
