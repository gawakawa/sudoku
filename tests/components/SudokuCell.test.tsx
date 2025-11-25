import { fireEvent, render } from "@solidjs/testing-library";
import { describe, expect, test, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { SudokuCell } from "../../src/components/SudokuCell.tsx";
import type { Cell } from "../../src/types/Sudoku.ts";

describe("<SudokuCell />", () => {
  test("it renders an empty cell when value is undefined", () => {
    const cell: Cell = { value: undefined, isInitial: false };
    const { container } = render(() => (
      <SudokuCell cell={cell} onChange={() => {}} />
    ));
    const input = container.querySelector("input") as HTMLInputElement;
    expect(input).toBeInTheDocument();
    expect(input.value).toBe("");
  });

  test("it renders a cell with a digit value", () => {
    const cell: Cell = { value: 5, isInitial: false };
    const { container } = render(() => (
      <SudokuCell cell={cell} onChange={() => {}} />
    ));
    const input = container.querySelector("input") as HTMLInputElement;
    expect(input.value).toBe("5");
  });

  test("it renders an initial cell as read-only", () => {
    const cell: Cell = { value: 7, isInitial: true };
    const { container } = render(() => (
      <SudokuCell cell={cell} onChange={() => {}} />
    ));
    const input = container.querySelector("input") as HTMLInputElement;
    expect(input).toHaveAttribute("readonly");
    expect(input.value).toBe("7");
  });

  test("it renders an editable cell without read-only attribute", () => {
    const cell: Cell = { value: 3, isInitial: false };
    const { container } = render(() => (
      <SudokuCell cell={cell} onChange={() => {}} />
    ));
    const input = container.querySelector("input") as HTMLInputElement;
    expect(input).not.toHaveAttribute("readonly");
  });

  test("it calls onChange with valid digit when user inputs 1-9", () => {
    const cell: Cell = { value: undefined, isInitial: false };
    const onChange = vi.fn();
    const { container } = render(() => (
      <SudokuCell cell={cell} onChange={onChange} />
    ));
    const input = container.querySelector("input") as HTMLInputElement;

    fireEvent.input(input, { target: { value: "8" } });
    expect(onChange).toHaveBeenCalledWith(8);
  });

  test("it calls onChange with undefined when user clears the cell", () => {
    const cell: Cell = { value: 5, isInitial: false };
    const onChange = vi.fn();
    const { container } = render(() => (
      <SudokuCell cell={cell} onChange={onChange} />
    ));
    const input = container.querySelector("input") as HTMLInputElement;

    fireEvent.input(input, { target: { value: "" } });
    expect(onChange).toHaveBeenCalledWith(undefined);
  });

  test("it ignores invalid input (non-digits, 0, or numbers > 9)", () => {
    const cell: Cell = { value: undefined, isInitial: false };
    const onChange = vi.fn();
    const { container } = render(() => (
      <SudokuCell cell={cell} onChange={onChange} />
    ));
    const input = container.querySelector("input") as HTMLInputElement;

    // Invalid inputs should not trigger onChange
    fireEvent.input(input, { target: { value: "0" } });
    expect(onChange).not.toHaveBeenCalled();

    fireEvent.input(input, { target: { value: "10" } });
    expect(onChange).not.toHaveBeenCalled();

    fireEvent.input(input, { target: { value: "abc" } });
    expect(onChange).not.toHaveBeenCalled();
  });

  test("it has different styling for initial vs editable cells", () => {
    const initialCell: Cell = { value: 5, isInitial: true };
    const editableCell: Cell = { value: 3, isInitial: false };

    const { container: container1 } = render(() => (
      <SudokuCell cell={initialCell} onChange={() => {}} />
    ));
    const { container: container2 } = render(() => (
      <SudokuCell cell={editableCell} onChange={() => {}} />
    ));

    const initialInput = container1.querySelector("input") as HTMLInputElement;
    const editableInput = container2.querySelector("input") as HTMLInputElement;

    // Initial cells should have a different class or style
    expect(initialInput.className).toContain("initial");
    expect(editableInput.className).not.toContain("initial");
  });
});
