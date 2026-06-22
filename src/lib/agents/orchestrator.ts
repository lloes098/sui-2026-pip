import {
  getOracleState,
  getOracles,
  getPredictState,
  getVaultSummary,
  type OracleState,
  type VaultSummary,
} from "@/lib/predict/api";
import { detectRegime } from "./market-analysis";
import { getLlmProviderName } from "./llm/provider";
import { resolveIntent } from "./resolve-intent";
import {
  buildRangeLegs,
  indexNameFor,
  plpAllocationPct,
  rangeLegCount,
  regimeLabel,
  selectRangesForIndex,
} from "./range-selection";
import type { AgentPlan, AgentStep, IndexId } from "./types";

function toSpotNumber(spot: OracleState["spot"]): number {
  if (spot === undefined || spot === null) return 0;
  return typeof spot === "string" ? Number(spot) : spot;
}

async function loadLiveOracle(): Promise<OracleState> {
  const oracles = await getOracles();
  const live =
    oracles.find((o) => o.status === "Live" || o.status === "active") ??
    oracles[0];
  if (!live?.oracle_id) {
    throw new Error("No active oracle available on DeepBook Predict");
  }
  return getOracleState(live.oracle_id);
}

export async function runAgentPipeline(input: string): Promise<AgentPlan> {
  const intent = await resolveIntent(input);

  if (!intent.supported) {
    throw new Error(
      intent.rejectionReason ??
        `${intent.asset} is not supported. PIP trades BTC indexes on DeepBook Predict only.`,
    );
  }

  const [oracle, vault, predictState] = await Promise.all([
    loadLiveOracle(),
    getVaultSummary().catch(() => null),
    getPredictState().catch(() => ({})),
  ]);

  const strikes = oracle.strikes ?? [];
  const spot = toSpotNumber(oracle.spot);
  const tradingPaused =
    "trading_paused" in predictState ? !!predictState.trading_paused : false;

  const steps: AgentStep[] = [];

  steps.push({
    agent: "Intent Agent",
    message:
      intent.reasoning ??
      `Parsed via ${intent.source === "llm" ? "LLM" : "rules"}: ${intent.asset}, $${intent.amountUsd}, ${intent.risk} risk`,
    data: {
      source: intent.source,
      asset: intent.asset,
      amountUsd: intent.amountUsd,
    },
  });

  const { regime, step: marketStep } = detectRegime(spot, strikes, intent);
  steps.push(marketStep);

  const indexId: IndexId = intent.regimeHint ?? regime;
  const indexName = indexNameFor(indexId);
  const plpPct = plpAllocationPct(intent.risk);
  const legCount = rangeLegCount(intent.risk);

  steps.push({
    agent: "Index Construction Agent",
    message: `Selected ${indexName} for ${regimeLabel(regime)} · ${intent.risk} risk · $${intent.amountUsd} allocation`,
    data: {
      indexId,
      risk: intent.risk,
      amountUsd: intent.amountUsd,
      plpPct,
    },
  });

  const ranges = selectRangesForIndex(indexId, strikes, spot, legCount);
  if (!ranges.length) {
    throw new Error("Could not construct ranges from live oracle strikes");
  }

  if (!oracle.expiry) {
    throw new Error("Active oracle is missing expiry");
  }

  steps.push({
    agent: "Range Selection Agent",
    message: `Mapped ${ranges.length} live strike ranges from oracle grid`,
    data: { rangeCount: ranges.length },
  });

  const baseQuantity = Math.max(1, Math.round(intent.amountUsd / 50));
  const rangeLegs = buildRangeLegs(indexId, ranges, intent.risk, baseQuantity);

  const vaultValue = vault?.vault_value ?? 0;
  steps.push({
    agent: "Risk Management Agent",
    message: `PLP buffer ${plpPct}% · vault exposure checked · ${tradingPaused ? "trading paused" : "within limits"}`,
    data: {
      plpPct,
      vaultValue: String(vaultValue),
      tradingPaused,
    },
  });

  const rangeSummary = rangeLegs
    .map((leg) => `${leg.label} (${leg.weightPct}% × qty ${leg.quantity})`)
    .join(", ");

  steps.push({
    agent: "Execution Agent",
    message: `Ready: deposit $${intent.amountUsd} DUSDC → mint ${rangeLegs.length} ranges${plpPct > 0 ? ` + ${plpPct}% PLP` : ""}`,
    data: {
      depositUsd: intent.amountUsd,
      mintLegs: rangeLegs.length,
    },
  });

  const summary = `${indexName}: ${rangeSummary}. Deposit $${intent.amountUsd} DUSDC.`;

  return {
    intent,
    regime,
    indexId,
    indexName,
    depositUsd: intent.amountUsd,
    plpPct,
    rangeLegs,
    ranges,
    oracleId: oracle.oracle_id,
    expiry: oracle.expiry,
    spot,
    steps,
    summary,
    llmProvider: getLlmProviderName(),
  };
}

export type { VaultSummary };
