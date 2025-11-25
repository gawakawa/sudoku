import type { Component } from "solid-js";
import type { Cell, CellValue, Digit } from "../types/Sudoku.ts";

type SudokuCellProps = {
  cell: Cell;
  onChange: (value: CellValue) => void;
};

export const SudokuCell: Component<SudokuCellProps> = (props) => {
  const handleKeyDown = (e: KeyboardEvent) => {
    // Handle Backspace and Delete - clear the cell regardless of cursor position
    if (e.key === "Backspace" || e.key === "Delete") {
      e.preventDefault();
      props.onChange(undefined);
      return;
    }

    // Allow navigation keys
    if (
      [
        "Tab",
        "ArrowLeft",
        "ArrowRight",
        "ArrowUp",
        "ArrowDown",
      ].includes(e.key)
    ) return;

    // Handle digit input - replace the entire value regardless of cursor position
    if (/^[1-9]$/.test(e.key)) {
      e.preventDefault();
      props.onChange(parseInt(e.key, 10) as Digit);
      return;
    }

    // Block all other keys
    e.preventDefault();
  };

  const handleInput = (e: InputEvent) => {
    const value = (e.target as HTMLInputElement).value;
    if (value === "") return props.onChange(undefined);
    const num = parseInt(value, 10);
    if (Number.isNaN(num) || num < 1 || num > 9) return;
    props.onChange(num as Digit);
  };

  return (
    <input
      type="text"
      inputmode="numeric"
      pattern="[1-9]"
      maxLength={1}
      value={props.cell.value ?? ""}
      onKeyDown={handleKeyDown}
      onInput={handleInput}
      readonly={props.cell.isInitial}
      class={`
        w-12 h-12
        border border-gray-300
        text-center text-xl
        caret-transparent
        focus:outline-none focus:bg-blue-50 focus:ring-2 focus:ring-blue-500
        ${
        props.cell.isInitial
          ? "initial font-bold text-gray-900 bg-gray-50 cursor-not-allowed"
          : "text-blue-600 bg-white"
      }
      `}
    />
  );
};
