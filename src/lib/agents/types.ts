import type { RangeQuote } from "@/lib/predict/api";

export type RiskLevel = "low" | "medium" | "high";
export type MarketRegime = "bull" | "bear" | "volatility" | "sideway";
export type IndexId = MarketRegime;

export type ParsedIntent = {
  raw: string;
  amountUsd: number;
  risk: RiskLevel;
  regimeHint: MarketRegime | null;
  asset: string;
  supported: boolean;
  rejectionReason?: string;
  reasoning?: string;
  source: "llm" | "rules";
};

export type RangeLeg = {
  lowerStrike: number;
  higherStrike: number;
  weightPct: number;
  quantity: number;
  label: string;
};

export type AgentStep = {
  agent: string;
  message: string;
  data?: Record<string, string | number | boolean>;
};

export type AgentPlan = {
  intent: ParsedIntent;
  regime: MarketRegime;
  indexId: IndexId;
  indexName: string;
  depositUsd: number;
  plpPct: number;
  rangeLegs: RangeLeg[];
  ranges: RangeQuote[];
  oracleId: string;
  expiry: number;
  spot: number;
  steps: AgentStep[];
  summary: string;
  llmProvider?: string | null;
};
