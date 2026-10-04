import { Magnetic } from "../../src";

export function MagneticFixture() {
  return (
    <main>
      <h1>Magnetic</h1>
      <p style={{ padding: "var(--cu-space-8)" }}>
        <Magnetic strength={10}>
          <a
            href="#start"
            style={{
              display: "inline-block",
              padding: "var(--cu-space-4) var(--cu-space-8)",
              background: "var(--cu-color-accent)",
              color: "var(--cu-color-accent-text)",
              borderRadius: "var(--cu-radius-md)",
            }}
          >
            Start a project
          </a>
        </Magnetic>
      </p>
      <p>
        <a href="#elsewhere">Elsewhere</a>
      </p>
    </main>
  );
}
