import { describe, it, expect } from "vitest";
import { Bankroll } from "../src/portfolio/Bankroll.js";

describe("Bankroll", () => {
  it("sizes stakes", () => expect(new Bankroll(1000).stakeFromKelly(0.05)).toBe(50));
});
