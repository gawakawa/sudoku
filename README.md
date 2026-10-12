# Sudoku

## Overview

A Sudoku puzzle game built to learn SolidJS. It runs in the browser.

## Features

- **Fine-grained reactivity** - Optimized rendering with minimal re-renders,
  verifiable via the on-screen performance metrics panel
- **Random puzzle generation** - Fast, performance-optimized generation of
  unique puzzles

## Prerequisites

Nix with flakes enabled

## Usage

Play online: https://sudoku.i0ta.dev

For development, see [CONTRIBUTING.md](CONTRIBUTING.md).

## Directory Structure

```
.
├── src
│   ├── Main.purs       # Entry point
│   └── Sudoku
│       ├── Data        # Domain model
│       ├── Solver      # Puzzle solver
│       ├── Generator   # Puzzle generator
│       └── UI          # Puzzle UI
├── test                # Tests
├── docs
│   └── DESIGN.md       # Design doc
└── nix                 # Build configuration
```
