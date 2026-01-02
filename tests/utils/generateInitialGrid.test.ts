import { describe, expect, it } from "vitest";
import { removeCells } from "../../src/utils/generateInitialGrid.ts";
import { Position } from "../../src/types/Sudoku.ts";
import type { Grid } from "../../src/types/Sudoku.ts";
import { emptyCell } from "../../src/utils/createEmptyGrid.ts";

describe("removeCells", () => {
  // Helper to create a simple test grid
  const createTestGrid = (): Grid => {
    return Array.from(
      { length: 9 },
      (_, row) =>
        Array.from({ length: 9 }, (_, col) => ({
          value: ((row * 9 + col + 1) % 9 || 9) as
            | 1
            | 2
            | 3
            | 4
            | 5
            | 6
            | 7
            | 8
            | 9,
          isInitial: true,
        })),
    );
  };

  it("should replace cells at specified positions with empty cells", () => {
    const grid = createTestGrid();
    const positions = [
      Position({ row: 0, col: 0 }),
      Position({ row: 4, col: 4 }),
      Position({ row: 8, col: 8 }),
    ];

    const result = removeCells(grid, positions);

    expect(result[0][0].value).toBeUndefined();
    expect(result[0][0].isInitial).toBe(false);

    expect(result[4][4].value).toBeUndefined();
    expect(result[4][4].isInitial).toBe(false);

    expect(result[8][8].value).toBeUndefined();
    expect(result[8][8].isInitial).toBe(false);
  });

  it("should preserve values at positions not specified for removal", () => {
    const grid = createTestGrid();
    const positions = [Position({ row: 0, col: 0 })];

    const result = removeCells(grid, positions);

    // Check that other cells retain their values
    expect(result[0][1].value).toBe(2);
    expect(result[1][0].value).toBe(1);
    expect(result[8][8].value).toBe(9);
  });

  it("should not mutate the original grid", () => {
    const grid = createTestGrid();
    const originalValue = grid[0][0].value;
    const positions = [Position({ row: 0, col: 0 })];

    removeCells(grid, positions);

    // Original grid should be unchanged
    expect(grid[0][0].value).toBe(originalValue);
    expect(grid[0][0].isInitial).toBe(true);
  });

  it("should preserve all cells when positions array is empty", () => {
    const grid = createTestGrid();
    const positions: Position[] = [];

    const result = removeCells(grid, positions);

    // All cells should retain their values
    result.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        expect(cell.value).toBe(grid[rowIndex][colIndex].value);
      });
    });
  });

  it("should handle multiple positions correctly", () => {
    const grid = createTestGrid();
    const positions = [
      Position({ row: 0, col: 0 }),
      Position({ row: 0, col: 1 }),
      Position({ row: 0, col: 2 }),
      Position({ row: 1, col: 0 }),
      Position({ row: 2, col: 0 }),
    ];

    const result = removeCells(grid, positions);

    // All specified positions should be empty
    positions.forEach((pos) => {
      expect(result[pos.row][pos.col].value).toBeUndefined();
      expect(result[pos.row][pos.col].isInitial).toBe(false);
    });

    // Other positions should retain their values
    expect(result[0][3].value).toBe(4);
    expect(result[1][1].value).toBe(2);
  });

  it("should create new cell objects, not reference emptyCell directly", () => {
    const grid = createTestGrid();
    const positions = [
      Position({ row: 0, col: 0 }),
      Position({ row: 0, col: 1 }),
    ];

    const result = removeCells(grid, positions);

    // Modifying one cell should not affect another
    result[0][0].value = 5;
    expect(result[0][1].value).toBeUndefined();
    expect(emptyCell.value).toBeUndefined();
  });
});
