// Optimizer service to choose the best swap route among EVM aggregators.
// Future iterations can incorporate fees, risk scoring, or routing heuristics.

// Select the quote with the highest expected output amount.
function pickBestRoute(quotesArray = []) {
  const validQuotes = quotesArray.filter(Boolean);

  if (!validQuotes.length) {
    return { bestSource: null, bestQuote: null };
  }

  const bestQuote = validQuotes.reduce((currentBest, quote) => {
    if (!currentBest) return quote;
    return BigInt(quote.amountOut || 0) > BigInt(currentBest.amountOut || 0) ? quote : currentBest;
  }, null);

  return {
    bestSource: bestQuote?.source || null,
    bestQuote: bestQuote || null,
  };
}

module.exports = {
  pickBestRoute,
};
