import { bookOverround } from "../markets/americanOdds.js";
import type { MarketFixture } from "../datasets/loadFixtures.js";

export class MarginAnalyzer {
  analyze(fixture: MarketFixture) {
    const margin = bookOverround(fixture.homeOdds, fixture.drawOdds, fixture.awayOdds);
    return { fixtureId: fixture.id, margin, vigPct: Math.round(margin * 1000) / 10 };
  }
}
