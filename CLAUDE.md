# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with
code in this repository.

## Overview

A Sudoku puzzle game written in PureScript on top of purs-solid (Solid 2.0
bindings), built with purs-nix and Vite, styled with Tailwind CSS v4. It is a
static SPA served by a single Cloudflare Worker (no backend).

## Development Environment

Requires Nix with flakes enabled. The dev shell loads automatically via direnv
(`use flake .`) and provides Node.js, the PureScript compiler, the `purs-nix`
command and the git pre-commit hooks (treefmt, statix, deadnix, actionlint,
zizmor). Nix files live in `nix/`.

Dependencies are declared in `nix/packages.nix`, not in a spago file. purs-solid
is not in the registry and is pulled in from git there; modules whose FFI
imports npm packages (`solid-js`, `@solidjs/web`) are listed in `with-solid`
so that `node_modules` is linked in for them.

## Common Commands

```bash
nix fmt                # Format Nix, PureScript, JS/TS, CSS, JSON, Markdown
purs-nix compile       # Compile src/ into output/
purs-nix test          # Compile src/ + test/ into output/, run Test.Main on node
npm run test:dom       # Run Test.Dom.Main under happy-dom (needs output/ with test/)
npm run serve          # Vite dev server on port 3000 (needs output/)
npm run build          # Production build into dist/ (needs output/)
nix build --out-link output   # Build output/ from src/ only (used by deploy)
nix flake check        # treefmt, hooks and the plain-node tests
npm run worst-case     # Worst-case solver search (node, TS type stripping)
npm run deploy         # wrangler deploy of dist/ (build first)
```

`wrangler.jsonc` serves `dist/` as static assets on `sudoku.i0ta.dev`.

New files are invisible to flake eval until `git add`-ed.

## Testing

- `test/Test/Main.purs` (spec + spec-node): pure logic only. It must not import
  any Solid module, directly or transitively, so it runs on plain node quickly.
  `nix flake check` runs it through `ps.test.check`.
- `test/Test/Dom/Main.purs`: component tests using `Solid.Testing`. These need a
  DOM, so `npm run test:dom` starts node with happy-dom
  (`test/setup-dom.mjs`) and `--conditions=browser --conditions=development`.
  purs-nix's `ps.test` cannot pass node flags, which is why this is a separate
  npm script that reads the `output/` made by `purs-nix test`.

## Solid 2.0 Notes

- Store writes are batched and become visible after the next flush. Compute the
  next value purely, write it, and derive dependent state (such as errors) from
  the computed value, not by reading the store back.
- `Setup` has no `MonadEffect`; use `Solid.Setup.liftSetup` for effects there.
- There are no `For`/`Show` components; see `Solid.Control` (`forEach`, `when`,
  `showMaybe`, ...).

## CI Pipeline

On pull requests, GitHub Actions CI runs `nix flake check`, `npm ci`,
`purs-nix test`, `npm run test:dom` and `npm run build`. Pushes to `main` run
only `.github/workflows/deploy.yml`, which builds and deploys to Cloudflare
Workers via `wrangler-action`.

## Skills

- `pursuit` (`.agents/skills/pursuit`, linked from `.claude/skills`): find
  PureScript functions and packages via Pursuit/Hoogle. Use it to look up
  imports instead of guessing them.
