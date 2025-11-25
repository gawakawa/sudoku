import type { Component } from "solid-js";
import type { Cell, Digit } from "../types/Sudoku";

type SudokuCellProps = {
  cell: Cell;
  onChange: (value: Digit | undefined) => void;
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
      class={props.cell.isInitial ? "initial" : ""}
      maxLength={1}
    />
  );
};
