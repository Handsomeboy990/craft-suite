import { Marquee } from "../../src";

// Wider than the viewport, so at any moment some items are wholly out of view.
export const CUSTOMERS = [
  "Alder", "Birch", "Cedar", "Dogwood", "Elm", "Fir", "Ginkgo",
  "Hazel", "Juniper", "Larch", "Maple", "Oak", "Pine", "Rowan",
];

export const PARTNERS = ["Quartz", "Basalt", "Granite", "Marble", "Slate", "Shale", "Gneiss", "Flint"];

export function MarqueeFixture() {
  return (
    <main>
      <h1>Marquee</h1>
      <p>
        <a href="#before">Before the marquee</a>
      </p>
      <Marquee label="Customers" durationMs={20000}>
        {CUSTOMERS.map((name) => (
          <a key={name} href={`#${name.toLowerCase()}`} style={{ whiteSpace: "nowrap" }}>
            {name} Company
          </a>
        ))}
      </Marquee>
      <p>
        <a href="#between">Between the marquees</a>
      </p>
      <Marquee label="Partners" durationMs={15000} direction="right">
        {PARTNERS.map((name) => (
          <a key={name} href={`#${name.toLowerCase()}`} style={{ whiteSpace: "nowrap" }}>
            {name} Partners Limited
          </a>
        ))}
      </Marquee>
      <p>
        <a href="#after">After the marquees</a>
      </p>
    </main>
  );
}
