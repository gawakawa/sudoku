# Developer Guide

## Commands

- `nix fmt` - Format Nix, PureScript, JS/TS, CSS, JSON, Markdown
- `nix flake check` - Run checks (treefmt, hooks and the plain-node tests)
- `nix build --out-link output` - Build `output/` from `src/` only (used by deploy)
- `purs-nix compile` - Compile `src/` into `output/`
- `purs-nix test` - Compile `src/` + `test/` into `output/`, run `Test.Main` on node
- `npm run test:dom` - Run `Test.Dom` under happy-dom (needs `output/` with `test/`)
- `npm run serve` - Start the Vite dev server on port 3000 (needs `output/`)
- `npm run build` - Build for production into `dist/` (needs `output/`)
- `bench run` - Measure the solver steps on generated boards
- `npm run deploy` - `wrangler deploy` of `dist/` (build first)

New files are invisible to flake eval until `git add`-ed.

## Development Environment

Requires Nix with flakes enabled. The dev shell loads automatically via direnv
(`use flake .`) and provides Node.js, the PureScript compiler, the `purs-nix`
command and the git pre-commit hooks (treefmt, statix, deadnix, actionlint,
zizmor). Nix files live in `nix/`.

Dependencies are declared in `nix/packages.nix`, not in a spago file. purs-solid
is not in the registry and is pulled in from git there; modules whose FFI
imports npm packages (`solid-js`, `@solidjs/web`) are listed in `with-solid`
so that `node_modules` is linked in for them.

## Testing

- `test/Main.purs` (spec + spec-node): pure logic only. It must not import
  any Solid module, directly or transitively, so it runs on plain node quickly.
  `nix flake check` runs it through `ps.test.check`.
- `test/Dom.purs`: component tests using `Solid.Testing`. These need a
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

## Deployment

- On pull requests, GitHub Actions CI runs `nix flake check`, `npm ci`, `purs-nix test`, `npm run test:dom` and `npm run build`.
- Pushes to `main` run only `.github/workflows/deploy.yml`, which builds and deploys to Cloudflare Workers via `wrangler-action`.
- `wrangler.jsonc` serves `dist/` as static assets on `sudoku.i0ta.dev`.
