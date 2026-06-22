import { formatTxError, type FormattedTxError } from "@/lib/format-tx-error";

export type FormattedAgentError = FormattedTxError;

export function formatAgentError(message: string): FormattedAgentError {
  return formatTxError(message);
}
