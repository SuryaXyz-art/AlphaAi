import { useMemo, useState } from "react";
import { PageHeader } from "../components/ui/PageHeader";
import { ArrowUpRight, ArrowDownLeft, Ghost } from "lucide-react";
import { useActivity, type ActivityItem } from "../hooks/useActivity";
import { formatUSDC } from "../lib/tokens";

type FilterTab = "all" | "sent" | "received" | "nano";

function truncateAddress(addr: string) {
  if (!addr) return "";
  if (addr.length <= 12) return addr;
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

function formatTimeAgo(tsMs: number) {
  const diff = Math.max(0, Date.now() - tsMs);
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} min ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}d ago`;
  return new Date(tsMs).toLocaleString();
}

function matchesFilter(item: ActivityItem, tab: FilterTab) {
  if (tab === "all") return true;
  if (tab === "nano") return item.channel === "nanopayment";
  return item.type === tab;
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
        active
          ? "bg-white/10 border-white/20 text-white"
          : "bg-transparent border-[var(--glass-border)] text-[var(--text-tertiary)] hover:border-white/15"
      }`}
    >
      {children}
    </button>
  );
}

function SkeletonRow() {
  return (
    <div className="glass-panel p-4 flex items-center justify-between animate-pulse">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded-full bg-white/10" />
        <div className="min-w-0 space-y-2">
          <div className="h-3 w-44 bg-white/10 rounded" />
          <div className="h-3 w-28 bg-white/5 rounded" />
        </div>
      </div>
      <div className="text-right space-y-2">
        <div className="h-3 w-20 bg-white/10 rounded ml-auto" />
        <div className="h-3 w-16 bg-white/5 rounded ml-auto" />
      </div>
    </div>
  );
}

export function Activity() {
  const { items, isLoading, error } = useActivity();
  const [tab, setTab] = useState<FilterTab>("all");

  const filtered = useMemo(() => items.filter((i) => matchesFilter(i, tab)), [items, tab]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <PageHeader title="Activity" />
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <TabButton active={tab === "all"} onClick={() => setTab("all")}>
            All
          </TabButton>
          <TabButton active={tab === "sent"} onClick={() => setTab("sent")}>
            Sent
          </TabButton>
          <TabButton active={tab === "received"} onClick={() => setTab("received")}>
            Received
          </TabButton>
          <TabButton active={tab === "nano"} onClick={() => setTab("nano")}>
            Nano-Payments
          </TabButton>
        </div>
      </div>

      {error && (
        <div className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, idx) => (
            <SkeletonRow key={idx} />
          ))}
        </div>
      )}

      {/* Empty */}
      {!isLoading && filtered.length === 0 && (
        <div className="glass-panel p-10 flex flex-col items-center justify-center text-center">
          <img src="/ghost.svg" alt="" className="w-12 h-12 opacity-80 mb-3" />
          <div className="text-sm text-white font-medium">No payments yet</div>
          <div className="text-xs text-[var(--text-tertiary)] mt-1">
            Payments you send/receive on-chain or via nano-payments will show up here.
          </div>
        </div>
      )}

      {/* Rows */}
      {!isLoading && filtered.length > 0 && (
        <div className="space-y-3">
          {filtered.map((tx) => {
            const isSent = tx.type === "sent";
            const leftIcon = isSent ? (
              <ArrowUpRight size={20} className="text-red-400" />
            ) : (
              <ArrowDownLeft size={20} className="text-emerald-accent" />
            );

            const amountText = `${formatUSDC(tx.amount)} USDC`;

            return (
              <div key={tx.id} className="glass-panel p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`p-2 rounded-full ${
                      isSent ? "bg-red-400/10" : "bg-emerald-accent/10"
                    }`}
                  >
                    {leftIcon}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-[var(--text-primary)] font-medium font-mono text-xs">
                        {isSent ? truncateAddress(tx.to) : truncateAddress(tx.from)}
                      </p>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full border ${
                          tx.channel === "onchain"
                            ? "border-white/10 text-[var(--text-tertiary)] bg-white/[0.03]"
                            : "border-emerald-accent/25 text-emerald-accent bg-emerald-accent/5"
                        }`}
                      >
                        {tx.channel === "onchain" ? "On-Chain" : "⚡ Nano"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)] mt-1 min-w-0">
                      {tx.note ? (
                        <span className="truncate max-w-[360px]">{tx.note}</span>
                      ) : (
                        <span className="opacity-70">No memo</span>
                      )}
                      <span className="text-[var(--text-tertiary)]">•</span>
                      <span className="text-[var(--text-tertiary)] whitespace-nowrap">
                        {formatTimeAgo(tx.timestamp)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <p
                    className={`text-amount font-medium ${
                      isSent ? "text-red-400" : "text-emerald-accent"
                    }`}
                  >
                    {isSent ? "-" : "+"}
                    {amountText}
                  </p>

                  <div className="text-[10px] text-[var(--text-tertiary)] mt-1 flex items-center justify-end gap-1.5">
                    {tx.txHash && (
                      <a
                        href={`https://testnet.arcscan.app/tx/${tx.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-white transition-colors"
                      >
                        View tx
                      </a>
                    )}
                    {!tx.txHash && tx.channel === "nanopayment" && (
                      <span className="inline-flex items-center gap-1">
                        <Ghost size={12} className="opacity-60" />
                        Off-chain
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
