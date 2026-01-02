import {
  type Component,
  createSignal,
  For,
  onCleanup,
  onMount,
} from "solid-js";
import { getMetricsSnapshot, type MetricsData } from "../lib/metrics.ts";

export const MetricsPanel: Component = () => {
  const [metrics, setMetrics] = createSignal<MetricsData>(getMetricsSnapshot());

  let rafId: number;

  const scheduleUpdate = () => {
    rafId = requestAnimationFrame(() => {
      setMetrics(getMetricsSnapshot());
      scheduleUpdate();
    });
  };

  onMount(() => {
    scheduleUpdate();
  });

  onCleanup(() => {
    cancelAnimationFrame(rafId);
  });

  // Calculate max cell update count for heatmap coloring
  const maxCellUpdates = () => {
    const updates = metrics().cellUpdates;
    let max = 0;
    for (let i = 0; i < updates.length; i++) {
      if (updates[i] > max) max = updates[i];
    }
    return max;
  };

  // Get cell color based on update count (white to red gradient)
  const getCellColor = (cellId: number) => {
    const count = metrics().cellUpdates[cellId];
    const max = maxCellUpdates();
    if (max === 0) return "bg-gray-100";
    const intensity = Math.floor((count / max) * 255);
    return `rgb(255, ${255 - intensity}, ${255 - intensity})`;
  };

  return (
    <div class="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg shadow-lg p-4 text-sm font-mono z-50 min-w-64">
      <h2 class="text-base font-bold mb-3 text-gray-800">
        Performance Metrics
      </h2>

      <div class="space-y-1 mb-4">
        <div class="flex justify-between">
          <span class="text-gray-600">App Renders:</span>
          <span class="font-semibold">{metrics().appRenders}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-600">Grid Renders:</span>
          <span class="font-semibold">{metrics().gridRenders}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-600">Total Cell Updates:</span>
          <span class="font-semibold">{metrics().totalCellUpdates}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-600">Store Updates:</span>
          <span class="font-semibold">{metrics().storeUpdates}</span>
        </div>
      </div>

      <div class="mb-3">
        <h3 class="text-xs font-semibold text-gray-600 mb-2">
          Cell Update Heatmap
        </h3>
        <div class="grid grid-cols-9 gap-px bg-gray-300 p-px">
          <For each={Array.from({ length: 81 }, (_, i) => i)}>
            {(cellId) => (
              <div
                class="w-4 h-4 flex items-center justify-center text-[8px]"
                style={{ "background-color": getCellColor(cellId) }}
                title={`Cell ${Math.floor(cellId / 9)},${cellId % 9}: ${
                  metrics().cellUpdates[cellId]
                } updates`}
              >
                {metrics().cellUpdates[cellId] > 0
                  ? metrics().cellUpdates[cellId]
                  : ""}
              </div>
            )}
          </For>
        </div>
      </div>
    </div>
  );
};
