import type { SuiClientTypes } from "@mysten/sui/client";
import { MANAGER_TYPE, PREDICT_PACKAGE, PREDICT_SERVER } from "./constants";

const STORAGE_PREFIX = "pip_predict_manager_";

type Client = Pick<
  SuiClientTypes.TransportMethods,
  "getTransaction" | "listOwnedObjects"
>;

export function getStoredManagerId(address: string): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(`${STORAGE_PREFIX}${address}`);
}

export function storeManagerId(address: string, managerId: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(`${STORAGE_PREFIX}${address}`, managerId);
}

type ManagerListItem = {
  manager_id?: string;
  owner?: string;
};

export async function findManagerFromServer(
  owner: string,
): Promise<string | null> {
  try {
    const res = await fetch(`${PREDICT_SERVER}/managers`);
    if (!res.ok) return null;
    const data = (await res.json()) as ManagerListItem[] | { managers?: ManagerListItem[] };
    const list = Array.isArray(data) ? data : (data.managers ?? []);
    const match = list.find(
      (m) => m.owner?.toLowerCase() === owner.toLowerCase() && m.manager_id,
    );
    return match?.manager_id ?? null;
  } catch {
    return null;
  }
}

/** Query wallet-owned PredictManager objects on chain */
export async function findManagerOnChain(
  client: Client,
  owner: string,
): Promise<string | null> {
  try {
    const page = await client.listOwnedObjects({
      owner,
      type: MANAGER_TYPE,
      limit: 1,
    });
    const obj = page.objects[0];
    if (!obj || obj instanceof Error) return null;
    return obj.objectId ?? null;
  } catch {
    return null;
  }
}

export async function findManagerFromTxEvents(
  client: Client,
  digest: string,
): Promise<string | null> {
  const tx = await client.getTransaction({
    digest,
    include: { events: true },
  });
  const events = tx.Transaction?.events ?? [];
  for (const event of events) {
    if (
      event.eventType?.includes("PredictManagerCreated") ||
      event.eventType?.includes(
        `${PREDICT_PACKAGE}::predict_manager::PredictManagerCreated`,
      )
    ) {
      const parsed = event.json as { manager_id?: string; manager?: string } | null;
      if (parsed?.manager_id) return parsed.manager_id;
      if (parsed?.manager) return parsed.manager;
    }
  }
  return null;
}

export async function extractManagerIdFromDigest(
  client: Client,
  digest: string,
  owner?: string,
): Promise<string | null> {
  const fromEvents = await findManagerFromTxEvents(client, digest);
  if (fromEvents) return fromEvents;

  if (owner) {
    const onChain = await findManagerOnChain(client, owner);
    if (onChain) return onChain;
  }

  return null;
}

export async function resolveManagerId(
  client: Client,
  owner: string,
): Promise<string | null> {
  const stored = getStoredManagerId(owner);
  if (stored) return stored;

  const fromChain = await findManagerOnChain(client, owner);
  if (fromChain) {
    storeManagerId(owner, fromChain);
    return fromChain;
  }

  const fromServer = await findManagerFromServer(owner);
  if (fromServer) {
    storeManagerId(owner, fromServer);
    return fromServer;
  }

  return null;
}

/** Poll chain + server after create_manager tx */
export async function resolveManagerAfterCreate(
  client: Client,
  owner: string,
  digest?: string,
): Promise<string | null> {
  if (digest) {
    const fromTx = await extractManagerIdFromDigest(client, digest, owner);
    if (fromTx) {
      storeManagerId(owner, fromTx);
      return fromTx;
    }
  }

  for (let i = 0; i < 4; i++) {
    const onChain = await findManagerOnChain(client, owner);
    if (onChain) {
      storeManagerId(owner, onChain);
      return onChain;
    }

    const fromServer = await findManagerFromServer(owner);
    if (fromServer) {
      storeManagerId(owner, fromServer);
      return fromServer;
    }

    if (i < 3) {
      await new Promise((r) => setTimeout(r, 1500));
    }
  }

  return null;
}
