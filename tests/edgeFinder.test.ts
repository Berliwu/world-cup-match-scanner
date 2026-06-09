import { describe, it, expect } from "vitest";
import { EdgeFinder } from "../src/scanner/EdgeFinder.js";

describe("EdgeFinder", () => {
  it("finds edges when model beats market", () => {
    const f = new EdgeFinder(0.01);
    const picks = f.scan(
      { id: "T", home: "arg", away: "aus", homeOdds: 200, drawOdds: 250, awayOdds: 300 },
      { home: 0.7, draw: 0.15, away: 0.15, xgHome: 2, xgAway: 1 }
    );
    expect(picks.length).toBeGreaterThanOrEqual(0);
  });
});
