# AlphaAi

AlphaAi is a project for the Arc Hackathon (nano-payments-arc on lablab.ai).

## Project Structure
- `packages/app`: Frontend application built with Vite, React, TailwindCSS, and Wagmi.
- `packages/contracts`: Solidity smart contracts using Hardhat for the Arc Testnet.

## Netlify Deployment

- **Netlify URL**: `<https://alphaaai.netlify.app>` (replace with your deployed URL)

### Deploy steps

1. Go to `https://app.netlify.com` → **Add new site** → **Import from Git**
2. Connect your GitHub repo (**AlphaAi**)
3. Set build settings:
   - **Base directory**: `packages/app`
   - **Build command**: `pnpm build`
   - **Publish directory**: `dist`
4. Add all `VITE_` env vars from `packages/app/.env.example` in Netlify → Site Settings → Environment Variables
5. Deploy
