import type { CSSProperties } from "react";
import { StackedCards } from "../../src";

const STEPS = ["Plan", "Build", "Test", "Ship"];

// Opaque, shorter than the viewport, with the link at the bottom edge: the
// part of a pinned card that the next card slides over.
const card: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  boxSizing: "border-box",
  height: "40vh",
  padding: "var(--cu-space-4)",
  background: "var(--cu-color-surface)",
  border: "1px solid var(--cu-color-border)",
  borderRadius: "var(--cu-radius-lg)",
};

export function StackedCardsFixture() {
  return (
    <main>
      <h1>StackedCards</h1>
      <p>
        <a href="#before">Before the stack</a>
      </p>
      <div style={{ height: "40vh" }} />
      <StackedCards label="How it works" top="2rem" step="1rem">
        {STEPS.map((step) => (
          <section key={step} aria-labelledby={`card-${step}`} style={card}>
            <h2 id={`card-${step}`} style={{ margin: 0 }}>
              {step}
            </h2>
            <p>What happens during {step.toLowerCase()}.</p>
            <a href={`#${step.toLowerCase()}`} style={{ marginTop: "auto" }}>
              Read about {step.toLowerCase()}
            </a>
          </section>
        ))}
      </StackedCards>
      <div style={{ height: "150vh" }}>
        <p>
          <a href="#after">After the stack</a>
        </p>
      </div>
    </main>
  );
}
