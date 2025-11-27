import { describe, expect, it } from "vitest";
import {
  findColDuplicates,
  findRowDuplicates,
  transpose,
} from "../../src/utils/findDuplicates.ts";
import { Position } from "../../src/types/Sudoku.ts";
import type { Cell, Grid } from "../../src/types/Sudoku.ts";

// Helper to create empty cells and rows
const emptyCell: Cell = { value: undefined, isInitial: false, hasError: false };
const createEmptyRow = (): Cell[] =>
  Array.from({ length: 9 }, () => ({ ...emptyCell }));
const createEmptyBoard = (): Grid =>
  Array.from({ length: 9 }, () => createEmptyRow());

describe("transpose", () => {
  it("should transpose a 9x9 grid correctly", () => {
    const grid: Grid = [
      [
        { value: 1, isInitial: true, hasError: false },
        { value: 2, isInitial: true, hasError: false },
        { value: 3, isInitial: true, hasError: false },
        ...createEmptyRow().slice(3),
      ],
      [
        { value: 4, isInitial: true, hasError: false },
        { value: 5, isInitial: true, hasError: false },
        { value: 6, isInitial: true, hasError: false },
        ...createEmptyRow().slice(3),
      ],
      [
        { value: 7, isInitial: false, hasError: false },
        { value: 8, isInitial: false, hasError: false },
        { value: 9, isInitial: false, hasError: false },
        ...createEmptyRow().slice(3),
      ],
      ...createEmptyBoard().slice(3),
    ];

    const result = transpose(grid);

    // Check dimensions
    expect(result.length).toBe(9);
    expect(result[0].length).toBe(9);

    // Check that grid[row][col] becomes result[col][row]
    expect(result[0][0]).toEqual({
      value: 1,
      isInitial: true,
      hasError: false,
    });
    expect(result[1][0]).toEqual({
      value: 2,
      isInitial: true,
      hasError: false,
    });
    expect(result[2][0]).toEqual({
      value: 3,
      isInitial: true,
      hasError: false,
    });
    expect(result[0][1]).toEqual({
      value: 4,
      isInitial: true,
      hasError: false,
    });
    expect(result[1][1]).toEqual({
      value: 5,
      isInitial: true,
      hasError: false,
    });
    expect(result[2][1]).toEqual({
      value: 6,
      isInitial: true,
      hasError: false,
    });
    expect(result[0][2]).toEqual({
      value: 7,
      isInitial: false,
      hasError: false,
    });
    expect(result[1][2]).toEqual({
      value: 8,
      isInitial: false,
      hasError: false,
    });
    expect(result[2][2]).toEqual({
      value: 9,
      isInitial: false,
      hasError: false,
    });
  });

  it("should preserve all cell properties", () => {
    const grid: Grid = [
      [
        { value: 1, isInitial: true, hasError: false },
        ...createEmptyRow().slice(1),
      ],
      [
        { value: 2, isInitial: false, hasError: false },
        ...createEmptyRow().slice(1),
      ],
      ...createEmptyBoard().slice(2),
    ];

    const result = transpose(grid);

    // Check that isInitial is preserved
    expect(result[0][0].isInitial).toBe(true);
    expect(result[0][1].isInitial).toBe(false);
  });
});

describe("findRowDuplicates", () => {
  it("should return empty set for grid with no duplicates", () => {
    const grid: Grid = [
      [
        { value: 1, isInitial: true, hasError: false },
        { value: 2, isInitial: true, hasError: false },
        { value: 3, isInitial: true, hasError: false },
        ...createEmptyRow().slice(3),
      ],
      [
        { value: 4, isInitial: true, hasError: false },
        { value: 5, isInitial: true, hasError: false },
        { value: 6, isInitial: true, hasError: false },
        ...createEmptyRow().slice(3),
      ],
      ...createEmptyBoard().slice(2),
    ];

    const result = findRowDuplicates(grid);
    expect(result.size).toBe(0);
  });

  it("should find duplicates in a single row", () => {
    const grid: Grid = [
      [
        { value: 1, isInitial: true, hasError: false },
        { value: 2, isInitial: true, hasError: false },
        { value: 1, isInitial: false, hasError: false }, // duplicate
        ...createEmptyRow().slice(3),
      ],
      ...createEmptyBoard().slice(1),
    ];

    const result = findRowDuplicates(grid);
    expect(result.size).toBe(2);
    expect(result.has(Position({ row: 0, col: 0 }))).toBe(true);
    expect(result.has(Position({ row: 0, col: 2 }))).toBe(true);
  });

  it("should find duplicates in multiple rows", () => {
    const grid: Grid = [
      [
        { value: 1, isInitial: true, hasError: false },
        { value: 2, isInitial: true, hasError: false },
        { value: 1, isInitial: false, hasError: false }, // duplicate
        ...createEmptyRow().slice(3),
      ],
      [
        { value: 5, isInitial: true, hasError: false },
        { value: 5, isInitial: false, hasError: false }, // duplicate
        ...createEmptyRow().slice(2),
      ],
      ...createEmptyBoard().slice(2),
    ];

    const result = findRowDuplicates(grid);
    expect(result.size).toBe(4);
    expect(result.has(Position({ row: 0, col: 0 }))).toBe(true);
    expect(result.has(Position({ row: 0, col: 2 }))).toBe(true);
    expect(result.has(Position({ row: 1, col: 0 }))).toBe(true);
    expect(result.has(Position({ row: 1, col: 1 }))).toBe(true);
  });

  it("should find all duplicates when value appears three times", () => {
    const grid: Grid = [
      [
        { value: 1, isInitial: true, hasError: false },
        { value: 1, isInitial: false, hasError: false }, // duplicate
        { value: 1, isInitial: false, hasError: false }, // duplicate
        ...createEmptyRow().slice(3),
      ],
      ...createEmptyBoard().slice(1),
    ];

    const result = findRowDuplicates(grid);
    expect(result.size).toBe(3);
    expect(result.has(Position({ row: 0, col: 0 }))).toBe(true);
    expect(result.has(Position({ row: 0, col: 1 }))).toBe(true);
    expect(result.has(Position({ row: 0, col: 2 }))).toBe(true);
  });

  it("should ignore undefined values", () => {
    const grid: Grid = createEmptyBoard();

    const result = findRowDuplicates(grid);
    expect(result.size).toBe(0);
  });
});

