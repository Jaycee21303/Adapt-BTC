// Swap quote endpoints for Solana (Jupiter) and EVM (1inch/0x) aggregators.

const express = require('express');
const { getQuote } = require('../services/jupiter');
const { getOneInchQuote } = require('../services/oneInch');
const { getZeroExQuote } = require('../services/zeroEx');
const { pickBestRoute } = require('../services/optimizer');
const { getThorchainQuote } = require('../services/thorchain');
const { getBestRoute } = require('../services/router');
const { validateQuoteRequest } = require('../middleware/validate');
const { rateLimitQuotes } = require('../middleware/rateLimit');
const { logSwapEvent } = require('../utils/logger');
const { getCache, setCache } = require('../utils/cache');

const SOL_EVM_CACHE_TTL = 2000; // 2 seconds
const BTC_CACHE_TTL = 5000; // 5 seconds

const router = express.Router();

// GET /quote/solana?from=&to=&amount=&address=
router.get('/solana', rateLimitQuotes, validateQuoteRequest, async (req, res) => {
  const { from: fromMint, to: toMint, amount, address } = req.query;

  logSwapEvent('QUOTE_REQUEST', { chain: 'SOL', fromMint, toMint, amount, address });

  try {
    const cacheKey = `sol:${fromMint}:${toMint}:${amount}:${address}`;
    const cached = getCache(cacheKey);
    if (cached) {
      logSwapEvent('QUOTE_RESPONSE', { chain: 'SOL', success: true, source: 'cache' });
      return res.json(cached);
    }

    const route = await getQuote(fromMint, toMint, amount);

    if (!route) {
      logSwapEvent('QUOTE_RESPONSE', { chain: 'SOL', success: false });
      return res.status(500).json({ success: false, error: 'Unable to retrieve quote' });
    }

    const payload = {
      success: true,
      route,
      bestAmountOut: route.outAmount,
      priceImpactPct: route.priceImpactPct,
    };

    setCache(cacheKey, payload, SOL_EVM_CACHE_TTL);

    logSwapEvent('QUOTE_RESPONSE', { chain: 'SOL', success: true, bestAmountOut: route.outAmount });
    return res.json(payload);
  } catch (error) {
    logSwapEvent('ERROR_EVENT', { context: 'quote/solana', error: error.message || error });
    console.error('[Quote] Error handling Solana quote', error.message || error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// GET /quote/universal?from=&to=&amount=&address=
router.get('/universal', rateLimitQuotes, validateQuoteRequest, async (req, res) => {
  const { from: fromSymbol, to: toSymbol, amount, address, debug } = req.query;
  const isProd = req.app?.locals?.isProd;
  const includeDebug = !isProd || debug === 'true';

  logSwapEvent('QUOTE_REQUEST', { chain: 'UNIVERSAL', fromSymbol, toSymbol, amount, address });

  try {
    const cacheKey = `universal:${fromSymbol}:${toSymbol}:${amount}:${address}`;
    const cached = getCache(cacheKey);
    if (cached && (includeDebug || !cached.debug)) {
      logSwapEvent('QUOTE_RESPONSE', { chain: 'UNIVERSAL', success: true, source: 'cache' });
      return res.json(cached);
    }

    const bestRoute = await getBestRoute({
      fromSymbol,
      toSymbol,
      amount,
      userAddress: address,
    });

    const payload = {
      success: true,
      chain: bestRoute.chain,
      source: bestRoute.source,
      route: bestRoute.route,
      inboundAddress: bestRoute.inboundAddress,
      memo: bestRoute.memo,
      amountOut: bestRoute.amountOut || bestRoute.expectedAmountOut,
    };

    if (includeDebug) {
      payload.debug = bestRoute.raw;
    }

    const ttl = bestRoute.chain === 'BTC' ? BTC_CACHE_TTL : SOL_EVM_CACHE_TTL;
    setCache(cacheKey, payload, ttl);

    logSwapEvent('QUOTE_RESPONSE', {
      chain: bestRoute.chain,
      source: bestRoute.source,
      success: true,
      amountOut: payload.amountOut,
    });

    return res.json(payload);
  } catch (error) {
    logSwapEvent('ERROR_EVENT', { context: 'quote/universal', error: error.message || error });
    console.error('[Quote] Error handling universal quote', error.message || error);
    return res.status(500).json({ success: false, error: error.message || 'Internal server error' });
  }
});

// GET /quote/btc?to=&amount=&address=
router.get('/btc', rateLimitQuotes, validateQuoteRequest, async (req, res) => {
  const { to: toAsset, amount, address } = req.query;
  const fromAsset = 'BTC.BTC';

  logSwapEvent('QUOTE_REQUEST', { chain: 'BTC', fromAsset, toAsset, amount, address });

  try {
    const cacheKey = `btc:${fromAsset}:${toAsset}:${amount}:${address}`;
    const cached = getCache(cacheKey);
    if (cached) {
      logSwapEvent('QUOTE_RESPONSE', { chain: 'BTC', success: true, source: 'cache' });
      return res.json(cached);
    }

    const quote = await getThorchainQuote(fromAsset, toAsset, amount);

    if (!quote) {
      logSwapEvent('QUOTE_RESPONSE', { chain: 'BTC', success: false });
      return res.status(500).json({ success: false, error: 'Unable to retrieve Thorchain quote' });
    }

    const { expectedAmountOut, inboundAddress, memo, fees } = quote;
    const payload = {
      success: true,
      expectedAmountOut,
      inboundAddress,
      memo,
      fees,
    };

    setCache(cacheKey, payload, BTC_CACHE_TTL);

    logSwapEvent('QUOTE_RESPONSE', { chain: 'BTC', success: true, expectedAmountOut });
    return res.json(payload);
  } catch (error) {
    logSwapEvent('ERROR_EVENT', { context: 'quote/btc', error: error.message || error });
    console.error('[Quote] Error handling BTC quote', error.message || error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// GET /quote/evm?from=&to=&amount=&address=
router.get('/evm', rateLimitQuotes, validateQuoteRequest, async (req, res) => {
  const { from: fromToken, to: toToken, amount, address } = req.query;

  logSwapEvent('QUOTE_REQUEST', { chain: 'EVM', fromToken, toToken, amount, address });

  try {
    const cacheKey = `evm:${fromToken}:${toToken}:${amount}:${address}`;
    const cached = getCache(cacheKey);
    if (cached) {
      logSwapEvent('QUOTE_RESPONSE', { chain: 'EVM', success: true, source: 'cache' });
      return res.json(cached);
    }

    const [oneInchQuote, zeroExQuote] = await Promise.all([
      getOneInchQuote(fromToken, toToken, amount),
      getZeroExQuote(fromToken, toToken, amount),
    ]);

    const { bestSource, bestQuote } = pickBestRoute([oneInchQuote, zeroExQuote]);

    if (!bestQuote) {
      logSwapEvent('QUOTE_RESPONSE', { chain: 'EVM', success: false });
      return res.status(500).json({ success: false, error: 'No quotes available' });
    }

    const payload = {
      success: true,
      bestSource,
      bestQuote,
      amountOut: bestQuote.amountOut,
    };

    setCache(cacheKey, payload, SOL_EVM_CACHE_TTL);

    logSwapEvent('QUOTE_RESPONSE', { chain: 'EVM', success: true, bestSource, amountOut: bestQuote.amountOut });
    return res.json(payload);
  } catch (error) {
    logSwapEvent('ERROR_EVENT', { context: 'quote/evm', error: error.message || error });
    console.error('[Quote] Error handling EVM quote', error.message || error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

module.exports = router;
