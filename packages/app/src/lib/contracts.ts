// ──────────────────────────────────────────────────────────────────
// Deployed contract addresses — Arc Testnet (Chain ID 65536)
// ──────────────────────────────────────────────────────────────────
// Update these after running: npx hardhat run tasks/deploy-alpha.ts --network arcTestnet

import type { Address } from "viem";
import { USDC_ADDRESS } from "./tokens";

export const CONTRACTS = {
  AlphaPaymentHub: {
    proxy: "" as Address,          // ← fill after deploy
    implementation: "" as Address,  // ← fill after deploy
  },
  AlphaAgentRegistry: {
    address: "" as Address,         // ← fill after deploy
  },
  USDC: USDC_ADDRESS as Address,
} as const;

// ── AlphaPaymentHub ABI (proxy-compatible) ──────────────────────

export const ALPHA_PAYMENT_HUB_ABI = [
  {
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "note", type: "string" },
    ],
    name: "sendPayment",
    outputs: [{ name: "paymentId", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "getPaymentsCount",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "paymentId", type: "uint256" }],
    name: "getPayment",
    outputs: [
      {
        components: [
          { name: "from", type: "address" },
          { name: "to", type: "address" },
          { name: "amount", type: "uint256" },
          { name: "note", type: "string" },
          { name: "timestamp", type: "uint256" },
        ],
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "from", type: "address" },
      { indexed: true, name: "to", type: "address" },
      { indexed: false, name: "amount", type: "uint256" },
      { indexed: false, name: "note", type: "string" },
      { indexed: false, name: "paymentId", type: "uint256" },
    ],
    name: "PaymentSent",
    type: "event",
  },
] as const;

// ── AlphaAgentRegistry ABI ──────────────────────────────────────

export const ALPHA_AGENT_REGISTRY_ABI = [
  {
    inputs: [
      { name: "name", type: "string" },
      { name: "endpoint", type: "string" },
      { name: "pricePerCall", type: "uint256" },
    ],
    name: "registerAgent",
    outputs: [{ name: "agentId", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "getAgents",
    outputs: [
      {
        components: [
          { name: "agentAddress", type: "address" },
          { name: "name", type: "string" },
          { name: "endpoint", type: "string" },
          { name: "pricePerCall", type: "uint256" },
          { name: "active", type: "bool" },
        ],
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "agentId", type: "uint256" }],
    name: "getAgent",
    outputs: [
      {
        components: [
          { name: "agentAddress", type: "address" },
          { name: "name", type: "string" },
          { name: "endpoint", type: "string" },
          { name: "pricePerCall", type: "uint256" },
          { name: "active", type: "bool" },
        ],
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getAgentsCount",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "agentId", type: "uint256" }],
    name: "deactivateAgent",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "agentId", type: "uint256" }],
    name: "activateAgent",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "agentId", type: "uint256" },
      { indexed: true, name: "agentAddress", type: "address" },
      { indexed: false, name: "name", type: "string" },
    ],
    name: "AgentRegistered",
    type: "event",
  },
] as const;
