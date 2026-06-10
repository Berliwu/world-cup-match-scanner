import {
  fetchClubCsv,
  type ClubCsvParams,
  type ClubMatchRow,
} from "../datasets/fetchClubCsv.js";
import { buildClubMatchContext, type ClubMatchContext } from "./clubTeamContext.js";
import { priceClubStatistical, type ClubOutcomeRates } from "./clubStatistical.js";

export interface ClubModelPrice extends ClubOutcomeRates {
  xgHome: number;
  xgAway: number;
  context: ClubMatchContext;
}

export interface ClubModelOptions extends ClubCsvParams {
  useCache?: boolean;
}

/**
 * Club match pricing model — fetches remote CSV stats and prices home/draw/away
 * using the same scanner/pricing pattern as WcProbabilityModel.
 */
export class ClubProbabilityModel {
  private rows: ClubMatchRow[] = [];
  private loaded = false;

  constructor(private options: ClubModelOptions = {}) {}

  async load(): Promise<void> {
    if (this.loaded) return;
    this.rows = await fetchClubCsv(
      {
        league: this.options.league,
        division: this.options.division,
        year: this.options.year,
      },
      this.options.useCache !== false,
    );
    this.loaded = true;
  }

  /** Load from in-memory rows (tests / fixtures). */
  loadFromRows(rows: ClubMatchRow[]): void {
    this.rows = rows;
    this.loaded = true;
  }

  price(homeTeam: string, awayTeam: string): ClubModelPrice {
    if (!this.loaded) {
      throw new Error("ClubProbabilityModel: call load() before price().");
    }
    if (!homeTeam?.trim() || !awayTeam?.trim()) {
      throw new Error("ClubProbabilityModel requires both home and away team names.");
    }

    const context = buildClubMatchContext(homeTeam.trim(), awayTeam.trim(), this.rows);
    const rates = priceClubStatistical(context);

    const homeGf = context.homeRecord.goalsFor / Math.max(1, context.homeRecord.played);
    const awayGf = context.awayRecord.goalsFor / Math.max(1, context.awayRecord.played);

    return {
      ...rates,
      xgHome: round(1.1 + homeGf * 0.35 + rates.home * 0.8),
      xgAway: round(1.1 + awayGf * 0.35 + rates.away * 0.8),
      context,
    };
  }
}

function round(n: number): number {
  return Math.round(n * 1000) / 1000;
}
