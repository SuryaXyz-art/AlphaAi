import { useState, useRef, useEffect, useCallback } from "react";
import { useAccount, useWalletClient } from "wagmi";
import { motion, AnimatePresence } from "framer-motion";
import { PageHeader } from "../components/ui/PageHeader";
import { BlankButton } from "../components/ui/BlankButton";
import { BlankInput } from "../components/ui/BlankInput";
import { StatusBadge } from "../components/ui/StatusBadge";
import { formatUSDC } from "../lib/tokens";
import { generateNonce, buildPaymentAuthorization } from "../lib/nanopayments";
import {
  DEFAULT_SERVICES,
  callMockAgent,
  type MockService,
} from "../lib/mock-agent-service";
import {
  Bot,
  Zap,
  Play,
  Pause,
  Square,
  DollarSign,
  Cpu,
  Sparkles,
  RotateCcw,
} from "lucide-react";

// ── Types ────────────────────────────────────────────────────────

type AgentStatus = "confirmed" | "pending" | "active" | "claimed";

interface FeedEvent {
  id: string;
  timestamp: Date;
  type: "payment" | "response" | "budget" | "error" | "info";
  message: string;
  amount?: number; // raw 6-decimal
}

// ── Main Component ───────────────────────────────────────────────

export function AgentDemo() {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();

  // Agent control state
  const [agentName, setAgentName] = useState("ResearchBot-1");
  const [budgetInput, setBudgetInput] = useState("0.01");
  const [status, setStatus] = useState<AgentStatus>("confirmed");
  const [remainingBudget, setRemainingBudget] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);

  // Service state
  const [services] = useState<MockService[]>(DEFAULT_SERVICES);
  const [selectedService, setSelectedService] = useState<MockService | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Feed state
  const [feed, setFeed] = useState<FeedEvent[]>([]);
  const feedRef = useRef<HTMLDivElement>(null);

  // Auto-scroll feed
  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [feed]);

  const addEvent = useCallback((event: Omit<FeedEvent, "id" | "timestamp">) => {
    setFeed((prev) => [
      ...prev,
      { ...event, id: crypto.randomUUID(), timestamp: new Date() },
    ]);
  }, []);

  const resetDemo = () => {
    setFeed([]);
  };

  // ── Start Agent Session ──────────────────────────────────────

  const startSession = () => {
    const budget = parseFloat(budgetInput) * 1_000_000; // to 6-decimal
    if (budget <= 0) return;

    setRemainingBudget(budget);
    setTotalSpent(0);
    setFeed([]);
    setStatus("active");
    setSelectedService(null);

    addEvent({
      type: "info",
      message: `🤖 ${agentName} initialized with $${budgetInput} USDC budget`,
    });
    addEvent({
      type: "info",
      message: `📡 Connected to Arc Testnet — scanning for available AI services...`,
    });
  };

  const pauseSession = () => {
    setStatus("pending");
    addEvent({ type: "info", message: `⏸️ ${agentName} paused` });
  };

  const resumeSession = () => {
    setStatus("active");
    addEvent({ type: "info", message: `▶️ ${agentName} resumed` });
  };

  const stopSession = () => {
    setStatus("claimed");
    addEvent({
      type: "info",
      message: `🏁 ${agentName} session ended. Total spent: $${formatUSDC(BigInt(totalSpent))} USDC`,
    });
  };

  // ── Hire Agent (execute nano-payment + get response) ─────────

  const hireAgent = async (service: MockService) => {
    if (status !== "active" || isProcessing) return;
    if (remainingBudget < service.pricePerCall) {
      addEvent({
        type: "error",
        message: `❌ Insufficient budget for ${service.name} ($${formatUSDC(BigInt(service.pricePerCall))}/call)`,
      });
      return;
    }

    setIsProcessing(true);
    setSelectedService(service);

    // Step 1: Hit endpoint (get 402)
    addEvent({
      type: "info",
      message: `📤 ${agentName} → ${service.name}: Requesting service...`,
    });

    const res402 = await callMockAgent(service, false);
    if (res402.status === 402) {
      addEvent({
        type: "info",
        message: `💳 Received 402 — signing nano-payment of $${formatUSDC(BigInt(service.pricePerCall))} USDC`,
      });
    }

    // Step 2: Sign EIP-3009 authorization
    try {
      if (walletClient && address) {
        const nonce = generateNonce();
        const now = BigInt(Math.floor(Date.now() / 1000));
        const typedData = buildPaymentAuthorization({
          from: address,
          to: res402.paymentRequired?.recipient || address,
          value: BigInt(service.pricePerCall),
          validAfter: now - 60n,
          validBefore: now + 300n,
          nonce,
        });

        // Sign — this is a real wallet signature
        await walletClient.signTypedData({
          account: address,
          domain: typedData.domain,
          types: typedData.types,
          primaryType: typedData.primaryType,
          message: typedData.message,
        });
      }

      // Step 3: Execute payment
      addEvent({
        type: "payment",
        message: `⚡ ${agentName} → ${service.name}: $${formatUSDC(BigInt(service.pricePerCall))} USDC (nano-payment, gas-free)`,
        amount: service.pricePerCall,
      });

      // Step 4: Get response
      const res200 = await callMockAgent(service, true);
      if (res200.data) {
        addEvent({
          type: "response",
          message: `✅ Response from ${service.name}: "${res200.data.result}"`,
        });
        addEvent({
          type: "info",
          message: `📊 Model: ${res200.data.model} | Tokens: ${res200.data.tokens} | Latency: ${res200.data.latencyMs}ms`,
        });
      }

      // Update budget
      const newRemaining = remainingBudget - service.pricePerCall;
      const newSpent = totalSpent + service.pricePerCall;
      setRemainingBudget(newRemaining);
      setTotalSpent(newSpent);

      addEvent({
        type: "budget",
        message: `💰 Budget remaining: $${formatUSDC(BigInt(Math.max(0, newRemaining)))} USDC`,
      });

      // Auto-stop if budget depleted
      if (newRemaining <= 0) {
        setStatus("claimed");
        addEvent({
          type: "info",
          message: `🏁 Budget depleted — ${agentName} session complete`,
        });
      }
    } catch (err: any) {
      addEvent({
        type: "error",
        message: `❌ Payment failed: ${err.message || "User rejected signature"}`,
      });
    }

    setIsProcessing(false);
    setSelectedService(null);
  };

  // ── Render ────────────────────────────────────────────────────

  return (
    <div className="p-6 space-y-6">
      <PageHeader title="AI Agent Demo" subtitle="Autonomous nano-payments between AI agents" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* ──── Left Panel: Agent Control ──────────────────────── */}
        <div className="glass-panel p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Bot size={16} className="text-emerald-accent" />
              Agent Control
            </h3>
            <StatusBadge status={status} />
          </div>

          <BlankInput
            label="Agent Name"
            value={agentName}
            onChange={(e) => setAgentName(e.target.value)}
            placeholder="MyBot-1"
            disabled={status === "active"}
          />

          <BlankInput
            label="USDC Budget"
            value={budgetInput}
            onChange={(e) => setBudgetInput(e.target.value)}
            placeholder="0.01"
            type="number"
            disabled={status === "active"}
            hint="Recommended: 0.01 USDC for demo"
          />

          {/* Session Controls */}
          {status === "confirmed" || status === "claimed" ? (
            <BlankButton
              size="full"
              onClick={startSession}
              disabled={!isConnected}
              icon={<Play size={16} />}
              className="glow-emerald"
            >
              Start Agent Session
            </BlankButton>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {status === "active" ? (
                <BlankButton
                  variant="secondary"
                  size="sm"
                  onClick={pauseSession}
                  icon={<Pause size={14} />}
                >
                  Pause
                </BlankButton>
              ) : (
                <BlankButton
                  variant="secondary"
                  size="sm"
                  onClick={resumeSession}
                  icon={<Play size={14} />}
                >
                  Resume
                </BlankButton>
              )}
              <BlankButton
                variant="ghost"
                size="sm"
                onClick={stopSession}
                icon={<Square size={14} />}
              >
                Stop
              </BlankButton>
            </div>
          )}

          {/* Budget Display */}
          {(status === "active" || status === "pending") && (
            <div className="bg-black/40 rounded-xl p-4 space-y-2 border border-[var(--glass-border)]">
              <div className="flex justify-between text-xs">
                <span className="text-[var(--text-tertiary)]">Remaining</span>
                <span className="text-amount text-emerald-accent">
                  ${formatUSDC(BigInt(Math.max(0, remainingBudget)))}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-[var(--text-tertiary)]">Spent</span>
                <span className="text-amount text-white">
                  ${formatUSDC(BigInt(totalSpent))}
                </span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-1.5 mt-1">
                <div
                  className="bg-emerald-accent rounded-full h-1.5 transition-all duration-500"
                  style={{
                    width: `${Math.max(0, Math.min(100, (remainingBudget / (parseFloat(budgetInput) * 1_000_000)) * 100))}%`,
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* ──── Center Panel: Available Services ──────────────── */}
        <div className="glass-panel p-5 space-y-4">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Cpu size={16} className="text-emerald-accent" />
            Available Services
          </h3>

          <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
            {services.map((service) => (
              <div
                key={service.id}
                className={`p-3 rounded-xl border transition-all ${
                  selectedService?.id === service.id
                    ? "border-emerald-accent/40 bg-emerald-accent/5"
                    : "border-[var(--glass-border)] bg-black/20 hover:border-white/15"
                }`}
              >
                <div className="flex items-start justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <Sparkles size={14} className="text-emerald-accent shrink-0" />
                    <span className="text-sm font-medium text-white">
                      {service.name}
                    </span>
                  </div>
                  <span className="text-amount text-xs text-emerald-accent flex items-center gap-1 shrink-0">
                    <Zap size={10} />$
                    {formatUSDC(BigInt(service.pricePerCall))}
                  </span>
                </div>
                <p className="text-[10px] text-[var(--text-tertiary)] mb-2 leading-relaxed">
                  {service.description}
                </p>
                <BlankButton
                  variant="secondary"
                  size="sm"
                  className="w-full !h-8 !text-xs"
                  onClick={() => hireAgent(service)}
                  loading={isProcessing && selectedService?.id === service.id}
                  disabled={
                    status !== "active" ||
                    isProcessing ||
                    remainingBudget < service.pricePerCall
                  }
                >
                  Hire This Agent
                </BlankButton>
              </div>
            ))}
          </div>
        </div>

        {/* ──── Right Panel: Live Payment Feed ────────────────── */}
        <div className="glass-panel p-5 space-y-4 flex flex-col">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <DollarSign size={16} className="text-emerald-accent" />
              Live Payment Feed
            </h3>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={resetDemo}
                className="text-[10px] px-2 py-1 rounded-lg border border-white/10 bg-white/[0.03] text-[var(--text-secondary)] hover:text-white hover:bg-white/[0.06] transition-colors inline-flex items-center gap-1.5"
                title="Clear the demo feed"
              >
                <RotateCcw size={12} />
                Reset Demo
              </button>
              {status === "active" && (
                <div className="flex items-center gap-1.5 text-[10px] text-emerald-accent">
                  <div className="w-2 h-2 rounded-full bg-emerald-accent animate-pulse" />
                  LIVE
                </div>
              )}
            </div>
          </div>

          <div
            ref={feedRef}
            className="flex-1 min-h-[200px] max-h-[380px] overflow-y-auto space-y-1.5 pr-1"
          >
            {feed.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <Bot size={32} className="text-[var(--text-tertiary)] mb-3" />
                <p className="text-xs text-[var(--text-tertiary)]">
                  Start an agent session and hire a service to see live payment events.
                </p>
              </div>
            ) : (
              <AnimatePresence initial={false}>
                {feed.map((event) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: 20, height: 0 }}
                    animate={{ opacity: 1, x: 0, height: "auto" }}
                    transition={{ duration: 0.3 }}
                    className={`text-[11px] leading-relaxed px-3 py-2 rounded-lg border ${
                      event.type === "payment"
                        ? "bg-emerald-accent/5 border-emerald-accent/15 text-emerald-accent"
                        : event.type === "response"
                          ? "bg-blue-500/5 border-blue-500/15 text-blue-300"
                          : event.type === "error"
                            ? "bg-red-500/5 border-red-500/15 text-red-400"
                            : event.type === "budget"
                              ? "bg-yellow-500/5 border-yellow-500/15 text-yellow-400"
                              : "bg-white/[0.02] border-white/5 text-[var(--text-secondary)]"
                    }`}
                  >
                    <span className="text-[9px] text-[var(--text-tertiary)] mr-2">
                      {event.timestamp.toLocaleTimeString()}
                    </span>
                    {event.message}
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>

          {/* Total Spent Footer */}
          {totalSpent > 0 && (
            <div className="border-t border-[var(--glass-border)] pt-3 flex justify-between items-center text-xs">
              <span className="text-[var(--text-tertiary)]">Total Spent</span>
              <span className="text-amount text-white text-sm">
                ${formatUSDC(BigInt(totalSpent))} USDC
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
