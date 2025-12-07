// Swap execution endpoints for returning client-signable transactions.

const express = require('express');
const { buildSwapTransaction } = require('../services/jupiter');
const { buildOneInchSwap } = require('../services/oneInch');
const { getZeroExQuote } = require('../services/zeroEx');
const { buildThorchainSwap } = require('../services/thorchain');
const { applyInputFee } = require('../services/feeEngine');
const { solanaFeeWallet, evmFeeWallet, btcFeeWallet } = require('../config/feeWallets');
const { validateExecuteRequest } = require('../middleware/validate');
const { rateLimitExecute } = require('../middleware/rateLimit');
const { logSwapEvent } = require('../utils/logger');

const router = express.Router();

const isSolanaAddress = (address = '') => typeof address === 'string' && address.length >= 32 && address.length <= 64;
const isEvmAddress = (address = '') => typeof address === 'string' && /^0x[a-fA-F0-9]{40}$/.test(address.trim());
const isBtcAddress = (address = '') => typeof address === 'string' && /^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,}$/i.test(address.trim());

// POST /execute/solana
router.post('/solana', rateLimitExecute, validateExecuteRequest, async (req, res) => {
  const { route, userPublicKey } = req.body || {};

  logSwapEvent('EXECUTE_REQUEST', { chain: 'SOL', userPublicKey, inAmount: route?.inAmount });

  try {
    if (!isSolanaAddress(userPublicKey)) {
      return res.status(400).json({ success: false, error: 'Invalid Solana address' });
    }

    const inputAmount = Number(route?.inAmount || route?.amount || route?.inputAmount);

    if (!Number.isFinite(inputAmount) || inputAmount <= 0) {
      return res.status(400).json({ success: false, error: 'Invalid input amount on route' });
    }

    const priceImpact = Number(route?.priceImpactPct || 0);
    if (priceImpact > 20) {
      return res.status(400).json({ success: false, error: 'High price impact' });
    }

    const { amountAfterFee, fee } = applyInputFee(inputAmount);
    if (amountAfterFee <= 0 || fee < 0) {
      return res.status(400).json({ success: false, error: 'Invalid amount after fee' });
    }
    console.log('0.01% fee applied:', fee);
    logSwapEvent('FEE_APPLIED', { chain: 'SOL', fee, amountAfterFee });

    // Adjust route to reflect the post-fee amount and note that the fee should be
    // forwarded to the designated Solana fee wallet using wrap/unwrap SOL logic.
    const adjustedRoute = {
      ...route,
      inAmount: amountAfterFee,
      amount: route?.amount ? amountAfterFee : route?.amount,
      inputAmount: route?.inputAmount ? amountAfterFee : route?.inputAmount,
      feeTransfer: {
        to: solanaFeeWallet,
        amount: fee,
      },
    };

    const serializedTx = await buildSwapTransaction(adjustedRoute, userPublicKey);

    if (!serializedTx) {
      return res.status(500).json({ success: false, error: 'Unable to build transaction' });
    }

    logSwapEvent('EXECUTE_RESPONSE', { chain: 'SOL', success: true });
    return res.json({ success: true, fee, amountAfterFee, serializedTx });
  } catch (error) {
    logSwapEvent('ERROR_EVENT', { context: 'execute/solana', error: error.message || error });
    console.error('[Execute] Error building Solana transaction', error.message || error);
    return res.status(500).json({ success: false, error: 'Swap execution failed' });
  }
});

