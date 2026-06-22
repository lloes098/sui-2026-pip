import type { OracleState, VaultSummary } from "@/lib/predict/api";
import { formatQuoteAmount } from "@/lib/predict/api";
import type { AgentStep, MarketRegime, ParsedIntent } from "./types";

function toSpotNumber(spot: OracleState["spot"]): number {
  if (spot === undefined || spot === null) return 0;
  return typeof spot === "string" ? Number(spot) : spot;
}

export function detectRegime(
  spot: number,
  strikes: number[],
  intent: ParsedIntent,
): { regime: MarketRegime; step: AgentStep } {
  if (intent.regimeHint) {
    return {
      regime: intent.regimeHint,
      step: {
        agent: "Market Analysis Agent",
        message: `User intent overrides regime → ${intent.regimeHint.toUpperCase()} (${intent.asset})`,
        data: { spot, regime: intent.regimeHint, source: "user_intent" },
      },
    };
  }

  if (!strikes.length || !spot) {
    return {
      regime: "sideway",
      step: {
        agent: "Market Analysis Agent",
        message: "Insufficient oracle data — defaulting to Sideway regime",
        data: { spot, regime: "sideway", source: "fallback" },
      },
    };
  }

  const min = Math.min(...strikes);
  const max = Math.max(...strikes);
  const range = max - min || 1;
  const position = (spot - min) / range;
  const spreadRatio = range / spot;

  let regime: MarketRegime;
  if (spreadRatio > 0.12) {
    regime = "volatility";
  } else if (position > 0.58) {
    regime = "bull";
  } else if (position < 0.42) {
    regime = "bear";
  } else {
    regime = "sideway";
  }

  return {
    regime,
    step: {
      agent: "Market Analysis Agent",
      message: `Spot ${formatQuoteAmount(spot)} vs strike grid → ${regime.toUpperCase()} regime`,
      data: {
        spot,
        regime,
        gridMin: min,
        gridMax: max,
        position: Math.round(position * 100),
        source: "oracle",
      },
    },
  };
}

export function buildMarketContext(
  oracle: OracleState,
  vault: VaultSummary | null,
  predictPaused: boolean,
): string {
  const spot = toSpotNumber(oracle.spot);
  const vaultValue = vault?.vault_value
    ? formatQuoteAmount(vault.vault_value)
    : "unknown";
  return `Oracle ${oracle.oracle_id.slice(0, 10)}… · Spot ${formatQuoteAmount(spot)} · Vault ${vaultValue} DUSDC · Trading ${predictPaused ? "paused" : "active"}`;
}
