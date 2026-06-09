import { describe, it, expect } from "vitest";
import { impliedProb, bookOverround } from "../src/markets/americanOdds.js";

describe("americanOdds", () => {
  it("converts negative odds", () => expect(impliedProb(-150)).toBeGreaterThan(0.5));
  it("detects overround", () => expect(bookOverround(-150, 280, 400)).toBeGreaterThan(0));
});
