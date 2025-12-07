// Thorchain service for BTC-based swaps via Midgard API.
// Provides quote retrieval, inbound address lookup, and swap instruction assembly.

const axios = require('axios');
const { logPerformance } = require('../utils/logger');

const MIDGARD_BASE_URL = 'https://midgard.ninerealms.com/v2/thorchain';

// Fetch a Thorchain quote for swapping fromAsset to toAsset with the given amount (base units).
async function getThorchainQuote(fromAsset, toAsset, amount) {
  try {
    const t0 = Date.now();
    const response = await axios.get(`${MIDGARD_BASE_URL}/quote/swap`, {
      params: {
        from_asset: fromAsset,
        to_asset: toAsset,
        amount,
        tolerance: 1, // 1% slippage tolerance
      },
    });
    logPerformance('ThorchainQuote', Date.now() - t0);

    const raw = response.data || {};
    console.log('[Thorchain] Quote received', raw?.expected_amount_out || raw?.expectedAmountOut);

    return {
      expectedAmountOut: raw.expected_amount_out || raw.expectedAmountOut || null,
      inboundAddress: raw.inbound_address || raw.inboundAddress || null,
      memo: raw.memo || null,
      fees: raw.fees || null,
      raw,
    };
  } catch (error) {
    console.error('[Thorchain] Quote error', error.message || error);
    return null;
  }
}

// Retrieve the inbound BTC address from Midgard inbound addresses list.
async function getInboundAddressForBTC() {
  try {
    const response = await axios.get(`${MIDGARD_BASE_URL}/inbound_addresses`);
    const entries = response.data || [];

    const btcEntry = entries.find((entry) => entry.chain === 'BTC');

    if (!btcEntry) {
      console.warn('[Thorchain] No BTC inbound address found');
      return null;
    }

    return {
      address: btcEntry.address,
      router: btcEntry.router,
      halted: Boolean(btcEntry.halted),
    };
  } catch (error) {
    console.error('[Thorchain] Inbound address error', error.message || error);
    return null;
  }
}

// Build a Thorchain BTC swap instruction that the user can execute from their own wallet.
async function buildThorchainSwap(fromAsset, toAsset, amount, userAddress) {
  const memo = `SWAP:${toAsset}:${userAddress}`;

  const inbound = await getInboundAddressForBTC();
  if (!inbound || !inbound.address) {
    return null;
  }

  return {
    chain: 'BTC',
    depositAddress: inbound.address,
    memo,
    amount,
    toAsset,
    userAddress,
  };
}

module.exports = {
  getThorchainQuote,
  getInboundAddressForBTC,
  buildThorchainSwap,
};
