import { bcs } from "@mysten/sui/bcs";
import { Transaction, coinWithBalance } from "@mysten/sui/transactions";
import {
  CLOCK_OBJECT,
  PREDICT_OBJECT,
  QUOTE_TYPE,
  managerTarget,
  predictTarget,
} from "./constants";

const RangeKey = bcs.struct("RangeKey", {
  oracle_id: bcs.Address,
  expiry: bcs.u64(),
  lower_strike: bcs.u64(),
  higher_strike: bcs.u64(),
});

export type RangeKeyArgs = {
  oracleId: string;
  expiry: bigint;
  lowerStrike: bigint;
  higherStrike: bigint;
};

export function encodeRangeKey(args: RangeKeyArgs): Uint8Array {
  return RangeKey.serialize({
    oracle_id: args.oracleId,
    expiry: args.expiry,
    lower_strike: args.lowerStrike,
    higher_strike: args.higherStrike,
  }).toBytes();
}

export function buildCreateManagerTx(): Transaction {
  const tx = new Transaction();
  tx.moveCall({ target: predictTarget("create_manager"), arguments: [] });
  return tx;
}

export function buildDepositTx(
  managerId: string,
  amount: bigint,
): Transaction {
  const tx = new Transaction();
  const coin = coinWithBalance({ type: QUOTE_TYPE, balance: amount });
  tx.moveCall({
    target: managerTarget("deposit"),
    typeArguments: [QUOTE_TYPE],
    arguments: [tx.object(managerId), coin],
  });
  return tx;
}

export function buildSupplyTx(amount: bigint): Transaction {
  const tx = new Transaction();
  const coin = coinWithBalance({ type: QUOTE_TYPE, balance: amount });
  tx.moveCall({
    target: predictTarget("supply"),
    typeArguments: [QUOTE_TYPE],
    arguments: [
      tx.object(PREDICT_OBJECT),
      coin,
      tx.object(CLOCK_OBJECT),
    ],
  });
  return tx;
}

export function buildMintRangeTx(
  managerId: string,
  oracleId: string,
  range: RangeKeyArgs,
  quantity: bigint,
): Transaction {
  const tx = new Transaction();
  tx.moveCall({
    target: predictTarget("mint_range"),
    typeArguments: [QUOTE_TYPE],
    arguments: [
      tx.object(PREDICT_OBJECT),
      tx.object(managerId),
      tx.object(oracleId),
      tx.pure(encodeRangeKey(range)),
      tx.pure.u64(quantity),
      tx.object(CLOCK_OBJECT),
    ],
  });
  return tx;
}

export function buildRedeemRangeTx(
  managerId: string,
  oracleId: string,
  range: RangeKeyArgs,
  quantity: bigint,
): Transaction {
  const tx = new Transaction();
  tx.moveCall({
    target: predictTarget("redeem_range"),
    typeArguments: [QUOTE_TYPE],
    arguments: [
      tx.object(PREDICT_OBJECT),
      tx.object(managerId),
      tx.object(oracleId),
      tx.pure(encodeRangeKey(range)),
      tx.pure.u64(quantity),
      tx.object(CLOCK_OBJECT),
    ],
  });
  return tx;
}

export function buildPreviewRangeTx(
  oracleId: string,
  range: RangeKeyArgs,
  quantity: bigint,
): Transaction {
  const tx = new Transaction();
  tx.moveCall({
    target: predictTarget("get_range_trade_amounts"),
    arguments: [
      tx.object(PREDICT_OBJECT),
      tx.object(oracleId),
      tx.pure(encodeRangeKey(range)),
      tx.pure.u64(quantity),
      tx.object(CLOCK_OBJECT),
    ],
  });
  return tx;
}
