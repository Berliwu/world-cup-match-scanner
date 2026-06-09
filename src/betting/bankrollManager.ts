export interface Bankroll {
  balance: number;
  unitSize: number;
}

export function createBankroll(balance: number, unitPct = 0.02): Bankroll {
  return { balance, unitSize: balance * unitPct };
}

export function kellyStake(bankroll: Bankroll, kellyFraction: number): number {
  return Math.round(bankroll.balance * kellyFraction * 100) / 100;
}
