type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

type Provider = "groq" | "gemini" | "openai";

type ResolvedProvider = {
  provider: Provider;
  apiKey: string;
  model: string;
};

function resolveProvider(): ResolvedProvider | null {
  const forced = process.env.LLM_PROVIDER?.toLowerCase() as Provider | undefined;

  const candidates: ResolvedProvider[] = [
    {
      provider: "groq",
      apiKey: process.env.GROQ_API_KEY ?? "",
      model: "llama-3.3-70b-versatile",
    },
    {
      provider: "gemini",
      apiKey: process.env.GEMINI_API_KEY ?? "",
      model: "gemini-2.0-flash",
    },
    {
      provider: "openai",
      apiKey: process.env.OPENAI_API_KEY ?? "",
      model: "gpt-4o-mini",
    },
  ];

  if (forced) {
    const match = candidates.find((c) => c.provider === forced && c.apiKey);
    return match ?? null;
  }

  return candidates.find((c) => c.apiKey) ?? null;
}

async function chatGroq(
  config: ResolvedProvider,
  messages: ChatMessage[],
): Promise<string> {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: config.model,
      messages,
      temperature: 0.1,
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Groq API error (${res.status}): ${body.slice(0, 200)}`);
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("Empty Groq response");
  return content;
}

async function chatOpenAI(
  config: ResolvedProvider,
  messages: ChatMessage[],
): Promise<string> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: config.model,
      messages,
      temperature: 0.1,
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`OpenAI API error (${res.status}): ${body.slice(0, 200)}`);
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("Empty OpenAI response");
  return content;
}

async function chatGemini(
  config: ResolvedProvider,
  messages: ChatMessage[],
): Promise<string> {
  const system = messages.find((m) => m.role === "system")?.content ?? "";
  const userParts = messages
    .filter((m) => m.role !== "system")
    .map((m) => m.content)
    .join("\n\n");

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${config.model}:generateContent?key=${config.apiKey}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: system ? { parts: [{ text: system }] } : undefined,
      contents: [{ role: "user", parts: [{ text: userParts }] }],
      generationConfig: {
        temperature: 0.1,
        responseMimeType: "application/json",
      },
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Gemini API error (${res.status}): ${body.slice(0, 200)}`);
  }

  const data = (await res.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Empty Gemini response");
  return text;
}

export function isLlmAvailable(): boolean {
  return resolveProvider() !== null;
}

export function getLlmProviderName(): string | null {
  return resolveProvider()?.provider ?? null;
}

export async function chatCompletion(messages: ChatMessage[]): Promise<string> {
  const config = resolveProvider();
  if (!config) {
    throw new Error("No LLM API key configured");
  }

  switch (config.provider) {
    case "groq":
      return chatGroq(config, messages);
    case "gemini":
      return chatGemini(config, messages);
    case "openai":
      return chatOpenAI(config, messages);
    default:
      throw new Error("Unknown LLM provider");
  }
}
