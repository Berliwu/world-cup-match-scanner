import { describe, it, expect } from "vitest";
import { createBankroll, kellyStake } from "../src/betting/bankrollManager.js";

describe("Bankroll", () => {
  it("sizes Kelly stake", () => {
    expect(kellyStake(createBankroll(1000), 0.05)).toBe(50);
  });
});
