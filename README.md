# AlphaAi — Nano-Payments on Arc

Live: `[your-netlify-url]`  
Hackathon: Arc × Circle Nano-Payments Hackathon — lablab.ai

## What it does
AlphaAi enables gas-free USDC nano-payments on Arc Testnet using Circle Gateway's
x402 protocol. AI agents can autonomously pay for services down to $0.000001 per
transaction with zero gas cost.

## Stack
- **Chain**: Arc Testnet (Chain ID 65536, native USDC gas)  
- **Payments**: Circle Gateway Nano-Payments (x402, EIP-3009, batched settlement)  
- **Contracts**: Hardhat + Solidity on Arc Testnet  
  - AlphaPaymentHub: `0x3AFdcBAe8ad0807d9205f91a06517D2678Ad7EF1`  
  - AlphaAgentRegistry: `0xDece7f04508c8D68ad48aeB7Ca17cE7306Eb69EB`  
- **Frontend**: React + Vite + wagmi v2 + TailwindCSS  
- **Deploy**: Netlify (frontend) + Arc Testnet (contracts)

## Key Features
- ⚡ Gas-free nano-payments via Circle Gateway x402
- 🤖 AI Agent demo — autonomous sub-cent payments for AI services
- 📊 Live activity feed — on-chain + nano-payment history merged
- 🔗 Native Arc Testnet integration with USDC ERC-20

## Contracts on Arc Testnet
| Contract | Address |
|----------|---------|
| AlphaPaymentHub | `0x3AFdcBAe8ad0807d9205f91a06517D2678Ad7EF1` |
| AlphaAgentRegistry | `0xDece7f04508c8D68ad48aeB7Ca17cE7306Eb69EB` |
| USDC (Arc native) | `0x3600000000000000000000000000000000000000` |

## Local Development
```bash
git clone https://github.com/YOUR_USERNAME/AlphaAi
cd AlphaAi
pnpm install
cp packages/app/.env.example packages/app/.env
# fill in env vars
pnpm --filter @alphaaai/app dev
```

## Deploy Contracts
```bash
cd packages/contracts
cp .env.example .env
# add DEPLOYER_PRIVATE_KEY
npx hardhat run tasks/deploy-alpha.ts --network arcTestnet
```
