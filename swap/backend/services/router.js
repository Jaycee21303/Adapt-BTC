// Universal routing layer to select best chain and aggregator based on asset symbols and token formats.
// This module centralizes decision making without executing swaps so future fee logic can be added.

const { getQuote: getSolanaQuote } = require('./jupiter');
const { getOneInchQuote } = require('./oneInch');
const { getZeroExQuote } = require('./zeroEx');
const { pickBestRoute } = require('./optimizer');
const { getThorchainQuote } = require('./thorchain');

// Basic helpers to recognize token formats and supported chains.
const isSolanaMint = (value) => {
  // Solana mints are base58 strings typically 32-44 chars and not 0x-prefixed.
  return typeof value === 'string' && !value.startsWith('0x') && value.length >= 32 && value.length <= 44;
};

const isErc20 = (value) => {
  // Minimal ERC-20 address check: 0x-prefixed, 42 chars.
  return typeof value === 'string' && value.startsWith('0x') && value.length === 42;
};

// Main router to pick chain + aggregator. Does not broadcast or sign transactions.
async function getBestRoute(params) {
  const { fromSymbol, toSymbol, amount, userAddress } = params || {};

  if (!fromSymbol || !toSymbol || !userAddress) {
    throw new Error('Missing required parameters: fromSymbol, toSymbol, userAddress');
  }

  const numericAmount = Number(amount);
  if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
    throw new Error('Invalid amount; must be a positive number');
  }

  // Route Solana tokens via Jupiter.
  if (fromSymbol === 'SOL' || isSolanaMint(fromSymbol)) {
    console.log('[Router] Routing SOL through Jupiter');
    const route = await getSolanaQuote(fromSymbol, toSymbol, numericAmount);
    if (!route) {
      throw new Error('Unable to retrieve Solana route');
    }
    return {
      chain: 'SOL',
      source: 'jupiter',
      route,
      amountOut: route.outAmount,
      raw: route,
    };
  }

  // Route EVM tokens via 1inch / 0x.
  if (fromSymbol === 'ETH' || isErc20(fromSymbol)) {
    console.log('[Router] Routing ETH through 1inch/0x');
    const [oneInchQuote, zeroExQuote] = await Promise.all([
      getOneInchQuote(fromSymbol, toSymbol, numericAmount),
      getZeroExQuote(fromSymbol, toSymbol, numericAmount),
    ]);

    const { bestSource, bestQuote } = pickBestRoute([oneInchQuote, zeroExQuote]);

    if (!bestQuote) {
      throw new Error('No available EVM quotes');
    }

    console.log('[Router] Best EVM source selected:', bestSource);
    return {
      chain: 'EVM',
      source: bestSource,
      route: bestQuote,
      amountOut: bestQuote.amountOut,
      raw: bestQuote,
    };
  }

  // Route native BTC via Thorchain.
  if (fromSymbol === 'BTC') {
    console.log('[Router] Routing BTC through Thorchain');
    const quote = await getThorchainQuote('BTC.BTC', toSymbol, numericAmount);

    if (!quote) {
      throw new Error('Unable to retrieve Thorchain quote');
    }

    return {
      chain: 'BTC',
      source: 'thorchain',
      inboundAddress: quote.inboundAddress,
      memo: quote.memo,
      expectedAmountOut: quote.expectedAmountOut,
      raw: quote.raw || quote,
    };
  }

  throw new Error('Unsupported fromSymbol provided');
}

module.exports = { getBestRoute };
