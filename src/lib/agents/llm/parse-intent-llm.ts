import type { MarketRegime, ParsedIntent, RiskLevel } from "../types";
import { validateAsset } from "../validate-asset";
import { chatCompletion } from "./provider";

const SYSTEM_PROMPT = `You parse investment intent for PIP (Predict Index Protocol) on DeepBook Predict.

Rules:
- ONLY supported underlying asset: BTC
- If user mentions any other asset (BTS, ETH, AAPL, etc.), set supported=false and explain in rejectionReason
- amountUsd: extract USD/USDC amount; default 100 if missing
- risk: "low" | "medium" | "high" — default medium
- regimeHint: "bull" | "bear" | "volatility" | "sideway" | null — only if user clearly expresses market view
- reasoning: one sentence explaining your interpretation

Respond with JSON only:
{
  "asset": "BTC",
  "amountUsd": number,
  "risk": "low" | "medium" | "high",
  "regimeHint": "bull" | "bear" | "volatility" | "sideway" | null,
  "supported": boolean,
  "rejectionReason": string | null,
  "reasoning": string
}`;

type LlmIntentResponse = {
  asset?: string;
  amountUsd?: number;
  risk?: string;
  regimeHint?: string | null;
  supported?: boolean;
  rejectionReason?: string | null;
  reasoning?: string;
};

function normalizeRisk(value: string | undefined): RiskLevel {
  if (value === "low" || value === "high") return value;
  return "medium";
}

function normalizeRegime(value: string | null | undefined): MarketRegime | null {
  if (
    value === "bull" ||
    value === "bear" ||
    value === "volatility" ||
    value === "sideway"
  ) {
    return value;
  }
  return null;
}

export async function parseIntentWithLlm(raw: string): Promise<ParsedIntent> {
  const content = await chatCompletion([
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: raw },
  ]);

  let parsed: LlmIntentResponse;
  try {
    parsed = JSON.parse(content) as LlmIntentResponse;
  } catch {
    throw new Error("LLM returned invalid JSON");
  }

  const asset = parsed.asset?.trim() || "BTC";
  const validation = validateAsset(asset);
  const amountUsd =
    typeof parsed.amountUsd === "number" && parsed.amountUsd > 0
      ? parsed.amountUsd
      : 100;

  const llmSaysUnsupported = parsed.supported === false;
  const supported = validation.supported && !llmSaysUnsupported;

  return {
    raw,
    asset: validation.normalized,
    amountUsd,
    risk: normalizeRisk(parsed.risk),
    regimeHint: normalizeRegime(parsed.regimeHint),
    supported,
    rejectionReason:
      parsed.rejectionReason ??
      validation.reason ??
      (llmSaysUnsupported ? `${asset} is not supported on DeepBook Predict.` : undefined),
    reasoning: parsed.reasoning,
    source: "llm",
  };
}
