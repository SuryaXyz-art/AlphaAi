import { useState, useMemo } from "react";
import { useAccount } from "wagmi";
import { QRCodeSVG } from "qrcode.react";
import { PageHeader } from "../components/ui/PageHeader";
import { BlankButton } from "../components/ui/BlankButton";
import { BlankInput } from "../components/ui/BlankInput";
import { Copy, Check, Link as LinkIcon, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";

export function Receive() {
  const { address, isConnected } = useAccount();
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [requestAmount, setRequestAmount] = useState("");
  const [requestNote, setRequestNote] = useState("");

  const displayAddress = address || "0x0000000000000000000000000000000000000000";

  const handleCopy = async () => {
    await navigator.clipboard.writeText(displayAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const requestLink = useMemo(() => {
    const base = `${window.location.origin}/app/pay?to=${displayAddress}`;
    const params: string[] = [];
    if (requestAmount) params.push(`amount=${requestAmount}`);
    if (requestNote) params.push(`note=${encodeURIComponent(requestNote)}`);
    return params.length > 0 ? `${base}&${params.join("&")}` : base;
  }, [displayAddress, requestAmount, requestNote]);

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(requestLink);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  return (
    <div className="p-6 space-y-6">
      <PageHeader title="Receive" />

      {/* QR Code Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel p-8 flex flex-col items-center space-y-6"
      >
        <div className="p-4 bg-white rounded-2xl">
          <QRCodeSVG
            value={displayAddress}
            size={180}
            bgColor="#ffffff"
            fgColor="#000000"
            level="M"
            includeMargin={false}
          />
        </div>

        <p className="text-[var(--text-secondary)] text-sm text-center">
          {isConnected
            ? "Scan this QR code to receive nano-payments on Arc Testnet."
            : "Connect your wallet to see your address."}
        </p>

        <div className="w-full flex items-center gap-2 bg-black/40 rounded-xl px-4 py-3 border border-[var(--glass-border)]">
          <span className="font-mono text-xs text-[var(--text-primary)] flex-1 truncate">
            {displayAddress}
          </span>
          <button
            onClick={handleCopy}
            className="shrink-0 text-[var(--text-tertiary)] hover:text-emerald-accent transition-colors"
            title="Copy address"
          >
            {copied ? (
              <Check size={16} className="text-emerald-accent" />
            ) : (
              <Copy size={16} />
            )}
          </button>
        </div>
      </motion.div>

      {/* Request Payment Link Generator */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-panel p-6 space-y-4"
      >
        <div className="flex items-center gap-2">
          <LinkIcon size={18} className="text-emerald-accent" />
          <h3 className="text-sm font-semibold text-white">
            Request Nano-Payment
          </h3>
        </div>

        <p className="text-xs text-[var(--text-tertiary)]">
          Generate a shareable link that pre-fills your address and amount.
        </p>

        <div className="space-y-3">
          <BlankInput
            label="Amount (USDC)"
            placeholder="0.00"
            type="number"
            value={requestAmount}
            onChange={(e) => setRequestAmount(e.target.value)}
            hint="Leave empty for any amount"
          />
          <BlankInput
            label="Note"
            placeholder="Coffee ☕"
            value={requestNote}
            onChange={(e) => setRequestNote(e.target.value)}
          />
        </div>

        {/* Generated Link Preview */}
        <div className="bg-black/40 rounded-xl px-4 py-3 border border-[var(--glass-border)]">
          <p className="text-[10px] text-[var(--text-tertiary)] mb-1 uppercase tracking-wider">
            Payment Link
          </p>
          <p className="font-mono text-xs text-emerald-accent break-all leading-relaxed">
            {requestLink}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <BlankButton variant="secondary" size="sm" onClick={handleCopyLink}>
            {linkCopied ? (
              <>
                <Check size={14} /> Copied!
              </>
            ) : (
              <>
                <Copy size={14} /> Copy Link
              </>
            )}
          </BlankButton>
          <BlankButton
            variant="ghost"
            size="sm"
            onClick={() => window.open(requestLink, "_blank")}
          >
            <ExternalLink size={14} /> Preview
          </BlankButton>
        </div>
      </motion.div>
    </div>
  );
}
