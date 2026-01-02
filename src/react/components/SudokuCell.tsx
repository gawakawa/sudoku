import { useEffect } from "react";
import type {
  Cell,
  CellValue,
  Digit,
  NavigationDirection,
} from "../types/Sudoku";
import { incrementCellUpdate } from "../lib/metrics";

type SudokuCellProps = {
  cell: Cell;
  cellId: number;
  hasError: boolean;
  onChange: (value: CellValue) => void;
  onNavigate: (direction: NavigationDirection) => void;
  inputRef?: (el: HTMLInputElement | null) => void;
};

export function SudokuCell(
  { cell, cellId, hasError, onChange, onNavigate, inputRef }: SudokuCellProps,
) {
  // Track reactive updates for performance metrics
  useEffect(() => {
    incrementCellUpdate(cellId);
  });

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" || e.key === "Delete") {
      if (cell.isInitial) {
        e.preventDefault();
        return;
      }
      e.preventDefault();
      onChange(undefined);
      return;
    }

    switch (e.key) {
      case "ArrowUp":
        e.preventDefault();
        onNavigate("up");
        return;
      case "ArrowDown":
        e.preventDefault();
        onNavigate("down");
        return;
      case "ArrowLeft":
        e.preventDefault();
        onNavigate("left");
        return;
      case "ArrowRight":
        e.preventDefault();
        onNavigate("right");
        return;
    }

    if (e.key === "Tab") return;

    if (/^[1-9]$/.test(e.key)) {
      if (cell.isInitial) {
        e.preventDefault();
        return;
      }
      e.preventDefault();
      onChange(parseInt(e.key, 10) as Digit);
      return;
    }

    e.preventDefault();
  };

  const handleInput = (e: React.FormEvent<HTMLInputElement>) => {
    const value = e.currentTarget.value;
    if (value === "") return onChange(undefined);
    const num = parseInt(value, 10);
    if (Number.isNaN(num) || num < 1 || num > 9) return;
    onChange(num as Digit);
  };

  return (
    <input
      ref={inputRef}
      type="text"
      inputMode="numeric"
      pattern="[1-9]"
      maxLength={1}
      value={cell.value ?? ""}
      onKeyDown={handleKeyDown}
      onInput={handleInput}
      readOnly={cell.isInitial}
      className={`
        w-12 h-12
        border border-gray-300
        text-center text-xl
        caret-transparent
        focus:outline-none focus:bg-blue-50 focus:ring-2 focus:ring-blue-500
        ${
        hasError
          ? "bg-red-100 text-red-700 border-red-500"
          : cell.isInitial
          ? "font-bold text-gray-900 bg-gray-50 cursor-not-allowed"
          : "text-blue-600 bg-white"
      }
      `}
    />
  );
}
