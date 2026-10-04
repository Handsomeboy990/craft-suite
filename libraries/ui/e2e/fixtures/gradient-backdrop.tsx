import { GradientBackdrop } from "../../src";

export function GradientBackdropFixture() {
  return (
    <main>
      <h1>GradientBackdrop</h1>
      <p>
        <a href="#before">Before the section</a>
      </p>
      <section
        aria-labelledby="hero-title"
        style={{
          position: "relative",
          isolation: "isolate",
          minHeight: "50vh",
          padding: "var(--cu-space-8)",
        }}
      >
        <GradientBackdrop durationMs={8000} />
        <h2 id="hero-title" style={{ position: "relative" }}>
          Owned, not rented
        </h2>
        <p style={{ position: "relative" }}>
          <a href="#start">Start here</a>
        </p>
      </section>
      <div style={{ height: "200vh" }}>
        <p>
          <a href="#after">After the section</a>
        </p>
      </div>
    </main>
  );
}
