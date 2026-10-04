import { Stagger } from "../../src";

const FEATURES = ["Owned", "Accessible", "Token driven", "Reduced motion safe"];

export function StaggerFixture() {
  return (
    <main>
      <h1>Stagger</h1>
      <Stagger as="ul">
        <span>On screen at load</span>
        <span>Never hidden</span>
      </Stagger>
      <div style={{ height: "150vh" }} />
      <h2>Features</h2>
      <Stagger as="ul" stepMs={80}>
        {FEATURES.map((feature) => (
          <span key={feature}>{feature}</span>
        ))}
      </Stagger>
      <div style={{ height: "50vh" }} />
    </main>
  );
}
