/// <reference types="vitest" />
/// <reference types="vite/client" />

import { defineConfig } from "vitest/config";
import solidPlugin from "vite-plugin-solid";
import react from "@vitejs/plugin-react";
import devtools from "solid-devtools/vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    devtools(),
    // SolidJS plugin - exclude files in src/react/
    solidPlugin({
      include: /^(?!.*\/react\/).*\.(tsx|jsx)$/,
    }),
    // React plugin - only process files in src/react/
    react({
      include: /\/react\/.*\.(tsx|jsx)$/,
      babel: {
        plugins: [["babel-plugin-react-compiler", {}]],
      },
    }),
    tailwindcss(),
  ],
  server: {
    port: 3000,
  },
  test: {
    environment: "jsdom",
    globals: false,
    setupFiles: ["node_modules/@testing-library/jest-dom/vitest"],
    // if you have few tests, try commenting this
    // out to improve performance:
    isolate: false,
    include: ["src/**/*.test.{ts,tsx}", "tests/**/*.test.{ts,tsx}"],
  },
  build: {
    target: "esnext",
  },
  resolve: {
    conditions: ["development", "browser"],
  },
});
