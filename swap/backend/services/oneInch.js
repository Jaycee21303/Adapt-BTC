// 1inch aggregator service for fetching EVM swap quotes and building swap transactions.
// This module intentionally avoids custody of keys; it only returns data for client-side signing.

const axios = require('axios');
const { logPerformance } = require('../utils/logger');

const ONEINCH_BASE_URL = 'https://api.1inch.dev/swap/v5.2/1';

// Helper to optionally attach API key if provided in environment.
const buildHeaders = () => {
  const headers = { accept: 'application/json' };
  if (process.env.ONEINCH_API_KEY) {
    headers.Authorization = `Bearer ${process.env.ONEINCH_API_KEY}`;
  }
  return headers;
};

// Retrieve a 1inch quote for the provided token pair and amount.
async function getOneInchQuote(fromToken, toToken, amount) {
  try {
    const t0 = Date.now();
    const response = await axios.get(`${ONEINCH_BASE_URL}/quote`, {
      headers: buildHeaders(),
      params: {
        src: fromToken,
        dst: toToken,
        amount,
        slippage: 1,
      },
    });
    logPerformance('1inchQuote', Date.now() - t0);

    const rawQuote = response.data;
    console.log('[1inch] Quote received', rawQuote?.toTokenAmount || rawQuote?.toAmount);

    return {
      source: '1inch',
      data: rawQuote,
      amountOut: rawQuote.toAmount,
    };
  } catch (error) {
    console.error('[1inch] Quote error', error.message || error);
    return null;
  }
}

// Build a 1inch swap transaction that MetaMask or other EVM wallets can sign and broadcast.
async function buildOneInchSwap(fromToken, toToken, amount, userAddress) {
  try {
    const response = await axios.get(`${ONEINCH_BASE_URL}/swap`, {
      headers: buildHeaders(),
      params: {
        src: fromToken,
        dst: toToken,
        amount,
        from: userAddress,
        slippage: 1,
      },
    });

    const tx = response.data?.tx || response.data;
    console.log('[1inch] Swap tx prepared');

    return {
      to: tx.to,
      data: tx.data,
      value: tx.value,
      gas: tx.gas,
    };
  } catch (error) {
    console.error('[1inch] Swap build error', error.message || error);
    return null;
  }
}

module.exports = {
  getOneInchQuote,
  buildOneInchSwap,
};
