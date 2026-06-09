import type { EdgePick } from "../scanner/EdgeFinder.js";

export class ReportFormatter {
  static edges(picks: EdgePick[]): string {
    if (!picks.length) return "No +EV edges above threshold.";
    return picks.map((p) =>
      `${p.fixtureId} ${p.selection.toUpperCase()}: +${(p.edge * 100).toFixed(1)}% edge, Kelly ${p.kellyPct.toFixed(1)}%`
    ).join("\n");
  }
}
