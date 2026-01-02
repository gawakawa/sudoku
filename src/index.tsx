import { render } from "solid-js/web";
import "solid-devtools";
import "./index.css";

import { App as SolidApp } from "./App.tsx";
import { MetricsPanel as SolidMetricsPanel } from "./components/MetricsPanel.tsx";

// React mount function (JSX is processed in src/react/)
import { mountReactApp } from "./react/index.tsx";

// Render SolidJS app to #solid-root
const solidRoot = document.getElementById("solid-root");

if (import.meta.env.DEV && !(solidRoot instanceof HTMLElement)) {
  throw new Error(
    "Solid root element not found. Did you forget to add it to your index.html?",
  );
}

render(
  () => (
    <>
      <SolidApp />
      <SolidMetricsPanel />
    </>
  ),
  solidRoot!,
);

// Render React app to #react-root
const reactRoot = document.getElementById("react-root");

if (import.meta.env.DEV && !(reactRoot instanceof HTMLElement)) {
  throw new Error(
    "React root element not found. Did you forget to add it to your index.html?",
  );
}

mountReactApp(reactRoot!);
