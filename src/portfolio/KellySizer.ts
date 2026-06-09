import { toDecimal } from "../markets/americanOdds.js";

export function kellyFraction(modelProb: number, americanOdds: number): number {
  const d = toDecimal(americanOdds);
  const f = (d * modelProb - (1 - modelProb)) / (d - 1);
  return Math.max(0, Math.round(f * 10000) / 100);
}
