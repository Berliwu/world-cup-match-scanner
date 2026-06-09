# WC2026 Betting Value Scanner

FIFA World Cup 2026 betting scanner — surfaces +EV match outcomes by comparing ensemble model probabilities against mock market odds with Kelly stake sizing.

## Features

- Value bet detection across all group fixtures
- Kelly criterion optimal stake sizing
- Bookmaker margin / overround analysis
- Bankroll manager with unit-based staking
- Edge report formatting for quick review

## Usage

```bash
npm install
npm run scan -- predict A1
npm run scan -- value-bets
npm run scan -- standings
npm test
```
