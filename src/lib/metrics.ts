// Performance metrics storage - uses non-reactive variables to avoid impacting reactivity
const cellUpdates = new Uint32Array(81); // row * 9 + col indexing
let appRenders = 0;
let gridRenders = 0;
let storeUpdates = 0;

export type MetricsData = {
  cellUpdates: Uint32Array;
  appRenders: number;
  gridRenders: number;
  totalCellUpdates: number;
  storeUpdates: number;
};

/**
 * Increment the update counter for a specific cell
 * @param cellId - Cell index (row * 9 + col)
 */
export const incrementCellUpdate = (cellId: number): void => {
  cellUpdates[cellId]++;
};

/**
 * Increment the App component render counter
 */
export const incrementAppRender = (): void => {
  appRenders++;
};

/**
 * Increment the SudokuGrid component render counter
 */
export const incrementGridRender = (): void => {
  gridRenders++;
};

/**
 * Increment the store update counter
 */
export const incrementStoreUpdate = (): void => {
  storeUpdates++;
};

/**
 * Get a snapshot of all current metrics
 * @returns Copy of current metrics data
 */
export const getMetricsSnapshot = (): MetricsData => {
  return {
    cellUpdates: new Uint32Array(cellUpdates), // Copy to avoid mutation
    appRenders,
    gridRenders,
    totalCellUpdates: cellUpdates.reduce((sum, count) => sum + count, 0),
    storeUpdates,
  };
};

/**
 * Reset all metrics to zero
 */
export const resetMetrics = (): void => {
  cellUpdates.fill(0);
  appRenders = 0;
  gridRenders = 0;
  storeUpdates = 0;
};
