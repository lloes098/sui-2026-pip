export function Comparison() {
  return (
    <section className="border-t border-border py-24">
      <div className="mx-auto max-w-6xl px-6">
        <span className="text-sm font-medium uppercase tracking-wider text-sui">
          Differentiation
        </span>
        <h2 className="mt-3 max-w-2xl text-3xl font-bold tracking-tight md:text-4xl">
          From range picking to index investing
        </h2>

        <div className="mt-12 overflow-hidden rounded-2xl border border-border">
          <div className="grid md:grid-cols-2">
            <div className="border-b border-border bg-surface p-8 md:border-b-0 md:border-r">
              <div className="mb-6 inline-block rounded-full bg-red-500/10 px-3 py-1 text-xs font-medium text-red-400">
                DeepBook Predict (Today)
              </div>
              <h3 className="text-xl font-semibold">You manage everything</h3>
              <ul className="mt-6 space-y-3 text-muted">
                <li className="flex gap-2">
                  <span>→</span> Select price ranges manually
                </li>
                <li className="flex gap-2">
                  <span>→</span> Choose strikes & expiry dates
                </li>
                <li className="flex gap-2">
                  <span>→</span> Monitor & rebalance at maturity
                </li>
                <li className="flex gap-2">
                  <span>→</span> High cognitive load for new users
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-sui/10 to-sui-cyan/5 p-8">
              <div className="mb-6 inline-block rounded-full bg-sui/20 px-3 py-1 text-xs font-medium text-sui">
                PIP Protocol
              </div>
              <h3 className="text-xl font-semibold">AI agents manage everything</h3>
              <ul className="mt-6 space-y-3 text-muted">
                <li className="flex gap-2">
                  <span className="text-sui">→</span> Pick Bull, Bear, Vol, or Sideway
                </li>
                <li className="flex gap-2">
                  <span className="text-sui">→</span> Agents construct range portfolios
                </li>
                <li className="flex gap-2">
                  <span className="text-sui">→</span> Auto settlement & rebalancing
                </li>
                <li className="flex gap-2">
                  <span className="text-sui">→</span> One sentence → one index token
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-border py-12">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-sui to-sui-cyan text-sm font-bold text-background">
              P
            </div>
            <div>
              <div className="font-semibold">PIP — Predict Index Protocol</div>
              <div className="text-sm text-muted">Sui Hackathon 2026</div>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-sm text-muted">
            <a href="#problem" className="hover:text-foreground">
              Problem
            </a>
            <a href="#indexes" className="hover:text-foreground">
              Indexes
            </a>
            <a href="#agents" className="hover:text-foreground">
              Agents
            </a>
            <a href="#demo" className="hover:text-foreground">
              Demo
            </a>
            <a
              href="https://sui.io"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-sui"
            >
              Sui Network
            </a>
          </div>
        </div>

        <div className="mt-8 border-t border-border pt-8 text-center text-sm text-muted">
          DeepBook Predict ranges, abstracted into AI-managed index ETFs on Sui.
        </div>
      </div>
    </footer>
  );
}
