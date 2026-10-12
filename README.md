# Sudoku

## Overview

A Sudoku puzzle game written in PureScript with
[purs-solid](https://github.com/aquarazorda/purs-solid) (Solid 2.0 bindings),
built with purs-nix and Vite, styled with Tailwind CSS v4 and deployed as static
assets on Cloudflare Workers.

## Features

- **Fine-grained reactivity** - Optimized rendering with minimal re-renders,
  verifiable via the on-screen performance metrics panel
- **Random puzzle generation** - Fast, performance-optimized generation of
  unique puzzles

## Prerequisites

Nix with flakes enabled

## Usage

Play online: https://sudoku.i0ta.dev/

For development, see [CONTRIBUTING.md](CONTRIBUTING.md).

## Directory Structure

- `src/Main.purs` — entry point (mounts into `#root`)
- `src/Sudoku/` — app, components (Cell, Grid, MetricsPanel), generator, solver, grid logic and metrics
- `test/` — plain-node tests (`Test/Main.purs`) and happy-dom component tests (`Test/Dom/Main.purs`)
- `bench/worstCase/` — worst-case search tools (node)
- `docs/DESIGN.md` — solver design
- `nix/` — flake-parts modules (purs-nix, treefmt, hooks)
- `index.html`, `index.js`, `style.css`, `vite.config.js` — Vite and Tailwind entry
- `wrangler.jsonc` — Cloudflare Workers (static assets) config
