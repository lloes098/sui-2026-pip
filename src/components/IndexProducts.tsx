type Allocation = { range: string; pct: number; color: string };

type IndexProduct = {
  id: string;
  name: string;
  tagline: string;
  icon: string;
  accent: string;
  accentBg: string;
  market: string;
  allocations: Allocation[];
};

const indexes: IndexProduct[] = [
  {
    id: "bull",
    name: "Bull Index",
    tagline: "Long BTC upside exposure",
    icon: "📈",
    accent: "text-emerald-400",
    accentBg: "from-emerald-500/20 to-emerald-500/5",
    market: "Bull Market",
    allocations: [
      { range: "71–72k Range", pct: 40, color: "bg-emerald-500" },
      { range: "72–73k Range", pct: 30, color: "bg-emerald-400" },
      { range: "73–74k Range", pct: 20, color: "bg-emerald-300" },
      { range: "PLP", pct: 10, color: "bg-sui" },
    ],
  },
  {
    id: "bear",
    name: "Bear Index",
    tagline: "Downside protection & short bias",
    icon: "📉",
    accent: "text-red-400",
    accentBg: "from-red-500/20 to-red-500/5",
    market: "Bear Market",
    allocations: [
      { range: "68–69k Range", pct: 35, color: "bg-red-500" },
      { range: "69–70k Range", pct: 35, color: "bg-red-400" },
      { range: "70–71k Range", pct: 20, color: "bg-red-300" },
      { range: "PLP", pct: 10, color: "bg-sui" },
    ],
  },
  {
    id: "volatility",
    name: "Volatility Index",
    tagline: "Profit from large price swings",
    icon: "⚡",
    accent: "text-violet-400",
    accentBg: "from-violet-500/20 to-violet-500/5",
    market: "High Volatility",
    allocations: [
      { range: "65–75k Wide", pct: 45, color: "bg-violet-500" },
      { range: "Tail Ranges", pct: 30, color: "bg-violet-400" },
      { range: "Straddle Mix", pct: 15, color: "bg-violet-300" },
      { range: "PLP", pct: 10, color: "bg-sui" },
    ],
  },
  {
    id: "sideway",
    name: "Sideway Index",
    tagline: "Range-bound market strategies",
    icon: "↔️",
    accent: "text-amber-400",
    accentBg: "from-amber-500/20 to-amber-500/5",
    market: "Sideway",
    allocations: [
      { range: "70–71k Range", pct: 30, color: "bg-amber-500" },
      { range: "71–72k Range", pct: 30, color: "bg-amber-400" },
      { range: "72–73k Range", pct: 30, color: "bg-amber-300" },
      { range: "PLP", pct: 10, color: "bg-sui" },
    ],
  },
];

function AllocationBar({ allocations }: { allocations: Allocation[] }) {
  return (
    <div className="space-y-3">
      <div className="flex h-3 overflow-hidden rounded-full bg-surface-elevated">
        {allocations.map((a) => (
          <div
            key={a.range}
            className={`${a.color} transition-all`}
            style={{ width: `${a.pct}%` }}
          />
        ))}
      </div>
      <div className="space-y-2">
        {allocations.map((a) => (
          <div key={a.range} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${a.color}`} />
              <span className="text-muted">{a.range}</span>
            </div>
            <span className="font-mono font-medium">{a.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function IndexProducts() {
  return (
    <section id="indexes" className="border-t border-border py-24">
      <div className="mx-auto max-w-6xl px-6">
        <span className="text-sm font-medium uppercase tracking-wider text-sui">
          Index Products
        </span>
        <h2 className="mt-3 max-w-2xl text-3xl font-bold tracking-tight md:text-4xl">
          Four macro views. Dozens of ranges managed for you.
        </h2>
        <p className="mt-4 max-w-2xl text-lg text-muted">
          Buy a single index token — agents allocate across DeepBook Predict
          ranges and PLP liquidity automatically.
        </p>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {indexes.map((index) => (
            <div
              key={index.id}
              className="group rounded-2xl border border-border bg-surface p-6 transition-colors hover:border-sui/30"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{index.icon}</span>
                    <div>
                      <h3 className={`text-lg font-semibold ${index.accent}`}>
                        {index.name}
                      </h3>
                      <p className="text-sm text-muted">{index.tagline}</p>
                    </div>
                  </div>
                </div>
                <span
                  className={`rounded-full bg-gradient-to-r ${index.accentBg} px-3 py-1 text-xs font-medium ${index.accent}`}
                >
                  {index.market}
                </span>
              </div>

              <div className="mt-6">
                <AllocationBar allocations={index.allocations} />
              </div>

              <button
                type="button"
                className="mt-6 w-full rounded-xl border border-border py-2.5 text-sm font-medium transition-colors group-hover:border-sui/40 group-hover:bg-sui/5"
              >
                Buy {index.name}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export { indexes };
