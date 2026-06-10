import chalk from "chalk";
import { loadEnv } from "../config/env.js";
import { ClubProbabilityModel } from "../pricing/clubProbabilityModel.js";
import type { ClubModelPrice } from "../pricing/clubProbabilityModel.js";
import {
  isNarratorAvailable,
  narrateMatch,
  narratorSetupInstructions,
} from "../ai/matchNarrator.js";
import { EdgeFinder } from "../scanner/EdgeFinder.js";
import type { EdgePick } from "../scanner/EdgeFinder.js";
import { ReportFormatter } from "../output/ReportFormatter.js";
import type { ClubCsvParams } from "../datasets/fetchClubCsv.js";

export interface MatchOdds {
  home: number;
  draw: number;
  away: number;
}

export interface MatchPredictOptions extends ClubCsvParams {
  useCache?: boolean;
  useAi?: boolean;
  minEdge?: number;
  odds?: MatchOdds;
}

export interface MatchPredictionResult {
  homeTeam: string;
  awayTeam: string;
  home: number;
  draw: number;
  away: number;
  confidence: number;
  reasoning: string;
  model: "ai" | "statistical";
  xgHome: number;
  xgAway: number;
  resolvedHome: string | null;
  resolvedAway: string | null;
  edges?: EdgePick[];
}

export async function runMatchPredict(
  homeTeam: string,
  awayTeam: string,
  options: MatchPredictOptions = {},
): Promise<MatchPredictionResult> {
  loadEnv();

  const wantsAi = options.useAi !== false;
  if (wantsAi && !isNarratorAvailable()) {
    throw new Error(narratorSetupInstructions());
  }

  const pricing = new ClubProbabilityModel({
    league: options.league,
    division: options.division,
    year: options.year,
    useCache: options.useCache,
  });
  await pricing.load();

  const baseline = pricing.price(homeTeam, awayTeam);
  let price: ClubModelPrice = baseline;
  let model: MatchPredictionResult["model"] = "statistical";

  if (wantsAi) {
    const narrated = await narrateMatch(baseline.context, baseline);
    price = { ...baseline, ...narrated };
    model = narrated.model;
  }

  const result: MatchPredictionResult = {
    homeTeam: homeTeam.trim(),
    awayTeam: awayTeam.trim(),
    home: round(price.home),
    draw: round(price.draw),
    away: round(price.away),
    confidence: round(price.confidence),
    reasoning: price.reasoning,
    model,
    xgHome: price.xgHome,
    xgAway: price.xgAway,
    resolvedHome: price.context.resolvedHome,
    resolvedAway: price.context.resolvedAway,
  };

  if (options.odds) {
    const fixture = {
      id: `${result.homeTeam}-vs-${result.awayTeam}`,
      home: result.resolvedHome ?? result.homeTeam,
      away: result.resolvedAway ?? result.awayTeam,
      homeOdds: options.odds.home,
      drawOdds: options.odds.draw,
      awayOdds: options.odds.away,
    };
    const finder = new EdgeFinder(options.minEdge ?? 0.03);
    result.edges = finder.scan(fixture, {
      home: price.home,
      draw: price.draw,
      away: price.away,
      xgHome: price.xgHome,
      xgAway: price.xgAway,
    });
  }

  return result;
}

export function printMatchResult(result: MatchPredictionResult): void {
  console.log(chalk.bold.cyan(`\n${result.homeTeam} vs ${result.awayTeam}\n`));
  console.log(ReportFormatter.match(result));
  if (result.edges?.length) {
    console.log(chalk.bold.green("\nEdge analysis\n"));
    console.log(ReportFormatter.edges(result.edges));
  } else if (result.edges) {
    console.log(chalk.yellow("\nNo +EV edges above threshold for posted odds."));
  }
}

function round(n: number): number {
  return Math.round(n * 1000) / 1000;
}
