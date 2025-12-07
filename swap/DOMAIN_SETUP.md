--------------------------------------------------------
swap.adaptbtc.com FINAL INTEGRATION
--------------------------------------------------------

1. Add CNAME in DNS:
   swap → cname.vercel-dns.com

2. In Vercel:
   Add domain swap.adaptbtc.com to the frontend project.

3. Add environment variable:
   NEXT_PUBLIC_SWAP_BACKEND_URL=https://<render-subdomain>.onrender.com

4. Enable HTTPS forced redirect on Vercel.

5. Test:
   https://swap.adaptbtc.com/health  → Should show OK from backend.
   https://swap.adaptbtc.com         → Should show Swap UI.

--------------------------------------------------------
