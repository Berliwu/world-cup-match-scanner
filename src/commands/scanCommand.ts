import chalk from "chalk";
import { marketFixtures } from "../datasets/loadFixtures.js";
import { WcProbabilityModel } from "../pricing/WcProbabilityModel.js";
import { EdgeFinder } from "../scanner/EdgeFinder.js";
import { MarginAnalyzer } from "../scanner/MarginAnalyzer.js";
import { ReportFormatter } from "../output/ReportFormatter.js";
import { Bankroll } from "../portfolio/Bankroll.js";

export function runEdgeScan(minEdge?: number) {
  const model = new WcProbabilityModel();
  const finder = new EdgeFinder(minEdge ?? 0.03);
  const prices = model.priceAll(marketFixtures);
  const picks = marketFixtures.flatMap((f) => finder.scan(f, prices.get(f.id)!));
  console.log(chalk.bold.green("
WC2026 Edge Scan
"));
  console.log(ReportFormatter.edges(picks));
  const bankroll = new Bankroll(1000);
  if (picks[0]) console.log(chalk.cyan(`Suggested stake: $${bankroll.stakeFromKelly(picks[0].kellyPct / 100)}`));
}

export function runMarginScan() {
  const analyzer = new MarginAnalyzer();
  console.log(chalk.bold.yellow("
Bookmaker margins
"));
  for (const f of marketFixtures) {
    const m = analyzer.analyze(f);
    console.log(`  ${m.fixtureId}: ${m.vigPct}% vig`);
  }
}
