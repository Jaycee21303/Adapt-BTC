// Simple input-based fee engine to apply a universal 0.01% fee before routing swaps.

const FEE_RATE = 0.0001; // 0.01%

function applyInputFee(amountInBaseUnits) {
  const normalizedAmount = Number(amountInBaseUnits);

  if (!Number.isFinite(normalizedAmount) || normalizedAmount <= 0) {
    throw new Error('Invalid amount for fee calculation');
  }

  const fee = Math.floor(normalizedAmount * FEE_RATE);
  const amountAfterFee = normalizedAmount - fee;

  return {
    amountAfterFee,
    fee,
  };
}

module.exports = {
  FEE_RATE,
  applyInputFee,
};
