import { describe, expect, it } from "vitest";
import {
  findBlockDuplicates,
  findColumnDuplicates,
  findDuplicates,
  findRowDuplicates,
  transpose,
} from "../../src/utils/findDuplicates.ts";
import { makePosition } from "../../src/types/Sudoku.ts";
import type { Grid } from "../../src/types/Sudoku.ts";
import {
  createEmptyGrid,
  createEmptyRow,
} from "../../src/utils/createEmptyGrid.ts";

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
      ...createEmptyGrid().slice(3),
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
      ...createEmptyGrid().slice(2),
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
      ...createEmptyGrid().slice(2),
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
      ...createEmptyGrid().slice(1),
    ];

    const result = findRowDuplicates(grid);
    expect(result.size).toBe(2);
    expect(result.has(makePosition({ row: 0, col: 0 }))).toBe(true);
    expect(result.has(makePosition({ row: 0, col: 2 }))).toBe(true);
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
      ...createEmptyGrid().slice(2),
    ];

    const result = findRowDuplicates(grid);
    expect(result.size).toBe(4);
    expect(result.has(makePosition({ row: 0, col: 0 }))).toBe(true);
    expect(result.has(makePosition({ row: 0, col: 2 }))).toBe(true);
    expect(result.has(makePosition({ row: 1, col: 0 }))).toBe(true);
    expect(result.has(makePosition({ row: 1, col: 1 }))).toBe(true);
  });

  it("should find all duplicates when value appears three times", () => {
    const grid: Grid = [
      [
        { value: 1, isInitial: true, hasError: false },
        { value: 1, isInitial: false, hasError: false }, // duplicate
        { value: 1, isInitial: false, hasError: false }, // duplicate
        ...createEmptyRow().slice(3),
      ],
      ...createEmptyGrid().slice(1),
    ];

    const result = findRowDuplicates(grid);
    expect(result.size).toBe(3);
    expect(result.has(makePosition({ row: 0, col: 0 }))).toBe(true);
    expect(result.has(makePosition({ row: 0, col: 1 }))).toBe(true);
    expect(result.has(makePosition({ row: 0, col: 2 }))).toBe(true);
  });

  it("should ignore undefined values", () => {
    const grid: Grid = createEmptyGrid();

    const result = findRowDuplicates(grid);
    expect(result.size).toBe(0);
  });
});

describe("findColumnDuplicates", () => {
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
      ...createEmptyGrid().slice(3),
    ];

    const result = findColumnDuplicates(grid);
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
      ...createEmptyGrid().slice(3),
    ];

    const result = findColumnDuplicates(grid);
    expect(result.size).toBe(2);
    expect(result.has(makePosition({ row: 0, col: 0 }))).toBe(true);
    expect(result.has(makePosition({ row: 2, col: 0 }))).toBe(true);
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
      ...createEmptyGrid().slice(2),
    ];

    const result = findColumnDuplicates(grid);
    expect(result.size).toBe(4);
    expect(result.has(makePosition({ row: 0, col: 0 }))).toBe(true);
    expect(result.has(makePosition({ row: 1, col: 0 }))).toBe(true);
    expect(result.has(makePosition({ row: 0, col: 1 }))).toBe(true);
    expect(result.has(makePosition({ row: 1, col: 1 }))).toBe(true);
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
      ...createEmptyGrid().slice(3),
    ];

    const result = findColumnDuplicates(grid);
    expect(result.size).toBe(3);
    expect(result.has(makePosition({ row: 0, col: 0 }))).toBe(true);
    expect(result.has(makePosition({ row: 1, col: 0 }))).toBe(true);
    expect(result.has(makePosition({ row: 2, col: 0 }))).toBe(true);
  });

  it("should ignore undefined values", () => {
    const grid: Grid = createEmptyGrid();

    const result = findColumnDuplicates(grid);
    expect(result.size).toBe(0);
  });
});

