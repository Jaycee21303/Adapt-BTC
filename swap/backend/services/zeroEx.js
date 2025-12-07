// 0x aggregator service for fetching EVM swap quotes.
// Returns raw swap calldata for client-side signing and submission.

const axios = require('axios');
const { logPerformance } = require('../utils/logger');

const ZERO_EX_BASE_URL = 'https://api.0x.org/swap/v1';

// Retrieve a 0x quote for the given token pair and amount.
async function getZeroExQuote(fromToken, toToken, amount) {
  try {
    const t0 = Date.now();
    const response = await axios.get(`${ZERO_EX_BASE_URL}/quote`, {
      params: {
        sellToken: fromToken,
        buyToken: toToken,
        sellAmount: amount,
      },
    });
    logPerformance('ZeroExQuote', Date.now() - t0);

    const rawQuote = response.data;
    console.log('[0x] Quote received', rawQuote?.buyAmount);

    return {
      source: '0x',
      data: rawQuote,
      amountOut: rawQuote.buyAmount,
    };
  } catch (error) {
    console.error('[0x] Quote error', error.message || error);
    return null;
  }
}

module.exports = {
  getZeroExQuote,
};
