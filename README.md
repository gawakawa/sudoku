# Sudoku

## Requirements

Nix with flakes enabled

## Directory Structure

```
.
├── deno.json
├── deno.lock
├── flake.lock
├── flake.nix
├── index.html
├── package-lock.json
├── package.json
├── spec.md
├── src
│   ├── App.tsx
│   ├── components
│   ├── index.css
│   ├── index.tsx
│   ├── types
│   └── vite-env.d.ts
├── tests
│   └── components
├── tsconfig.json
└── vite.config.ts
```

## Usage

Play online: https://sudoku-cgaexek40jyd.gawakawa.deno.net/

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
