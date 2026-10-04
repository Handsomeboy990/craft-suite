import { renderToString } from "react-dom/server";
import { fixtures, type FixtureName } from "../fixtures";

export const fixtureNames = Object.keys(fixtures) as FixtureName[];

/** The server HTML of one fixture, as a real server-rendered page would send it. */
export function render(name: FixtureName): string {
  const Fixture = fixtures[name];
  return renderToString(<Fixture />);
}
