<img width="600" height="336" alt="download" src="https://github.com/user-attachments/assets/38b30288-9860-4678-aa04-85a2e2157549" />

# WC2026 Betting Value Scanner

Class-based market scanner for FIFA World Cup 2026 — compares model-implied probabilities against American odds to surface +EV edges with Kelly-style portfolio sizing.

## Features

- **Edge detection** — `EdgeFinder` flags outcomes where model prob × decimal odds > 1
- **Margin analysis** — bookmaker overround and market efficiency metrics
- **WcProbabilityModel** — Elo-logistic pricing from nation ratings
- **Portfolio sizing** — fractional Kelly bankroll recommendations
- **Report output** — formatted edge tables for terminal or export
- **Redis cache** — optional scan result caching

## Quick start

**Requirements:** Node.js 20+

```bash
npm install
npm test
npm run scan -- edges
npm run scan -- edges 0.05
npm run scan -- margin
```

## Architecture

```
world-cup-match-scanner/
├── src/
│   ├── bin/scan.ts             CLI entry
│   ├── datasets/               JSON fixtures + loader
│   ├── markets/                Odds conversion, implied probability
│   ├── pricing/                WcProbabilityModel (Elo logistic)
│   ├── portfolio/              Bankroll + Kelly sizing
│   ├── scanner/                EdgeFinder, MarginAnalyzer
│   ├── output/                 ReportFormatter
│   ├── commands/               scanCommand orchestration
│   └── utils/                  Redis cache
└── tests/
```

| Module | Role |
|--------|------|
| `datasets/` | Load WC2026 fixtures and market odds JSON |
| `pricing/` | Model win/draw/loss probabilities per fixture |
| `scanner/` | Compare model vs market, rank edges |
| `portfolio/` | Suggested stake sizes given bankroll |
| `output/` | Human-readable scan reports |

## CLI reference

| Command | Description |
|---------|-------------|
| `edges [minEdge]` | List +EV outcomes; optional minimum edge threshold (default 0.03) |
| `margin` | Show bookmaker margin / overround per fixture |
| `redis ping` | Redis connectivity |
| `redis flush` | Clear scan cache |

### Examples

```bash
npm run scan -- edges
npm run scan -- edges 0.05
npm run scan -- margin
npm run scan -- redis ping
```

## Edge logic

A bet is flagged as value when:

```
model_probability × decimal_odds > 1
```

Kelly fraction (when enabled) uses model prob and posted odds to suggest bankroll allocation.

## Environment variables

| Variable | Description |
|----------|-------------|
| `REDIS_URL` / `REDIS_HOST` | Optional scan cache |
| `REDIS_KEY_PREFIX` | Scanner-specific namespace |
| `REDIS_ENABLED` | `false` for memory-only |

## Scripts

| Script | Description |
|--------|-------------|
| `npm run scan` | CLI |
| `npm run typecheck` | TypeScript |
| `npm test` | Vitest |

## Sample output

```
Fixture  Edge        Model%   Market%   Odds
A1       Home Win    52.1%    45.0%    +122
B2       Draw        28.4%    24.0%    +317
```
