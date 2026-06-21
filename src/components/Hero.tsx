export function Hero() {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-28">
      <div className="pointer-events-none absolute inset-0 grid-bg" />
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-sui-cyan/10 blur-[120px] animate-pulse-glow" />

      <div className="relative mx-auto max-w-6xl px-6">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-1.5 text-sm text-muted">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          Built on DeepBook Predict · Powered by AI Agents
        </div>

        <h1 className="max-w-4xl text-4xl font-bold leading-tight tracking-tight md:text-6xl md:leading-[1.1]">
          DeepBook Predict,{" "}
          <span className="gradient-text">simplified into indexes</span>
        </h1>

        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted md:text-xl">
          PIP wraps complex Range products into AI-managed ETFs. Say{" "}
          <em className="text-foreground not-italic">&ldquo;BTC going up, medium risk&rdquo;</em>{" "}
          — agents handle market analysis, index construction, and rebalancing on Sui.
        </p>

        <div className="mt-10 flex flex-wrap gap-4">
          <a
            href="#demo"
            className="rounded-full bg-gradient-to-r from-sui to-sui-cyan px-6 py-3 text-sm font-semibold text-background transition-opacity hover:opacity-90"
          >
            Launch Demo
          </a>
          <a
            href="#agents"
            className="rounded-full border border-border px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-surface-elevated"
          >
            View Agent Architecture
          </a>
        </div>

        <div className="mt-16 grid gap-4 sm:grid-cols-3">
          {[
            { value: "4", label: "Index Products", sub: "Bull · Bear · Vol · Sideway" },
            { value: "5", label: "AI Agents", sub: "End-to-end automation" },
            { value: "1", label: "User Input", sub: "Natural language investing" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-border bg-surface p-6"
            >
              <div className="text-3xl font-bold gradient-text">{stat.value}</div>
              <div className="mt-1 font-medium">{stat.label}</div>
              <div className="mt-1 text-sm text-muted">{stat.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
