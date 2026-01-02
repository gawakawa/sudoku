import { describe, expect, it } from "vitest";
import {
  createEmptyGrid,
  createEmptyRow,
  emptyCell,
} from "../../src/utils/createEmptyGrid.ts";

describe("emptyCell", () => {
  it("should have undefined value", () => {
    expect(emptyCell.value).toBeUndefined();
  });

  it("should not be initial", () => {
    expect(emptyCell.isInitial).toBe(false);
  });
});

describe("createEmptyRow", () => {
  it("should create a row with 9 cells", () => {
    const row = createEmptyRow();
    expect(row).toHaveLength(9);
  });

  it("should create cells with empty values", () => {
    const row = createEmptyRow();
    row.forEach((cell) => {
      expect(cell.value).toBeUndefined();
      expect(cell.isInitial).toBe(false);
    });
  });

  it("should create independent cell objects", () => {
    const row = createEmptyRow();
    row[0].value = 5;
    expect(row[1].value).toBeUndefined();
  });
});

describe("createEmptyGrid", () => {
  it("should create a 9x9 grid", () => {
    const board = createEmptyGrid();
    expect(board).toHaveLength(9);
    board.forEach((row) => {
      expect(row).toHaveLength(9);
    });
  });

  it("should create cells with empty values", () => {
    const board = createEmptyGrid();
    board.forEach((row) => {
      row.forEach((cell) => {
        expect(cell.value).toBeUndefined();
        expect(cell.isInitial).toBe(false);
      });
    });
  });

  it("should create independent cell objects", () => {
    const board = createEmptyGrid();
    board[0][0].value = 5;
    expect(board[0][1].value).toBeUndefined();
    expect(board[1][0].value).toBeUndefined();
  });

  it("should create independent row arrays", () => {
    const board = createEmptyGrid();
    const originalLength = board[0].length;
    board[0].push({ value: 5, isInitial: true });
    expect(board[1]).toHaveLength(originalLength);
  });
});
