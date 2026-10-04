import { Tooltip } from "../../src";

export function TooltipFixture() {
  return (
    <main>
      <h1>Tooltip</h1>
      <p style={{ paddingTop: "var(--cu-space-8)" }}>
        <a href="#before">Before the trigger</a>{" "}
        <Tooltip content="Copies the link to your clipboard" delayMs={200}>
          <button type="button">Copy link</button>
        </Tooltip>{" "}
        <a href="#after">After the trigger</a>
      </p>
    </main>
  );
}
