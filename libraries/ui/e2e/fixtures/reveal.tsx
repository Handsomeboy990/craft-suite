import { Reveal } from "../../src";

export function RevealFixture() {
  return (
    <main>
      <h1>Reveal</h1>
      <Reveal>
        <p data-testid="above">Above the fold, on screen at load.</p>
      </Reveal>
      <div style={{ height: "150vh" }} />
      <Reveal delayMs={50}>
        <h2>Below the fold</h2>
        <p data-testid="below">Off screen at load, revealed when scrolled into view.</p>
      </Reveal>
      <div style={{ height: "50vh" }} />
    </main>
  );
}
