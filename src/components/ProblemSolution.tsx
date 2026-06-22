import { ArrowRight, Check, X } from "lucide-react";

export function ProblemSolution() {
  return (
    <>
      <section id="problem" className="sui-divider py-24">
        <div className="mx-auto max-w-6xl px-6">
          <span className="sui-label">Problem</span>
          <h2 className="sui-heading mt-4 max-w-2xl">
            DeepBook Predict has a high barrier to entry
          </h2>
          <p className="mt-4 max-w-2xl text-muted">
            Range selection, strike prices, expiry dates — the complexity blocks
            mainstream users from participating in prediction markets.
          </p>

          <div className="mt-12 grid gap-5 md:grid-cols-2">
            <div className="sui-card p-8">
              <h3 className="text-sm font-bold uppercase tracking-wide text-muted">
                Today · Manual
              </h3>
              <ul className="mt-6 space-y-4">
                {[
                  "Choose the right price range (71–72k? 72–73k?)",
                  "Pick strike and expiry for each position",
                  "Monitor dozens of ranges simultaneously",
                  "Rebalance when ranges expire",
                ].map((item) => (
                  <li key={item} className="flex gap-3 text-sm text-muted">
                    <X className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2.5} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="sui-card-glow p-8">
              <h3 className="text-sm font-bold uppercase tracking-wide">
                With PIP · One-Click
              </h3>
              <ul className="mt-6 space-y-4">
                {[
                  "Pick Bull, Bear, Volatility, or Sideway",
                  "AI agents construct optimal range portfolios",
                  "Automatic risk management & PLP allocation",
                  "Rebalancing handled at expiry",
                ].map((item) => (
                  <li key={item} className="flex gap-3 text-sm text-muted">
                    <Check className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2.5} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section id="solution" className="sui-divider py-24">
        <div className="mx-auto max-w-6xl px-6">
          <span className="sui-label">Solution</span>
          <h2 className="sui-heading mt-4 max-w-2xl">
            AI-managed ETF protocol for DeepBook Predict
          </h2>
          <p className="mt-4 max-w-2xl text-muted">
            PIP bundles complex Range products into simple index tokens. Users
            invest in macro views — agents manage the micro structure.
          </p>

          <div className="sui-card-glow mt-12 p-8 md:p-10">
            <div className="grid gap-8 lg:grid-cols-[1fr_auto_1fr] lg:items-center">
              <div>
                <div className="sui-label !text-muted">User Input</div>
                <div className="mt-3 rounded-xl border border-border bg-surface p-4 font-mono text-sm">
                  <span className="text-muted">&gt;</span> BTC going up. Medium
                  risk. Invest $500
                </div>
              </div>

              <ArrowRight
                className="hidden h-6 w-6 shrink-0 text-muted lg:block"
                strokeWidth={2}
              />

              <div>
                <div className="sui-label !text-muted">AI Pipeline</div>
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
                      className="flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm"
                    >
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border text-xs font-bold text-muted">
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
