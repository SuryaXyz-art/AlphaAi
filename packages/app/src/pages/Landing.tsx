import { Link } from "react-router-dom";
import { BlankButton } from "../components/ui/BlankButton";
import { motion } from "framer-motion";
import { ArrowRight, ExternalLink, Zap, Bot, Link2, Layers, Wallet } from "lucide-react";
import { useReadContract } from "wagmi";
import { CONTRACTS, ALPHA_PAYMENT_HUB_ABI, ALPHA_AGENT_REGISTRY_ABI } from "../lib/contracts";

const Github = ({ size = 24, className = "" }: { size?: number; className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

export function Landing() {
  const { data: paymentsCount } = useReadContract({
    address: CONTRACTS.AlphaPaymentHub.proxy,
    abi: ALPHA_PAYMENT_HUB_ABI,
    functionName: "getPaymentsCount",
    query: { staleTime: 15_000 },
  });

  const { data: agents } = useReadContract({
    address: CONTRACTS.AlphaAgentRegistry.address,
    abi: ALPHA_AGENT_REGISTRY_ABI,
    functionName: "getAgents",
    query: { staleTime: 15_000 },
  });

  const agentCount = Array.isArray(agents) ? agents.length : 0;

  return (
    <div className="min-h-screen bg-void-900 text-white relative overflow-hidden">
      {/* Background: subtle grid + glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 opacity-[0.12] [background-image:linear-gradient(to_right,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:64px_64px]" />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2 }}
          className="absolute -top-24 left-1/2 -translate-x-1/2 w-[680px] h-[680px] bg-emerald-accent/15 blur-3xl rounded-full"
        />
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 16 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-white/30"
            style={{
              left: `${(i * 13) % 100}%`,
              top: `${(i * 17) % 100}%`,
            }}
            animate={{ y: [0, -14, 0], opacity: [0.25, 0.65, 0.25] }}
            transition={{ duration: 5 + (i % 5), repeat: Infinity, ease: "easeInOut" }}
          />
        ))}
      </div>

      <div className="relative">
        {/* Hero */}
        <section className="px-6 pt-16 pb-10 max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-panel text-xs text-emerald-accent border-emerald-accent/20 bg-emerald-accent/5 mb-6">
              <Zap size={14} />
              Arc × Circle Nano-Payments Hackathon
            </div>

            <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-[1.05]">
              AI Payments at Human Speed
            </h1>

            <p className="text-[var(--text-secondary)] text-lg md:text-xl mt-5 max-w-2xl">
              Gas-free USDC nano-payments on Arc — down to{" "}
              <span className="text-white font-mono">$0.000001</span> per transaction
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link to="/app" className="sm:w-auto">
                <BlankButton size="lg" className="w-full sm:w-auto">
                  Launch App <ArrowRight size={16} />
                </BlankButton>
              </Link>
              <Link to="/app/agent" className="sm:w-auto">
                <BlankButton variant="secondary" size="lg" className="w-full sm:w-auto">
                  View Demo <ExternalLink size={16} />
                </BlankButton>
              </Link>
            </div>
          </motion.div>
        </section>

        {/* Features */}
        <section className="px-6 py-10 max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass-panel p-6">
              <div className="w-10 h-10 rounded-xl bg-emerald-accent/10 border border-emerald-accent/20 flex items-center justify-center mb-4">
                <Zap className="text-emerald-accent" size={18} />
              </div>
              <h3 className="font-semibold text-white mb-1">Gas-Free</h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                Circle Gateway batches thousands of payments, zero per-tx fees.
              </p>
            </div>

            <div className="glass-panel p-6">
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                <Bot className="text-white" size={18} />
              </div>
              <h3 className="font-semibold text-white mb-1">Agent-Native</h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                AI agents pay autonomously for compute, data, and services.
              </p>
            </div>

            <div className="glass-panel p-6">
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                <Link2 className="text-white" size={18} />
              </div>
              <h3 className="font-semibold text-white mb-1">Built on Arc</h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                Deterministic finality, native USDC gas, post-quantum security.
              </p>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="px-6 py-10 max-w-6xl mx-auto">
          <div className="flex items-end justify-between gap-4 mb-4">
            <div>
              <h2 className="text-2xl font-semibold">How It Works</h2>
              <p className="text-sm text-[var(--text-secondary)] mt-1">
                Nano-payments without the usual on-chain friction.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                n: 1,
                title: "Connect wallet to Arc Testnet",
                icon: <Wallet size={16} className="text-emerald-accent" />,
                body: "Connect MetaMask / WalletConnect and you’re ready to transact.",
              },
              {
                n: 2,
                title: "Deposit USDC",
                icon: <Layers size={16} className="text-emerald-accent" />,
                body: "Get testnet USDC from faucet.circle.com and fund your wallet.",
              },
              {
                n: 3,
                title: "Send or receive nano-payments — agents too",
                icon: <Bot size={16} className="text-emerald-accent" />,
                body: "Pay humans or agents; memos and history stay readable.",
              },
              {
                n: 4,
                title: "Gateway settles in bulk, no gas stress",
                icon: <Zap size={16} className="text-emerald-accent" />,
                body: "Off-chain authorizations settle in batches for near-zero friction.",
              },
            ].map((s) => (
              <div key={s.n} className="glass-panel p-5 flex gap-4">
                <div className="shrink-0">
                  <div className="w-10 h-10 rounded-xl bg-emerald-accent/10 border border-emerald-accent/15 flex items-center justify-center">
                    <span className="text-emerald-accent font-mono text-sm">{s.n}</span>
                  </div>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    {s.icon}
                    <h3 className="text-sm font-semibold text-white">{s.title}</h3>
                  </div>
                  <p className="text-sm text-[var(--text-secondary)] mt-1 leading-relaxed">
                    {s.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Live stats */}
        <section className="px-6 py-10 max-w-6xl mx-auto">
          <div className="glass-panel p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-accent/10 border border-emerald-accent/20 flex items-center justify-center">
                <Zap size={18} className="text-emerald-accent" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white">Live Stats</div>
                <div className="text-xs text-[var(--text-tertiary)]">
                  Pulled from Arc Testnet contracts
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 w-full md:w-auto">
              <div className="rounded-xl border border-white/10 bg-black/20 px-4 py-3">
                <div className="text-[10px] text-[var(--text-tertiary)]">Total payments sent</div>
                <div className="text-xl font-mono text-white mt-1">
                  {paymentsCount !== undefined ? String(paymentsCount) : "—"}
                </div>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/20 px-4 py-3">
                <div className="text-[10px] text-[var(--text-tertiary)]">Agents registered</div>
                <div className="text-xl font-mono text-white mt-1">{agentCount}</div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="px-6 py-12 max-w-6xl mx-auto">
          <div className="glass-panel p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="text-sm font-semibold text-white">AlphaAi</div>
              <div className="text-xs text-[var(--text-secondary)] mt-1">
                Built for Arc × Circle Nano-Payments Hackathon
              </div>
            </div>

            <div className="flex flex-wrap gap-3 text-xs">
              <a
                href="https://github.com/SuryaXyz-art/AlphaAi"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[var(--text-secondary)] hover:text-white transition-colors"
              >
                <Github size={14} />
                GitHub
              </a>
              <a
                href="https://docs.arc.network"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[var(--text-secondary)] hover:text-white transition-colors"
              >
                Arc Docs <ExternalLink size={12} />
              </a>
              <a
                href="https://developers.circle.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[var(--text-secondary)] hover:text-white transition-colors"
              >
                Circle Docs <ExternalLink size={12} />
              </a>
              <a
                href="https://github.com/SuryaXyz-art/AlphaAi"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[var(--text-secondary)] hover:text-white transition-colors"
              >
                Hackathon <ExternalLink size={12} />
              </a>
            </div>
          </div>
          <div className="text-center text-[10px] text-[var(--text-tertiary)] mt-6">
            Gas-free nano-payments for humans and agents.
          </div>
        </footer>
      </div>
    </div>
  );
}
