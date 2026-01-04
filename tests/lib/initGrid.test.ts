import { describe, expect, it } from "vitest";
import { initCell, initGrid } from "../../src/lib/initGrid.ts";

describe("initCell", () => {
  it("should have undefined value", () => {
    expect(initCell().value).toBeUndefined();
  });

  it("should not be initial", () => {
    expect(initCell().isInitial).toBe(false);
  });
});

describe("initGrid", () => {
  it("should create a 9x9 grid", () => {
    const board = initGrid();
    expect(board).toHaveLength(9);
    board.forEach((row) => {
      expect(row).toHaveLength(9);
    });
  });

  it("should create cells with empty values", () => {
    const board = initGrid();
    board.forEach((row) => {
      row.forEach((cell) => {
        expect(cell.value).toBeUndefined();
        expect(cell.isInitial).toBe(false);
      });
    });
  });

  it("should create independent cell objects", () => {
    const board = initGrid();
    board[0][0].value = 5;
    expect(board[0][1].value).toBeUndefined();
    expect(board[1][0].value).toBeUndefined();
  });

  it("should create independent row arrays", () => {
    const board = initGrid();
    const originalLength = board[0].length;
    board[0].push({ value: 5, isInitial: true });
    expect(board[1]).toHaveLength(originalLength);
  });
});
