import type {
  CellValue,
  Grid,
  NavigationDirection,
  Position,
} from "../types/Sudoku";
import { SudokuCell } from "./SudokuCell";
import { incrementGridRender } from "../lib/metrics";

type SudokuGridProps = {
  grid: Grid;
  onChange: (pos: Position, value: CellValue) => void;
  hasError: (row: number, col: number) => boolean;
};

export function SudokuGrid({ grid, onChange, hasError }: SudokuGridProps) {
  // Track component initialization for performance metrics
  incrementGridRender();

  const cellRefs: (HTMLInputElement | null)[][] = Array.from(
    { length: 9 },
    () => Array(9).fill(null),
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
    <div className="inline-block border-2 border-gray-900">
      <div className="grid grid-cols-9">
        {grid.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={`
                ${
                colIndex === 2 || colIndex === 5
                  ? "border-r-2 border-r-gray-900"
                  : ""
              }
                ${
                rowIndex === 2 || rowIndex === 5
                  ? "border-b-2 border-b-gray-900"
                  : ""
              }
              `}
            >
              <SudokuCell
                cell={cell}
                cellId={rowIndex * 9 + colIndex}
                hasError={hasError(rowIndex, colIndex)}
                onChange={(value: CellValue) =>
                  onChange({ row: rowIndex, col: colIndex }, value)}
                onNavigate={(direction) =>
                  handleNavigate(rowIndex, colIndex, direction)}
                inputRef={(el) => {
                  cellRefs[rowIndex][colIndex] = el;
                }}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
