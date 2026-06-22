"use client";

import dynamic from "next/dynamic";

export const ConnectWallet = dynamic(
  () => import("./ConnectWalletButton").then((m) => m.ConnectWalletButton),
  {
    ssr: false,
    loading: () => (
      <button
        type="button"
        disabled
        className="rounded-full border border-border px-4 py-2 text-sm text-muted"
      >
        …
      </button>
    ),
  },
);
