"use client";

import { formatTxError, type FormattedTxError } from "@/lib/format-tx-error";
import { useCallback, useEffect, useState } from "react";
import { Check } from "lucide-react";
import {
  useCurrentAccount,
  useCurrentClient,
  useDAppKit,
} from "@mysten/dapp-kit-react";
import { copy } from "@/lib/copy";
import {
  formatQuoteAmount,
  getOracleState,
  getOracles,
  getPredictState,
  getServerStatus,
  getVaultSummary,
  pickBullRanges,
  type OracleState,
  type VaultSummary,
} from "@/lib/predict/api";
import {
  extractManagerIdFromDigest,
  resolveManagerAfterCreate,
  resolveManagerId,
  storeManagerId,
} from "@/lib/predict/manager";
import {
  simulateCombinedIndexTx,
  simulateRangeMint,
  simulateVaultSupply,
  type RangeSimulationResult,
  type VaultSimulationResult,
} from "@/lib/predict/simulation";
import { indexes } from "@/lib/indexes";
import { AgentConsole } from "@/components/app/AgentConsole";
import { runAgentPipeline } from "@/lib/agents/orchestrator";
import type { AgentPlan } from "@/lib/agents/types";
import {
  buildIndexPortfolioTx,
  planToPortfolioArgs,
} from "@/lib/predict/portfolio";
import {
  buildCreateManagerTx,
  buildSupplyTx,
} from "@/lib/predict/transactions";
import { IconBox } from "@/components/icons/IconBox";
import {
  PREDICT_OBJECT,
  PREDICT_PACKAGE,
  QUOTE_DECIMALS,
} from "@/lib/predict/constants";

type Tab = "agent" | "vault" | "index" | "status";

