import chalk from "chalk";
import { runEdgeScan, runMarginScan } from "../commands/scanCommand.js";
import { cacheFlushNamespace } from "../utils/redisCache.js";
import { closeRedisClient, isRedisEnabled, pingRedis } from "../utils/redis.js";

const argv = process.argv.slice(2);
const useCache = !argv.includes("--no-cache");
const [cmd, arg] = argv.filter((a) => a !== "--no-cache");

async function main() {
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
    console.log("  edges [minEdge]   Scan all fixtures for +EV picks");
    console.log("  margin            Show bookmaker overround per fixture");
    console.log("  redis ping        Check Redis connection");
    console.log("  redis flush       Clear wc2026-scanner:* cache keys");
    console.log("  --no-cache        Bypass Redis/memory cache");
  }
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await closeRedisClient(); });
