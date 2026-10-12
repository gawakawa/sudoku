# Sudoku

## Usage

Play online: https://sudoku.i0ta.dev/

## Features

- **Fine-grained reactivity** - Optimized rendering with minimal re-renders,
  verifiable via the on-screen performance metrics panel
- **Random puzzle generation** - Fast, performance-optimized generation of
  unique puzzles

## Tech Stack

PureScript with [purs-solid](https://github.com/aquarazorda/purs-solid) (Solid
2.0 bindings), built with purs-nix and Vite, styled with Tailwind CSS v4 and
deployed as static assets on Cloudflare Workers.

## Directory Structure

```
.
├── src
│   ├── Main.purs                     # Entry point (mounts into #root)
│   └── Sudoku
│       ├── App.purs                  # Root component
│       ├── Component                 # Cell, Grid, MetricsPanel
│       ├── Generator.purs            # Puzzle generation
│       ├── Grid.purs                 # Peers and conflicts
│       ├── Metrics.purs              # Update counts reported by components
│       ├── Solver.purs               # Uniqueness-checking solver
│       └── Types.purs                # Digit, Index, Cell, Grid
├── test
│   ├── Test
│   │   ├── Main.purs                 # Tests that run on plain node
│   │   └── Dom
│   │       └── Main.purs             # Component tests (happy-dom)
│   └── setup-dom.mjs                 # Registers happy-dom globals
├── bench/worstCase                   # Worst-case search tools (node)
├── docs/DESIGN.md                    # Solver design
├── nix                               # flake-parts modules (purs-nix, treefmt, hooks)
├── index.html / index.js             # Vite entry
├── style.css                         # Tailwind entry
├── vite.config.js                    # Vite build config
└── wrangler.jsonc                    # Cloudflare Workers (static assets) config
```

## Requirements

Nix with flakes enabled

## Development

```bash
# Dev shell loads automatically via direnv (use flake .)

# Format code
nix fmt

# Compile src/ and test/ into output/, then run the plain-node tests
purs-nix test

# Run the component tests (needs output/ from `purs-nix test`)
npm run test:dom

# Start development server (needs output/ from `purs-nix compile` or `test`)
npm run serve

# Build for production
nix build --out-link output
npm run build

# Deploy to Cloudflare Workers (build first)
npm run deploy

# Worst-case solver search (node)
npm run worst-case
```
