const agents = [
  {
    id: "market",
    name: "Market Analysis Agent",
    role: "Regime Detection",
    icon: "🔍",
    inputs: ["BTC Price", "SVI Surface", "Volume", "Open Interest"],
    outputs: ["Bull Market", "Bear Market", "High Volatility", "Sideway"],
    color: "border-sui/30 bg-sui/5",
  },
  {
    id: "construction",
    name: "Index Construction Agent",
    role: "Portfolio Design",
    icon: "🏗️",
    inputs: ["Market Regime", "Risk Profile", "Available Ranges"],
    outputs: ["Range Weights", "PLP Allocation", "Index Composition"],
    color: "border-emerald-500/30 bg-emerald-500/5",
  },
  {
    id: "risk",
    name: "Risk Management Agent",
    role: "Exposure Control",
    icon: "🛡️",
    inputs: ["Volatility", "Drawdown Risk", "Portfolio Delta"],
    outputs: ["PLP Rebalancing", "Position Limits", "Risk Alerts"],
    color: "border-amber-500/30 bg-amber-500/5",
  },
  {
    id: "rebalance",
    name: "Rebalancing Agent",
    role: "Lifecycle Management",
    icon: "🔄",
    inputs: ["Expiry Events", "Settlement Data", "New Ranges"],
    outputs: ["Range Rotation", "Index Recomposition", "Auto Settlement"],
    color: "border-violet-500/30 bg-violet-500/5",
  },
  {
    id: "execution",
    name: "Execution Agent",
    role: "On-Chain Operations",
    icon: "⚡",
    inputs: ["Index Orders", "User Deposits", "Redemption Requests"],
    outputs: ["predict::mint", "predict::supply", "predict::redeem"],
    color: "border-red-500/30 bg-red-500/5",
  },
];

export function Agents() {
  return (
    <section id="agents" className="border-t border-border py-24">
      <div className="mx-auto max-w-6xl px-6">
        <span className="text-sm font-medium uppercase tracking-wider text-sui">
          Agent Architecture
        </span>
        <h2 className="mt-3 max-w-2xl text-3xl font-bold tracking-tight md:text-4xl">
          Five specialized agents, one seamless flow
        </h2>
        <p className="mt-4 max-w-2xl text-lg text-muted">
          Each agent handles a distinct phase — from reading the SVI surface to
          executing on-chain via DeepBook Predict smart contracts.
        </p>

        <div className="mt-12 space-y-4">
          {agents.map((agent, i) => (
            <div
              key={agent.id}
              className={`rounded-2xl border p-6 md:p-8 ${agent.color}`}
            >
              <div className="flex flex-col gap-6 md:flex-row md:items-start">
                <div className="flex shrink-0 items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface text-2xl">
                    {agent.icon}
                  </div>
                  <div>
                    <div className="text-xs font-medium uppercase tracking-wider text-muted">
                      Agent {i + 1}
                    </div>
                    <h3 className="text-lg font-semibold">{agent.name}</h3>
                    <p className="text-sm text-muted">{agent.role}</p>
                  </div>
                </div>

                <div className="grid flex-1 gap-4 sm:grid-cols-2">
                  <div>
                    <div className="mb-2 text-xs font-medium uppercase tracking-wider text-muted">
                      Inputs
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {agent.inputs.map((input) => (
                        <span
                          key={input}
                          className="rounded-lg border border-border bg-surface px-2.5 py-1 font-mono text-xs"
                        >
                          {input}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="mb-2 text-xs font-medium uppercase tracking-wider text-muted">
                      Outputs
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {agent.outputs.map((output) => (
                        <span
                          key={output}
                          className="rounded-lg border border-sui/20 bg-sui/10 px-2.5 py-1 font-mono text-xs text-sui"
                        >
                          {output}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
