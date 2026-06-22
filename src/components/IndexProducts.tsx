import Link from "next/link";
import { IconBox } from "@/components/icons/IconBox";
import { indexes } from "@/lib/indexes";

function AllocationBar({
  allocations,
}: {
  allocations: (typeof indexes)[number]["allocations"];
}) {
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
    <section id="indexes" className="sui-divider py-24">
      <div className="mx-auto max-w-6xl px-6">
        <span className="sui-label">Index Products</span>
        <h2 className="sui-heading mt-4 max-w-2xl">
          Four macro views. Dozens of ranges managed for you.
        </h2>
        <p className="mt-4 max-w-2xl text-muted">
          Buy a single index token — agents allocate across DeepBook Predict
          ranges and PLP liquidity automatically.
        </p>

        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {indexes.map((index) => (
            <div key={index.id} className="group sui-card-glow p-6 md:p-7">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <IconBox
                      icon={index.Icon}
                      boxClassName={index.iconBg}
                      iconClassName={index.iconColor}
                    />
                    <div>
                      <h3 className="text-lg font-semibold">{index.name}</h3>
                      <p className="text-sm text-muted">{index.tagline}</p>
                    </div>
                  </div>
                </div>
                <span className="rounded-full border border-border px-3 py-1 text-xs font-medium text-muted">
                  {index.market}
                </span>
              </div>

              <div className="mt-6">
                <AllocationBar allocations={index.allocations} />
              </div>

              <Link href="/app" className="sui-btn-ghost mt-6 block w-full !text-xs text-center">
                Invest in {index.name}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export { indexes };
