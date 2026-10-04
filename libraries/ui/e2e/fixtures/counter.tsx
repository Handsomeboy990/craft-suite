import { Counter } from "../../src";

export function CounterFixture() {
  return (
    <main>
      <h1>Counter</h1>
      <div style={{ height: "120vh" }} />
      <section aria-labelledby="figures-title">
        <h2 id="figures-title">Figures</h2>
        <p data-testid="figure">
          <Counter value={12000} locale="en-US" durationMs={3000} /> customers
        </p>
      </section>
      <div style={{ height: "50vh" }} />
    </main>
  );
}
