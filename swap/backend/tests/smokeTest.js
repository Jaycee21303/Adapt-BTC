// Lightweight smoke tests for swap backend quote retrieval.
// These rely on live aggregator endpoints and are intended for quick QA before deploy.

const { getQuote } = require('../services/jupiter');
const { getOneInchQuote } = require('../services/oneInch');
const { getZeroExQuote } = require('../services/zeroEx');
const { getThorchainQuote } = require('../services/thorchain');

async function testSolanaQuote() {
  try {
    const route = await getQuote(
      'So11111111111111111111111111111111111111112',
      'Es9vMFrzaCERJcVhD9rdji3TbtV7zF7b6jc1i2gNi5wr',
      '1000000'
    );
    if (route && route.outAmount) {
      console.log('PASS: Solana quote returned outAmount');
    } else {
      console.error('FAIL: Solana quote missing outAmount');
    }
  } catch (error) {
    console.error('FAIL: Solana quote error', error.message || error);
  }
}

async function testEvmQuote() {
  try {
    const [oneInch, zeroEx] = await Promise.all([
      getOneInchQuote('0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE', '0xdAC17F958D2ee523a2206206994597C13D831ec7', '10000000000000000'),
      getZeroExQuote('ETH', 'USDT', '10000000000000000'),
    ]);
    if ((oneInch && oneInch.amountOut) || (zeroEx && zeroEx.amountOut)) {
      console.log('PASS: EVM quote returned from at least one source');
    } else {
      console.error('FAIL: EVM quotes missing amountOut');
    }
  } catch (error) {
    console.error('FAIL: EVM quote error', error.message || error);
  }
}

async function testBtcQuote() {
  try {
    const quote = await getThorchainQuote('BTC.BTC', 'ETH.ETH', '100000');
    if (quote && quote.expectedAmountOut) {
      console.log('PASS: BTC quote returned expectedAmountOut');
    } else {
      console.error('FAIL: BTC quote missing expectedAmountOut');
    }
  } catch (error) {
    console.error('FAIL: BTC quote error', error.message || error);
  }
}

(async () => {
  await testSolanaQuote();
  await testEvmQuote();
  await testBtcQuote();
})();
