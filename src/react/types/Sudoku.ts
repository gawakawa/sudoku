/**
 * Digit value in a cell (1-9)
 */
export type Digit = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

/**
 * Value that can be assigned to a cell (Digit or empty)
 */
export type CellValue = Digit | undefined;

/**
 * Single cell in the Sudoku grid
 */
export type Cell = {
  value: CellValue;
  isInitial: boolean;
};

/**
 * Position in the grid
 */
export type Position = {
  row: number;
  col: number;
};

/**
 * 9x9 Sudoku grid
 * First index is row (0-8), second index is column (0-8)
 * Access pattern: grid[row][col]
 */
export type Grid = Cell[][];

/**
 * Navigation direction for keyboard navigation
 */
export type NavigationDirection = "up" | "down" | "left" | "right";
