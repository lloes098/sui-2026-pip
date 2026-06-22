import { QUOTE_DECIMALS } from "@/lib/predict/constants";

export type FormattedTxError = {
  title: string;
  detail: string;
  hint?: string;
  link?: { label: string; href: string };
  /** When true, hide generic "Transaction failed" status line */
  suppressTxStatus?: boolean;
};

export function formatTxError(message: string): FormattedTxError {
  const lower = message.toLowerCase();

  if (lower.includes("incorrect password") || lower.includes("wrong password")) {
    return {
      title: "Wallet signing password incorrect",
      detail:
        "Your wallet is connected, but Slush rejected the transaction signature.",
      hint: "This is not a login error — re-open Slush, enter the correct signing password, and approve the transaction again.",
      suppressTxStatus: true,
    };
  }

  if (
    lower.includes("reject") ||
    lower.includes("cancelled") ||
    lower.includes("canceled") ||
    lower.includes("user rejected")
  ) {
    return {
      title: "Transaction not signed",
      detail: "You cancelled or rejected the request in your wallet.",
      hint: "Connect is separate from signing. Click the action again and approve in Slush.",
      suppressTxStatus: true,
    };
  }

  if (
    lower.includes("insufficient balance") ||
    lower.includes("not enough coin") ||
    (lower.includes("not enough") && lower.includes("balance"))
  ) {
    const requiredMatch = message.match(/Required:\s*(\d+)/i);
    const requiredRaw = requiredMatch?.[1];
    const requiredUsd = requiredRaw
      ? (Number(requiredRaw) / 10 ** QUOTE_DECIMALS).toFixed(2)
      : null;

    return {
      title: "Insufficient DUSDC balance",
      detail: requiredUsd
        ? `This action needs ~$${requiredUsd} DUSDC in your wallet (testnet).`
        : "Your wallet does not have enough DUSDC for this transaction.",
      hint: "Get testnet SUI for gas, then obtain DUSDC before retrying.",
      link: {
        label: "Open Sui testnet faucet",
        href: "https://faucet.sui.io/?address=",
      },
    };
  }

  if (lower.includes("not supported") || lower.includes("is not supported")) {
    return {
      title: "Unsupported investment",
      detail: message,
      hint: 'Try: "BTC going up. Medium risk. Invest $500"',
    };
  }

  if (lower.includes("no llm") || lower.includes("api key")) {
    return {
      title: "Agent configuration",
      detail: message,
      hint: "Add GROQ_API_KEY or GEMINI_API_KEY to .env.local (free tiers available).",
    };
  }

  return {
    title: "Something went wrong",
    detail: message,
  };
}
