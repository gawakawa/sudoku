import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

export function mountReactApp(element: HTMLElement) {
  createRoot(element).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
