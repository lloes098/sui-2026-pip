import { parseIntent } from "./parse-intent";
import { parseIntentWithLlm } from "./llm/parse-intent-llm";
import { isLlmAvailable } from "./llm/provider";
import type { ParsedIntent } from "./types";
import { validateAsset } from "./validate-asset";

export async function resolveIntent(input: string): Promise<ParsedIntent> {
  const raw = input.trim();

  if (isLlmAvailable()) {
    try {
      return await parseIntentWithLlm(raw);
    } catch {
      // fall through to rule-based parser
    }
  }

  const intent = parseIntent(raw);
  const validation = validateAsset(intent.asset);

  return {
    ...intent,
    supported: validation.supported,
    rejectionReason: validation.reason,
    source: "rules",
  };
}
