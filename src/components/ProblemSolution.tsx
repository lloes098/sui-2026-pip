export function ProblemSolution() {
  return (
    <>
      <section id="problem" className="border-t border-border py-24">
        <div className="mx-auto max-w-6xl px-6">
          <span className="text-sm font-medium uppercase tracking-wider text-sui">
            Problem
          </span>
          <h2 className="mt-3 max-w-2xl text-3xl font-bold tracking-tight md:text-4xl">
            DeepBook Predict has a high barrier to entry
          </h2>
          <p className="mt-4 max-w-2xl text-lg text-muted">
            Range selection, strike prices, expiry dates — the complexity blocks
            mainstream users from participating in prediction markets.
          </p>

          <div className="mt-12 grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-8">
              <h3 className="text-lg font-semibold text-red-400">
                Today: Manual Complexity
              </h3>
              <ul className="mt-6 space-y-4">
                {[
                  "Choose the right price range (71–72k? 72–73k?)",
                  "Pick strike and expiry for each position",
                  "Monitor dozens of ranges simultaneously",
                  "Rebalance when ranges expire",
                ].map((item) => (
                  <li key={item} className="flex gap-3 text-muted">
                    <span className="mt-1 text-red-400">✕</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-8">
              <h3 className="text-lg font-semibold text-emerald-400">
                With PIP: One-Click Indexes
              </h3>
              <ul className="mt-6 space-y-4">
                {[
                  "Pick Bull, Bear, Volatility, or Sideway",
                  "AI agents construct optimal range portfolios",
                  "Automatic risk management & PLP allocation",
                  "Rebalancing handled at expiry",
                ].map((item) => (
                  <li key={item} className="flex gap-3 text-muted">
                    <span className="mt-1 text-emerald-400">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section id="solution" className="border-t border-border py-24">
        <div className="mx-auto max-w-6xl px-6">
          <span className="text-sm font-medium uppercase tracking-wider text-sui">
            Solution
          </span>
          <h2 className="mt-3 max-w-2xl text-3xl font-bold tracking-tight md:text-4xl">
            AI-managed ETF protocol for DeepBook Predict
          </h2>
          <p className="mt-4 max-w-2xl text-lg text-muted">
            PIP (Predict Index Protocol) bundles complex Range products into
            simple index tokens. Users invest in macro views — agents manage
            the micro structure.
          </p>

          <div className="mt-12 rounded-2xl border border-border bg-surface p-8 md:p-10">
            <div className="grid gap-8 lg:grid-cols-[1fr_auto_1fr] lg:items-center">
              <div>
                <div className="text-xs font-medium uppercase tracking-wider text-muted">
                  User Input
                </div>
                <div className="mt-3 rounded-xl border border-border bg-surface-elevated p-4 font-mono text-sm">
                  <span className="text-sui">&gt;</span> BTC 올라감. 리스크 중간. $500
                  투자
                </div>
              </div>

              <div className="hidden text-2xl text-muted lg:block">→</div>

              <div>
                <div className="text-xs font-medium uppercase tracking-wider text-muted">
                  AI Pipeline
                </div>
                <div className="mt-3 space-y-2">
                  {[
                    "Market Analysis",
                    "Index Strategy",
                    "Range Selection",
                    "Asset Allocation",
                    "Index Mint & Execute",
                    "Settlement & Rebalance",
                  ].map((step, i) => (
                    <div
                      key={step}
                      className="flex items-center gap-3 rounded-lg border border-border bg-surface-elevated px-4 py-2 text-sm"
                      style={{ animationDelay: `${i * 100}ms` }}
                    >
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sui/20 text-xs font-medium text-sui">
                        {i + 1}
                      </span>
                      {step}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
