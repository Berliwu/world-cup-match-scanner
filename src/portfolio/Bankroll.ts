export class Bankroll {
  constructor(public balance: number, public unitPct = 0.02) {}
  get unit() { return this.balance * this.unitPct; }
  stakeFromKelly(kellyPct: number, cap = 0.25): number {
    return Math.round(this.balance * Math.min(kellyPct, cap) * 100) / 100;
  }
}
