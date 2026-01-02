// Performance metrics storage - uses non-reactive variables to avoid impacting reactivity
const cellUpdates = new Uint32Array(81); // row * 9 + col indexing
let appRenders = 0;
let gridRenders = 0;
let storeUpdates = 0;
let validationRuns = 0;

export type MetricsData = {
  cellUpdates: Uint32Array;
  appRenders: number;
  gridRenders: number;
  totalCellUpdates: number;
  storeUpdates: number;
  validationRuns: number;
};

export function incrementCellUpdate(cellId: number): void {
  cellUpdates[cellId]++;
}

export function incrementAppRender(): void {
  appRenders++;
}

export function incrementGridRender(): void {
  gridRenders++;
}

export function incrementStoreUpdate(): void {
  storeUpdates++;
}

export function incrementValidationRun(): void {
  validationRuns++;
}

export function getMetricsSnapshot(): MetricsData {
  return {
    cellUpdates: new Uint32Array(cellUpdates), // Copy to avoid mutation
    appRenders,
    gridRenders,
    totalCellUpdates: cellUpdates.reduce((sum, count) => sum + count, 0),
    storeUpdates,
    validationRuns,
  };
}

export function resetMetrics(): void {
  cellUpdates.fill(0);
  appRenders = 0;
  gridRenders = 0;
  storeUpdates = 0;
  validationRuns = 0;
}
