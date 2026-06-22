import type { RangeQuote } from "@/lib/predict/api";
import { indexes } from "@/lib/indexes";
import type { IndexId, MarketRegime, RangeLeg, RiskLevel } from "./types";

type StrikePair = RangeQuote & { midpoint: number; width: number };

function buildPairs(strikes: number[]): StrikePair[] {
  const sorted = [...strikes].sort((a, b) => a - b);
  const pairs: StrikePair[] = [];
  for (let i = 0; i < sorted.length - 1; i++) {
    const lower = sorted[i];
    const higher = sorted[i + 1];
    pairs.push({
      lower_strike: lower,
      higher_strike: higher,
      midpoint: (lower + higher) / 2,
      width: higher - lower,
    });
  }
  return pairs;
}

function selectBullPairs(pairs: StrikePair[], spot: number, count: number): StrikePair[] {
  const above = pairs.filter((p) => p.midpoint >= spot * 0.98);
  const pool = above.length >= count ? above : pairs;
  return pool.slice(0, count);
}

function selectBearPairs(pairs: StrikePair[], spot: number, count: number): StrikePair[] {
  const below = pairs.filter((p) => p.midpoint <= spot * 1.02);
  const pool = below.length >= count ? below : [...pairs].reverse();
  return pool.slice(0, count);
}

function selectSidewayPairs(pairs: StrikePair[], spot: number, count: number): StrikePair[] {
  return [...pairs]
    .sort((a, b) => Math.abs(a.midpoint - spot) - Math.abs(b.midpoint - spot))
    .slice(0, count);
}

function selectVolatilityPairs(pairs: StrikePair[], count: number): StrikePair[] {
  if (pairs.length <= count) return pairs;
  const widest = [...pairs].sort((a, b) => b.width - a.width)[0];
  const tails = [pairs[0], pairs[pairs.length - 1]];
  const selected = new Map<string, StrikePair>();
  selected.set(`${widest.lower_strike}-${widest.higher_strike}`, widest);
  for (const pair of tails) {
    selected.set(`${pair.lower_strike}-${pair.higher_strike}`, pair);
  }
  return [...selected.values()].slice(0, count);
}

export function selectRangesForIndex(
  indexId: IndexId,
  strikes: number[],
  spot: number,
  rangeCount: number,
): RangeQuote[] {
  const pairs = buildPairs(strikes);
  if (!pairs.length) return [];

  let selected: StrikePair[];
  switch (indexId) {
    case "bear":
      selected = selectBearPairs(pairs, spot, rangeCount);
      break;
    case "volatility":
      selected = selectVolatilityPairs(pairs, rangeCount);
      break;
    case "sideway":
      selected = selectSidewayPairs(pairs, spot, rangeCount);
      break;
    case "bull":
    default:
      selected = selectBullPairs(pairs, spot, rangeCount);
      break;
  }

  return selected.map(({ lower_strike, higher_strike }) => ({
    lower_strike,
    higher_strike,
  }));
}

export function buildRangeLegs(
  indexId: IndexId,
  ranges: RangeQuote[],
  risk: RiskLevel,
  baseQuantity: number,
): RangeLeg[] {
  const template = indexes.find((i) => i.id === indexId);
  const rangeAllocations =
    template?.allocations.filter((a) => a.range !== "PLP") ?? [];
  const totalRangeWeight = rangeAllocations.reduce((sum, a) => sum + a.pct, 0);

  return ranges.map((range, i) => {
    const weightPct = rangeAllocations[i]?.pct ?? Math.floor(100 / ranges.length);
    const normalizedWeight = totalRangeWeight
      ? weightPct / totalRangeWeight
      : 1 / ranges.length;
    const riskMultiplier = risk === "high" ? 1.5 : risk === "low" ? 0.75 : 1;
    const quantity = Math.max(
      1,
      Math.round(baseQuantity * normalizedWeight * riskMultiplier),
    );

    return {
      lowerStrike: range.lower_strike,
      higherStrike: range.higher_strike,
      weightPct,
      quantity,
      label: rangeAllocations[i]?.range ?? `Range ${i + 1}`,
    };
  });
}

export function plpAllocationPct(risk: RiskLevel): number {
  switch (risk) {
    case "low":
      return 20;
    case "high":
      return 5;
    default:
      return 10;
  }
}

export function rangeLegCount(risk: RiskLevel): number {
  return risk === "low" ? 2 : 3;
}

export function indexNameFor(id: IndexId): string {
  return indexes.find((i) => i.id === id)?.name ?? id;
}

export function regimeLabel(regime: MarketRegime): string {
  return indexes.find((i) => i.id === regime)?.market ?? regime;
}
