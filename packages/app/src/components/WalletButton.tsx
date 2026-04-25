import { useEffect, useRef } from "react";
import { useAccount, useConnect, useDisconnect, useReadContract } from "wagmi";
import { BlankButton } from "./ui/BlankButton";
import { USDC_ADDRESS, USDC_ABI, formatUSDC } from "../lib/tokens";
import { LogOut, ExternalLink } from "lucide-react";
import { toast } from "../lib/toast";

async function ensureArcTestnetInWallet() {
  const eth = (window as any)?.ethereum;
  if (!eth?.request) return;

  const chainIdHex = "0x4cef52"; // 5042002

  try {
    await eth.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: chainIdHex }],
    });
  } catch (err: any) {
    // 4902: Unrecognized chain
    if (err?.code === 4902) {
      await eth.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: chainIdHex,
            chainName: "Arc Testnet",
            rpcUrls: ["https://rpc.testnet.arc.network"],
            nativeCurrency: { name: "USDC", symbol: "USDC", decimals: 18 },
            blockExplorerUrls: ["https://testnet.arcscan.app"],
          },
        ],
      });
      // Attempt switch after add
      await eth.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: chainIdHex }],
      });
    }
  }
}

export function WalletButton() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { connectors, connect, isPending } = useConnect();
  const wasConnected = useRef(false);

  useEffect(() => {
    if (!wasConnected.current && isConnected) {
      toast({ message: "Connected to Arc Testnet ✓", tone: "success" });
      wasConnected.current = true;
    }
    if (!isConnected) wasConnected.current = false;
  }, [isConnected]);

  const { data: balanceData } = useReadContract({
    address: USDC_ADDRESS,
    abi: USDC_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: {
      enabled: isConnected && !!address,
    },
  });

  const truncateAddress = (addr: string) => {
    if (!addr) return "";
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  if (isConnected && address) {
    const formattedBalance = balanceData !== undefined ? formatUSDC(balanceData as bigint) : "0.00";
    
    return (
      <div className="flex flex-col items-end gap-1">
        <div className="flex items-center gap-2 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-full pl-2 pr-3 py-1 text-sm text-[var(--text-primary)]">
          <div className="w-2 h-2 rounded-full bg-emerald-accent glow-emerald animate-pulse"></div>
          <span className="font-mono">{truncateAddress(address)}</span>
          <button 
            onClick={() => disconnect()}
            className="ml-2 text-[var(--text-tertiary)] hover:text-red-400 transition-colors"
            title="Disconnect"
          >
            <LogOut size={14} />
          </button>
        </div>
        
        <div className="flex items-center gap-2 text-xs">
          <span className="text-[var(--text-secondary)]">
            <span className="text-amount">{formattedBalance}</span> USDC
          </span>
          {formattedBalance === "0.00" && (
            <a 
              href="https://faucet.circle.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-emerald-accent hover:underline flex items-center gap-1"
            >
              Get Testnet USDC <ExternalLink size={10} />
            </a>
          )}
        </div>
      </div>
    );
  }

  // Find MetaMask or fallback to first injected
  const connector = connectors.find((c: any) => c.id === 'metaMask') || connectors[0];

  return (
    <BlankButton 
      size="sm" 
      onClick={async () => {
        await ensureArcTestnetInWallet().catch(() => {});
        connect({ connector });
      }}
      loading={isPending}
      className="!rounded-full"
    >
      Connect Wallet
    </BlankButton>
  );
}
