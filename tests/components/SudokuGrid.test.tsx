import { fireEvent, render } from "@solidjs/testing-library";
import { describe, expect, test, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { SudokuGrid } from "../../src/components/SudokuGrid";
import type { Grid } from "../../src/types/Sudoku";

describe("<SudokuGrid />", () => {
  test("it renders a 9x9 grid with 81 input elements", () => {
    const grid: Grid = Array.from(
      { length: 9 },
      () =>
        Array.from(
          { length: 9 },
          () => ({ value: undefined, isInitial: false }),
        ),
    );

    const { container } = render(() => (
      <SudokuGrid grid={grid} onChange={() => {}} />
    ));

    const inputs = container.querySelectorAll("input");
    expect(inputs).toHaveLength(81);
  });

  test("it renders cells with correct values", () => {
    const grid: Grid = Array.from(
      { length: 9 },
      (_, row) =>
        Array.from({ length: 9 }, (_, col) => ({
          value: row === 0 && col === 0 ? 5 : undefined,
          isInitial: false,
        })),
    );

    const { container } = render(() => (
      <SudokuGrid grid={grid} onChange={() => {}} />
    ));

    const inputs = container.querySelectorAll("input");
    expect((inputs[0] as HTMLInputElement).value).toBe("5");
    expect((inputs[1] as HTMLInputElement).value).toBe("");
  });

  test("it calls onChange with correct row, col, and value when a cell changes", () => {
    const grid: Grid = Array.from(
      { length: 9 },
      () =>
        Array.from(
          { length: 9 },
          () => ({ value: undefined, isInitial: false }),
        ),
    );

    const onChange = vi.fn();
    const { container } = render(() => (
      <SudokuGrid grid={grid} onChange={onChange} />
    ));

    const inputs = container.querySelectorAll("input");
    // Change cell at row 0, col 0
    const firstInput = inputs[0] as HTMLInputElement;
    firstInput.value = "3";
    firstInput.dispatchEvent(new InputEvent("input", { bubbles: true }));

    expect(onChange).toHaveBeenCalledWith(0, 0, 3);

    // Change cell at row 1, col 2 (index 9 + 2 = 11)
    const input_1_2 = inputs[11] as HTMLInputElement;
    input_1_2.value = "7";
    input_1_2.dispatchEvent(new InputEvent("input", { bubbles: true }));

    expect(onChange).toHaveBeenCalledWith(1, 2, 7);
  });

  test("it renders initial cells as readonly", () => {
    const grid: Grid = Array.from(
      { length: 9 },
      (_, row) =>
        Array.from({ length: 9 }, (_, col) => ({
          value: row === 0 && col === 0 ? 9 : undefined,
          isInitial: row === 0 && col === 0,
        })),
    );

    const { container } = render(() => (
      <SudokuGrid grid={grid} onChange={() => {}} />
    ));

    const inputs = container.querySelectorAll("input");
    expect((inputs[0] as HTMLInputElement).readOnly).toBe(true);
    expect((inputs[1] as HTMLInputElement).readOnly).toBe(false);
  });

  test("it calls onChange with undefined when a cell is cleared", () => {
    const grid: Grid = Array.from(
      { length: 9 },
      () =>
        Array.from(
          { length: 9 },
          () => ({ value: undefined, isInitial: false }),
        ),
    );

    const onChange = vi.fn();
    const { container } = render(() => (
      <SudokuGrid grid={grid} onChange={onChange} />
    ));

    const inputs = container.querySelectorAll("input");
    const firstInput = inputs[0] as HTMLInputElement;
    firstInput.value = "";
    firstInput.dispatchEvent(new InputEvent("input", { bubbles: true }));

    expect(onChange).toHaveBeenCalledWith(0, 0, undefined);
  });
});
