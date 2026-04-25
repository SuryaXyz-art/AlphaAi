import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { WalletButton } from "./WalletButton";
import { Send, QrCode, History, Bot, LayoutDashboard } from "lucide-react";
import { cn } from "../lib/cn";
import { useConnect } from "wagmi";
import { subscribeToToasts } from "../lib/toast";

export function Layout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const { isPending } = useConnect();
  const [toastState, setToastState] = useState<{
    message: string;
    tone: "success" | "error" | "info";
    id: number;
  } | null>(null);

  const toastStyles = useMemo(() => {
    if (!toastState) return "";
    if (toastState.tone === "success")
      return "border-emerald-accent/25 bg-emerald-accent/10 text-emerald-accent";
    if (toastState.tone === "error")
      return "border-red-500/25 bg-red-500/10 text-red-300";
    return "border-white/10 bg-white/[0.06] text-white";
  }, [toastState]);

  useEffect(() => {
    return subscribeToToasts((d) => {
      setToastState({
        message: d.message,
        tone: d.tone || "info",
        id: Date.now(),
      });
    });
  }, []);

  useEffect(() => {
    if (!toastState) return;
    const t = window.setTimeout(() => setToastState(null), 2500);
    return () => window.clearTimeout(t);
  }, [toastState]);

  const navItems = [
    { name: "Dashboard", path: "/app", icon: <LayoutDashboard size={20} /> },
    { name: "Pay", path: "/app/pay", icon: <Send size={20} /> },
    { name: "Receive", path: "/app/receive", icon: <QrCode size={20} /> },
    { name: "Activity", path: "/app/activity", icon: <History size={20} /> },
    { name: "AI Agent", path: "/app/agent", icon: <Bot size={20} /> },
  ];

  return (
    <div className="flex min-h-screen bg-void-900 text-[var(--text-primary)]">
      {/* Toast */}
      {toastState && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[60] px-4">
          <div
            key={toastState.id}
            className={`glass-panel px-4 py-2 text-xs border ${toastStyles}`}
          >
            {toastState.message}
          </div>
        </div>
      )}

      {/* Wallet connect loading overlay */}
      {isPending && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="glass-panel p-6 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full border-2 border-emerald-accent border-t-transparent animate-spin" />
            <div className="space-y-0.5">
              <div className="text-sm font-semibold text-white">Connecting wallet…</div>
              <div className="text-xs text-[var(--text-tertiary)]">
                Confirm the request in your wallet
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside className="w-64 border-r border-[var(--glass-border)] bg-[var(--glass-bg)] flex-col hidden md:flex sticky top-0 h-screen">
        <div className="p-6">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-accent/20 flex items-center justify-center glow-emerald">
              <span className="text-emerald-accent font-bold text-xl leading-none">A</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-white glow-emerald">AlphaAi</span>
          </Link>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/app' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm",
                  isActive 
                    ? "bg-emerald-accent/10 text-emerald-accent border border-emerald-accent/20" 
                    : "text-[var(--text-secondary)] hover:bg-white/5 hover:text-white border border-transparent"
                )}
              >
                {item.icon}
                {item.name}
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-[var(--glass-border)]">
          <div className="text-xs text-[var(--text-tertiary)] text-center flex items-center justify-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-accent"></div>
            Arc Testnet
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col relative w-full md:border-none border-x border-[var(--glass-border)] max-w-4xl mx-auto md:mx-0 md:max-w-none">
        {/* Top bar */}
        <header className="h-20 border-b border-[var(--glass-border)] bg-void-900/80 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-10">
          <div className="md:hidden">
             <Link to="/app" className="text-lg font-bold tracking-tight text-white glow-emerald">AlphaAi</Link>
          </div>
          <div className="hidden md:block"></div>
          <WalletButton />
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto max-w-3xl w-full mx-auto pb-24 md:pb-0">
          {children}
        </main>

        {/* Mobile bottom tab bar */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-20 bg-void-900/80 backdrop-blur-md border-t border-[var(--glass-border)]">
          <div className="max-w-3xl mx-auto px-3 py-2">
            <div className="grid grid-cols-5 gap-2">
              {navItems.map((item) => {
                const isActive =
                  location.pathname === item.path ||
                  (item.path !== "/app" && location.pathname.startsWith(item.path));
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      "flex flex-col items-center justify-center gap-1 rounded-xl py-2 transition-all border",
                      isActive
                        ? "bg-emerald-accent/10 text-emerald-accent border-emerald-accent/20"
                        : "bg-transparent text-[var(--text-tertiary)] border-transparent hover:bg-white/5 hover:text-white"
                    )}
                  >
                    {item.icon}
                    <span className="text-[10px] font-medium leading-none">{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>
      </div>
    </div>
  );
}
