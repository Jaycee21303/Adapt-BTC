--------------------------------------------------------
ADAPTBTC SWAP — PRODUCTION LAUNCH CHECKLIST
--------------------------------------------------------

BACKEND:
✔ Render deploy successful  
✔ Environment variables set  
✔ Fee wallets set to PRODUCTION wallets  
✔ Health check returns OK  
✔ RPC failover working  

FRONTEND:
✔ Vercel deploy successful  
✔ Backend URL loaded via env var  
✔ WalletConnect working  
✔ Route preview working  
✔ Swaps tested on SOL/EVM/BTC  

SECURITY:
✔ All headers added  
✔ Rate limiting active  
✔ Input validation active  
✔ No private keys anywhere  

PERFORMANCE:
✔ Caching layer verified  
✔ Quote times under 500ms  
✔ EVM gas estimated correctly  

DNS:
✔ swap.adaptbtc.com resolves to Vercel  
✔ HTTPS valid  
✔ CORS rules correct  

FINAL STEPS:
✔ Replace temporary fee wallets  
✔ Set NODE_ENV=production  
✔ Run `npm test` for smoke tests  
✔ Publish v1.0 release tag  

--------------------------------------------------------
