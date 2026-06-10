import type { ClubMatchContext } from "./clubTeamContext.js";
import type { TeamRecord } from "./clubTeamContext.js";

export interface ClubOutcomeRates {
  home: number;
  draw: number;
  away: number;
  confidence: number;
  reasoning: string;
}

const PRIOR = { home: 0.42, draw: 0.26, away: 0.32 };
const FLOOR = 0.08;

function teamRates(record: TeamRecord): { win: number; draw: number; loss: number } {
  if (record.played === 0) return { win: 1 / 3, draw: 1 / 3, loss: 1 / 3 };
  return {
    win: record.wins / record.played,
    draw: record.draws / record.played,
    loss: record.losses / record.played,
  };
}

function sampleConfidence(context: ClubMatchContext): number {
  const samples =
    context.homeRecord.played +
    context.awayRecord.played +
    context.headToHead.played * 2;
  const knownTeams = Number(Boolean(context.resolvedHome)) + Number(Boolean(context.resolvedAway));
  const coverage = knownTeams / 2;
  return Math.min(0.95, Math.max(0.15, (samples / 16) * coverage));
}

function normalizeRates(rates: ClubOutcomeRates): ClubOutcomeRates {
  const home = Math.max(FLOOR, rates.home);
  const draw = Math.max(FLOOR, rates.draw);
  const away = Math.max(FLOOR, rates.away);
  const sum = home + draw + away;
  return {
    home: home / sum,
    draw: draw / sum,
    away: away / sum,
    confidence: rates.confidence,
    reasoning: rates.reasoning,
  };
}

function formatRecord(label: string, record: TeamRecord): string {
  if (record.played === 0) return `${label}: no matches in dataset`;
  return `${label}: ${record.played}P ${record.wins}W-${record.draws}D-${record.losses}L (${record.goalsFor}-${record.goalsAgainst})`;
}

function buildReasoning(context: ClubMatchContext, rates: ClubOutcomeRates): string {
  const parts = [
    `Resolved teams: ${context.resolvedHome ?? "unknown"} (home) vs ${context.resolvedAway ?? "unknown"} (away).`,
    formatRecord("Home form", context.homeRecord),
    formatRecord("Away form", context.awayRecord),
    context.headToHead.played > 0
      ? `H2H: ${context.headToHead.played} matches (${context.headToHead.homeWins}H-${context.headToHead.draws}D-${context.headToHead.awayWins}A).`
      : "H2H: none in dataset.",
    `League draw rate: ${(context.leagueDrawRate * 100).toFixed(1)}%.`,
    `Model: home ${(rates.home * 100).toFixed(1)}%, draw ${(rates.draw * 100).toFixed(1)}%, away ${(rates.away * 100).toFixed(1)}%.`,
  ];
  return parts.join(" ");
}

/** Elo-style logistic blend on top of historical team rates (WcProbabilityModel pattern). */
export function priceClubStatistical(context: ClubMatchContext): ClubOutcomeRates {
  const home = teamRates(context.homeRecord);
  const away = teamRates(context.awayRecord);

  const homeGf = context.homeRecord.goalsFor / Math.max(1, context.homeRecord.played);
  const awayGf = context.awayRecord.goalsFor / Math.max(1, context.awayRecord.played);
  const homeStrength = home.win * 0.55 + (1 - away.win) * 0.25 + homeGf * 0.05;
  const awayStrength = away.win * 0.55 + (1 - home.win) * 0.25 + awayGf * 0.05;
  const diff = (homeStrength - awayStrength) * 400;
  const logisticHome = 1 / (1 + Math.exp(-diff / 200));

  let homeWin = logisticHome * 0.55 + home.win * 0.25 + away.loss * 0.2;
  let draw = (home.draw + away.draw) / 2 * 0.45 + context.leagueDrawRate * 0.55;
  let awayWin = (1 - logisticHome) * 0.55 + away.win * 0.25 + home.loss * 0.2;

  const confidence = sampleConfidence(context);
  const priorWeight = Math.max(0.25, 1 - confidence);
  homeWin = homeWin * (1 - priorWeight) + PRIOR.home * priorWeight;
  draw = draw * (1 - priorWeight) + PRIOR.draw * priorWeight;
  awayWin = awayWin * (1 - priorWeight) + PRIOR.away * priorWeight;

  if (context.headToHead.played > 0) {
    const h2hWeight = Math.min(0.35, context.headToHead.played / 12);
    homeWin =
      homeWin * (1 - h2hWeight) +
      (context.headToHead.homeWins / context.headToHead.played) * h2hWeight;
    draw =
      draw * (1 - h2hWeight) +
      (context.headToHead.draws / context.headToHead.played) * h2hWeight;
    awayWin =
      awayWin * (1 - h2hWeight) +
      (context.headToHead.awayWins / context.headToHead.played) * h2hWeight;
  }

  const scaledDraw = 0.26;
  const scale = 1 - scaledDraw;
  homeWin = homeWin * scale;
  awayWin = awayWin * scale;
  draw = scaledDraw;

  const draft: ClubOutcomeRates = {
    home: homeWin,
    draw,
    away: awayWin,
    confidence,
    reasoning: "",
  };

  const normalized = normalizeRates(draft);
  return {
    ...normalized,
    reasoning: buildReasoning(context, normalized),
  };
}
