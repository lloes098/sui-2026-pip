"use client";

import { useRef, type ComponentRef } from "react";
import { useDAppKit, useWalletConnection } from "@mysten/dapp-kit-react";
import { ConnectModal } from "@mysten/dapp-kit-react/ui";
import { copy } from "@/lib/copy";

function truncateAddress(address: string) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export function ConnectWalletButton() {
  const dAppKit = useDAppKit();
  const { isConnected, account } = useWalletConnection();
  const modalRef = useRef<ComponentRef<typeof ConnectModal>>(null);

  if (isConnected && account) {
    return (
      <button
        type="button"
        onClick={() => dAppKit.disconnectWallet()}
        title={account.address}
        className="sui-btn-ghost font-mono !text-xs !tracking-normal !normal-case"
      >
        {truncateAddress(account.address)}
      </button>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => void modalRef.current?.show()}
        className="sui-btn-primary !py-2 !px-4 !text-[0.6875rem]"
      >
        {copy.common.connectWallet}
      </button>
      <ConnectModal ref={modalRef} />
    </>
  );
}
