import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { useAccount, useWalletClient } from "wagmi";
import { type Address } from "viem";
import { motion, AnimatePresence } from "framer-motion";
import { PageHeader } from "../components/ui/PageHeader";
import { BlankButton } from "../components/ui/BlankButton";
import { BlankInput } from "../components/ui/BlankInput";
import { NumericKeypad } from "../components/ui/NumericKeypad";
import { parseUSDC, formatUSDC } from "../lib/tokens";
import { sendNanoPayment, sendOnChainTransfer } from "../lib/nanopayments";
import { Zap, ArrowUpRight, CheckCircle2, ExternalLink, Copy } from "lucide-react";

type PaymentMode = "standard" | "nano";

export function Pay() {
  const [searchParams] = useSearchParams();
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();

  const [amount, setAmount] = useState(searchParams.get("amount") || "");
  const [toAddress, setToAddress] = useState(searchParams.get("to") || "");
  const [note, setNote] = useState(searchParams.get("note") || "");
  const [mode, setMode] = useState<PaymentMode>("standard");
  const [isSending, setIsSending] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    reference?: string;
    error?: string;
  } | null>(null);

  // Auto-select nano-payment for sub-cent amounts
  const numericAmount = parseFloat(amount || "0");
  const isSubCent = numericAmount > 0 && numericAmount < 0.01;

  useEffect(() => {
    if (isSubCent) {
      setMode("nano");
    }
  }, [isSubCent]);

  const handleKey = useCallback(
    (key: string) => {
      setAmount((prev) => {
        if (key === "." && prev.includes(".")) return prev;
        if (prev === "0" && key !== ".") return key;
        // Limit to 6 decimal places
        const parts = (prev + key).split(".");
        if (parts[1] && parts[1].length > 6) return prev;
        return prev + key;
      });
    },
    []
  );

  const handleBackspace = useCallback(() => {
    setAmount((prev) => prev.slice(0, -1));
  }, []);

  const handleSend = async () => {
    if (!walletClient || !address || !toAddress || numericAmount <= 0) return;

    setIsSending(true);
    setResult(null);

    try {
      const parsedAmount = parseUSDC(amount);

      if (mode === "nano") {
        const res = await sendNanoPayment({
          walletClient,
          sellerEndpoint: `https://api.gateway.circle.com/v1/pay`,
          amount: parsedAmount,
          from: address,
          gatewayTo: toAddress as Address,
          note,
        });
        setResult(res);
      } else {
        const res = await sendOnChainTransfer({
          walletClient,
          to: toAddress as Address,
          amount: parsedAmount,
          from: address,
        });
        setResult(res);
      }
    } catch (err: any) {
      setResult({ success: false, error: err.message });
    } finally {
      setIsSending(false);
    }
  };

  // ── Success Screen ──────────────────────────────────────────────
  if (result?.success) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[70vh]">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="flex flex-col items-center gap-6 text-center"
        >
          <div className="w-20 h-20 rounded-full bg-emerald-accent/20 flex items-center justify-center glow-emerald">
            <CheckCircle2 size={40} className="text-emerald-accent" />
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-white">Payment Sent!</h2>
            <p className="text-[var(--text-secondary)] text-sm">
              {mode === "nano" ? "Gas-free via Circle Gateway" : "On-chain transfer"}
            </p>
          </div>

          <div className="glass-panel p-6 w-full max-w-sm space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-[var(--text-tertiary)]">Amount</span>
              <span className="text-amount text-white">
                {formatUSDC(parseUSDC(amount))} USDC
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[var(--text-tertiary)]">To</span>
              <span className="font-mono text-xs text-white">
                {toAddress.slice(0, 6)}...{toAddress.slice(-4)}
              </span>
            </div>
            {result.reference && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-[var(--text-tertiary)]">Reference</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-xs text-white truncate max-w-[140px]">
                    {result.reference.slice(0, 10)}...
                  </span>
                  <button
                    onClick={() => navigator.clipboard.writeText(result.reference!)}
                    className="text-[var(--text-tertiary)] hover:text-white transition-colors"
                  >
                    <Copy size={12} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {mode === "standard" && result.reference && (
            <a
              href={`https://testnet.arcscan.app/tx/${result.reference}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-accent text-sm flex items-center gap-1 hover:underline"
            >
              View on ArcScan <ExternalLink size={12} />
            </a>
          )}

          <BlankButton
            variant="secondary"
            className="mt-4"
            onClick={() => {
              setResult(null);
              setAmount("");
              setToAddress("");
              setNote("");
            }}
          >
            Send Another
          </BlankButton>
        </motion.div>
      </div>
    );
  }

  // ── Main Pay Form ────────────────────────────────────────────────
  return (
    <div className="p-6 space-y-6">
      <PageHeader title="Send Payment" />

      {/* Amount Display */}
      <div className="text-center py-4">
        <div className="text-5xl font-mono font-medium text-white tracking-tight min-h-[60px] flex items-center justify-center">
          <span className="text-[var(--text-tertiary)] text-3xl mr-2">$</span>
          {amount || "0"}
        </div>
        <p className="text-[var(--text-tertiary)] text-sm mt-2">USDC</p>
      </div>

      {/* Numeric Keypad */}
      <NumericKeypad onKey={handleKey} onBackspace={handleBackspace} />

      {/* Recipient & Note */}
      <div className="space-y-3 pt-2">
        <BlankInput
          label="To"
          placeholder="0x..."
          value={toAddress}
          onChange={(e) => setToAddress(e.target.value)}
        />
        <BlankInput
          label="Note (optional)"
          placeholder="What's this for?"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>

      {/* Payment Type Toggle */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-[var(--text-secondary)]">
          Payment Type
        </label>

        {isSubCent && (
          <div className="flex items-center gap-2 text-xs text-yellow-500 bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-3 py-2">
            <Zap size={14} />
            Sub-cent amount — nano-payment only
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => !isSubCent && setMode("standard")}
            disabled={isSubCent}
            className={`px-4 py-3 rounded-xl text-sm font-medium transition-all border ${
              mode === "standard"
                ? "bg-white/10 border-white/20 text-white"
                : "bg-transparent border-[var(--glass-border)] text-[var(--text-tertiary)] hover:border-white/15"
            } ${isSubCent ? "opacity-40 cursor-not-allowed" : ""}`}
          >
            <ArrowUpRight size={16} className="inline mr-1.5" />
            Standard
          </button>
          <button
            onClick={() => setMode("nano")}
            className={`px-4 py-3 rounded-xl text-sm font-medium transition-all border ${
              mode === "nano"
                ? "bg-emerald-accent/10 border-emerald-accent/30 text-emerald-accent"
                : "bg-transparent border-[var(--glass-border)] text-[var(--text-tertiary)] hover:border-emerald-accent/20"
            }`}
          >
            <Zap size={16} className="inline mr-1.5" />
            Nano-Payment
          </button>
        </div>

        <AnimatePresence>
          {mode === "nano" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="flex items-center gap-2 text-xs text-emerald-accent bg-emerald-accent/5 border border-emerald-accent/15 rounded-lg px-3 py-2 mt-1">
                <Zap size={14} />
                Gas-Free via Circle Gateway (x402)
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Error message */}
      {result?.error && (
        <div className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
          {result.error}
        </div>
      )}

      {/* Send Button */}
      <BlankButton
        size="full"
        onClick={handleSend}
        loading={isSending}
        disabled={!isConnected || !toAddress || numericAmount <= 0}
        className="glow-emerald hover:shadow-[0_0_60px_rgba(52,211,153,0.2)] transition-shadow"
      >
        {isSending
          ? "Signing..."
          : mode === "nano"
            ? `Send ${amount || "0"} USDC (Gas-Free)`
            : `Send ${amount || "0"} USDC`}
      </BlankButton>
    </div>
  );
}
