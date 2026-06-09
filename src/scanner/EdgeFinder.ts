import { impliedProb } from "../markets/americanOdds.js";
import type { MarketFixture } from "../datasets/loadFixtures.js";
import type { ModelPrice } from "../pricing/WcProbabilityModel.js";
import { kellyFraction } from "../portfolio/KellySizer.js";

export interface EdgePick {
  fixtureId: string;
  selection: "home" | "draw" | "away";
  modelProb: number;
  marketProb: number;
  edge: number;
  kellyPct: number;
}

export class EdgeFinder {
  constructor(private minEdge = 0.03) {}

  scan(fixture: MarketFixture, model: ModelPrice): EdgePick[] {
    const legs: Array<{ selection: EdgePick["selection"]; modelProb: number; american: number }> = [
      { selection: "home", modelProb: model.home, american: fixture.homeOdds },
      { selection: "draw", modelProb: model.draw, american: fixture.drawOdds },
      { selection: "away", modelProb: model.away, american: fixture.awayOdds },
    ];
    return legs
      .map((l) => {
        const marketProb = impliedProb(l.american);
        const edge = modelProbRound(l.modelProb - marketProb);
        return {
          fixtureId: fixture.id,
          selection: l.selection,
          modelProb: l.modelProb,
          marketProb,
          edge,
          kellyPct: kellyFraction(l.modelProb, l.american),
        };
      })
      .filter((p) => p.edge >= this.minEdge);
  }
}

function modelProbRound(n: number) { return Math.round(n * 1000) / 1000; }
