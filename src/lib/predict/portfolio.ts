import { Transaction, coinWithBalance } from "@mysten/sui/transactions";
import {
  CLOCK_OBJECT,
  PREDICT_OBJECT,
  QUOTE_DECIMALS,
  QUOTE_TYPE,
  managerTarget,
  predictTarget,
} from "./constants";
import { encodeRangeKey, type RangeKeyArgs } from "./transactions";

export type PortfolioLeg = {
  lowerStrike: bigint;
  higherStrike: bigint;
  quantity: bigint;
};

export type PortfolioTxArgs = {
  managerId: string | null;
  oracleId: string;
  expiry: bigint;
  depositAmount: bigint;
  plpAmount: bigint;
  legs: PortfolioLeg[];
};

export function usdToQuoteAmount(usd: number): bigint {
  return BigInt(Math.floor(usd * 10 ** QUOTE_DECIMALS));
}

export function buildIndexPortfolioTx(args: PortfolioTxArgs): Transaction {
  const tx = new Transaction();

  let managerArg;
  if (args.managerId) {
    managerArg = tx.object(args.managerId);
  } else {
    [managerArg] = tx.moveCall({
      target: predictTarget("create_manager"),
      arguments: [],
    });
  }

  const totalDeposit = args.depositAmount;
  if (totalDeposit > 0n) {
    const coin = coinWithBalance({ type: QUOTE_TYPE, balance: totalDeposit });
    tx.moveCall({
      target: managerTarget("deposit"),
      typeArguments: [QUOTE_TYPE],
      arguments: [managerArg, coin],
    });
  }

  for (const leg of args.legs) {
    const range: RangeKeyArgs = {
      oracleId: args.oracleId,
      expiry: args.expiry,
      lowerStrike: leg.lowerStrike,
      higherStrike: leg.higherStrike,
    };
    tx.moveCall({
      target: predictTarget("mint_range"),
      typeArguments: [QUOTE_TYPE],
      arguments: [
        tx.object(PREDICT_OBJECT),
        managerArg,
        tx.object(args.oracleId),
        tx.pure(encodeRangeKey(range)),
        tx.pure.u64(leg.quantity),
        tx.object(CLOCK_OBJECT),
      ],
    });
  }

  if (args.plpAmount > 0n) {
    const plpCoin = coinWithBalance({ type: QUOTE_TYPE, balance: args.plpAmount });
    tx.moveCall({
      target: predictTarget("supply"),
      typeArguments: [QUOTE_TYPE],
      arguments: [tx.object(PREDICT_OBJECT), plpCoin, tx.object(CLOCK_OBJECT)],
    });
  }

  return tx;
}

export function planToPortfolioArgs(
  plan: {
    oracleId: string;
    expiry: number;
    depositUsd: number;
    plpPct: number;
    rangeLegs: {
      lowerStrike: number;
      higherStrike: number;
      quantity: number;
    }[];
  },
  managerId: string | null,
): PortfolioTxArgs {
  const total = usdToQuoteAmount(plan.depositUsd);
  const plpAmount = (total * BigInt(plan.plpPct)) / 100n;
  const depositAmount = total - plpAmount;

  return {
    managerId,
    oracleId: plan.oracleId,
    expiry: BigInt(plan.expiry),
    depositAmount,
    plpAmount,
    legs: plan.rangeLegs.map((leg) => ({
      lowerStrike: BigInt(leg.lowerStrike),
      higherStrike: BigInt(leg.higherStrike),
      quantity: BigInt(leg.quantity),
    })),
  };
}
