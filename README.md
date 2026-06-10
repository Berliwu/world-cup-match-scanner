<img width="600" height="336" alt="download" src="https://github.com/user-attachments/assets/38b30288-9860-4678-aa04-85a2e2157549" />

# WC2026 Betting Value Scanner

Class-based market scanner for FIFA World Cup 2026 — compares model-implied probabilities against American odds to surface +EV edges with Kelly-style portfolio sizing. Includes a **club match predict pipeline** that prices two team names from remote CSV stats.

## Features

- **Club match predict** — `match Arsenal Chelsea` via `ClubProbabilityModel` + optional AI narrative
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
cp .env.example .env   # set OPENAI_API_KEY for AI narrative
npm test
npm run scan -- match Arsenal Chelsea
npm run scan -- match Arsenal Chelsea --no-ai
npm run scan -- edges
```

## Architecture

```
world-cup-match-scanner/
├── src/
│   ├── bin/scan.ts             CLI entry
│   ├── config/env.ts           dotenv loader
│   ├── datasets/               Fixtures JSON + remote club CSV fetch
│   ├── pricing/                WcProbabilityModel, ClubProbabilityModel
│   ├── ai/matchNarrator.ts     Optional AI SDK narrative overlay
│   ├── scanner/                EdgeFinder, MarginAnalyzer
│   ├── commands/               scan + match orchestration
│   ├── output/                 ReportFormatter
│   ├── portfolio/              Bankroll + Kelly sizing
│   └── utils/                  Redis cache
└── tests/
```

| Module | Role |
|--------|------|
| `pricing/ClubProbabilityModel` | Fetch club CSV stats, price home/draw/away |
| `ai/matchNarrator.ts` | Optional LLM refinement + reasoning |
| `scanner/EdgeFinder` | Compare model vs posted odds (optional on `match`) |
| `pricing/WcProbabilityModel` | WC nation Elo pricing for fixture scans |

Scanner/pricing focused — unlike extractor-heavy toolbox repos, club data is loaded inside the pricing model.

## CLI reference

| Command | Description |
|---------|-------------|
| `match <home> <away>` | Predict club match from remote CSV + optional AI |
| `edges [minEdge]` | List +EV outcomes; optional minimum edge threshold (default 0.03) |
| `margin` | Show bookmaker margin / overround per fixture |
| `redis ping` | Redis connectivity |
| `redis flush` | Clear scan cache |

### Match examples

```bash
npm run scan -- match Arsenal Chelsea
npm run scan -- match Arsenal Chelsea --no-ai
npm run scan -- match Arsenal Chelsea --league England --division 1 --year 2020
npm run scan -- match Arsenal Chelsea --no-ai --home-odds 150 --draw-odds 240 --away-odds 200
```

### WC edge scan examples

```bash
npm run scan -- edges
npm run scan -- edges 0.05
npm run scan -- margin
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
| `OPENAI_API_KEY` | Required for AI narrative (use `--no-ai` to skip) |
| `OPENAI_MODEL` | Default `gpt-4o-mini` |
| `CLUB_LEAGUE` / `CLUB_DIVISION` / `CLUB_YEAR` | Remote CSV defaults |
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
Arsenal vs Chelsea

Home win:  41.2%
Draw:      26.0%
Away win:  32.8%
Confidence: 68.0%
Model: ai
xG: 1.85 - 1.42
Resolved: Arsenal vs Chelsea

Reasoning: ...
```
