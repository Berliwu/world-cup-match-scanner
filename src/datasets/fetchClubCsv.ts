import { parse } from "csv-parse/sync";
import { cacheGet, cacheSet } from "../utils/redisCache.js";

export const CLUB_CSV_URL =
  "https://raw.githubusercontent.com/georgedouzas/sports-betting/data/data/soccer/modelling/{league}_{division}_{year}.csv";

export interface ClubCsvParams {
  league?: string;
  division?: number;
  year?: number;
}

export type ClubMatchRow = Record<string, string>;

export function clubCsvUrl(params: ClubCsvParams = {}): string {
  const league = params.league ?? "England";
  const division = String(params.division ?? 1);
  const year = String(params.year ?? 2020);
  return CLUB_CSV_URL.replace("{league}", league)
    .replace("{division}", division)
    .replace("{year}", year);
}

export function parseClubCsv(text: string): ClubMatchRow[] {
  return parse(text, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as ClubMatchRow[];
}

export async function fetchClubCsv(
  params: ClubCsvParams = {},
  useCache = true,
): Promise<ClubMatchRow[]> {
  const url = clubCsvUrl(params);
  const cacheKey = `club-csv:${url}`;

  if (useCache) {
    const cached = await cacheGet<ClubMatchRow[]>(cacheKey);
    if (cached) return cached;
  }

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch club CSV ${url}: ${response.status}`);
  }

  const text = await response.text();
  const rows = parseClubCsv(text);

  if (useCache) await cacheSet(cacheKey, rows);

  return rows;
}
