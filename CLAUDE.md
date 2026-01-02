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
deno task check        # Type check src/ directory only
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

Two separate stores for fine-grained reactivity:

1. **Grid Store** (`App.tsx`) - Main puzzle state using `createStore<Grid>`
2. **Error Store** (`lib/useErrorStore.ts`) - Separate 81-cell boolean store for
   duplicate errors

This separation ensures cell error highlighting only re-renders affected cells,
not the entire grid.

### Data Flow

```
User Input → handleChange → setGrid (update value)
                         → updateErrors (recalculate affected 21 cells)
                         → SudokuCell re-renders only if its error state changed
```

### Grid Data Model

- `Grid`: 9×9 2D array `Cell[][]` accessed as `grid[row][col]`
- `Cell`: `{ value: CellValue, isInitial: boolean }`
- `Position`: Immutable Record from `immutable` library for set operations
- `CellValue`: `Digit | undefined` where `Digit` is `1-9`

### Testing

Component tests use `@solidjs/testing-library` and Vitest with jsdom
environment. Tests are located in `tests/components/` mirroring the source
structure.

## CI Pipeline

GitHub Actions CI runs:

1. Format check (`nix fmt -- --ci`)
2. Lint check (`deno lint`)
3. Type check (`deno task check`)
4. Component tests (`npm test`)

Uses Nix flake's `ci` package which bundles Deno and Node.js 24.

## Key Implementation Notes

- Uses Tailwind CSS v4 via `@tailwindcss/vite` plugin
- Cell input is keyboard-driven (1-9 keys, Backspace/Delete, arrow keys for
  navigation)
- Uses `immutable` library's `Set` and `Record` for efficient position
  comparisons
- Error detection recalculates only affected cells (row + column + block = max
  21 cells)

## Code Editing Guidelines

- DO NOT use `mcp__serena__replace_regex` for code edits
- Use standard editing tools (Edit, Write, etc.) instead of regex-based
  replacements
