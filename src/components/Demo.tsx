"use client";

import { useState } from "react";
import { indexes } from "./IndexProducts";

type Step = {
  agent: string;
  message: string;
  status: "done" | "active" | "pending";
};

const pipelineSteps = [
  { agent: "Market Analysis", message: "Regime: Bull Market detected (BTC +4.2% 7d, OI rising)" },
  { agent: "Index Construction", message: "Selected Bull Index — 71–72k 40%, 72–73k 30%, 73–74k 20%, PLP 10%" },
  { agent: "Risk Management", message: "Volatility within bounds. PLP buffer at 10% — approved." },
  { agent: "Execution", message: "predict::mint → Bull Index · $500 USDC supplied" },
  { agent: "Rebalancing", message: "Next rebalance scheduled at range expiry (T+14d)" },
];

export function Demo() {
  const [input, setInput] = useState("BTC going up. Medium risk. Invest $500");
  const [amount, setAmount] = useState("500");
  const [risk, setRisk] = useState<"low" | "medium" | "high">("medium");
  const [view, setView] = useState<"bull" | "bear" | "volatility" | "sideway">("bull");
  const [running, setRunning] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<number>(-1);
  const [showResult, setShowResult] = useState(false);

  const selectedIndex = indexes.find((i) => i.id === view)!;

  async function runDemo() {
    setRunning(true);
    setShowResult(false);
    setCompletedSteps(-1);

    for (let i = 0; i < pipelineSteps.length; i++) {
      await new Promise((r) => setTimeout(r, 700));
      setCompletedSteps(i);
    }

    await new Promise((r) => setTimeout(r, 400));
    setShowResult(true);
    setRunning(false);
  }

  function getStepStatus(index: number): Step["status"] {
    if (index <= completedSteps) return "done";
    if (index === completedSteps + 1 && running) return "active";
    return "pending";
  }

  return (
    <section id="demo" className="border-t border-border py-24">
      <div className="mx-auto max-w-6xl px-6">
        <span className="text-sm font-medium uppercase tracking-wider text-sui">
          Live Demo
        </span>
        <h2 className="mt-3 max-w-2xl text-3xl font-bold tracking-tight md:text-4xl">
          Tell PIP what you think. Agents do the rest.
        </h2>
        <p className="mt-4 max-w-2xl text-lg text-muted">
          Simulate the full agent pipeline — from natural language input to
          on-chain index mint on DeepBook Predict.
        </p>

        <div className="mt-12 grid gap-8 lg:grid-cols-2">
          {/* Input panel */}
          <div className="rounded-2xl border border-border bg-surface p-6">
            <h3 className="font-semibold">Your Investment Intent</h3>

            <div className="mt-6 space-y-4">
              <div>
                <label htmlFor="demo-input" className="text-sm text-muted">
                  Natural language
                </label>
                <textarea
                  id="demo-input"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  rows={3}
                  className="mt-2 w-full resize-none rounded-xl border border-border bg-surface-elevated px-4 py-3 text-sm outline-none focus:border-sui/50"
                  placeholder="BTC going up. Medium risk. Invest $500"
                />
              </div>

              <div>
                <label htmlFor="demo-amount" className="text-sm text-muted">
                  Amount (USDC)
                </label>
                <input
                  id="demo-amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-border bg-surface-elevated px-4 py-3 text-sm outline-none focus:border-sui/50"
                />
              </div>

              <div>
                <span className="text-sm text-muted">Risk tolerance</span>
                <div className="mt-2 flex gap-2">
                  {(["low", "medium", "high"] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRisk(r)}
                      className={`flex-1 rounded-lg border py-2 text-sm capitalize transition-colors ${
                        risk === r
                          ? "border-sui bg-sui/10 text-sui"
                          : "border-border text-muted hover:border-sui/30"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-sm text-muted">Market view (override)</span>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {indexes.map((idx) => (
                    <button
                      key={idx.id}
                      type="button"
                      onClick={() => setView(idx.id as typeof view)}
                      className={`rounded-lg border py-2 text-sm transition-colors ${
                        view === idx.id
                          ? "border-sui bg-sui/10 text-sui"
                          : "border-border text-muted hover:border-sui/30"
                      }`}
                    >
                      {idx.icon} {idx.name}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={runDemo}
                disabled={running}
                className="w-full rounded-xl bg-gradient-to-r from-sui to-sui-cyan py-3 text-sm font-semibold text-background transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {running ? "Agents working..." : "Run Agent Pipeline"}
              </button>
            </div>
          </div>

          {/* Pipeline output */}
          <div className="rounded-2xl border border-border bg-surface p-6">
            <h3 className="font-semibold">Agent Pipeline</h3>

            <div className="mt-6 space-y-3">
              {pipelineSteps.map((step, i) => {
                const status = getStepStatus(i);
                return (
                  <div
                    key={step.agent}
                    className={`rounded-xl border p-4 transition-all ${
                      status === "done"
                        ? "border-emerald-500/30 bg-emerald-500/5"
                        : status === "active"
                          ? "border-sui/50 bg-sui/5"
                          : "border-border bg-surface-elevated opacity-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-medium ${
                          status === "done"
                            ? "bg-emerald-500 text-background"
                            : status === "active"
                              ? "bg-sui text-background animate-pulse"
                              : "bg-surface text-muted"
                        }`}
                      >
                        {status === "done" ? "✓" : i + 1}
                      </span>
                      <div>
                        <div className="text-sm font-medium">{step.agent}</div>
                        {(status === "done" || status === "active") && (
                          <div className="mt-1 font-mono text-xs text-muted">
                            {step.message}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {showResult && (
              <div className="mt-6 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-5">
                <div className="flex items-center gap-2 text-emerald-400">
                  <span>✓</span>
                  <span className="font-semibold">Index Minted Successfully</span>
                </div>
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted">Index</span>
                    <span className="font-medium">{selectedIndex.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Amount</span>
                    <span className="font-mono">${amount} USDC</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Risk</span>
                    <span className="capitalize">{risk}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Tx</span>
                    <span className="font-mono text-xs text-sui">
                      0x7a3f...c91d · Sui
                    </span>
                  </div>
                </div>
                <div className="mt-4 flex h-2 overflow-hidden rounded-full bg-surface-elevated">
                  {selectedIndex.allocations.map((a) => (
                    <div
                      key={a.range}
                      className={a.color}
                      style={{ width: `${a.pct}%` }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