export function PredictApp() {
  const t = copy;
  const account = useCurrentAccount();
  const client = useCurrentClient();
  const dAppKit = useDAppKit();

  const [tab, setTab] = useState<Tab>("agent");
  const [managerId, setManagerId] = useState<string | null>(null);
  const [vaultSummary, setVaultSummary] = useState<VaultSummary | null>(null);
  const [oracle, setOracle] = useState<OracleState | null>(null);
  const [tradingPaused, setTradingPaused] = useState(false);
  const [serverOk, setServerOk] = useState<boolean | null>(null);

  const [vaultAmount, setVaultAmount] = useState("10");
  const [vaultSim, setVaultSim] = useState<VaultSimulationResult | null>(null);
  const [indexId, setIndexId] = useState("bull");
  const [indexAmount, setIndexAmount] = useState("5");
  const [quantity, setQuantity] = useState("1");
  const [rangeSim, setRangeSim] = useState<RangeSimulationResult | null>(null);
  const [agentPlan, setAgentPlan] = useState<AgentPlan | null>(null);
  const [portfolioReady, setPortfolioReady] = useState(false);

  const [loading, setLoading] = useState(false);
  const [txStatus, setTxStatus] = useState<string | null>(null);
  const [txDigest, setTxDigest] = useState<string | null>(null);
  const [formattedError, setFormattedError] = useState<FormattedTxError | null>(
    null,
  );

  function clearTxError() {
    setFormattedError(null);
  }

  function showTxError(message: string) {
    const formatted = formatTxError(message);
    setFormattedError(formatted);
    if (formatted.suppressTxStatus) {
      setTxStatus(null);
    } else {
      setTxStatus(copy.app.tx.failed);
    }
  }

  const refreshProtocol = useCallback(async () => {
    try {
      const [status, vault, state, oracles] = await Promise.all([
        getServerStatus().catch(() => ({ status: "error" })),
        getVaultSummary().catch(() => null),
        getPredictState().catch(() => ({})),
        getOracles().catch(() => []),
      ]);
      setServerOk(status.status !== "error");
      setVaultSummary(vault);
      setTradingPaused(
        "trading_paused" in state ? !!state.trading_paused : false,
      );

      const live =
        oracles.find((o) => o.status === "Live" || o.status === "active") ??
        oracles[0];
      if (live?.oracle_id) {
        const oracleState = await getOracleState(live.oracle_id).catch(() => null);
        setOracle(oracleState);
      }
    } catch {
      setServerOk(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch predict protocol state on mount
    refreshProtocol().catch(() => undefined);
  }, [refreshProtocol]);

  useEffect(() => {
    if (!account?.address) return;
    let cancelled = false;
    resolveManagerId(client, account.address).then((id) => {
      if (!cancelled) setManagerId(id);
    });
    return () => {
      cancelled = true;
    };
  }, [account?.address, client]);

  const activeManagerId = account?.address ? managerId : null;

  const parseAmount = (val: string) => {
    const n = parseFloat(val);
    if (Number.isNaN(n) || n <= 0) return 0n;
    return BigInt(Math.floor(n * 10 ** QUOTE_DECIMALS));
  };

  const [creatingManager, setCreatingManager] = useState(false);

  const refreshManager = useCallback(async () => {
    if (!account?.address) return;
    const id = await resolveManagerId(client, account.address);
    setManagerId(id);
    return id;
  }, [account?.address, client]);

  const handleCreateManager = async () => {
    if (!account) return;
    setCreatingManager(true);
    setLoading(true);
    clearTxError();
    setTxDigest(null);
    setTxStatus(t.app.manager.approveInWallet);
    try {
      const tx = buildCreateManagerTx();
      const result = await dAppKit.signAndExecuteTransaction({ transaction: tx });
      if (result.$kind === "FailedTransaction") {
        throw new Error(result.FailedTransaction.status.error?.message ?? "Failed");
      }
      const digest = result.Transaction.digest;
      setTxDigest(digest);
      setTxStatus(t.app.tx.pending);

      const id = await resolveManagerAfterCreate(
        client,
        account.address,
        digest,
      );

      if (id) {
        setManagerId(id);
        setTxStatus(t.app.manager.createSuccess);
      } else {
        setTxStatus(t.app.tx.success);
        setFormattedError({
          title: "Manager pending",
          detail:
            "Transaction confirmed but manager ID not indexed yet. Click Refresh in a few seconds.",
        });
      }
    } catch (err) {
      showTxError(err instanceof Error ? err.message : t.app.tx.failed);
    } finally {
      setLoading(false);
      setCreatingManager(false);
    }
  };

  const handleVaultSimulate = async () => {
    if (!account) return;
    setLoading(true);
    clearTxError();
    setVaultSim(null);
    const amount = parseAmount(vaultAmount);
    const result = await simulateVaultSupply(
      client,
      account.address,
      amount,
      vaultSummary ?? undefined,
    );
    setVaultSim(result);
    if (!result.passed) showTxError(result.error ?? t.app.vault.previewFail);
    setLoading(false);
  };

  const handleVaultSupply = async () => {
    if (!account || !vaultSim?.passed) return;
    setLoading(true);
    clearTxError();
    setTxStatus(t.app.tx.pending);
    try {
      const tx = buildSupplyTx(parseAmount(vaultAmount));
      const result = await dAppKit.signAndExecuteTransaction({ transaction: tx });
      if (result.$kind === "FailedTransaction") {
        throw new Error(result.FailedTransaction.status.error?.message ?? "Failed");
      }
      setTxDigest(result.Transaction.digest);
      setTxStatus(t.app.tx.success);
      setVaultSim(null);
      await refreshProtocol();
    } catch (err) {
      showTxError(err instanceof Error ? err.message : t.app.tx.failed);
    } finally {
      setLoading(false);
    }
  };

  const getSelectedRanges = () => {
    if (!oracle?.strikes?.length) return [];
    const strikes = oracle.strikes;
    if (indexId === "bear") {
      return pickBullRanges([...strikes].reverse(), 3);
    }
    return pickBullRanges(strikes, 3);
  };

  const handleIndexSimulate = async () => {
    if (!account) return;
    setLoading(true);
    clearTxError();
    setRangeSim(null);
    setAgentPlan(null);
    setPortfolioReady(false);

    try {
      const agentInput = `${indexId} index. Invest $${indexAmount}. medium risk.`;
      const plan = await runAgentPipeline(agentInput);
      setAgentPlan(plan);

      const tx = buildIndexPortfolioTx(planToPortfolioArgs(plan, managerId));
      const combined = await simulateCombinedIndexTx(client, account.address, tx);
      if (!combined.passed) {
        throw new Error(combined.error ?? t.app.vault.previewFail);
      }
      setPortfolioReady(true);

      const primary = plan.rangeLegs[0];
      if (primary) {
        const result = await simulateRangeMint(
          client,
          account.address,
          plan.oracleId,
          {
            oracleId: plan.oracleId,
            expiry: BigInt(plan.expiry),
            lowerStrike: BigInt(primary.lowerStrike),
            higherStrike: BigInt(primary.higherStrike),
          },
          BigInt(primary.quantity),
        );
        setRangeSim(result);
      }
    } catch (err) {
      showTxError(err instanceof Error ? err.message : t.app.vault.previewFail);
    } finally {
      setLoading(false);
    }
  };

  const handleIndexInvest = async () => {
    if (!account || !agentPlan || !portfolioReady) return;

    setLoading(true);
    clearTxError();
    setTxStatus(t.app.tx.pending);

    try {
      const tx = buildIndexPortfolioTx(
        planToPortfolioArgs(agentPlan, managerId),
      );
      const sim = await simulateCombinedIndexTx(client, account.address, tx);
      if (!sim.passed) {
        throw new Error(sim.error ?? "Combined simulation failed");
      }

      const result = await dAppKit.signAndExecuteTransaction({ transaction: tx });
      if (result.$kind === "FailedTransaction") {
        throw new Error(result.FailedTransaction.status.error?.message ?? "Failed");
      }

      const digest = result.Transaction.digest;
      if (!managerId && digest && account.address) {
        const newId = await extractManagerIdFromDigest(client, digest);
        if (newId) {
          storeManagerId(account.address, newId);
          setManagerId(newId);
        }
      }

      setTxDigest(result.Transaction.digest);
      setTxStatus(t.app.tx.success);
      setRangeSim(null);
      setAgentPlan(null);
      setPortfolioReady(false);
      await refreshProtocol();
    } catch (err) {
      showTxError(err instanceof Error ? err.message : t.app.tx.failed);
    } finally {
      setLoading(false);
    }
  };

  const selectedIndex = indexes.find((i) => i.id === indexId);
  const displayRanges = agentPlan?.rangeLegs ?? getSelectedRanges().map((r) => ({
    lowerStrike: r.lower_strike,
    higherStrike: r.higher_strike,
    weightPct: 0,
    quantity: Number(quantity),
    label: "",
  }));

  if (!account) {
    return (
      <div className="sui-card-glow p-12 text-center">
        <p className="text-lg text-muted">{t.app.connect}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Manager bar */}
      <div className="sui-card-glow flex flex-wrap items-center justify-between gap-4 p-4">
        <div className="min-w-0 flex-1">
          <div className="text-xs uppercase tracking-wider text-muted">{t.app.manager.label}</div>
          <div className="mt-1 break-all font-mono text-sm">
            {activeManagerId ?? t.app.manager.none}
          </div>
          <p className="mt-2 text-xs text-muted">{t.app.manager.hint}</p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <button
            type="button"
            onClick={() => refreshManager()}
            disabled={loading}
            className="sui-btn-ghost !py-2 !px-3 !text-[0.6875rem]"
          >
            {t.app.manager.refresh}
          </button>
          {!activeManagerId && (
            <button
              type="button"
              onClick={handleCreateManager}
              disabled={loading}
              className="sui-btn-primary disabled:opacity-50"
            >
              {creatingManager ? t.app.tx.pending : t.app.manager.create}
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="sui-tabs">
        {(["agent", "vault", "index", "status"] as Tab[]).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={tab === key ? "sui-tab sui-tab-active" : "sui-tab"}
          >
            {t.app.tabs[key]}
          </button>
        ))}
      </div>

      {formattedError && (
        <div className="rounded-xl border border-border bg-surface px-4 py-3 text-sm">
          <div className="font-medium">{formattedError.title}</div>
          <p className="mt-1 text-muted">{formattedError.detail}</p>
          {formattedError.hint && (
            <p className="mt-2 text-xs text-muted">{formattedError.hint}</p>
          )}
          {formattedError.link && account?.address && (
            <a
              href={`${formattedError.link.href}${account.address}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block text-xs underline"
            >
              {formattedError.link.label}
            </a>
          )}
        </div>
      )}

      {txStatus && (
        <div className="rounded-xl border border-border bg-surface px-4 py-3 text-sm">
          {txStatus}
          {txDigest && (
            <a
              href={`https://suiscan.xyz/testnet/tx/${txDigest}`}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 underline"
            >
              {t.app.tx.view}
            </a>
          )}
        </div>
      )}

      {tab === "agent" && (
        <AgentConsole
          managerId={managerId}
          onManagerCreated={setManagerId}
          onTxSuccess={() => refreshProtocol()}
        />
      )}

      {tab === "vault" && (
        <div className="sui-card-glow p-6 md:p-7">
          <h3 className="text-lg font-semibold">{t.app.vault.title}</h3>
          <p className="mt-2 text-sm text-muted">{t.app.vault.desc}</p>

          <div className="mt-6 space-y-4">
            <div>
              <label className="text-sm text-muted">{t.app.vault.amount}</label>
              <input
                type="number"
                value={vaultAmount}
                onChange={(e) => {
                  setVaultAmount(e.target.value);
                  setVaultSim(null);
                }}
                className="sui-input mt-2"
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleVaultSimulate}
                disabled={loading}
                className="sui-btn-primary disabled:opacity-50"
              >
                {t.app.vault.preview}
              </button>
              <button
                type="button"
                onClick={handleVaultSupply}
                disabled={loading || !vaultSim?.passed}
                className="sui-btn-solid disabled:opacity-40"
              >
                {t.app.vault.supply}
              </button>
            </div>

            {vaultSim && (
              <div className="rounded-xl border border-border bg-surface p-4 text-sm">
                <div className="font-medium">
                  {vaultSim.passed ? t.app.vault.previewPass : t.app.vault.previewFail}
                </div>
                {vaultSim.passed && (
                  <dl className="mt-3 grid gap-2 sm:grid-cols-2">
                    <div className="flex justify-between gap-4">
                      <dt className="text-muted">{t.app.vault.vaultValue}</dt>
                      <dd className="font-mono">{vaultSim.vaultValueBefore} DUSDC</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-muted">{t.app.vault.estShares}</dt>
                      <dd className="font-mono">{vaultSim.estimatedShares}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-muted">{t.app.vault.available}</dt>
                      <dd className="font-mono">{vaultSim.availableWithdrawal} DUSDC</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-muted">{t.app.vault.maxPayout}</dt>
                      <dd className="font-mono">{vaultSim.maxPayout} DUSDC</dd>
                    </div>
                  </dl>
                )}
                {vaultSim.error && (
                  <p className="mt-2 text-muted">{vaultSim.error}</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {tab === "index" && (
        <div className="sui-card-glow p-6 md:p-7">
          <h3 className="text-lg font-semibold">{t.app.index.title}</h3>
          <p className="mt-2 text-sm text-muted">{t.app.index.desc}</p>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <div className="space-y-4">
              <div>
                <span className="text-sm text-muted">{t.app.index.select}</span>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {indexes.map((idx) => (
                    <button
                      key={idx.id}
                      type="button"
                      onClick={() => setIndexId(idx.id)}
                      className={`inline-flex items-center justify-center gap-2 rounded-lg border py-2 text-sm ${
                        indexId === idx.id
                          ? "border-foreground bg-white/10 text-foreground"
                          : "border-border text-muted"
                      }`}
                    >
                      <idx.Icon
                        className={`h-4 w-4 shrink-0 ${idx.iconColor}`}
                        strokeWidth={2.25}
                      />
                      {idx.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm text-muted">{t.app.index.amount}</label>
                <input
                  type="number"
                  value={indexAmount}
                  onChange={(e) => setIndexAmount(e.target.value)}
                  className="sui-input mt-2"
                />
              </div>

              <div>
                <label className="text-sm text-muted">{t.app.index.quantity}</label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="sui-input mt-2"
                />
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleIndexSimulate}
                  disabled={loading}
                  className="sui-btn-primary disabled:opacity-50"
                >
                  {t.app.index.preview}
                </button>
                <button
                  type="button"
                  onClick={handleIndexInvest}
                  disabled={loading || !portfolioReady}
                  className="sui-btn-solid disabled:opacity-40"
                >
                  {t.app.index.invest}
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-xl border border-border bg-surface-elevated p-4">
                <div className="text-xs uppercase text-muted">{t.app.index.oracle}</div>
                <div className="mt-1 font-mono text-xs break-all">
                  {oracle?.oracle_id ?? "—"}
                </div>
                {selectedIndex && (
                  <div className="mt-3 flex items-center gap-2 text-sm">
                    <IconBox
                      icon={selectedIndex.Icon}
                      size="sm"
                      boxClassName={selectedIndex.iconBg}
                      iconClassName={selectedIndex.iconColor}
                    />
                    {selectedIndex.name}
                  </div>
                )}
              </div>

              {agentPlan && (
                <div className="rounded-xl border border-border p-4">
                  <div className="text-xs uppercase text-muted">{t.app.index.pipeline}</div>
                  <div className="mt-2 space-y-2">
                    {agentPlan.steps.map((step) => (
                      <div key={`${step.agent}-${step.message}`} className="flex gap-2 text-sm">
                        <Check className="h-4 w-4 shrink-0" strokeWidth={2.5} />
                        <div>
                          <div className="font-medium">{step.agent}</div>
                          <div className="text-xs text-muted">{step.message}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {displayRanges.length > 0 && (
                <div className="rounded-xl border border-border p-4">
                  <div className="text-xs uppercase text-muted">{t.app.index.ranges}</div>
                  <ul className="mt-2 space-y-1 text-sm font-mono">
                    {displayRanges.map((r) => (
                      <li key={`${r.lowerStrike}-${r.higherStrike}`}>
                        {formatQuoteAmount(r.lowerStrike)} –{" "}
                        {formatQuoteAmount(r.higherStrike)}
                        {"quantity" in r && r.quantity ? ` · qty ${r.quantity}` : ""}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {rangeSim?.passed && (
                <div className="rounded-xl border border-border bg-surface p-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted">{t.app.index.mintCost}</span>
                    <span className="font-mono">{rangeSim.mintCostFormatted} DUSDC</span>
                  </div>
                  <div className="mt-2 flex justify-between">
                    <span className="text-muted">{t.app.index.redeemPayout}</span>
                    <span className="font-mono">{rangeSim.redeemPayoutFormatted} DUSDC</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {tab === "status" && (
        <div className="sui-card-glow p-6 md:p-7">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">{t.app.tabs.status}</h3>
            <button
              type="button"
              onClick={refreshProtocol}
              className="text-sm text-muted hover:text-foreground hover:underline"
            >
              {t.common.refresh}
            </button>
          </div>

          <dl className="mt-6 space-y-4 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted">{t.app.status.server}</dt>
              <dd className={serverOk ? "text-foreground" : "text-muted"}>
                {serverOk ? "Online" : "Offline"}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">{t.app.status.trading}</dt>
              <dd>{tradingPaused ? "Paused" : "Active"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">{t.app.status.vaultValue}</dt>
              <dd className="font-mono">
                {formatQuoteAmount(vaultSummary?.vault_value)} DUSDC
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">{t.app.status.plpSupply}</dt>
              <dd className="font-mono">{vaultSummary?.total_plp_supply ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-muted">{t.app.status.package}</dt>
              <dd className="mt-1 font-mono text-xs break-all">{PREDICT_PACKAGE}</dd>
            </div>
            <div>
              <dt className="text-muted">{t.app.status.predict}</dt>
              <dd className="mt-1 font-mono text-xs break-all">{PREDICT_OBJECT}</dd>
            </div>
          </dl>
        </div>
      )}
    </div>
  );
}
