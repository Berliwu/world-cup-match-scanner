import { generateObject } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { z } from "zod";
import { loadEnv } from "../config/env.js";
import type { ClubMatchContext } from "../pricing/clubTeamContext.js";
import type { ClubOutcomeRates } from "../pricing/clubStatistical.js";

const narrativeSchema = z.object({
  home: z.number().min(0).max(1),
  draw: z.number().min(0).max(1),
  away: z.number().min(0).max(1),
  confidence: z.number().min(0).max(1),
  reasoning: z.string(),
});

export interface NarratedPrice extends ClubOutcomeRates {
  model: "ai" | "statistical";
}

function formatRecord(label: string, record: ClubMatchContext["homeRecord"]): string {
  if (record.played === 0) return `${label}: no historical matches`;
  return `${label}: ${record.played}P ${record.wins}W-${record.draws}D-${record.losses}L`;
}

function buildPrompt(context: ClubMatchContext, baseline: ClubOutcomeRates): string {
  return [
    `Analyze this club match: ${context.homeTeam} (home) vs ${context.awayTeam} (away).`,
    `Dataset names: home=${context.resolvedHome ?? "unknown"}, away=${context.resolvedAway ?? "unknown"}.`,
    formatRecord("Home", context.homeRecord),
    formatRecord("Away", context.awayRecord),
    context.headToHead.played > 0
      ? `H2H: ${context.headToHead.played} games`
      : "H2H: none",
    `League draw rate: ${(context.leagueDrawRate * 100).toFixed(1)}%`,
    `Pricing baseline: home ${(baseline.home * 100).toFixed(1)}%, draw ${(baseline.draw * 100).toFixed(1)}%, away ${(baseline.away * 100).toFixed(1)}%`,
    baseline.reasoning,
    "Return calibrated probabilities and a concise narrative explaining the edge case factors.",
  ].join("\n");
}

function normalizeRates(raw: z.infer<typeof narrativeSchema>): ClubOutcomeRates {
  const sum = raw.home + raw.draw + raw.away;
  const scale = sum > 0 ? 1 / sum : 1;
  return {
    home: raw.home * scale,
    draw: raw.draw * scale,
    away: raw.away * scale,
    confidence: Math.min(1, Math.max(0, raw.confidence)),
    reasoning: raw.reasoning,
  };
}

function openAiProvider() {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  const baseURL = process.env.OPENAI_BASE_URL?.trim();
  return createOpenAI({
    apiKey: apiKey ?? "",
    baseURL: baseURL || undefined,
  });
}

export function isNarratorAvailable(): boolean {
  loadEnv();
  return Boolean(process.env.OPENAI_API_KEY?.trim());
}

export function narratorSetupInstructions(): string {
  return [
    "AI narrative requires OPENAI_API_KEY (use --no-ai for statistical-only).",
    "  1. cp .env.example .env",
    "  2. Set OPENAI_API_KEY=sk-...",
    "  3. Optional: OPENAI_MODEL=gpt-4o-mini",
  ].join("\n");
}

/** Optional AI overlay — refines baseline pricing with narrative reasoning. */
export async function narrateMatch(
  context: ClubMatchContext,
  baseline: ClubOutcomeRates,
): Promise<NarratedPrice> {
  loadEnv();
  if (!isNarratorAvailable()) {
    throw new Error(narratorSetupInstructions());
  }

  const model = process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini";
  const { object } = await generateObject({
    model: openAiProvider()(model),
    schema: narrativeSchema,
    prompt: buildPrompt(context, baseline),
  });

  const rates = normalizeRates(object);
  return { ...rates, model: "ai" };
}
