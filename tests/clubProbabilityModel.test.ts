import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { parseClubCsv } from "../src/datasets/fetchClubCsv.js";
import { ClubProbabilityModel } from "../src/pricing/clubProbabilityModel.js";
import { buildClubMatchContext } from "../src/pricing/clubTeamContext.js";
import { priceClubStatistical } from "../src/pricing/clubStatistical.js";

const fixturePath = resolve("tests/fixtures/club-sample.csv");

describe("ClubProbabilityModel", () => {
  const rows = parseClubCsv(readFileSync(fixturePath, "utf8"));

  it("prices Arsenal vs Chelsea from fixture CSV", () => {
    const model = new ClubProbabilityModel();
    model.loadFromRows(rows);
    const price = model.price("Arsenal", "Chelsea");

    expect(price.home + price.draw + price.away).toBeCloseTo(1, 2);
    expect(price.confidence).toBeGreaterThan(0);
    expect(price.context.resolvedHome).toBe("Arsenal");
    expect(price.context.resolvedAway).toBe("Chelsea");
    expect(price.reasoning.length).toBeGreaterThan(10);
  });

  it("builds head-to-head context", () => {
    const context = buildClubMatchContext("Arsenal", "Chelsea", rows);
    expect(context.headToHead.played).toBe(2);
    expect(context.homeRecord.played).toBeGreaterThan(0);
    expect(context.awayRecord.played).toBeGreaterThan(0);
  });

  it("returns normalized statistical rates", () => {
    const context = buildClubMatchContext("Arsenal", "Chelsea", rows);
    const rates = priceClubStatistical(context);
    expect(rates.home + rates.draw + rates.away).toBeCloseTo(1, 5);
    expect(rates.confidence).toBeGreaterThan(0);
  });
});
