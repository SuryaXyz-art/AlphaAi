import { PageHeader } from "../components/ui/PageHeader";
import { StatusBadge } from "../components/ui/StatusBadge";
import { ArrowUpRight, ArrowDownLeft } from "lucide-react";

const mockTxs = [
  { id: 1, type: "receive", amount: "5.00", status: "confirmed", date: "Today, 10:23 AM" },
  { id: 2, type: "send", amount: "1.25", status: "confirmed", date: "Yesterday, 2:15 PM" },
];

export function Activity() {
  return (
    <div className="p-6 space-y-6">
      <PageHeader title="Activity" />
      
      <div className="space-y-3">
        {mockTxs.map((tx) => (
          <div key={tx.id} className="glass-panel p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${tx.type === 'receive' ? 'bg-emerald-accent/10 text-emerald-accent' : 'bg-white/10 text-white'}`}>
                {tx.type === 'receive' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
              </div>
              <div>
                <p className="text-[var(--text-primary)] font-medium capitalize">{tx.type}</p>
                <p className="text-[var(--text-secondary)] text-xs">{tx.date}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-amount font-medium text-[var(--text-primary)]">
                {tx.type === 'receive' ? '+' : '-'}{tx.amount} USDC
              </p>
              <StatusBadge status={tx.status as any} className="mt-1" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
