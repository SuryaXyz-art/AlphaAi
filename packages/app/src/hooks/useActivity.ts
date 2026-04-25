import { useEffect, useMemo, useState } from "react";
import { useAccount, usePublicClient } from "wagmi";
import type { Address, Hex } from "viem";
import { getAddress, parseAbiItem } from "viem";
import { CONTRACTS } from "../lib/contracts";
import { readNanoPaymentHistory } from "../lib/nanopayments";

export interface ActivityItem {
  id: string;
  type: "sent" | "received";
  channel: "onchain" | "nanopayment";
  from: Address;
  to: Address;
  amount: bigint; // 6-decimal USDC
  note: string;
  timestamp: number; // ms
  txHash?: string;
  gatewayRef?: string;
}

type UseActivityResult = {
  items: ActivityItem[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
};

const paymentSentEvent = parseAbiItem(
  "event PaymentSent(address indexed from, address indexed to, uint256 amount, string note, uint256 paymentId)"
);

function safeLowerAddress(addr?: string | null): string {
  try {
    return addr ? getAddress(addr as Address).toLowerCase() : "";
  } catch {
    return (addr || "").toLowerCase();
  }
}

export function useActivity(): UseActivityResult {
  const { address } = useAccount();
  const publicClient = usePublicClient();

  const [onchain, setOnchain] = useState<ActivityItem[]>([]);
  const [nano, setNano] = useState<ActivityItem[]>([]);
  const [isLoadingOnchain, setIsLoadingOnchain] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const refetch = () => setReloadKey((x) => x + 1);

  // Nano-payments: load from localStorage + keep in sync across tabs
  useEffect(() => {
    const load = () => {
      const wallet = safeLowerAddress(address);
      const raw = readNanoPaymentHistory();
      const items: ActivityItem[] = raw
        .map((p) => {
          const from = safeLowerAddress(p.from);
          const to = safeLowerAddress(p.to);
          const involved = wallet && (from === wallet || to === wallet);
          if (!involved) return null;
          const type: ActivityItem["type"] = from === wallet ? "sent" : "received";
          return {
            id: `nano:${p.reference}`,
            type,
            channel: "nanopayment",
            from: p.from,
            to: p.to,
            amount: BigInt(p.amount),
            note: p.note || "",
            timestamp: p.timestamp,
            gatewayRef: p.reference,
          } as ActivityItem;
        })
        .filter((x): x is ActivityItem => !!x);

      setNano(items);
    };

    load();
    window.addEventListener("storage", load);
    return () => window.removeEventListener("storage", load);
  }, [address, reloadKey]);

  // On-chain: fetch logs where from==address OR to==address, attach block timestamps
  useEffect(() => {
    let cancelled = false;

    async function run() {
      setError(null);
      if (!address || !publicClient) {
        setOnchain([]);
        return;
      }

      setIsLoadingOnchain(true);
      try {
        const wallet = getAddress(address);
        const hub = CONTRACTS.AlphaPaymentHub.proxy;

        const latestBlock = await publicClient.getBlockNumber();
        const fromBlock = latestBlock > 9999n ? latestBlock - 9999n : 0n;

        const [sentLogs, recvLogs] = await Promise.all([
          publicClient.getLogs({
            address: hub,
            event: paymentSentEvent,
            args: { from: wallet },
            fromBlock,
          }),
          publicClient.getLogs({
            address: hub,
            event: paymentSentEvent,
            args: { to: wallet },
            fromBlock,
          }),
        ]);

        const all = [...sentLogs, ...recvLogs];

        // Unique blocks → timestamps
        const uniqueBlocks = Array.from(
          new Set(all.map((l) => l.blockNumber).filter((b): b is bigint => typeof b === "bigint"))
        );
        const blockTs = new Map<bigint, number>();
        await Promise.all(
          uniqueBlocks.map(async (bn) => {
            try {
              const block = await publicClient.getBlock({ blockNumber: bn });
              blockTs.set(bn, Number(block.timestamp) * 1000);
            } catch {
              // ignore
            }
          })
        );

        // Dedup by txHash + logIndex (covers self-send appearing in both queries)
        const seen = new Set<string>();
        const items: ActivityItem[] = [];

        for (const log of all) {
          const key = `${log.transactionHash ?? "0x"}:${log.logIndex ?? -1}`;
          if (seen.has(key)) continue;
          seen.add(key);

          const from = (log.args as any)?.from as Address | undefined;
          const to = (log.args as any)?.to as Address | undefined;
          const amount = (log.args as any)?.amount as bigint | undefined;
          const note = ((log.args as any)?.note as string | undefined) || "";

          const type: ActivityItem["type"] =
            safeLowerAddress(from) === safeLowerAddress(wallet) ? "sent" : "received";

          const txHash = log.transactionHash as Hex | undefined;
          const ts = log.blockNumber ? blockTs.get(log.blockNumber) : undefined;

          items.push({
            id: `onchain:${txHash ?? key}`,
            type,
            channel: "onchain",
            from: from || "0x0000000000000000000000000000000000000000",
            to: to || "0x0000000000000000000000000000000000000000",
            amount: amount ?? 0n,
            note,
            timestamp: ts ?? Date.now(),
            txHash: txHash,
          });
        }

        if (!cancelled) setOnchain(items);
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "Failed to load on-chain activity");
      } finally {
        if (!cancelled) setIsLoadingOnchain(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [address, publicClient, reloadKey]);

  const items = useMemo(() => {
    const merged = [...onchain, ...nano];
    merged.sort((a, b) => b.timestamp - a.timestamp);
    return merged;
  }, [onchain, nano]);

  return {
    items,
    isLoading: isLoadingOnchain && items.length === 0,
    error,
    refetch,
  };
}

