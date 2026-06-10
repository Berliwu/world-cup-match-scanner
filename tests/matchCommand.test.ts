import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { parseClubCsv } from "../src/datasets/fetchClubCsv.js";
import { runMatchPredict } from "../src/commands/matchCommand.js";
import * as fetchClubCsv from "../src/datasets/fetchClubCsv.js";

const fixturePath = resolve("tests/fixtures/club-sample.csv");
const rows = parseClubCsv(readFileSync(fixturePath, "utf8"));

describe("runMatchPredict", () => {
  beforeEach(() => {
    vi.spyOn(fetchClubCsv, "fetchClubCsv").mockResolvedValue(rows);
  });

  it("predicts match with statistical model when --no-ai", async () => {
    const result = await runMatchPredict("Arsenal", "Chelsea", { useAi: false });

    expect(result.homeTeam).toBe("Arsenal");
    expect(result.awayTeam).toBe("Chelsea");
    expect(result.model).toBe("statistical");
    expect(result.home + result.draw + result.away).toBeCloseTo(1, 2);
    expect(result.confidence).toBeGreaterThan(0);
    expect(result.reasoning.length).toBeGreaterThan(10);
  });

  it("requires API key when AI is enabled", async () => {
    const prev = process.env.OPENAI_API_KEY;
    delete process.env.OPENAI_API_KEY;
    await expect(runMatchPredict("Arsenal", "Chelsea", { useAi: true })).rejects.toThrow(
      /OPENAI_API_KEY/,
    );
    if (prev) process.env.OPENAI_API_KEY = prev;
  });

  it("runs optional edge analysis when odds are posted", async () => {
    const result = await runMatchPredict("Arsenal", "Chelsea", {
      useAi: false,
      odds: { home: 150, draw: 240, away: 200 },
      minEdge: 0.01,
    });

    expect(Array.isArray(result.edges)).toBe(true);
  });
});
