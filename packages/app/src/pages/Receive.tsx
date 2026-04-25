import { PageHeader } from "../components/ui/PageHeader";
import { QrCode } from "lucide-react";

export function Receive() {
  return (
    <div className="p-6 space-y-6 flex flex-col items-center">
      <div className="w-full">
        <PageHeader title="Receive" />
      </div>
      
      <div className="glass-panel p-8 flex flex-col items-center justify-center space-y-6 w-full mt-8">
        <div className="w-48 h-48 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20">
          <QrCode size={100} className="text-white/50" />
        </div>
        <p className="text-[var(--text-secondary)] text-sm text-center">
          Show this QR code to receive nano-payments on the Arc Testnet.
        </p>
        <div className="bg-black/50 px-4 py-2 rounded-lg font-mono text-xs text-[var(--text-primary)] w-full text-center break-all">
          0x0000000000000000000000000000000000000000
        </div>
      </div>
    </div>
  );
}
