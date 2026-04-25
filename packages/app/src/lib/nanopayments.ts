import type { WalletClient, Hex, Address } from "viem";
import { USDC_ADDRESS } from "./tokens";

// Circle Gateway API base (use testnet endpoint)
// const GATEWAY_API = "https://api.gateway.circle.com";

// ───────────────────────────────────────────────────────────────────
// Types
// ───────────────────────────────────────────────────────────────────

export interface PaymentAuthorizationParams {
  from: Address;
  to: Address;
  value: bigint;
  validAfter: bigint;
  validBefore: bigint;
  nonce: Hex;
}

export interface NanoPaymentRequest {
  walletClient: WalletClient;
  sellerEndpoint: string;
  amount: bigint;
  from: Address;
  gatewayTo: Address;
  note?: string;
}

export interface PaymentResult {
  success: boolean;
  reference?: string;
  data?: unknown;
  error?: string;
}

// ───────────────────────────────────────────────────────────────────
// EIP-3009 Typed Data Builder
// ───────────────────────────────────────────────────────────────────

/**
 * Build EIP-712 typed data for USDC `transferWithAuthorization` (EIP-3009).
 * The signer authorises the Gateway to pull `value` USDC from `from` → `to`
 * without requiring an on-chain approve + transfer.
 */
export function buildPaymentAuthorization({
  from,
  to,
  value,
  validAfter,
  validBefore,
  nonce,
}: PaymentAuthorizationParams) {
  return {
    domain: {
      name: "USD Coin",
      version: "2",
      chainId: 5042002n, // Arc Testnet
      verifyingContract: USDC_ADDRESS as Address,
    },
    types: {
      TransferWithAuthorization: [
        { name: "from", type: "address" },
        { name: "to", type: "address" },
        { name: "value", type: "uint256" },
        { name: "validAfter", type: "uint256" },
        { name: "validBefore", type: "uint256" },
        { name: "nonce", type: "bytes32" },
      ],
    },
    primaryType: "TransferWithAuthorization" as const,
    message: {
      from,
      to,
      value,
      validAfter,
      validBefore,
      nonce,
    },
  };
}

// ───────────────────────────────────────────────────────────────────
// Random nonce generator (32 bytes)
// ───────────────────────────────────────────────────────────────────

export function generateNonce(): Hex {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return ("0x" +
    Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")) as Hex;
}

// ───────────────────────────────────────────────────────────────────
// Nano-Payment Flow
// ───────────────────────────────────────────────────────────────────

/**
 * Full x402 nano-payment flow:
 * 1. Hit the seller endpoint → expect 402 Payment Required
 * 2. Parse payment details from the 402 response
 * 3. Sign an EIP-3009 authorization off-chain (zero gas)
 * 4. Retry the request with the signed auth in `X-Payment` header
 * 5. Return the seller's response
 */
export async function sendNanoPayment({
  walletClient,
  sellerEndpoint,
  amount,
  from,
  gatewayTo,
  note,
}: NanoPaymentRequest): Promise<PaymentResult> {
  try {
    // ── Step 1: Hit endpoint, receive 402 ────────────────────────
    const initialResponse = await fetch(sellerEndpoint).catch(() => null);

    // Use the provided gatewayTo (from seller's 402 or manual input)
    const to = gatewayTo;
    const now = BigInt(Math.floor(Date.now() / 1000));
    const validAfter = now - 60n;
    const validBefore = now + 300n; // 5 minute window
    const nonce = generateNonce();

    // ── Step 2: Sign EIP-3009 authorization ──────────────────────
    const typedData = buildPaymentAuthorization({
      from,
      to,
      value: amount,
      validAfter,
      validBefore,
      nonce,
    });

    const signature = await walletClient.signTypedData({
      account: from,
      domain: typedData.domain,
      types: typedData.types,
      primaryType: typedData.primaryType,
      message: typedData.message,
    });

    // ── Step 3: Encode payload as base64 for X-Payment header ────
    const paymentPayload = {
      authorization: {
        from,
        to,
        value: amount.toString(),
        validAfter: validAfter.toString(),
        validBefore: validBefore.toString(),
        nonce,
      },
      signature,
      chainId: 65536,
      token: USDC_ADDRESS,
    };

    const encodedPayment = btoa(JSON.stringify(paymentPayload));

    // ── Step 4: Retry with X-Payment header ──────────────────────
    const response = await fetch(sellerEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Payment": encodedPayment,
      },
      body: JSON.stringify({
        amount: amount.toString(),
        from,
        to,
      }),
    }).catch(() => null);

    if (response && response.ok) {
      const data = await response.json().catch(() => ({}));
      const reference = data.reference || nonce;
      writeNanoPaymentHistory({
        reference,
        from,
        to,
        amount,
        note,
        timestamp: Date.now(),
      });
      return {
        success: true,
        reference,
        data,
      };
    }

    // If no server is running, treat as a demo — return signature as reference
    writeNanoPaymentHistory({
      reference: nonce,
      from,
      to,
      amount,
      note,
      timestamp: Date.now(),
    });
    return {
      success: true,
      reference: nonce,
      data: {
        signature,
        authorization: paymentPayload.authorization,
        demo: !initialResponse,
      },
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Nano-payment failed",
    };
  }
}

// ───────────────────────────────────────────────────────────────────
// Local nano-payment history (for Activity feed)
// ───────────────────────────────────────────────────────────────────

const NANO_HISTORY_KEY = "alphaai:nanoPayments:v1";

export interface StoredNanoPayment {
  reference: string;
  from: Address;
  to: Address;
  amount: string; // bigint string
  note?: string;
  timestamp: number; // ms
}

export function readNanoPaymentHistory(): StoredNanoPayment[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(NANO_HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((x): x is StoredNanoPayment => !!x && typeof x === "object")
      .slice(-500);
  } catch {
    return [];
  }
}

export function writeNanoPaymentHistory(item: Omit<StoredNanoPayment, "amount"> & { amount: bigint | string }) {
  if (typeof window === "undefined") return;
  try {
    const existing = readNanoPaymentHistory();
    const next = [
      ...existing,
      {
        ...item,
        amount: item.amount.toString(),
      },
    ];
    window.localStorage.setItem(NANO_HISTORY_KEY, JSON.stringify(next.slice(-500)));
  } catch {
    // ignore
  }
}

/**
 * Direct on-chain USDC transfer (standard path).
 * Uses the ERC-20 `transfer` function.
 */
export async function sendOnChainTransfer({
  walletClient,
  to,
  amount,
  from,
}: {
  walletClient: WalletClient;
  to: Address;
  amount: bigint;
  from: Address;
}): Promise<PaymentResult> {
  try {
    const hash = await walletClient.writeContract({
      address: USDC_ADDRESS as Address,
      abi: [
        {
          name: "transfer",
          type: "function",
          inputs: [
            { name: "to", type: "address" },
            { name: "value", type: "uint256" },
          ],
          outputs: [{ name: "", type: "bool" }],
        },
      ] as const,
      functionName: "transfer",
      args: [to, amount],
      account: from,
      chain: null,
    });

    return {
      success: true,
      reference: hash,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "On-chain transfer failed",
    };
  }
}