// POST /execute/btc
router.post('/btc', rateLimitExecute, validateExecuteRequest, async (req, res) => {
  const { toAsset, amount, userAddress } = req.body || {};
  const fromAsset = 'BTC.BTC';

  logSwapEvent('EXECUTE_REQUEST', { chain: 'BTC', toAsset, amount, userAddress });

  try {
    if (!isBtcAddress(userAddress)) {
      return res.status(400).json({ success: false, error: 'Invalid BTC address' });
    }

    const { amountAfterFee, fee } = applyInputFee(amount);
    if (amountAfterFee <= 0 || fee < 0) {
      return res.status(400).json({ success: false, error: 'Invalid amount after fee' });
    }
    console.log('0.01% fee applied:', fee);
    logSwapEvent('FEE_APPLIED', { chain: 'BTC', fee, amountAfterFee });

    const swapInfo = await buildThorchainSwap(fromAsset, toAsset, amountAfterFee, userAddress);

    if (!swapInfo) {
      return res.status(500).json({ success: false, error: 'Unable to build Thorchain swap' });
    }

    const { depositAddress, memo } = swapInfo;
    logSwapEvent('EXECUTE_RESPONSE', { chain: 'BTC', success: true });
    return res.json({
      success: true,
      fee,
      amountAfterFee,
      swapInfo: {
        depositAddress,
        memo,
        amount: amountAfterFee,
        toAsset,
        feeDestination: btcFeeWallet,
      },
    });
  } catch (error) {
    logSwapEvent('ERROR_EVENT', { context: 'execute/btc', error: error.message || error });
    console.error('[Execute] Error building BTC swap', error.message || error);
    return res.status(500).json({ success: false, error: 'Swap execution failed' });
  }
});

// POST /execute/evm
router.post('/evm', rateLimitExecute, validateExecuteRequest, async (req, res) => {
  const { bestSource, fromToken, toToken, amount, userAddress } = req.body || {};

  logSwapEvent('EXECUTE_REQUEST', { chain: 'EVM', bestSource, fromToken, toToken, amount, userAddress });

  try {
    if (!isEvmAddress(userAddress)) {
      return res.status(400).json({ success: false, error: 'Invalid EVM address' });
    }

    const { amountAfterFee, fee } = applyInputFee(amount);
    if (amountAfterFee <= 0 || fee < 0) {
      return res.status(400).json({ success: false, error: 'Invalid amount after fee' });
    }
    console.log('0.01% fee applied:', fee);
    logSwapEvent('FEE_APPLIED', { chain: 'EVM', fee, amountAfterFee });

    const feeTransfer = { to: evmFeeWallet, value: fee };

    if (bestSource === '1inch') {
      const tx = await buildOneInchSwap(fromToken, toToken, amountAfterFee, userAddress);

      if (!tx) {
        return res.status(500).json({ success: false, error: 'Unable to build 1inch transaction' });
      }

      const priceImpact = Number(
        tx?.priceImpact || tx?.estimatedPriceImpact || tx?.protocols?.[0]?.[0]?.[0]?.price_impact || 0
      );
      if (priceImpact > 0.2) {
        return res.status(400).json({ success: false, error: 'High price impact' });
      }

      logSwapEvent('EXECUTE_RESPONSE', { chain: 'EVM', source: '1inch', success: true });
      return res.json({ success: true, fee, amountAfterFee, txObject: { swapTx: tx, feeTransfer } });
    }

    if (bestSource === '0x') {
      // Reuse the quote endpoint to fetch fresh calldata aligned to user params.
      const quote = await getZeroExQuote(fromToken, toToken, amountAfterFee);

      if (!quote || !quote.data) {
        return res.status(500).json({ success: false, error: 'Unable to retrieve 0x transaction data' });
      }

      const priceImpact = Number(quote?.data?.estimatedPriceImpact || quote?.data?.priceImpact || 0);
      if (priceImpact > 0.2) {
        return res.status(400).json({ success: false, error: 'High price impact' });
      }

      const { to, data, value, gas, gasPrice } = quote.data;
      logSwapEvent('EXECUTE_RESPONSE', { chain: 'EVM', source: '0x', success: true });
      return res.json({
        success: true,
        fee,
        amountAfterFee,
        txObject: {
          swapTx: { to, data, value, gas, gasPrice },
          feeTransfer,
        },
      });
    }

    return res.status(400).json({ success: false, error: 'Unsupported aggregator source' });
  } catch (error) {
    logSwapEvent('ERROR_EVENT', { context: 'execute/evm', error: error.message || error });
    console.error('[Execute] Error building EVM transaction', error.message || error);
    return res.status(500).json({ success: false, error: 'Swap execution failed' });
  }
});

module.exports = router;
