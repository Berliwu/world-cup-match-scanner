import chalk from "chalk";
import { marketFixtures } from "../datasets/loadFixtures.js";
import { WcProbabilityModel } from "../pricing/WcProbabilityModel.js";
import { EdgeFinder } from "../scanner/EdgeFinder.js";
import type { EdgePick } from "../scanner/EdgeFinder.js";
import { MarginAnalyzer } from "../scanner/MarginAnalyzer.js";
import { ReportFormatter } from "../output/ReportFormatter.js";
import { Bankroll } from "../portfolio/Bankroll.js";
import { cacheGet, cacheSet } from "../utils/redisCache.js";

export async function runEdgeScan(minEdge?: number, useCache = true) {
  const threshold = minEdge ?? 0.03;
  const cacheKey = `edges:${threshold}`;

  let picks: EdgePick[] | null = useCache ? await cacheGet<EdgePick[]>(cacheKey) : null;
  if (!picks) {
    const model = new WcProbabilityModel();
    const finder = new EdgeFinder(threshold);
    const prices = model.priceAll(marketFixtures);
    picks = marketFixtures.flatMap((f) => finder.scan(f, prices.get(f.id)!));
    if (useCache) await cacheSet(cacheKey, picks);
  } else {
    console.log(chalk.cyan("(cached)"));
  }

  console.log(chalk.bold.green("\nWC2026 Edge Scan\n"));
  console.log(ReportFormatter.edges(picks));
  const bankroll = new Bankroll(1000);
  if (picks[0]) console.log(chalk.cyan(`Suggested stake: $${bankroll.stakeFromKelly(picks[0].kellyPct / 100)}`));
}

export async function runMarginScan(useCache = true) {
  const cacheKey = "margin:fixtures";
  type MarginRow = { fixtureId: string; margin: number; vigPct: number };

  let rows: MarginRow[] | null = useCache ? await cacheGet<MarginRow[]>(cacheKey) : null;
  if (!rows) {
    const analyzer = new MarginAnalyzer();
    rows = marketFixtures.map((f) => analyzer.analyze(f));
    if (useCache) await cacheSet(cacheKey, rows);
  } else {
    console.log(chalk.cyan("(cached)"));
  }

  console.log(chalk.bold.yellow("\nBookmaker margins\n"));
  for (const m of rows) console.log(`  ${m.fixtureId}: ${m.vigPct}% vig`);
}
