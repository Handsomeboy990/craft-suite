import { Tilt } from "../../src";

export function TiltFixture() {
  return (
    <main>
      <h1>Tilt</h1>
      <div style={{ width: 320, margin: "var(--cu-space-8)" }}>
        <Tilt maxDeg={8}>
          <article
            aria-labelledby="case-title"
            style={{
              padding: "var(--cu-space-6)",
              background: "var(--cu-color-surface)",
              border: "1px solid var(--cu-color-border)",
              borderRadius: "var(--cu-radius-lg)",
            }}
          >
            <h2 id="case-title">Case study</h2>
            <p>A surface that leans toward the pointer.</p>
            <a href="#case">Read the case study</a>
          </article>
        </Tilt>
      </div>
      <p>
        <a href="#elsewhere">Elsewhere</a>
      </p>
    </main>
  );
}