describe("findBlockDuplicates", () => {
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
      [
        { value: 7, isInitial: true, hasError: false },
        { value: 8, isInitial: true, hasError: false },
        { value: 9, isInitial: true, hasError: false },
        ...createEmptyRow().slice(3),
      ],
      ...createEmptyGrid().slice(3),
    ];

    const result = findBlockDuplicates(grid);
    expect(result.size).toBe(0);
  });

  it("should find duplicates in a single 3x3 block", () => {
    const grid: Grid = [
      [
        { value: 1, isInitial: true, hasError: false },
        { value: 2, isInitial: true, hasError: false },
        { value: 3, isInitial: true, hasError: false },
        ...createEmptyRow().slice(3),
      ],
      [
        { value: 4, isInitial: true, hasError: false },
        { value: 1, isInitial: false, hasError: false }, // duplicate in same block
        { value: 6, isInitial: true, hasError: false },
        ...createEmptyRow().slice(3),
      ],
      [
        { value: 7, isInitial: true, hasError: false },
        { value: 8, isInitial: true, hasError: false },
        { value: 9, isInitial: true, hasError: false },
        ...createEmptyRow().slice(3),
      ],
      ...createEmptyGrid().slice(3),
    ];

    const result = findBlockDuplicates(grid);
    expect(result.size).toBe(2);
    expect(result.has(makePosition({ row: 0, col: 0 }))).toBe(true);
    expect(result.has(makePosition({ row: 1, col: 1 }))).toBe(true);
  });

  it("should find duplicates in different blocks", () => {
    const grid: Grid = [
      [
        { value: 1, isInitial: true, hasError: false },
        { value: 1, isInitial: false, hasError: false }, // duplicate in top-left block
        { value: 3, isInitial: true, hasError: false },
        { value: 5, isInitial: true, hasError: false },
        { value: 5, isInitial: false, hasError: false }, // duplicate in top-middle block
        ...createEmptyRow().slice(5),
      ],
      ...createEmptyGrid().slice(1),
    ];

    const result = findBlockDuplicates(grid);
    expect(result.size).toBe(4);
    expect(result.has(makePosition({ row: 0, col: 0 }))).toBe(true);
    expect(result.has(makePosition({ row: 0, col: 1 }))).toBe(true);
    expect(result.has(makePosition({ row: 0, col: 3 }))).toBe(true);
    expect(result.has(makePosition({ row: 0, col: 4 }))).toBe(true);
  });

  it("should find all duplicates when value appears three times in a block", () => {
    const grid: Grid = [
      [
        { value: 1, isInitial: true, hasError: false },
        { value: 1, isInitial: false, hasError: false }, // duplicate
        { value: 3, isInitial: true, hasError: false },
        ...createEmptyRow().slice(3),
      ],
      [
        { value: 1, isInitial: false, hasError: false }, // duplicate
        { value: 5, isInitial: true, hasError: false },
        { value: 6, isInitial: true, hasError: false },
        ...createEmptyRow().slice(3),
      ],
      ...createEmptyGrid().slice(2),
    ];

    const result = findBlockDuplicates(grid);
    expect(result.size).toBe(3);
    expect(result.has(makePosition({ row: 0, col: 0 }))).toBe(true);
    expect(result.has(makePosition({ row: 0, col: 1 }))).toBe(true);
    expect(result.has(makePosition({ row: 1, col: 0 }))).toBe(true);
  });

  it("should find duplicates in bottom-right block", () => {
    const grid: Grid = [
      ...createEmptyGrid().slice(0, 6),
      [
        ...createEmptyRow().slice(0, 6),
        { value: 1, isInitial: true, hasError: false },
        { value: 2, isInitial: true, hasError: false },
        { value: 3, isInitial: true, hasError: false },
      ],
      [
        ...createEmptyRow().slice(0, 6),
        { value: 4, isInitial: true, hasError: false },
        { value: 1, isInitial: false, hasError: false }, // duplicate in bottom-right block
        { value: 6, isInitial: true, hasError: false },
      ],
      [
        ...createEmptyRow().slice(0, 6),
        { value: 7, isInitial: true, hasError: false },
        { value: 8, isInitial: true, hasError: false },
        { value: 9, isInitial: true, hasError: false },
      ],
    ];

    const result = findBlockDuplicates(grid);
    expect(result.size).toBe(2);
    expect(result.has(makePosition({ row: 6, col: 6 }))).toBe(true);
    expect(result.has(makePosition({ row: 7, col: 7 }))).toBe(true);
  });

  it("should ignore undefined values", () => {
    const grid: Grid = createEmptyGrid();

    const result = findBlockDuplicates(grid);
    expect(result.size).toBe(0);
  });

  it("should not detect duplicates across different blocks", () => {
    const grid: Grid = [
      [
        { value: 1, isInitial: true, hasError: false },
        { value: 2, isInitial: true, hasError: false },
        { value: 3, isInitial: true, hasError: false },
        { value: 1, isInitial: true, hasError: false }, // same value but different block
        ...createEmptyRow().slice(4),
      ],
      ...createEmptyGrid().slice(1),
    ];

    const result = findBlockDuplicates(grid);
    expect(result.size).toBe(0);
  });
});

