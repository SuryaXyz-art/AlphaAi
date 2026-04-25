// ──────────────────────────────────────────────────────────────────
// Mock Agent Service — simulates an x402-protected AI endpoint
// ──────────────────────────────────────────────────────────────────
// In production, this would be a real server that checks X-Payment
// headers and returns AI responses. For the hackathon demo, we
// simulate the full 402 → sign → retry → response flow client-side.

export interface MockAgentResponse {
  result: string;
  model: string;
  tokens: number;
  latencyMs: number;
}

export interface MockService {
  id: number;
  name: string;
  endpoint: string;
  pricePerCall: number; // raw 6-decimal USDC
  description: string;
  model: string;
}

// Default services available when the on-chain registry is empty
export const DEFAULT_SERVICES: MockService[] = [
  {
    id: 0,
    name: "SummaryAgent",
    endpoint: "/api/mock-agent/summary",
    pricePerCall: 100, // 0.000100 USDC
    description: "Summarizes documents and web pages into concise bullet points.",
    model: "alpha-summary-v1",
  },
  {
    id: 1,
    name: "SentimentBot",
    endpoint: "/api/mock-agent/sentiment",
    pricePerCall: 50, // 0.000050 USDC
    description: "Analyzes text sentiment with confidence scores.",
    model: "alpha-sentiment-v1",
  },
  {
    id: 2,
    name: "CodeReviewer",
    endpoint: "/api/mock-agent/code",
    pricePerCall: 200, // 0.000200 USDC
    description: "Reviews code for bugs, security issues, and best practices.",
    model: "alpha-code-v2",
  },
  {
    id: 3,
    name: "PriceOracle",
    endpoint: "/api/mock-agent/price",
    pricePerCall: 25, // 0.000025 USDC
    description: "Returns real-time token price feeds from multiple DEXes.",
    model: "alpha-oracle-v1",
  },
  {
    id: 4,
    name: "TranslatorAI",
    endpoint: "/api/mock-agent/translate",
    pricePerCall: 75, // 0.000075 USDC
    description: "Translates text across 50+ languages with context awareness.",
    model: "alpha-translate-v1",
  },
];

// Mock AI responses keyed by service name
const MOCK_RESPONSES: Record<string, string[]> = {
  SummaryAgent: [
    "Summary: The Arc network enables sub-cent micropayments using Circle's USDC. Key benefits include zero-gas transactions via EIP-3009 and instant settlement through the Gateway protocol.",
    "Summary: AI agents on Arc can autonomously pay for services using nano-payments. This unlocks machine-to-machine commerce at scales previously impossible on traditional blockchains.",
    "Summary: The x402 protocol extends HTTP with native payment headers. Servers respond 402 Payment Required, clients sign EIP-3009 authorizations, and the Gateway batches settlements.",
  ],
  SentimentBot: [
    "Sentiment: POSITIVE (confidence: 0.94). The text expresses optimism about decentralized AI payment systems with strong technical backing.",
    "Sentiment: NEUTRAL (confidence: 0.87). Technical documentation with balanced pros/cons analysis. No strong emotional indicators detected.",
    "Sentiment: POSITIVE (confidence: 0.91). Market outlook appears bullish with several positive catalysts identified.",
  ],
  CodeReviewer: [
    "Review: No critical issues found. Suggestion: Consider adding input validation on line 42. Gas optimization: Use calldata instead of memory for string parameters. Security: LGTM.",
    "Review: 1 warning detected — reentrancy risk in withdraw(). Recommend adding ReentrancyGuard. Overall code quality: 8.5/10.",
    "Review: Clean architecture. Consider extracting the payment logic into a separate library for reusability across contracts. Test coverage recommendation: Add edge cases for zero-amount transfers.",
  ],
  PriceOracle: [
    "USDC/ETH: 0.000312 | USDC/BTC: 0.0000098 | Last updated: 2s ago | Sources: Uniswap, Curve, Balancer",
    "ARC/USDC: 1.247 (+2.3%) | 24h Volume: $4.2M | Market Cap: $89M | Confidence: HIGH",
    "ETH/USDC: 3,205.42 | Gas: 12 gwei | Block: 19,847,221 | Sources: 5 DEXes aggregated",
  ],
  TranslatorAI: [
    "Translation (EN→ES): 'Los pagos nano en la red Arc permiten transacciones de fracciones de centavo sin costo de gas.'",
    "Translation (EN→JP): 'Arcネットワーク上のナノペイメントにより、ガスコストなしでサブセントのトランザクションが可能になります。'",
    "Translation (EN→FR): 'Les nano-paiements sur le réseau Arc permettent des transactions sub-cent sans frais de gaz.'",
  ],
};

/**
 * Simulates calling an x402-protected mock AI agent.
 * Adds realistic latency to mimic network + inference time.
 */
export async function callMockAgent(
  service: MockService,
  hasPayment: boolean
): Promise<{ status: number; data?: MockAgentResponse; paymentRequired?: any }> {
  // Simulate network latency
  const latency = 300 + Math.random() * 700;
  await new Promise((r) => setTimeout(r, latency));

  // Step 1: If no payment header, return 402
  if (!hasPayment) {
    return {
      status: 402,
      paymentRequired: {
        gateway: "circle-gateway",
        protocol: "x402",
        token: "USDC",
        amount: service.pricePerCall,
        chain: "arc-testnet",
        chainId: 5042002,
        recipient: "0x3AFdcBAe8ad0807d9205f91a06517D2678Ad7EF1",
      },
    };
  }

  // Step 2: With payment, return mock AI response
  const responses = MOCK_RESPONSES[service.name] || MOCK_RESPONSES["SummaryAgent"];
  const randomResponse = responses[Math.floor(Math.random() * responses.length)];

  return {
    status: 200,
    data: {
      result: randomResponse,
      model: service.model,
      tokens: 80 + Math.floor(Math.random() * 200),
      latencyMs: Math.round(latency),
    },
  };
}
