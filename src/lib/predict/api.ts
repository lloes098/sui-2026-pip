import {
  PREDICT_OBJECT,
  PREDICT_SERVER,
  QUOTE_DECIMALS,
} from "./constants";

export type VaultSummary = {
  vault_value?: string | number;
  total_plp_supply?: string | number;
  available_withdrawal?: string | number;
  max_payout?: string | number;
  balance?: string | number;
  total_exposure?: string | number;
};

export type OracleState = {
  oracle_id: string;
  expiry?: number;
  spot?: number | string;
  forward?: number | string;
  status?: string;
  settlement_price?: number | string | null;
  strikes?: number[];
};

export type OracleListItem = {
  oracle_id: string;
  expiry?: number;
  status?: string;
};

export type RangeQuote = {
  lower_strike: number;
  higher_strike: number;
  ask?: number;
  bid?: number;
};

export type PredictState = {
  trading_paused?: boolean;
  predict_id?: string;
};

function toNumber(value: string | number | undefined): number {
  if (value === undefined) return 0;
  return typeof value === "string" ? Number(value) : value;
}

export function formatQuoteAmount(raw: number | string | undefined): string {
  const n = toNumber(raw);
  if (!n) return "0.00";
  return (n / 10 ** QUOTE_DECIMALS).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

async function fetchJson<T>(path: string): Promise<T> {
  const res = await fetch(`${PREDICT_SERVER}${path}`, {
    next: { revalidate: 15 },
  });
  if (!res.ok) {
    throw new Error(`Predict API ${path}: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export async function getPredictState(): Promise<PredictState> {
  return fetchJson(`/predicts/${PREDICT_OBJECT}/state`);
}

export async function getVaultSummary(): Promise<VaultSummary> {
  return fetchJson(`/predicts/${PREDICT_OBJECT}/vault/summary`);
}

export async function getOracles(): Promise<OracleListItem[]> {
  const data = await fetchJson<{ oracles?: OracleListItem[] } | OracleListItem[]>(
    `/predicts/${PREDICT_OBJECT}/oracles`,
  );
  return Array.isArray(data) ? data : (data.oracles ?? []);
}

/** Build strike grid centered on spot for range pair selection */
export function buildStrikeGridNearSpot(
  minStrike: number,
  tickSize: number,
  spot: number,
  windowTicks = 24,
): number[] {
  if (tickSize <= 0) return [];
  const spotIndex = Math.round((spot - minStrike) / tickSize);
  const startIndex = Math.max(0, spotIndex - windowTicks);
  const endIndex = spotIndex + windowTicks;
  const strikes: number[] = [];
  for (let i = startIndex; i <= endIndex; i++) {
    strikes.push(minStrike + i * tickSize);
  }
  return strikes;
}

type OracleStateResponse = {
  oracle?: {
    oracle_id: string;
    expiry?: number;
    min_strike?: number;
    tick_size?: number;
    status?: string;
  };
  latest_price?: {
    spot?: number;
    forward?: number;
  };
};

export async function getOracleState(oracleId: string): Promise<OracleState> {
  const raw = await fetchJson<OracleStateResponse>(
    `/oracles/${oracleId}/state`,
  ).catch(() => null);

  if (raw?.oracle) {
    const o = raw.oracle;
    const spot = raw.latest_price?.spot;
    const forward = raw.latest_price?.forward;
    let strikes: number[] | undefined;
    if (o.min_strike != null && o.tick_size != null && spot != null) {
      strikes = buildStrikeGridNearSpot(o.min_strike, o.tick_size, spot);
    }
    return {
      oracle_id: o.oracle_id ?? oracleId,
      expiry: o.expiry,
      spot,
      forward,
      status: o.status,
      strikes,
    };
  }

  const [state, bounds] = await Promise.all([
    fetchJson<OracleState & { strike_grid?: number[]; strikes?: number[] }>(
      `/oracles/${oracleId}/state`,
    ).catch(() => ({ oracle_id: oracleId } as OracleState)),
    fetchJson<{ strikes?: number[]; lower?: number[]; upper?: number[] }>(
      `/oracles/${oracleId}/ask-bounds`,
    ).catch(() => null),
  ]);

  const legacy = state as OracleState & { strike_grid?: number[] };
  const strikes =
    legacy.strikes ??
    legacy.strike_grid ??
    bounds?.strikes ??
    (bounds?.lower && bounds?.upper
      ? bounds.lower.flatMap((l, i) => [l, bounds.upper?.[i] ?? l + 1])
      : undefined);

  return {
    ...state,
    oracle_id: state.oracle_id ?? oracleId,
    strikes: strikes ? [...new Set(strikes)].sort((a, b) => a - b) : undefined,
  };
}

export async function getServerStatus(): Promise<{ status?: string }> {
  return fetchJson("/status");
}

/** Pick consecutive strike pairs for bull index ranges */
export function pickBullRanges(
  strikes: number[],
  count = 3,
): RangeQuote[] {
  const sorted = [...strikes].sort((a, b) => a - b);
  const ranges: RangeQuote[] = [];
  for (let i = 0; i < sorted.length - 1 && ranges.length < count; i++) {
    ranges.push({
      lower_strike: sorted[i],
      higher_strike: sorted[i + 1],
    });
  }
  return ranges;
}
