export function growthProjection(amount, frequency, years, mode = 'moderate') {
  const growthMap = { reserved: 0.05, moderate: 0.15, bullish: 0.3 };
  const rate = growthMap[mode] || growthMap.moderate;
  const periods = years * 12 / frequency;
  const results = [];
  let total = 0;
  for (let i = 1; i <= periods; i++) {
    total += amount;
    total *= 1 + rate / 12;
    results.push({ month: i, total });
  }
  return { total, results };
}
