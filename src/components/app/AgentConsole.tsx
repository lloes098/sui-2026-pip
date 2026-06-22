"use client";

import { useEffect, useState } from "react";
import { Check, Loader2 } from "lucide-react";
import {
  useCurrentAccount,
  useCurrentClient,
  useDAppKit,
} from "@mysten/dapp-kit-react";
import { copy } from "@/lib/copy";
import type { AgentPlan } from "@/lib/agents/types";
import {
  formatAgentError,
  type FormattedAgentError,
} from "@/lib/agents/format-error";
import { formatQuoteAmount } from "@/lib/predict/api";
import {
  extractManagerIdFromDigest,
  storeManagerId,
} from "@/lib/predict/manager";
import {
  buildIndexPortfolioTx,
  planToPortfolioArgs,
} from "@/lib/predict/portfolio";
import { simulateCombinedIndexTx } from "@/lib/predict/simulation";
import { indexes } from "@/lib/indexes";
import { IconBox } from "@/components/icons/IconBox";

type AgentConsoleProps = {
  managerId: string | null;
  onManagerCreated: (id: string) => void;
  onTxSuccess: () => void;
};

export function AgentConsole({
  managerId,
  onManagerCreated,
  onTxSuccess,
}: AgentConsoleProps) {
  const account = useCurrentAccount();
  const client = useCurrentClient();
  const dAppKit = useDAppKit();

  const [input, setInput] = useState("");
  const [plan, setPlan] = useState<AgentPlan | null>(null);
  const [running, setRunning] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [simPassed, setSimPassed] = useState(false);
  const [formattedError, setFormattedError] = useState<FormattedAgentError | null>(
    null,
  );
  const [txStatus, setTxStatus] = useState<string | null>(null);
  const [txDigest, setTxDigest] = useState<string | null>(null);
  const [llmStatus, setLlmStatus] = useState<{
    enabled: boolean;
    provider: string | null;
  }>({ enabled: false, provider: null });

  useEffect(() => {
    fetch("/api/agent/plan")
      .then((r) => r.json())
      .then((data: { llmEnabled?: boolean; llmProvider?: string | null }) => {
        setLlmStatus({
          enabled: !!data.llmEnabled,
          provider: data.llmProvider ?? null,
        });
      })
      .catch(() => undefined);
  }, []);

  const selectedIndex = plan
    ? indexes.find((i) => i.id === plan.indexId)
    : null;

  function setErrorFromMessage(message: string) {
    const formatted = formatAgentError(message);
    setFormattedError(formatted);
    if (formatted.suppressTxStatus) {
      setTxStatus(null);
    } else if (message === copy.app.tx.failed || message.toLowerCase().includes("failed")) {
      setTxStatus(copy.app.tx.failed);
    }
  }

  async function runAgent() {
    if (!account) return;
    setRunning(true);
    setFormattedError(null);
    setPlan(null);
    setSimPassed(false);
    setTxStatus(null);
    setTxDigest(null);

    try {
      const res = await fetch("/api/agent/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input }),
      });
      const data = (await res.json()) as { plan?: AgentPlan; error?: string };
      if (!res.ok || !data.plan) {
        throw new Error(data.error ?? "Agent failed");
      }

      setPlan(data.plan);

      const tx = buildIndexPortfolioTx(
        planToPortfolioArgs(data.plan, managerId),
      );
      const sim = await simulateCombinedIndexTx(client, account.address, tx);
      if (!sim.passed) {
        throw new Error(sim.error ?? "Transaction preview failed");
      }
      setSimPassed(true);
    } catch (err) {
      setErrorFromMessage(err instanceof Error ? err.message : "Agent failed");
    } finally {
      setRunning(false);
    }
  }

  async function executePlan() {
    if (!account || !plan || !simPassed) return;
    setExecuting(true);
    setFormattedError(null);
    setTxStatus(copy.app.tx.pending);

    try {
      const tx = buildIndexPortfolioTx(planToPortfolioArgs(plan, managerId));
      const sim = await simulateCombinedIndexTx(client, account.address, tx);
      if (!sim.passed) {
        throw new Error(sim.error ?? "Simulation failed");
      }

      const result = await dAppKit.signAndExecuteTransaction({ transaction: tx });
      if (result.$kind === "FailedTransaction") {
        throw new Error(
          result.FailedTransaction.status.error?.message ?? "Transaction failed",
        );
      }

      const digest = result.Transaction.digest;
      if (!managerId && digest && account.address) {
        const newId = await extractManagerIdFromDigest(client, digest);
        if (newId) {
          storeManagerId(account.address, newId);
          onManagerCreated(newId);
        }
      }

      setTxDigest(digest);
      setTxStatus(copy.app.tx.success);
      setSimPassed(false);
      onTxSuccess();
    } catch (err) {
      setErrorFromMessage(err instanceof Error ? err.message : copy.app.tx.failed);
    } finally {
      setExecuting(false);
    }
  }

  const faucetHref = account?.address
    ? `https://faucet.sui.io/?address=${account.address}`
    : "https://faucet.sui.io/";

  return (
    <div className="sui-card-glow p-6 md:p-7">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">{copy.app.agent.title}</h3>
          <p className="mt-2 max-w-2xl text-sm text-muted">{copy.app.agent.desc}</p>
        </div>
        <span className="rounded-full border border-border px-3 py-1 text-xs text-muted">
          {llmStatus.enabled
            ? copy.app.agent.llmOn.replace("{provider}", llmStatus.provider ?? "llm")
            : copy.app.agent.llmOff}
        </span>
      </div>

      <div className="mt-6 space-y-4">
        <div>
          <label htmlFor="agent-input" className="text-sm text-muted">
            {copy.app.agent.inputLabel}
          </label>
          <textarea
            id="agent-input"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setPlan(null);
              setSimPassed(false);
              setFormattedError(null);
            }}
            rows={3}
            placeholder={copy.app.agent.placeholder}
            className="sui-input mt-2 resize-none font-mono text-sm"
          />
          <p className="mt-2 text-xs text-muted">{copy.app.agent.supportedAsset}</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={runAgent}
            disabled={running || executing || !input.trim()}
            className="sui-btn-solid inline-flex items-center gap-2 disabled:opacity-50"
          >
            {running && <Loader2 className="h-4 w-4 animate-spin" />}
            {running ? copy.app.agent.running : copy.app.agent.run}
          </button>
          <button
            type="button"
            onClick={executePlan}
            disabled={!simPassed || executing || running}
            className="sui-btn-primary disabled:opacity-40"
          >
            {copy.app.agent.execute}
          </button>
        </div>

        {formattedError && (
          <div className="rounded-xl border border-border bg-surface px-4 py-3 text-sm">
            <div className="font-medium">{formattedError.title}</div>
            <p className="mt-1 text-muted">{formattedError.detail}</p>
            {formattedError.hint && (
              <p className="mt-2 text-xs text-muted">{formattedError.hint}</p>
            )}
            {formattedError.link && (
              <a
                href={
                  formattedError.title.includes("DUSDC")
                    ? faucetHref
                    : formattedError.link.href
                }
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block text-xs underline"
              >
                {formattedError.link.label}
              </a>
            )}
          </div>
        )}

        {txStatus && (
          <div className="rounded-xl border border-border bg-surface px-4 py-3 text-sm">
            {txStatus}
            {txDigest && (
              <a
                href={`https://suiscan.xyz/testnet/tx/${txDigest}`}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2 underline"
              >
                {copy.app.tx.view}
              </a>
            )}
          </div>
        )}

        {plan && (
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-4">
              <div className="rounded-xl border border-border bg-surface p-4">
                <div className="text-xs uppercase text-muted">
                  {copy.app.agent.plan}
                </div>
                {selectedIndex && (
                  <div className="mt-3 flex items-center gap-2">
                    <IconBox
                      icon={selectedIndex.Icon}
                      size="sm"
                      boxClassName={selectedIndex.iconBg}
                      iconClassName={selectedIndex.iconColor}
                    />
                    <span className="font-medium">{plan.indexName}</span>
                  </div>
                )}
                <p className="mt-3 text-sm text-muted">{plan.summary}</p>
                <dl className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted">{copy.app.agent.deposit}</dt>
                    <dd className="font-mono">${plan.depositUsd} DUSDC</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted">{copy.app.agent.plpBuffer}</dt>
                    <dd>{plan.plpPct}%</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted">{copy.app.agent.intentSource}</dt>
                    <dd className="capitalize">
                      {plan.intent.source}
                      {plan.llmProvider ? ` (${plan.llmProvider})` : ""}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted">{copy.app.index.oracle}</dt>
                    <dd className="max-w-[180px] truncate font-mono text-xs">
                      {plan.oracleId}
                    </dd>
                  </div>
                </dl>
              </div>

              {simPassed && (
                <div className="rounded-xl border border-border bg-surface px-4 py-3 text-sm">
                  {copy.app.agent.simReady}
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="rounded-xl border border-border p-4">
                <div className="text-xs uppercase text-muted">
                  {copy.app.index.pipeline}
                </div>
                <div className="mt-3 space-y-3">
                  {plan.steps.map((step) => (
                    <div key={`${step.agent}-${step.message}`} className="flex gap-3">
                      <Check className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2.5} />
                      <div>
                        <div className="text-sm font-medium">{step.agent}</div>
                        <div className="mt-0.5 text-xs text-muted">{step.message}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-border p-4">
                <div className="text-xs uppercase text-muted">
                  {copy.app.index.ranges}
                </div>
                <ul className="mt-2 space-y-2 text-sm">
                  {plan.rangeLegs.map((leg) => (
                    <li
                      key={`${leg.lowerStrike}-${leg.higherStrike}`}
                      className="flex items-center justify-between gap-2 font-mono"
                    >
                      <span>
                        {formatQuoteAmount(leg.lowerStrike)} –{" "}
                        {formatQuoteAmount(leg.higherStrike)}
                      </span>
                      <span className="text-xs text-muted">
                        {leg.weightPct}% · qty {leg.quantity}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {running && !plan && (
          <div className="rounded-xl border border-border p-4">
            <div className="text-xs uppercase text-muted">
              {copy.app.index.pipeline}
            </div>
            <div className="mt-3 space-y-2">
              {[
                "Intent Agent",
                "Market Analysis Agent",
                "Index Construction Agent",
                "Range Selection Agent",
                "Risk Management Agent",
                "Execution Agent",
              ].map((agent) => (
                <div key={agent} className="flex items-center gap-2 text-sm text-muted">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {agent}
                </div>
              ))}
            </div>
          </div>
        )}

        {!plan && !running && (
          <div className="rounded-xl border border-border p-4">
            <div className="text-xs uppercase text-muted">
              {copy.app.agent.examples}
            </div>
            <ul className="mt-2 space-y-1 text-sm text-muted">
              {copy.app.agent.exampleList.map((example) => (
                <li key={example}>
                  <button
                    type="button"
                    onClick={() => setInput(example)}
                    className="text-left hover:text-foreground"
                  >
                    {example}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export type { AgentPlan };
