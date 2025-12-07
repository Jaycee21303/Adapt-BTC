// Jupiter aggregator service for Solana routes and swap transactions.
// Provides quote retrieval and serialized transaction building helpers.

const axios = require('axios');
const { getHealthyRPC } = require('../config/rpc');
const { logPerformance } = require('../utils/logger');

const JUPITER_BASE_URL = 'https://quote-api.jup.ag/v6';
const DEFAULT_SLIPPAGE_BPS = 50; // 0.5% default slippage for quotes.

/**
 * Fetch the best quote route between two mints using Jupiter v6.
 * @param {string} fromMint - The input token mint address.
 * @param {string} toMint - The output token mint address.
 * @param {string|number} amount - Raw token amount in smallest units.
 * @returns {Promise<object|null>} Best route object or null if unavailable.
 */
async function getQuote(fromMint, toMint, amount) {
  try {
    const rpcEndpoint = await getHealthyRPC('solana');
    console.log('[Jupiter] Fetching quote', { fromMint, toMint, amount, rpcEndpoint });

    const t0 = Date.now();
    const { data } = await axios.get(`${JUPITER_BASE_URL}/quote`, {
      params: {
        inputMint: fromMint,
        outputMint: toMint,
        amount,
        slippageBps: DEFAULT_SLIPPAGE_BPS,
        onlyDirectRoutes: false,
      },
    });
    logPerformance('JupiterQuote', Date.now() - t0);

    if (data && Array.isArray(data.routes) && data.routes.length > 0) {
      console.log('[Jupiter] Quote received', {
        routeCount: data.routes.length,
        bestOutAmount: data.routes[0]?.outAmount,
      });
      return data.routes[0];
    }

    console.warn('[Jupiter] No routes returned for quote request');
    return null;
  } catch (error) {
    console.error('[Jupiter] Error fetching quote', error.message || error);
    return null;
  }
}

/**
 * Build a serialized swap transaction for the provided route.
 * The transaction is returned base64-encoded for client-side signing.
 * @param {object} route - Jupiter route object from getQuote.
 * @param {string} userPublicKey - Base58 address of the user.
 * @returns {Promise<string|null>} Base64 encoded transaction string.
 */
async function buildSwapTransaction(route, userPublicKey) {
  try {
    const rpcEndpoint = await getHealthyRPC('solana');
    console.log('[Jupiter] Building swap transaction', {
      userPublicKey,
      inAmount: route?.inAmount,
      outAmount: route?.outAmount,
      rpcEndpoint,
    });

    const { data } = await axios.post(`${JUPITER_BASE_URL}/swap`, {
      route,
      userPublicKey,
      wrapAndUnwrapSol: true,
      asLegacyTransaction: false,
      prioritizationFeeLamports: route?.prioritizationFeeLamports,
    });

    const serializedTx = data?.swapTransaction;

    if (!serializedTx) {
      console.warn('[Jupiter] No transaction returned from swap builder');
      return null;
    }

    console.log('[Jupiter] Swap transaction built successfully');
    return serializedTx;
  } catch (error) {
    console.error('[Jupiter] Error building swap transaction', error.message || error);
    return null;
  }
}

module.exports = {
  getQuote,
  buildSwapTransaction,
};
