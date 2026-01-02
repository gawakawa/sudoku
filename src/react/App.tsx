import { SudokuGrid } from "./components/SudokuGrid";
import { MetricsPanel } from "./components/MetricsPanel";
import { useSudokuGame } from "./hooks/useSudokuGame";
import { incrementAppRender, incrementStoreUpdate } from "./lib/metrics";
import type { CellValue, Position } from "./types/Sudoku";

function App() {
  // Track component initialization for performance metrics
  incrementAppRender();

  const { grid, hasError, updateCell } = useSudokuGame();

  const handleChange = (pos: Position, value: CellValue) => {
    incrementStoreUpdate();
    updateCell(pos, value);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex flex-col items-center justify-center p-8">
      <div className="bg-green-600 text-white px-4 py-2 rounded-full font-semibold mb-4">
        React
      </div>
      <h1 className="text-4xl font-bold text-gray-800 mb-8">数独</h1>
      <SudokuGrid grid={grid} onChange={handleChange} hasError={hasError} />
      <MetricsPanel />
    </div>
  );
}

export default App;
