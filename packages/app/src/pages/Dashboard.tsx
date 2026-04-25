import { Link } from "react-router-dom";
import { BlankButton } from "../components/ui/BlankButton";
import { PageHeader } from "../components/ui/PageHeader";
import { Send, QrCode, History, Bot } from "lucide-react";

export function Dashboard() {
  return (
    <div className="p-6 space-y-6">
      <PageHeader title="Wallet" showBack={false} />
      
      <div className="glass-panel p-6 space-y-2 text-center">
        <p className="text-[var(--text-secondary)] text-sm">Total Balance</p>
        <h2 className="text-4xl text-amount text-white drop-shadow-[0_0_15px_rgba(52,211,153,0.3)]">
          0.00 USDC
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Link to="/app/pay">
          <BlankButton variant="secondary" className="w-full h-24 flex-col gap-2 !rounded-2xl">
            <Send size={24} className="text-emerald-accent" />
            <span>Send</span>
          </BlankButton>
        </Link>
        <Link to="/app/receive">
          <BlankButton variant="secondary" className="w-full h-24 flex-col gap-2 !rounded-2xl">
            <QrCode size={24} className="text-emerald-accent" />
            <span>Receive</span>
          </BlankButton>
        </Link>
        <Link to="/app/activity">
          <BlankButton variant="secondary" className="w-full h-24 flex-col gap-2 !rounded-2xl">
            <History size={24} className="text-emerald-accent" />
            <span>Activity</span>
          </BlankButton>
        </Link>
        <Link to="/app/agent">
          <BlankButton variant="secondary" className="w-full h-24 flex-col gap-2 !rounded-2xl border-emerald-accent/30 bg-emerald-accent/5 hover:bg-emerald-accent/10">
            <Bot size={24} className="text-emerald-accent" />
            <span>AI Agent</span>
          </BlankButton>
        </Link>
      </div>
    </div>
  );
}
