# Sudoku

## Usage

Play online: https://sudoku.gawakawa.deno.net/

## Features

- **Fine-grained reactivity** - Optimized rendering with minimal re-renders,
  verifiable via the on-screen performance metrics panel
- **Random puzzle generation** - Fast, performance-optimized generation of
  unique puzzles

## Directory Structure

```
.
├── src
│   ├── components                    # UI components
│   │   ├── MetricsPanel.tsx          # Render count display
│   │   ├── SudokuCell.tsx            # Individual cell input
│   │   └── SudokuGrid.tsx            # 9x9 grid layout
│   ├── generator                     # Puzzle generation
│   │   ├── createEmptyGrid.ts        # Empty grid factory
│   │   ├── generateCompleteGrid.ts   # Full solution generator
│   │   ├── generateInitialGrid.ts    # Puzzle with blanks
│   │   └── solve.ts                  # Constraint propagation solver
│   ├── lib                           # Hooks and utilities
│   │   ├── metrics.ts                # Render tracking
│   │   └── useErrorStore.ts          # Duplicate error state
│   ├── types                         # Type definitions
│   │   └── Sudoku.ts                 # Grid, Cell, Digit types
│   ├── utils                         # Helper functions
│   │   ├── findDuplicates.ts         # Duplicate detection
│   │   └── position.ts               # Position helpers
│   ├── App.tsx                       # Main app with grid state
│   ├── index.css                     # Tailwind CSS entry
│   └── index.tsx                     # App entry point
├── tests                             # Vitest component tests
├── deno.json                         # Deno config and dependencies
├── flake.nix                         # Nix development environment
└── vite.config.ts                    # Vite build config
```

## Requirements

Nix with flakes enabled

## Development

```bash
nix develop

# Format code
nix fmt

# Lint code
deno task lint

# Type check
deno task check

# Run tests
npm test

# Start development server
deno task dev

# Build for production
deno task build

# Preview production build
deno task preview
```
