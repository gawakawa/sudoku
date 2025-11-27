import { render, screen } from "@solidjs/testing-library";
import { describe, expect, test, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { App } from "../src/App.tsx";
import * as generateInitialGridModule from "../src/utils/generateInitialGrid.ts";
import type { Grid } from "../src/types/Sudoku.ts";

describe("<App />", () => {
  test("it renders the app title", () => {
    render(() => <App />);
    const title = screen.getByText("数独");
    expect(title).toBeInTheDocument();
    expect(title.tagName).toBe("H1");
  });

  test("it renders the SudokuGrid component", () => {
    const { container } = render(() => <App />);
    // Check that there are 81 input elements (9x9 grid)
    const inputs = container.querySelectorAll("input");
    expect(inputs).toHaveLength(81);
  });

  test("it initializes the grid using generateInitialGrid", () => {
    const mockGrid: Grid = Array.from(
      { length: 9 },
      (_, row) =>
        Array.from({ length: 9 }, (_, col) => ({
          value: row === 0 && col === 0 ? 5 : undefined,
          isInitial: row === 0 && col === 0,
          hasError: false,
        })),
    );

    const spy = vi
      .spyOn(generateInitialGridModule, "generateInitialGrid")
      .mockReturnValue(mockGrid);

    const { container } = render(() => <App />);

    expect(spy).toHaveBeenCalled();

    const firstInput = container.querySelector("input") as HTMLInputElement;
    expect(firstInput.value).toBe("5");

    spy.mockRestore();
  });

  test("it updates cell value when user inputs a digit", () => {
    const { container } = render(() => <App />);

    const inputs = container.querySelectorAll("input");
    // Find a non-initial cell (editable cell)
    const editableInput = Array.from(inputs).find(
      (input) => !(input as HTMLInputElement).readOnly,
    ) as HTMLInputElement;

    expect(editableInput).toBeDefined();

    // Simulate user input
    editableInput.value = "7";
    editableInput.dispatchEvent(new InputEvent("input", { bubbles: true }));

    // The input value should be updated
    expect(editableInput.value).toBe("7");
  });

  test("it marks cells with hasError when duplicates are detected in a row", () => {
    const mockGrid: Grid = Array.from(
      { length: 9 },
      (_, row) =>
        Array.from({ length: 9 }, (_, col) => ({
          value: undefined,
          isInitial: false,
          hasError: false,
        })),
    );

    vi.spyOn(generateInitialGridModule, "generateInitialGrid").mockReturnValue(
      mockGrid,
    );

    const { container } = render(() => <App />);

    const inputs = container.querySelectorAll("input");
    const firstInput = inputs[0] as HTMLInputElement; // row 0, col 0
    const secondInput = inputs[1] as HTMLInputElement; // row 0, col 1

    // Input the same value in two cells in the same row
    firstInput.value = "5";
    firstInput.dispatchEvent(new InputEvent("input", { bubbles: true }));

    secondInput.value = "5";
    secondInput.dispatchEvent(new InputEvent("input", { bubbles: true }));

    // Both cells should have error styling
    // The error class is applied to cells with hasError: true
    expect(firstInput.className).toContain("error");
    expect(secondInput.className).toContain("error");
  });

  test("it marks cells with hasError when duplicates are detected in a column", () => {
    const mockGrid: Grid = Array.from(
      { length: 9 },
      (_, row) =>
        Array.from({ length: 9 }, (_, col) => ({
          value: undefined,
          isInitial: false,
          hasError: false,
        })),
    );

    vi.spyOn(generateInitialGridModule, "generateInitialGrid").mockReturnValue(
      mockGrid,
    );

    const { container } = render(() => <App />);

    const inputs = container.querySelectorAll("input");
    const firstInput = inputs[0] as HTMLInputElement; // row 0, col 0
    const belowInput = inputs[9] as HTMLInputElement; // row 1, col 0

    // Input the same value in two cells in the same column
    firstInput.value = "3";
    firstInput.dispatchEvent(new InputEvent("input", { bubbles: true }));

    belowInput.value = "3";
    belowInput.dispatchEvent(new InputEvent("input", { bubbles: true }));

    // Both cells should have error styling
    expect(firstInput.className).toContain("error");
    expect(belowInput.className).toContain("error");
  });

  test("it marks cells with hasError when duplicates are detected in a 3x3 block", () => {
    const mockGrid: Grid = Array.from(
      { length: 9 },
      (_, row) =>
        Array.from({ length: 9 }, (_, col) => ({
          value: undefined,
          isInitial: false,
          hasError: false,
        })),
    );

    vi.spyOn(generateInitialGridModule, "generateInitialGrid").mockReturnValue(
      mockGrid,
    );

    const { container } = render(() => <App />);

    const inputs = container.querySelectorAll("input");
    const firstInput = inputs[0] as HTMLInputElement; // row 0, col 0
    const blockInput = inputs[10] as HTMLInputElement; // row 1, col 1 (same block)

    // Input the same value in two cells in the same 3x3 block
    firstInput.value = "8";
    firstInput.dispatchEvent(new InputEvent("input", { bubbles: true }));

    blockInput.value = "8";
    blockInput.dispatchEvent(new InputEvent("input", { bubbles: true }));

    // Both cells should have error styling
    expect(firstInput.className).toContain("error");
    expect(blockInput.className).toContain("error");
  });

  test("it clears hasError flag when duplicate is resolved", () => {
    const mockGrid: Grid = Array.from(
      { length: 9 },
      (_, row) =>
        Array.from({ length: 9 }, (_, col) => ({
          value: undefined,
          isInitial: false,
          hasError: false,
        })),
    );

    vi.spyOn(generateInitialGridModule, "generateInitialGrid").mockReturnValue(
      mockGrid,
    );

    const { container } = render(() => <App />);

    const inputs = container.querySelectorAll("input");
    const firstInput = inputs[0] as HTMLInputElement;
    const secondInput = inputs[1] as HTMLInputElement;

    // Create a duplicate
    firstInput.value = "5";
    firstInput.dispatchEvent(new InputEvent("input", { bubbles: true }));

    secondInput.value = "5";
    secondInput.dispatchEvent(new InputEvent("input", { bubbles: true }));

    // Both should have error styling
    expect(firstInput.className).toContain("error");
    expect(secondInput.className).toContain("error");

    // Resolve the duplicate by changing one value
    secondInput.value = "6";
    secondInput.dispatchEvent(new InputEvent("input", { bubbles: true }));

    // Error styling should be removed from both
    expect(firstInput.className).not.toContain("error");
    expect(secondInput.className).not.toContain("error");
  });

  test("it clears hasError flag when duplicate is removed by clearing a cell", () => {
    const mockGrid: Grid = Array.from(
      { length: 9 },
      (_, row) =>
        Array.from({ length: 9 }, (_, col) => ({
          value: undefined,
          isInitial: false,
          hasError: false,
        })),
    );

    vi.spyOn(generateInitialGridModule, "generateInitialGrid").mockReturnValue(
      mockGrid,
    );

    const { container } = render(() => <App />);

    const inputs = container.querySelectorAll("input");
    const firstInput = inputs[0] as HTMLInputElement;
    const secondInput = inputs[1] as HTMLInputElement;

    // Create a duplicate
    firstInput.value = "9";
    firstInput.dispatchEvent(new InputEvent("input", { bubbles: true }));

    secondInput.value = "9";
    secondInput.dispatchEvent(new InputEvent("input", { bubbles: true }));

    // Both should have error styling
    expect(firstInput.className).toContain("error");
    expect(secondInput.className).toContain("error");

    // Clear one cell to resolve the duplicate
    secondInput.value = "";
    secondInput.dispatchEvent(new InputEvent("input", { bubbles: true }));

    // Error styling should be removed from both
    expect(firstInput.className).not.toContain("error");
    expect(secondInput.className).not.toContain("error");
  });

  test("it handles multiple simultaneous duplicates correctly", () => {
    const mockGrid: Grid = Array.from(
      { length: 9 },
      (_, row) =>
        Array.from({ length: 9 }, (_, col) => ({
          value: undefined,
          isInitial: false,
          hasError: false,
        })),
    );

    vi.spyOn(generateInitialGridModule, "generateInitialGrid").mockReturnValue(
      mockGrid,
    );

    const { container } = render(() => <App />);

    const inputs = container.querySelectorAll("input");

    // Create duplicates in row 0
    const row0cell0 = inputs[0] as HTMLInputElement;
    const row0cell1 = inputs[1] as HTMLInputElement;
    const row0cell2 = inputs[2] as HTMLInputElement;

    row0cell0.value = "4";
    row0cell0.dispatchEvent(new InputEvent("input", { bubbles: true }));

    row0cell1.value = "4";
    row0cell1.dispatchEvent(new InputEvent("input", { bubbles: true }));

    row0cell2.value = "4";
    row0cell2.dispatchEvent(new InputEvent("input", { bubbles: true }));

    // All three should have error styling
    expect(row0cell0.className).toContain("error");
    expect(row0cell1.className).toContain("error");
    expect(row0cell2.className).toContain("error");

    // Resolve one duplicate
    row0cell2.value = "7";
    row0cell2.dispatchEvent(new InputEvent("input", { bubbles: true }));

    // First two should still have error, third should not
    expect(row0cell0.className).toContain("error");
    expect(row0cell1.className).toContain("error");
    expect(row0cell2.className).not.toContain("error");
  });

  test("it preserves initial cell values and marks them with initial class", () => {
    const mockGrid: Grid = Array.from(
      { length: 9 },
      (_, row) =>
        Array.from({ length: 9 }, (_, col) => ({
          value: row === 0 && col < 2 ? 5 : undefined,
          isInitial: row === 0 && col < 2,
          hasError: false,
        })),
    );

    vi.spyOn(generateInitialGridModule, "generateInitialGrid").mockReturnValue(
      mockGrid,
    );

    const { container } = render(() => <App />);

    const inputs = container.querySelectorAll("input");
    const firstInput = inputs[0] as HTMLInputElement; // Initial cell with value 5
    const secondInput = inputs[1] as HTMLInputElement; // Initial cell with value 5

    // Both initial cells should have value 5
    expect(firstInput.value).toBe("5");
    expect(secondInput.value).toBe("5");

    // Both should be readonly
    expect(firstInput.readOnly).toBe(true);
    expect(secondInput.readOnly).toBe(true);

    // Initial cells should have the "initial" class for styling
    expect(firstInput.className).toContain("initial");
    expect(secondInput.className).toContain("initial");
  });
});
