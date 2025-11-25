# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with
code in this repository.

## Overview

A Sudoku puzzle game built with SolidJS, Vite, and Tailwind CSS v4. The project
uses Deno for task execution and Nix for development environment management.

## Development Environment

This project requires Nix with flakes enabled. Enter the development shell with:

```bash
nix develop
```

This auto-generates `.mcp.json` for MCP server configuration.

## Common Commands

### Development

```bash
deno task dev          # Start dev server on port 3000
deno task build        # Build for production
deno task preview      # Preview production build
```

### Code Quality

```bash
nix fmt                # Format Nix and TypeScript files (nixfmt + deno fmt)
deno task lint         # Lint TypeScript with Deno
deno check             # Type check without --node-modules-dir flag
```

### Testing

```bash
npm test               # Run component tests with Vitest
deno task test         # Alternative test command via Deno
```

Note: The project uses `npm test` for testing (not `deno task test`) as seen in
CI and git commits.

## Architecture

### State Management

- Uses SolidJS's `createStore` for reactive grid state management
- Grid state is maintained in `App.tsx` and passed down to components
- Cell updates flow through the `handleChange` callback

### Component Structure

```
src/
├── App.tsx                    # Root component with grid state
├── components/
│   ├── SudokuGrid.tsx        # 9×9 grid container with 3×3 block styling
│   └── SudokuCell.tsx        # Individual cell with input handling
└── types/
    └── Sudoku.ts             # Type definitions (Digit, CellValue, Cell, Grid)
```

### Grid Data Model

- `Grid` is a 9×9 2D array: `Cell[][]` where `grid[row][col]`
- Each `Cell` has:
  - `value: CellValue` (1-9 or undefined)
  - `isInitial: boolean` (true for puzzle clues, false for user input)
- Initial cells are styled differently and non-editable

### Testing

Component tests use `@solidjs/testing-library` and Vitest with jsdom
environment. Tests are located in `tests/components/` mirroring the source
structure.

## CI Pipeline

GitHub Actions CI runs:

1. Format check (`nix fmt -- --ci`)
2. Lint check (`deno lint`)
3. Type check (`deno check`)
4. Component tests (`npm test`)

Uses Nix flake's `ci` package which bundles Deno and Node.js 24.

## Key Implementation Notes

- Uses Tailwind CSS v4 via `@tailwindcss/vite` plugin
- Cell input is keyboard-driven (1-9 keys, Backspace/Delete)
- Current implementation has a hardcoded puzzle in `App.tsx`
- Specification (`spec.md`) includes planned features: puzzle generation,
  validation, error highlighting, and game controls
