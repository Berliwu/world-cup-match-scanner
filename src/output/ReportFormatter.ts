import type { EdgePick } from "../scanner/EdgeFinder.js";
import type { MatchPredictionResult } from "../commands/matchCommand.js";

export class ReportFormatter {
  static edges(picks: EdgePick[]): string {
    if (!picks.length) return "No +EV edges above threshold.";
    return picks
      .map(
        (p) =>
          `${p.fixtureId} ${p.selection.toUpperCase()}: +${(p.edge * 100).toFixed(1)}% edge, Kelly ${p.kellyPct.toFixed(1)}%`,
      )
      .join("\n");
  }

  static match(result: MatchPredictionResult): string {
    const pct = (n: number) => `${(n * 100).toFixed(1)}%`;
    const lines = [
      `Home win:  ${pct(result.home)}`,
      `Draw:      ${pct(result.draw)}`,
      `Away win:  ${pct(result.away)}`,
      `Confidence: ${pct(result.confidence)}`,
      `Model: ${result.model}`,
      `xG: ${result.xgHome.toFixed(2)} - ${result.xgAway.toFixed(2)}`,
      `Resolved: ${result.resolvedHome ?? "?"} vs ${result.resolvedAway ?? "?"}`,
      "",
      `Reasoning: ${result.reasoning}`,
    ];
    return lines.join("\n");
  }
}
