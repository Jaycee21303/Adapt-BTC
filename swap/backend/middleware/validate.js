// Validation middleware for quote and execute requests.
// Ensures basic parameter presence and rough formatting before routing logic runs.

const { applyInputFee } = require('../services/feeEngine');

function isPositiveInteger(value) {
  const num = Number(value);
  return Number.isInteger(num) && num > 0;
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

// Validate required query params for quote endpoints.
function validateQuoteRequest(req, res, next) {
  const path = req.path.toLowerCase();
  const { from, to, amount, address } = req.query;

  if (path.includes('/btc')) {
    // BTC quotes always assume from=BTC.BTC
    if (!isNonEmptyString(to) || !isNonEmptyString(address) || !isPositiveInteger(amount)) {
      return res.status(400).json({ success: false, error: 'Invalid parameters' });
    }
    return next();
  }

  if (!isNonEmptyString(from) || !isNonEmptyString(to) || !isNonEmptyString(address)) {
    return res.status(400).json({ success: false, error: 'Invalid parameters' });
  }

  if (!isPositiveInteger(amount)) {
    return res.status(400).json({ success: false, error: 'Invalid parameters' });
  }

  return next();
}

// Validate payloads for execute endpoints per chain.
function validateExecuteRequest(req, res, next) {
  const path = req.path.toLowerCase();
  const body = req.body || {};

  // Shared validations
  if (!isPositiveInteger(body.amount || body.inAmount || body.inputAmount || body.amountAfterFee || body.route?.inAmount)) {
    return res.status(400).json({ success: false, error: 'Invalid amount' });
  }

  // Chain-specific checks
  if (path.includes('solana')) {
    if (!body.route || !isNonEmptyString(body.userPublicKey)) {
      return res.status(400).json({ success: false, error: 'Invalid parameters' });
    }

    const { amountAfterFee } = applyInputFee(Number(body.route?.inAmount || body.route?.amount || body.route?.inputAmount));
    if (!isPositiveInteger(amountAfterFee)) {
      return res.status(400).json({ success: false, error: 'Invalid amount after fee' });
    }
  }

  if (path.includes('evm')) {
    const { bestSource, fromToken, toToken, userAddress, amount } = body;
    if (!isNonEmptyString(bestSource) || !isNonEmptyString(fromToken) || !isNonEmptyString(toToken) || !isNonEmptyString(userAddress)) {
      return res.status(400).json({ success: false, error: 'Invalid parameters' });
    }
    const { amountAfterFee } = applyInputFee(Number(amount));
    if (!isPositiveInteger(amountAfterFee)) {
      return res.status(400).json({ success: false, error: 'Invalid amount after fee' });
    }
  }

  if (path.includes('btc')) {
    const { toAsset, userAddress, amount } = body;
    if (!isNonEmptyString(toAsset) || !isNonEmptyString(userAddress)) {
      return res.status(400).json({ success: false, error: 'Invalid parameters' });
    }
    const { amountAfterFee } = applyInputFee(Number(amount));
    if (!isPositiveInteger(amountAfterFee)) {
      return res.status(400).json({ success: false, error: 'Invalid amount after fee' });
    }
  }

  return next();
}

module.exports = {
  validateQuoteRequest,
  validateExecuteRequest,
};
