import { nationById, NATIONS } from "./nationRatings.js";
import type { MarketFixture } from "../datasets/loadFixtures.js";

export interface ModelPrice {
  home: number; draw: number; away: number;
  xgHome: number; xgAway: number;
}

export class WcProbabilityModel {
  price(fixture: MarketFixture): ModelPrice {
    const home = nationById(fixture.home)!;
    const away = nationById(fixture.away)!;
    const diff = home.elo - away.elo;
    const homeWin = 1 / (1 + Math.exp(-diff / 200));
    const awayWin = 1 - homeWin;
    const draw = 0.26;
    const scale = 1 - draw;
    return {
      home: homeWin * scale,
      draw,
      away: awayWin * scale,
      xgHome: 1.2 + home.elo / 3000,
      xgAway: 1.2 + away.elo / 3000,
    };
  }

  priceAll(fixtures: MarketFixture[]): Map<string, ModelPrice> {
    return new Map(fixtures.map((f) => [f.id, this.price(f)]));
  }
}
