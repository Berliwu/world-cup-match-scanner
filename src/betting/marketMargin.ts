export function bookmakerMargin(implied: number[]): number {
  const total = implied.reduce((s, p) => s + p, 0);
  return Math.round((total - 1) * 1000) / 1000;
}
