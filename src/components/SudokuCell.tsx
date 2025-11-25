import type { Component } from "solid-js";
import type { Cell, CellValue, Digit } from "../types/Sudoku.ts";

type SudokuCellProps = {
  cell: Cell;
  onChange: (value: CellValue) => void;
};

export const SudokuCell: Component<SudokuCellProps> = (props) => {
  const handleInput = (e: InputEvent) => {
    const target = e.target as HTMLInputElement;
    const value = target.value;

    if (value === "") {
      props.onChange(undefined);
      return;
    }

    const num = parseInt(value, 10);
    // Only accept valid digits 1-9 (ignore NaN, 0, or > 9)
    if (!Number.isNaN(num) && num >= 1 && num <= 9) {
      props.onChange(num as Digit);
    }
  };

  return (
    <input
      type="text"
      inputmode="numeric"
      pattern="[1-9]"
      value={props.cell.value ?? ""}
      onInput={handleInput}
      readonly={props.cell.isInitial}
      class={`
        w-12 h-12 
        border border-gray-300 
        text-center text-xl
        focus:outline-none focus:bg-blue-50 focus:ring-2 focus:ring-blue-500
        ${
        props.cell.isInitial
          ? "font-bold text-gray-900 bg-gray-50 cursor-not-allowed"
          : "text-blue-600 bg-white"
      }
      `}
      maxLength={1}
    />
  );
};
