import { render } from "solid-js/web";
import "solid-devtools";
import "./index.css";

import { App } from "./App.tsx";
import { MetricsPanel } from "./components/MetricsPanel.tsx";

const root = document.getElementById("root");

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    "Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?",
  );
}

render(
  () => (
    <div class="min-h-screen flex flex-col">
      <App />
      <MetricsPanel />
    </div>
  ),
  root!,
);
