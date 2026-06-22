import { ArrowRight } from "lucide-react";

export function Comparison() {
  return (
    <section className="sui-divider py-24">
      <div className="mx-auto max-w-6xl px-6">
        <span className="sui-label">Differentiation</span>
        <h2 className="sui-heading mt-4 max-w-2xl">
          From range picking to index investing
        </h2>

        <div className="sui-card-glow mt-12 overflow-hidden !p-0">
          <div className="grid md:grid-cols-2">
            <div className="border-b border-border p-8 md:border-b-0 md:border-r">
              <div className="sui-label mb-6">DeepBook Predict</div>
              <h3 className="text-lg font-bold uppercase tracking-wide">
                You manage everything
              </h3>
              <ul className="mt-6 space-y-3 text-sm text-muted">
                {[
                  "Select price ranges manually",
                  "Choose strikes & expiry dates",
                  "Monitor & rebalance at maturity",
                  "High cognitive load for new users",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <ArrowRight className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2.5} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-8">
              <div className="sui-label mb-6">PIP Protocol</div>
              <h3 className="text-lg font-bold uppercase tracking-wide">
                AI agents manage everything
              </h3>
              <ul className="mt-6 space-y-3 text-sm text-muted">
                {[
                  "Pick Bull, Bear, Vol, or Sideway",
                  "Agents construct range portfolios",
                  "Auto settlement & rebalancing",
                  "One sentence → one index token",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <ArrowRight className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2.5} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
