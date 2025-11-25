import { render } from "@solidjs/testing-library";
import { describe, expect, test, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import userEvent from "@testing-library/user-event";
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

  test("it calls onChange with valid digit when user inputs 1-9", async () => {
    const cell: Cell = { value: undefined, isInitial: false };
    const onChange = vi.fn();
    const { container } = render(() => (
      <SudokuCell cell={cell} onChange={onChange} />
    ));
    const input = container.querySelector("input") as HTMLInputElement;

    await userEvent.type(input, "8");
    expect(onChange).toHaveBeenCalledWith(8);
  });

  test("it calls onChange with undefined when user clears the cell", async () => {
    const cell: Cell = { value: 5, isInitial: false };
    const onChange = vi.fn();
    const { container } = render(() => (
      <SudokuCell cell={cell} onChange={onChange} />
    ));
    const input = container.querySelector("input") as HTMLInputElement;

    await userEvent.clear(input);
    expect(onChange).toHaveBeenCalledWith(undefined);
  });

  test("it ignores invalid input (non-digits, 0, or numbers > 9)", async () => {
    const cell: Cell = { value: undefined, isInitial: false };
    const onChange = vi.fn();
    const { container } = render(() => (
      <SudokuCell cell={cell} onChange={onChange} />
    ));
    const input = container.querySelector("input") as HTMLInputElement;

    // Invalid inputs should not trigger onChange
    await userEvent.type(input, "0");
    expect(onChange).not.toHaveBeenCalled();

    await userEvent.type(input, "a");
    expect(onChange).not.toHaveBeenCalled();

    await userEvent.type(input, "!");
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

  test("it hides the text cursor (caret) in the input", () => {
    const cell: Cell = { value: undefined, isInitial: false };
    const { container } = render(() => (
      <SudokuCell cell={cell} onChange={() => {}} />
    ));
    const input = container.querySelector("input") as HTMLInputElement;

    // Should have caret-transparent class to hide the cursor
    expect(input.className).toContain("caret-transparent");
  });

  test("it deletes the value on Backspace regardless of cursor position", async () => {
    const cell: Cell = { value: 5, isInitial: false };
    const onChange = vi.fn();
    const { container } = render(() => (
      <SudokuCell cell={cell} onChange={onChange} />
    ));
    const input = container.querySelector("input") as HTMLInputElement;

    // Move cursor to the beginning
    input.focus();
    input.setSelectionRange(0, 0);

    // Press Backspace - should delete the value regardless of cursor position
    await userEvent.keyboard("{Backspace}");
    expect(onChange).toHaveBeenCalledWith(undefined);
  });

  test("it deletes the value on Delete regardless of cursor position", async () => {
    const cell: Cell = { value: 5, isInitial: false };
    const onChange = vi.fn();
    const { container } = render(() => (
      <SudokuCell cell={cell} onChange={onChange} />
    ));
    const input = container.querySelector("input") as HTMLInputElement;

    // Move cursor to the beginning
    input.focus();
    input.setSelectionRange(0, 0);

    // Press Delete - should delete the value regardless of cursor position
    await userEvent.keyboard("{Delete}");
    expect(onChange).toHaveBeenCalledWith(undefined);
  });

  test("it accepts new digit input regardless of cursor position", async () => {
    const cell: Cell = { value: 5, isInitial: false };
    const onChange = vi.fn();
    const { container } = render(() => (
      <SudokuCell cell={cell} onChange={onChange} />
    ));
    const input = container.querySelector("input") as HTMLInputElement;

    // Move cursor to the beginning
    input.focus();
    input.setSelectionRange(0, 0);

    // Type a new digit - should replace the entire value
    await userEvent.keyboard("7");
    expect(onChange).toHaveBeenCalledWith(7);
  });

  test("it does not allow digit input on initial cells", async () => {
    const cell: Cell = { value: 5, isInitial: true };
    const onChange = vi.fn();
    const { container } = render(() => (
      <SudokuCell cell={cell} onChange={onChange} />
    ));
    const input = container.querySelector("input") as HTMLInputElement;

    input.focus();
    await userEvent.keyboard("7");
    expect(onChange).not.toHaveBeenCalled();
  });

  test("it does not allow Backspace on initial cells", async () => {
    const cell: Cell = { value: 5, isInitial: true };
    const onChange = vi.fn();
    const { container } = render(() => (
      <SudokuCell cell={cell} onChange={onChange} />
    ));
    const input = container.querySelector("input") as HTMLInputElement;

    input.focus();
    await userEvent.keyboard("{Backspace}");
    expect(onChange).not.toHaveBeenCalled();
  });

  test("it does not allow Delete on initial cells", async () => {
    const cell: Cell = { value: 5, isInitial: true };
    const onChange = vi.fn();
    const { container } = render(() => (
      <SudokuCell cell={cell} onChange={onChange} />
    ));
    const input = container.querySelector("input") as HTMLInputElement;

    input.focus();
    await userEvent.keyboard("{Delete}");
    expect(onChange).not.toHaveBeenCalled();
  });
});
