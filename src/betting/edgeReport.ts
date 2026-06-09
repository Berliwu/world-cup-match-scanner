import type { ValueBet } from "../types/prediction.js";

export function buildEdgeReport(bets: ValueBet[]): string {
  if (!bets.length) return "No +EV edges found for WC2026 fixtures.";
  return bets.map((b) =>
    `${b.matchId} ${b.outcome}: +${(b.edge * 100).toFixed(1)}% (Kelly ${b.kellyFraction.toFixed(1)}%)`
  ).join("
");
}
