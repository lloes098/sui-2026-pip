import {
  ArrowLeftRight,
  TrendingDown,
  TrendingUp,
  Zap,
  type LucideIcon,
} from "lucide-react";

type Allocation = { range: string; pct: number; color: string };

export type IndexProduct = {
  id: string;
  name: string;
  tagline: string;
  Icon: LucideIcon;
  iconColor: string;
  iconBg: string;
  market: string;
  allocations: Allocation[];
};

export const indexes: IndexProduct[] = [
  {
    id: "bull",
    name: "Bull Index",
    tagline: "Long BTC upside exposure",
    Icon: TrendingUp,
    iconColor: "text-foreground",
    iconBg: "bg-white/10",
    market: "Bull Market",
    allocations: [
      { range: "71–72k Range", pct: 40, color: "bg-neutral-200" },
      { range: "72–73k Range", pct: 30, color: "bg-neutral-400" },
      { range: "73–74k Range", pct: 20, color: "bg-neutral-600" },
      { range: "PLP", pct: 10, color: "bg-neutral-800" },
    ],
  },
  {
    id: "bear",
    name: "Bear Index",
    tagline: "Downside protection & short bias",
    Icon: TrendingDown,
    iconColor: "text-foreground",
    iconBg: "bg-white/10",
    market: "Bear Market",
    allocations: [
      { range: "68–69k Range", pct: 35, color: "bg-neutral-200" },
      { range: "69–70k Range", pct: 35, color: "bg-neutral-400" },
      { range: "70–71k Range", pct: 20, color: "bg-neutral-600" },
      { range: "PLP", pct: 10, color: "bg-neutral-800" },
    ],
  },
  {
    id: "volatility",
    name: "Volatility Index",
    tagline: "Profit from large price swings",
    Icon: Zap,
    iconColor: "text-foreground",
    iconBg: "bg-white/10",
    market: "High Volatility",
    allocations: [
      { range: "65–75k Wide", pct: 45, color: "bg-neutral-200" },
      { range: "Tail Ranges", pct: 30, color: "bg-neutral-400" },
      { range: "Straddle Mix", pct: 15, color: "bg-neutral-600" },
      { range: "PLP", pct: 10, color: "bg-neutral-800" },
    ],
  },
  {
    id: "sideway",
    name: "Sideway Index",
    tagline: "Range-bound market strategies",
    Icon: ArrowLeftRight,
    iconColor: "text-foreground",
    iconBg: "bg-white/10",
    market: "Sideway",
    allocations: [
      { range: "70–71k Range", pct: 30, color: "bg-neutral-200" },
      { range: "71–72k Range", pct: 30, color: "bg-neutral-400" },
      { range: "72–73k Range", pct: 30, color: "bg-neutral-600" },
      { range: "PLP", pct: 10, color: "bg-neutral-800" },
    ],
  },
];
