import { Link } from "react-router-dom";
import { BlankButton } from "../components/ui/BlankButton";
import { motion } from "framer-motion";

export function Landing() {
  return (
    <div className="min-h-screen bg-void-900 flex flex-col items-center justify-center p-6 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="space-y-8 max-w-md"
      >
        <div className="space-y-4">
          <div className="inline-block px-4 py-1.5 rounded-full glass-panel text-sm text-emerald-accent mb-4 border-emerald-accent/20 bg-emerald-accent/5">
            Arc Hackathon
          </div>
          <h1 className="text-5xl font-bold tracking-tight text-white glow-emerald">
            AlphaAi
          </h1>
          <p className="text-[var(--text-secondary)] text-lg">
            Nano-payments powered by AI agents on the Arc Testnet.
          </p>
        </div>

        <Link to="/app">
          <BlankButton size="lg" className="w-full">
            Launch App
          </BlankButton>
        </Link>
      </motion.div>
    </div>
  );
}
