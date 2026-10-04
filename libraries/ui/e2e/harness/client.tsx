import { StrictMode, useEffect, type ReactNode } from "react";
import { hydrateRoot } from "react-dom/client";
import { fixtures, type FixtureName } from "../fixtures";

// Marks the page once React has committed the hydrated tree and run its
// effects, so a test waits for a condition rather than for a duration.
function Hydrated({ children }: { children: ReactNode }) {
  useEffect(() => {
    document.body.dataset.hydrated = "true";
  }, []);
  return children;
}

// Hydrates the server HTML of the fixture named on <body>. With JavaScript off
// this never runs, and the server HTML is the whole page.
const name = document.body.dataset.fixture as FixtureName | undefined;
const Fixture = name ? fixtures[name] : undefined;
const root = document.getElementById("root");
if (Fixture && root) {
  hydrateRoot(
    root,
    <StrictMode>
      <Hydrated>
        <Fixture />
      </Hydrated>
    </StrictMode>,
  );
}
