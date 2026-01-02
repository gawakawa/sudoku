import { useEffect, useState } from "react";
import { getMetricsSnapshot, type MetricsData } from "../lib/metrics";

export function MetricsPanel() {
  const [metrics, setMetrics] = useState<MetricsData>(getMetricsSnapshot);

  useEffect(() => {
    let rafId: number;

    const scheduleUpdate = () => {
      rafId = requestAnimationFrame(() => {
        setMetrics(getMetricsSnapshot());
        scheduleUpdate();
      });
    };

    scheduleUpdate();

    return () => {
      cancelAnimationFrame(rafId);
    };
  }, []);

  // Calculate max cell update count for heatmap coloring
  const maxCellUpdates = (() => {
    const updates = metrics.cellUpdates;
    let max = 0;
    for (let i = 0; i < updates.length; i++) {
      if (updates[i] > max) max = updates[i];
    }
    return max;
  })();

  // Get cell color based on update count (white to red gradient)
  const getCellColor = (cellId: number) => {
    const count = metrics.cellUpdates[cellId];
    if (maxCellUpdates === 0) return "rgb(243, 244, 246)"; // gray-100
    const intensity = Math.floor((count / maxCellUpdates) * 255);
    return `rgb(255, ${255 - intensity}, ${255 - intensity})`;
  };

  return (
    <div className="mt-8 bg-white border border-gray-300 rounded-lg shadow-lg p-4 text-sm font-mono min-w-64">
      <h2 className="text-base font-bold mb-3 text-gray-800">
        Performance Metrics
      </h2>

      <div className="space-y-1 mb-4">
        <div className="flex justify-between">
          <span className="text-gray-600">App Renders:</span>
          <span className="font-semibold">{metrics.appRenders}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Grid Renders:</span>
          <span className="font-semibold">{metrics.gridRenders}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Total Cell Updates:</span>
          <span className="font-semibold">{metrics.totalCellUpdates}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Store Updates:</span>
          <span className="font-semibold">{metrics.storeUpdates}</span>
        </div>
      </div>

      <div className="mb-3">
        <h3 className="text-xs font-semibold text-gray-600 mb-2">
          Cell Update Heatmap
        </h3>
        <div className="grid grid-cols-9 gap-px bg-gray-300 p-px">
          {Array.from({ length: 81 }, (_, cellId) => (
            <div
              key={cellId}
              className="w-4 h-4 flex items-center justify-center text-[8px]"
              style={{ backgroundColor: getCellColor(cellId) }}
              title={`Cell ${Math.floor(cellId / 9)},${cellId % 9}: ${
                metrics.cellUpdates[cellId]
              } updates`}
            >
              {metrics.cellUpdates[cellId] > 0
                ? metrics.cellUpdates[cellId]
                : ""}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
