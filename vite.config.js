import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [tailwindcss()],
  server: { port: 3000 },
  build: { target: "esnext" },
  // Solid ships a dev build behind the "development" condition
  resolve: { conditions: ["development", "browser"] },
});
