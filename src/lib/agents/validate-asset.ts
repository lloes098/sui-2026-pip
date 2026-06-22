export const SUPPORTED_ASSETS = ["BTC"] as const;
export type SupportedAsset = (typeof SUPPORTED_ASSETS)[number];

export function validateAsset(asset: string): {
  supported: boolean;
  normalized: string;
  reason?: string;
} {
  const normalized = asset.trim().toUpperCase();

  if ((SUPPORTED_ASSETS as readonly string[]).includes(normalized)) {
    return { supported: true, normalized };
  }

  return {
    supported: false,
    normalized,
    reason: `${asset} is not supported. PIP trades BTC prediction indexes on DeepBook Predict (Sui testnet) only.`,
  };
}