describe("findColDuplicates", () => {
  it("should return empty set for grid with no duplicates", () => {
    const grid: Grid = [
      [
        { value: 1, isInitial: true, hasError: false },
        { value: 4, isInitial: true, hasError: false },
        { value: 7, isInitial: true, hasError: false },
        ...createEmptyRow().slice(3),
      ],
      [
        { value: 2, isInitial: true, hasError: false },
        { value: 5, isInitial: true, hasError: false },
        { value: 8, isInitial: true, hasError: false },
        ...createEmptyRow().slice(3),
      ],
      [
        { value: 3, isInitial: true, hasError: false },
        { value: 6, isInitial: true, hasError: false },
        { value: 9, isInitial: true, hasError: false },
        ...createEmptyRow().slice(3),
      ],
      ...createEmptyBoard().slice(3),
    ];

    const result = findColDuplicates(grid);
    expect(result.size).toBe(0);
  });

  it("should find duplicates in a single column", () => {
    const grid: Grid = [
      [
        { value: 1, isInitial: true, hasError: false },
        ...createEmptyRow().slice(1),
      ],
      [
        { value: 2, isInitial: true, hasError: false },
        ...createEmptyRow().slice(1),
      ],
      [
        { value: 1, isInitial: false, hasError: false }, // duplicate - same column
        ...createEmptyRow().slice(1),
      ],
      ...createEmptyBoard().slice(3),
    ];

    const result = findColDuplicates(grid);
    expect(result.size).toBe(2);
    expect(result.has(Position({ row: 0, col: 0 }))).toBe(true);
    expect(result.has(Position({ row: 2, col: 0 }))).toBe(true);
  });

  it("should find duplicates in multiple columns", () => {
    const grid: Grid = [
      [
        { value: 1, isInitial: true, hasError: false },
        { value: 5, isInitial: true, hasError: false },
        ...createEmptyRow().slice(2),
      ],
      [
        { value: 1, isInitial: false, hasError: false }, // duplicate col 0
        { value: 5, isInitial: false, hasError: false }, // duplicate col 1
        ...createEmptyRow().slice(2),
      ],
      ...createEmptyBoard().slice(2),
    ];

    const result = findColDuplicates(grid);
    expect(result.size).toBe(4);
    expect(result.has(Position({ row: 0, col: 0 }))).toBe(true);
    expect(result.has(Position({ row: 1, col: 0 }))).toBe(true);
    expect(result.has(Position({ row: 0, col: 1 }))).toBe(true);
    expect(result.has(Position({ row: 1, col: 1 }))).toBe(true);
  });

  it("should find all duplicates when value appears three times in a column", () => {
    const grid: Grid = [
      [
        { value: 1, isInitial: true, hasError: false },
        ...createEmptyRow().slice(1),
      ],
      [
        { value: 1, isInitial: false, hasError: false }, // duplicate
        ...createEmptyRow().slice(1),
      ],
      [
        { value: 1, isInitial: false, hasError: false }, // duplicate
        ...createEmptyRow().slice(1),
      ],
      ...createEmptyBoard().slice(3),
    ];

    const result = findColDuplicates(grid);
    expect(result.size).toBe(3);
    expect(result.has(Position({ row: 0, col: 0 }))).toBe(true);
    expect(result.has(Position({ row: 1, col: 0 }))).toBe(true);
    expect(result.has(Position({ row: 2, col: 0 }))).toBe(true);
  });

  it("should ignore undefined values", () => {
    const grid: Grid = createEmptyBoard();

    const result = findColDuplicates(grid);
    expect(result.size).toBe(0);
  });
});
