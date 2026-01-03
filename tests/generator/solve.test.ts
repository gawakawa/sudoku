import { describe, expect, it } from "vitest";
import { solve } from "../../src/generator/solve.ts";
import { createEmptyGrid } from "../../src/generator/createEmptyGrid.ts";
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

describe("solve", () => {
  it("should return solved tag for empty grid", () => {
    const grid = createEmptyGrid();
    const result = solve(grid);

    expect(result.tag).toBe("solved");
  });

  it("should fill all 81 cells with values", () => {
    const grid = createEmptyGrid();
    const result = solve(grid);

    expect(result.tag).toBe("solved");
    if (result.tag !== "solved") return;

    const filledCount = result.grid
      .flat()
      .filter((cell) => cell.value !== undefined).length;
    expect(filledCount).toBe(81);
  });

  it("should have each digit 1-9 in every row", () => {
    const grid = createEmptyGrid();
    const result = solve(grid);

    expect(result.tag).toBe("solved");
    if (result.tag !== "solved") return;

    [0, 1, 2, 3, 4, 5, 6, 7, 8].forEach((row) => {
      expect(hasAllDigits(getRow(result.grid, row))).toBe(true);
    });
  });

  it("should have each digit 1-9 in every column", () => {
    const grid = createEmptyGrid();
    const result = solve(grid);

    expect(result.tag).toBe("solved");
    if (result.tag !== "solved") return;

    [0, 1, 2, 3, 4, 5, 6, 7, 8].forEach((col) => {
      expect(hasAllDigits(getCol(result.grid, col))).toBe(true);
    });
  });

  it("should have each digit 1-9 in every 3x3 block", () => {
    const grid = createEmptyGrid();
    const result = solve(grid);

    expect(result.tag).toBe("solved");
    if (result.tag !== "solved") return;

    [0, 1, 2].forEach((blockRow) => {
      [0, 1, 2].forEach((blockCol) => {
        expect(hasAllDigits(getBlock(result.grid, blockRow, blockCol))).toBe(
          true,
        );
      });
    });
  });

  it("should return unsolvable for grid where a cell has no candidates", () => {
    const grid = createEmptyGrid();
    // Fill row 4 with 8 digits (leaving cell (4,4) empty)
    grid[4][0] = { value: 1, isInitial: true };
    grid[4][1] = { value: 2, isInitial: true };
    grid[4][2] = { value: 3, isInitial: true };
    grid[4][3] = { value: 9, isInitial: true };
    // grid[4][4] is empty - needs digit 4
    grid[4][5] = { value: 5, isInitial: true };
    grid[4][6] = { value: 6, isInitial: true };
    grid[4][7] = { value: 7, isInitial: true };
    grid[4][8] = { value: 8, isInitial: true };

    // Put 4 in column 4, so cell (4,4) has no valid candidates
    grid[0][4] = { value: 4, isInitial: true };

    const result = solve(grid);
    expect(result.tag).toBe("unsolvable");
  });

  it("should preserve already filled cells", () => {
    const grid = createEmptyGrid();
    // Set some initial values
    grid[0][0] = { value: 5, isInitial: true };
    grid[4][4] = { value: 9, isInitial: true };
    grid[8][8] = { value: 1, isInitial: true };

    const result = solve(grid);

    expect(result.tag).toBe("solved");
    if (result.tag !== "solved") return;

    // Check that initial values are preserved
    expect(result.grid[0][0].value).toBe(5);
    expect(result.grid[4][4].value).toBe(9);
    expect(result.grid[8][8].value).toBe(1);
  });
});
