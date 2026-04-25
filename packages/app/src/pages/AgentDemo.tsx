import { PageHeader } from "../components/ui/PageHeader";
import { BlankButton } from "../components/ui/BlankButton";
import { Bot, Zap } from "lucide-react";

export function AgentDemo() {
  return (
    <div className="p-6 space-y-6">
      <PageHeader title="AI Agent" />
      
      <div className="glass-panel p-6 flex flex-col items-center justify-center space-y-4 text-center border-emerald-accent/20 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-emerald-accent/5 pointer-events-none" />
        
        <div className="w-16 h-16 rounded-full bg-emerald-accent/20 flex items-center justify-center glow-emerald relative z-10">
          <Bot size={32} className="text-emerald-accent" />
        </div>
        
        <div className="relative z-10 space-y-2">
          <h2 className="text-xl font-bold text-white">Autonomous Trading Agent</h2>
          <p className="text-[var(--text-secondary)] text-sm">
            Fund this agent to execute trades automatically on your behalf using nano-payments.
          </p>
        </div>
        
        <div className="w-full relative z-10 pt-4">
          <BlankButton size="full" className="gap-2" icon={<Zap size={18} />}>
            Fund Agent (1.00 USDC)
          </BlankButton>
        </div>
      </div>
    </div>
  );
}
