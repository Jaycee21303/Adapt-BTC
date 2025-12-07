# Swap Deployment Guide

## DNS configuration for swap.adaptbtc.com

```
CNAME record:
Host: swap
Value: cname.vercel-dns.com
TTL: Auto
Proxy: OFF
```

After DNS propagates, add the domain in Vercel:
- Vercel Dashboard → Project → Settings → Domains → add `swap.adaptbtc.com`

Backend URL for frontend env:
`NEXT_PUBLIC_SWAP_BACKEND_URL=https://<your-render-service>.onrender.com`

## Backend deploy steps (Render)
- Runtime: Node 18
- Build Command: `npm install`
- Start Command: `npm start`
- Set environment variables: `SOLANA_RPC_1`, `SOLANA_RPC_2`, `EVM_RPC_1`, `EVM_RPC_2`, `FEE_SOL_WALLET`, `FEE_EVM_WALLET`, `FEE_BTC_WALLET`, `NODE_ENV=production`
- Deploy the `/swap/backend` service and confirm `/health` returns status ok

## Frontend deploy steps (Vercel)
- Runtime: Node 18
- Build Command: `npm run build`
- Install Command: `npm install`
- Output: Next.js default
- Environment variable: `NEXT_PUBLIC_SWAP_BACKEND_URL` pointing to the Render backend
- Add `swap.adaptbtc.com` domain after DNS is live

## Fee wallet updates before production
- Update `FEE_SOL_WALLET`, `FEE_EVM_WALLET`, and `FEE_BTC_WALLET` in the Render environment dashboard
- Redeploy backend to propagate changes

## Local development
- Backend: `cd swap/backend && npm install && npm run dev`
- Frontend: `cd swap/frontend && npm install && npm run dev`
- Set `NODE_ENV=development` in `.env` files

## Production mode
- Set `NODE_ENV=production` in both backend and frontend environments
- Provide mainnet RPC endpoints in environment variables for reliability

## Testing swaps
- Solana: connect a Solana wallet, fetch quote, execute and sign serialized transaction
- Ethereum: connect MetaMask on mainnet, fetch quote, execute, and sign returned transaction payload
- BTC (Thorchain): fetch quote, send BTC to provided deposit address with memo from your own wallet

## Expected folder structure
- `/swap/backend` for the Node.js API running on Render
- `/swap/frontend` for the Next.js UI running on Vercel
- Shared utilities in `/swap/utils`
