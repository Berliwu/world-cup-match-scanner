# WC2026 Betting Value Scanner

Class-based market scanner for FIFA World Cup 2026 — compares model prices against American odds to find +EV edges.

## Architecture

```
src/
├── bin/scan.ts              CLI entry
├── datasets/                JSON fixtures + loader
├── markets/                 Odds conversion, implied probability
├── pricing/                 WcProbabilityModel (Elo logistic)
├── portfolio/               Bankroll + Kelly sizing
├── scanner/                 EdgeFinder, MarginAnalyzer
├── output/                  ReportFormatter
└── commands/                scanCommand orchestration
```

## Commands

```bash
npm install
npm run scan -- edges
npm run scan -- edges 0.05
npm run scan -- margin
npm test
```
