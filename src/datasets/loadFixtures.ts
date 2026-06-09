import raw from "./wc2026-fixtures.json" with { type: "json" };

export interface MarketFixture {
  id: string; home: string; away: string;
  homeOdds: number; drawOdds: number; awayOdds: number;
}

export const marketFixtures: MarketFixture[] = raw as MarketFixture[];
export const fixtureById = (id: string) => marketFixtures.find((f) => f.id === id);
