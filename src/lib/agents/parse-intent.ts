import type { MarketRegime, ParsedIntent, RiskLevel } from "./types";
import { validateAsset } from "./validate-asset";

const DEFAULT_AMOUNT = 100;
const DEFAULT_RISK: RiskLevel = "medium";

function parseAmount(text: string): number {
  const patterns = [
    /\$\s*([\d,]+(?:\.\d+)?)/i,
    /([\d,]+(?:\.\d+)?)\s*(?:usd|usdc|dusdc)/i,
    /invest\s+([\d,]+(?:\.\d+)?)/i,
    /(?:amount|deposit)\s+([\d,]+(?:\.\d+)?)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) {
      const value = parseFloat(match[1].replace(/,/g, ""));
      if (!Number.isNaN(value) && value > 0) return value;
    }
  }

  return DEFAULT_AMOUNT;
}

function parseRisk(text: string): RiskLevel {
  if (/\b(low\s+risk|conservative|safe)\b/i.test(text)) return "low";
  if (/\b(high\s+risk|aggressive|yolo)\b/i.test(text)) return "high";
  if (/\bmedium\s+risk\b/i.test(text)) return "medium";
  return DEFAULT_RISK;
}

function parseRegimeHint(text: string): MarketRegime | null {
  if (/\b(bull|going up|upside|long|rally|moon)\b/i.test(text)) return "bull";
  if (/\b(bear|going down|downside|short|crash|dump)\b/i.test(text)) return "bear";
  if (/\b(volatility|volatile|vol|swings|straddle)\b/i.test(text)) return "volatility";
  if (/\b(sideway|sideways|range.?bound|flat|neutral)\b/i.test(text)) return "sideway";
  return null;
}

function parseAsset(text: string): string {
  const upper = text.toUpperCase();
  const tokens = upper.match(/\b[A-Z]{2,5}\b/g) ?? [];
  for (const token of tokens) {
    if (token === "BTC") return "BTC";
    if (token === "ETH") return "ETH";
    if (token === "SUI") return "SUI";
    if (token === "BTS") return "BTS";
  }
  if (/\bbtc\b/i.test(text)) return "BTC";
  if (/\beth\b/i.test(text)) return "ETH";
  if (/\bsui\b/i.test(text)) return "SUI";
  if (/\bbts\b/i.test(text)) return "BTS";
  return "BTC";
}

export function parseIntent(input: string): ParsedIntent {
  const raw = input.trim();
  const asset = parseAsset(raw);
  const validation = validateAsset(asset);

  return {
    raw,
    amountUsd: parseAmount(raw),
    risk: parseRisk(raw),
    regimeHint: parseRegimeHint(raw),
    asset: validation.normalized,
    supported: validation.supported,
    rejectionReason: validation.reason,
    source: "rules",
  };
}
