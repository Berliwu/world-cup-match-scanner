import chalk from "chalk";
import { runEdgeScan, runMarginScan } from "../commands/scanCommand.js";
import { runMatchPredict, printMatchResult } from "../commands/matchCommand.js";
import { cacheFlushNamespace } from "../utils/redisCache.js";
import { closeRedisClient, isRedisEnabled, pingRedis } from "../utils/redis.js";
import { loadEnv } from "../config/env.js";

loadEnv();

const argv = process.argv.slice(2);
const useCache = !argv.includes("--no-cache");
const filtered = argv.filter((a) => a !== "--no-cache");

function hasFlag(args: string[], flag: string): boolean {
  return args.includes(flag);
}

function getFlagValue(args: string[], flag: string): string | null {
  const idx = args.indexOf(flag);
  return idx >= 0 ? (args[idx + 1] ?? null) : null;
}

function parseMatchTeams(args: string[]): { home: string; away: string } {
  const positional = args.filter((a) => !a.startsWith("--") && a !== "match");
  if (positional.length >= 2) {
    return { home: positional[0]!, away: positional[1]! };
  }
  throw new Error("Usage: npm run scan -- match <home-team> <away-team>");
}

function parseMatchOptions(args: string[]) {
  const homeOdds = getFlagValue(args, "--home-odds");
  const drawOdds = getFlagValue(args, "--draw-odds");
  const awayOdds = getFlagValue(args, "--away-odds");
  const minEdge = getFlagValue(args, "--min-edge");

  const odds =
    homeOdds && drawOdds && awayOdds
      ? {
          home: Number(homeOdds),
          draw: Number(drawOdds),
          away: Number(awayOdds),
        }
      : undefined;

  return {
    useCache,
    useAi: !hasFlag(args, "--no-ai"),
    league: getFlagValue(args, "--league") ?? undefined,
    division: getFlagValue(args, "--division")
      ? Number(getFlagValue(args, "--division"))
      : undefined,
    year: getFlagValue(args, "--year") ? Number(getFlagValue(args, "--year")) : undefined,
    minEdge: minEdge ? Number(minEdge) : undefined,
    odds,
  };
}

async function main() {
  const [cmd, arg] = filtered;

  if (cmd === "match") {
    const { home, away } = parseMatchTeams(filtered);
    const result = await runMatchPredict(home, away, parseMatchOptions(filtered));
    printMatchResult(result);
    return;
  }

  if (cmd === "redis" && arg === "ping") {
    if (!isRedisEnabled()) {
      console.log(chalk.yellow("Redis disabled. Set REDIS_URL or REDIS_HOST."));
      return;
    }
    console.log((await pingRedis()) ? chalk.green("Redis PONG") : chalk.red("Redis unreachable"));
    return;
  }
  if (cmd === "redis" && arg === "flush") {
    const n = await cacheFlushNamespace();
    console.log(chalk.green(`Flushed ${n} Redis key(s)`));
    return;
  }
  if (cmd === "edges") await runEdgeScan(arg ? Number(arg) : undefined, useCache);
  else if (cmd === "margin") await runMarginScan(useCache);
  else {
    console.log("WC2026 Betting Value Scanner");
    console.log("  match <home> <away>   Predict club match (remote CSV + optional AI)");
    console.log("  edges [minEdge]       Scan all fixtures for +EV picks");
    console.log("  margin                Show bookmaker overround per fixture");
    console.log("  redis ping            Check Redis connection");
    console.log("  redis flush           Clear wc2026-scanner:* cache keys");
    console.log("  --no-cache            Bypass Redis/memory cache");
    console.log("  --no-ai               Statistical pricing only (match command)");
    console.log("  --home-odds --draw-odds --away-odds   Optional edge analysis");
  }
}

main()
  .catch((e) => {
    console.error(chalk.red(e instanceof Error ? e.message : String(e)));
    process.exit(1);
  })
  .finally(async () => {
    await closeRedisClient();
  });
