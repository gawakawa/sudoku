import { describe, expect, it } from "vitest";
import { generateCompleteGrid } from "../../src/generator/generateCompleteGrid.ts";
import type { Digit, Grid } from "../../src/types/Sudoku.ts";

// Helper functions for validation
const getRow = (grid: Grid, row: number): (Digit | undefined)[] =>
  grid[row].map((cell) => cell.value);

const getCol = (grid: Grid, col: number): (Digit | undefined)[] =>
  grid.map((row) => row[col].value);

const getBlock = (
  grid: Grid,
  blockRow: number,
  blockCol: number,
): (Digit | undefined)[] =>
  [0, 1, 2].flatMap((dr) =>
    [0, 1, 2].map((dc) => grid[blockRow * 3 + dr][blockCol * 3 + dc].value)
  );

const hasAllDigits = (values: (Digit | undefined)[]): boolean => {
  const defined = values.filter((v) => v !== undefined);
  return defined.length === 9 && new Set(defined).size === 9;
};

describe("generateCompleteGrid", () => {
  it("should fill all 81 cells", () => {
    const grid = generateCompleteGrid();

    const filledCount = grid
      .flat()
      .filter((cell) => cell.value !== undefined).length;
    expect(filledCount).toBe(81);
  });

  it("should have each digit 1-9 in every row", () => {
    const grid = generateCompleteGrid();

    [0, 1, 2, 3, 4, 5, 6, 7, 8].forEach((row) => {
      expect(hasAllDigits(getRow(grid, row))).toBe(true);
    });
  });

  it("should have each digit 1-9 in every column", () => {
    const grid = generateCompleteGrid();

    [0, 1, 2, 3, 4, 5, 6, 7, 8].forEach((col) => {
      expect(hasAllDigits(getCol(grid, col))).toBe(true);
    });
  });

  it("should have each digit 1-9 in every 3x3 block", () => {
    const grid = generateCompleteGrid();

    [0, 1, 2].forEach((blockRow) => {
      [0, 1, 2].forEach((blockCol) => {
        expect(hasAllDigits(getBlock(grid, blockRow, blockCol))).toBe(true);
      });
    });
  });

  it("should mark all cells as isInitial: true", () => {
    const grid = generateCompleteGrid();

    const allInitial = grid.flat().every((cell) => cell.isInitial === true);
    expect(allInitial).toBe(true);
  });
});