describe("findDuplicates", () => {
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
      [
        { value: 7, isInitial: true, hasError: false },
        { value: 8, isInitial: true, hasError: false },
        { value: 9, isInitial: true, hasError: false },
        ...createEmptyRow().slice(3),
      ],
      ...createEmptyGrid().slice(3),
    ];

    const result = findDuplicates(grid);
    expect(result.size).toBe(0);
  });

  it("should find row duplicates only", () => {
    const grid: Grid = [
      [
        { value: 1, isInitial: true, hasError: false },
        { value: 2, isInitial: true, hasError: false },
        { value: 1, isInitial: false, hasError: false }, // duplicate in row
        ...createEmptyRow().slice(3),
      ],
      ...createEmptyGrid().slice(1),
    ];

    const result = findDuplicates(grid);
    expect(result.size).toBe(2);
    expect(result.has(makePosition({ row: 0, col: 0 }))).toBe(true);
    expect(result.has(makePosition({ row: 0, col: 2 }))).toBe(true);
  });

  it("should find column duplicates only", () => {
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
        { value: 1, isInitial: false, hasError: false }, // duplicate in column
        ...createEmptyRow().slice(1),
      ],
      ...createEmptyGrid().slice(3),
    ];

    const result = findDuplicates(grid);
    expect(result.size).toBe(2);
    expect(result.has(makePosition({ row: 0, col: 0 }))).toBe(true);
    expect(result.has(makePosition({ row: 2, col: 0 }))).toBe(true);
  });

  it("should find block duplicates only", () => {
    const grid: Grid = [
      [
        { value: 1, isInitial: true, hasError: false },
        { value: 2, isInitial: true, hasError: false },
        { value: 3, isInitial: true, hasError: false },
        ...createEmptyRow().slice(3),
      ],
      [
        { value: 4, isInitial: true, hasError: false },
        { value: 1, isInitial: false, hasError: false }, // duplicate in block
        { value: 6, isInitial: true, hasError: false },
        ...createEmptyRow().slice(3),
      ],
      [
        { value: 7, isInitial: true, hasError: false },
        { value: 8, isInitial: true, hasError: false },
        { value: 9, isInitial: true, hasError: false },
        ...createEmptyRow().slice(3),
      ],
      ...createEmptyGrid().slice(3),
    ];

    const result = findDuplicates(grid);
    expect(result.size).toBe(2);
    expect(result.has(makePosition({ row: 0, col: 0 }))).toBe(true);
    expect(result.has(makePosition({ row: 1, col: 1 }))).toBe(true);
  });

  it("should find duplicates in both row and column", () => {
    const grid: Grid = [
      [
        { value: 1, isInitial: true, hasError: false },
        { value: 2, isInitial: true, hasError: false },
        { value: 1, isInitial: false, hasError: false }, // duplicate in row
        ...createEmptyRow().slice(3),
      ],
      [
        { value: 3, isInitial: true, hasError: false },
        { value: 2, isInitial: false, hasError: false }, // duplicate in column
        ...createEmptyRow().slice(2),
      ],
      ...createEmptyGrid().slice(2),
    ];

    const result = findDuplicates(grid);
    expect(result.size).toBe(4);
    expect(result.has(makePosition({ row: 0, col: 0 }))).toBe(true);
    expect(result.has(makePosition({ row: 0, col: 2 }))).toBe(true);
    expect(result.has(makePosition({ row: 0, col: 1 }))).toBe(true);
    expect(result.has(makePosition({ row: 1, col: 1 }))).toBe(true);
  });

  it("should find duplicates in row and block", () => {
    const grid: Grid = [
      [
        { value: 1, isInitial: true, hasError: false },
        { value: 1, isInitial: false, hasError: false }, // duplicate in row and block
        { value: 3, isInitial: true, hasError: false },
        ...createEmptyRow().slice(3),
      ],
      ...createEmptyGrid().slice(1),
    ];

    const result = findDuplicates(grid);
    expect(result.size).toBe(2);
    expect(result.has(makePosition({ row: 0, col: 0 }))).toBe(true);
    expect(result.has(makePosition({ row: 0, col: 1 }))).toBe(true);
  });

  it("should find duplicates in column and block", () => {
    const grid: Grid = [
      [
        { value: 1, isInitial: true, hasError: false },
        { value: 2, isInitial: true, hasError: false },
        { value: 3, isInitial: true, hasError: false },
        ...createEmptyRow().slice(3),
      ],
      [
        { value: 1, isInitial: false, hasError: false }, // duplicate in column and block
        { value: 5, isInitial: true, hasError: false },
        { value: 6, isInitial: true, hasError: false },
        ...createEmptyRow().slice(3),
      ],
      ...createEmptyGrid().slice(2),
    ];

    const result = findDuplicates(grid);
    expect(result.size).toBe(2);
    expect(result.has(makePosition({ row: 0, col: 0 }))).toBe(true);
    expect(result.has(makePosition({ row: 1, col: 0 }))).toBe(true);
  });

  it("should find duplicates in row, column, and block", () => {
    const grid: Grid = [
      [
        { value: 1, isInitial: true, hasError: false },
        { value: 2, isInitial: true, hasError: false },
        { value: 3, isInitial: true, hasError: false },
        { value: 4, isInitial: true, hasError: false },
        ...createEmptyRow().slice(4),
      ],
      [
        { value: 1, isInitial: false, hasError: false }, // duplicate in column and block with (0,0)
        { value: 2, isInitial: false, hasError: false }, // duplicate in column and block with (0,1)
        { value: 5, isInitial: true, hasError: false },
        { value: 4, isInitial: false, hasError: false }, // duplicate in row with (0,3)
        ...createEmptyRow().slice(4),
      ],
      ...createEmptyGrid().slice(2),
    ];

    const result = findDuplicates(grid);
    expect(result.size).toBe(6);
    // Column duplicates
    expect(result.has(makePosition({ row: 0, col: 0 }))).toBe(true);
    expect(result.has(makePosition({ row: 1, col: 0 }))).toBe(true);
    expect(result.has(makePosition({ row: 0, col: 1 }))).toBe(true);
    expect(result.has(makePosition({ row: 1, col: 1 }))).toBe(true);
    // Row duplicates
    expect(result.has(makePosition({ row: 0, col: 3 }))).toBe(true);
    expect(result.has(makePosition({ row: 1, col: 3 }))).toBe(true);
  });

  it("should handle same cell being duplicate in multiple ways", () => {
    // Cell at (1,1) has value 1, which duplicates with:
    // - (0,1) in same column
    // - (1,0) in same row
    // - (0,0) in same block (which also has value 1)
    const grid: Grid = [
      [
        { value: 1, isInitial: true, hasError: false },
        { value: 1, isInitial: false, hasError: false }, // duplicate in row and block
        { value: 3, isInitial: true, hasError: false },
        ...createEmptyRow().slice(3),
      ],
      [
        { value: 1, isInitial: false, hasError: false }, // duplicate in column and block
        { value: 1, isInitial: false, hasError: false }, // duplicate in row, column, and block
        { value: 6, isInitial: true, hasError: false },
        ...createEmptyRow().slice(3),
      ],
      ...createEmptyGrid().slice(2),
    ];

    const result = findDuplicates(grid);
    // All four cells with value 1 should be marked as duplicates
    expect(result.size).toBe(4);
    expect(result.has(makePosition({ row: 0, col: 0 }))).toBe(true);
    expect(result.has(makePosition({ row: 0, col: 1 }))).toBe(true);
    expect(result.has(makePosition({ row: 1, col: 0 }))).toBe(true);
    expect(result.has(makePosition({ row: 1, col: 1 }))).toBe(true);
  });

  it("should ignore undefined values", () => {
    const grid: Grid = createEmptyGrid();

    const result = findDuplicates(grid);
    expect(result.size).toBe(0);
  });

  it("should handle multiple separate duplicate groups", () => {
    const grid: Grid = [
      [
        { value: 1, isInitial: true, hasError: false },
        { value: 1, isInitial: false, hasError: false }, // duplicate group 1
        { value: 3, isInitial: true, hasError: false },
        { value: 2, isInitial: true, hasError: false },
        { value: 2, isInitial: false, hasError: false }, // duplicate group 2
        ...createEmptyRow().slice(5),
      ],
      [
        { value: 5, isInitial: true, hasError: false },
        { value: 5, isInitial: false, hasError: false }, // duplicate group 3
        ...createEmptyRow().slice(2),
      ],
      ...createEmptyGrid().slice(2),
    ];

    const result = findDuplicates(grid);
    expect(result.size).toBe(6);
    // Group 1
    expect(result.has(makePosition({ row: 0, col: 0 }))).toBe(true);
    expect(result.has(makePosition({ row: 0, col: 1 }))).toBe(true);
    // Group 2
    expect(result.has(makePosition({ row: 0, col: 3 }))).toBe(true);
    expect(result.has(makePosition({ row: 0, col: 4 }))).toBe(true);
    // Group 3
    expect(result.has(makePosition({ row: 1, col: 0 }))).toBe(true);
    expect(result.has(makePosition({ row: 1, col: 1 }))).toBe(true);
  });
});
