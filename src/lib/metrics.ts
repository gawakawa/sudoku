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

export const incrementCellUpdate = (cellId: number): void => {
  cellUpdates[cellId]++;
};

export const incrementAppRender = (): void => {
  appRenders++;
};

export const incrementGridRender = (): void => {
  gridRenders++;
};

export const incrementStoreUpdate = (): void => {
  storeUpdates++;
};

export const getMetricsSnapshot = (): MetricsData => {
  return {
    cellUpdates: new Uint32Array(cellUpdates), // Copy to avoid mutation
    appRenders,
    gridRenders,
    totalCellUpdates: cellUpdates.reduce((sum, count) => sum + count, 0),
    storeUpdates,
  };
};

export const resetMetrics = (): void => {
  cellUpdates.fill(0);
  appRenders = 0;
  gridRenders = 0;
  storeUpdates = 0;
};
