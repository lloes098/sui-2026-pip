import type { SuiClientTypes } from "@mysten/sui/client";
import { Transaction } from "@mysten/sui/transactions";
import { formatQuoteAmount } from "./api";
import { buildPreviewRangeTx, buildSupplyTx } from "./transactions";
import type { RangeKeyArgs } from "./transactions";

type Client = Pick<SuiClientTypes.TransportMethods, "simulateTransaction">;

export type VaultSimulationResult = {
  passed: boolean;
  depositAmount: bigint;
  vaultValueBefore?: string;
  estimatedShares?: string;
  availableWithdrawal?: string;
  maxPayout?: string;
  error?: string;
};

export type RangeSimulationResult = {
  passed: boolean;
  mintCost: bigint;
  redeemPayout: bigint;
  mintCostFormatted: string;
  redeemPayoutFormatted: string;
  error?: string;
};

function parseU64Return(
  results: SuiClientTypes.SimulateTransactionResult<{ commandResults: true }>["commandResults"],
): bigint | null {
  if (!results?.length) return null;
  const last = results[results.length - 1];
  const value = last?.returnValues?.[0]?.bcs;
  if (!value || value.length < 8) return null;
  const view = new DataView(value.buffer, value.byteOffset, value.byteLength);
  return view.getBigUint64(0, true);
}

function parseTupleReturn(
  results: SuiClientTypes.SimulateTransactionResult<{ commandResults: true }>["commandResults"],
): [bigint, bigint] | null {
  if (!results?.length) return null;
  const last = results[results.length - 1];
  const values = last?.returnValues;
  if (!values || values.length < 2) return null;

  const readU64 = (entry: { bcs: Uint8Array }) => {
    const view = new DataView(
      entry.bcs.buffer,
      entry.bcs.byteOffset,
      entry.bcs.byteLength,
    );
    return view.getBigUint64(0, true);
  };

  return [readU64(values[0]), readU64(values[1])];
}

export async function simulateVaultSupply(
  client: Client,
  sender: string,
  amount: bigint,
  vaultSummary?: {
    vault_value?: string | number;
    available_withdrawal?: string | number;
    max_payout?: string | number;
  },
): Promise<VaultSimulationResult> {
  if (amount <= 0n) {
    return { passed: false, depositAmount: amount, error: "Amount must be > 0" };
  }

  const tx = buildSupplyTx(amount);
  tx.setSender(sender);

  try {
    const result = await client.simulateTransaction({
      transaction: tx,
      include: { commandResults: true, effects: true },
    });

    if (result.$kind === "FailedTransaction") {
      return {
        passed: false,
        depositAmount: amount,
        error: result.FailedTransaction.status.error?.message ?? "Simulation failed",
      };
    }

    const shares = parseU64Return(result.commandResults);
    const vaultValue = vaultSummary?.vault_value;
    const available = vaultSummary?.available_withdrawal;
    const maxPayout = vaultSummary?.max_payout;

    return {
      passed: true,
      depositAmount: amount,
      vaultValueBefore: formatQuoteAmount(vaultValue),
      estimatedShares: shares?.toString() ?? "—",
      availableWithdrawal: formatQuoteAmount(available),
      maxPayout: formatQuoteAmount(maxPayout),
    };
  } catch (err) {
    return {
      passed: false,
      depositAmount: amount,
      error: err instanceof Error ? err.message : "Simulation error",
    };
  }
}

export async function simulateRangeMint(
  client: Client,
  sender: string,
  oracleId: string,
  range: RangeKeyArgs,
  quantity: bigint,
): Promise<RangeSimulationResult> {
  if (quantity <= 0n) {
    return {
      passed: false,
      mintCost: 0n,
      redeemPayout: 0n,
      mintCostFormatted: "0",
      redeemPayoutFormatted: "0",
      error: "Quantity must be > 0",
    };
  }

  const tx = buildPreviewRangeTx(oracleId, range, quantity);
  tx.setSender(sender);

  try {
    const result = await client.simulateTransaction({
      transaction: tx,
      include: { commandResults: true },
    });

    if (result.$kind === "FailedTransaction") {
      return {
        passed: false,
        mintCost: 0n,
        redeemPayout: 0n,
        mintCostFormatted: "0",
        redeemPayoutFormatted: "0",
        error: result.FailedTransaction.status.error?.message ?? "Preview failed",
      };
    }

    const tuple = parseTupleReturn(result.commandResults);
    if (!tuple) {
      return {
        passed: false,
        mintCost: 0n,
        redeemPayout: 0n,
        mintCostFormatted: "0",
        redeemPayoutFormatted: "0",
        error: "Could not parse preview amounts",
      };
    }

    const [mintCost, redeemPayout] = tuple;
    return {
      passed: true,
      mintCost,
      redeemPayout,
      mintCostFormatted: formatQuoteAmount(Number(mintCost)),
      redeemPayoutFormatted: formatQuoteAmount(Number(redeemPayout)),
    };
  } catch (err) {
    return {
      passed: false,
      mintCost: 0n,
      redeemPayout: 0n,
      mintCostFormatted: "0",
      redeemPayoutFormatted: "0",
      error: err instanceof Error ? err.message : "Preview error",
    };
  }
}

export async function simulateCombinedIndexTx(
  client: Client,
  sender: string,
  transaction: Transaction,
): Promise<{ passed: boolean; error?: string }> {
  try {
    transaction.setSender(sender);
    const result = await client.simulateTransaction({
      transaction,
      include: { effects: true },
    });

    if (result.$kind === "FailedTransaction") {
      return {
        passed: false,
        error: result.FailedTransaction.status.error?.message ?? "Simulation failed",
      };
    }

    return { passed: true };
  } catch (err) {
    return {
      passed: false,
      error: err instanceof Error ? err.message : "Simulation error",
    };
  }
}
