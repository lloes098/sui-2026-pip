import { NextResponse } from "next/server";
import { runAgentPipeline } from "@/lib/agents/orchestrator";
import { isLlmAvailable, getLlmProviderName } from "@/lib/agents/llm/provider";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { input?: string };
    const input = body.input?.trim();

    if (!input) {
      return NextResponse.json({ error: "input is required" }, { status: 400 });
    }

    const plan = await runAgentPipeline(input);
    return NextResponse.json({
      plan,
      meta: {
        llmEnabled: isLlmAvailable(),
        llmProvider: getLlmProviderName(),
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Agent pipeline failed";
    const status = message.toLowerCase().includes("not supported") ? 422 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function GET() {
  return NextResponse.json({
    llmEnabled: isLlmAvailable(),
    llmProvider: getLlmProviderName(),
    supportedAssets: ["BTC"],
    freeProviders: ["groq", "gemini"],
  });
}
