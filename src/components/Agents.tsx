import {
  Layers,
  RefreshCw,
  ScanSearch,
  Shield,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { IconBox } from "@/components/icons/IconBox";

type Agent = {
  id: string;
  name: string;
  role: string;
  Icon: LucideIcon;
  inputs: string[];
  outputs: string[];
};

const agents: Agent[] = [
  {
    id: "market",
    name: "Market Analysis Agent",
    role: "Regime Detection",
    Icon: ScanSearch,
    inputs: ["BTC Price", "SVI Surface", "Volume", "Open Interest"],
    outputs: ["Bull Market", "Bear Market", "High Volatility", "Sideway"],
  },
  {
    id: "construction",
    name: "Index Construction Agent",
    role: "Portfolio Design",
    Icon: Layers,
    inputs: ["Market Regime", "Risk Profile", "Available Ranges"],
    outputs: ["Range Weights", "PLP Allocation", "Index Composition"],
  },
  {
    id: "risk",
    name: "Risk Management Agent",
    role: "Exposure Control",
    Icon: Shield,
    inputs: ["Volatility", "Drawdown Risk", "Portfolio Delta"],
    outputs: ["PLP Rebalancing", "Position Limits", "Risk Alerts"],
  },
  {
    id: "rebalance",
    name: "Rebalancing Agent",
    role: "Lifecycle Management",
    Icon: RefreshCw,
    inputs: ["Expiry Events", "Settlement Data", "New Ranges"],
    outputs: ["Range Rotation", "Index Recomposition", "Auto Settlement"],
  },
  {
    id: "execution",
    name: "Execution Agent",
    role: "On-Chain Operations",
    Icon: Zap,
    inputs: ["Index Orders", "User Deposits", "Redemption Requests"],
    outputs: ["predict::mint", "predict::supply", "predict::redeem"],
  },
];

export function Agents() {
  return (
    <section id="agents" className="sui-divider py-24">
      <div className="mx-auto max-w-6xl px-6">
        <span className="sui-label">Agent Architecture</span>
        <h2 className="sui-heading mt-4 max-w-2xl">
          Five specialized agents, one seamless flow
        </h2>
        <p className="mt-4 max-w-2xl text-muted">
          Each agent handles a distinct phase — from reading the SVI surface to
          executing on-chain via DeepBook Predict smart contracts.
        </p>

        <div className="mt-12 space-y-4">
          {agents.map((agent, i) => (
            <div key={agent.id} className="sui-card-glow p-6 md:p-8">
              <div className="flex flex-col gap-6 md:flex-row md:items-start">
                <div className="flex shrink-0 items-center gap-4">
                  <IconBox
                    icon={agent.Icon}
                    size="lg"
                    boxClassName="bg-white/10"
                    iconClassName="text-foreground"
                  />
                  <div>
                    <div className="sui-label !text-muted">Agent {i + 1}</div>
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
                          className="rounded-lg border border-border bg-surface px-2.5 py-1 font-mono text-xs"
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
