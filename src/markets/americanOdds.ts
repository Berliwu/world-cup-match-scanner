export function toDecimal(american: number): number {
  return american >= 100 ? 1 + american / 100 : 1 + 100 / Math.abs(american);
}

export function impliedProb(american: number): number {
  return 1 / toDecimal(american);
}

export function bookOverround(home: number, draw: number, away: number): number {
  return impliedProb(home) + impliedProb(draw) + impliedProb(away) - 1;
}
