const growthModes = {
  reserved: 0.15,
  moderate: 0.3,
  bullish: 0.5,
};

const contributionsPerYear = {
  daily: 365,
  weekly: 52,
  monthly: 12,
};

export function getGrowthRate(mode) {
  return growthModes[mode] ?? growthModes.moderate;
}

export function getPeriodsPerYear(frequency) {
  return contributionsPerYear[frequency] ?? contributionsPerYear.weekly;
}

export function computeDcaProjection({
  startingPrice,
  currentBtc,
  goalBtc,
  dcaAmount,
  frequency,
  mode,
  horizonYears = 10,
}) {
  const periodsPerYear = getPeriodsPerYear(frequency);
  const monthsPerPeriod = 12 / periodsPerYear;
  const selectedGrowth = getGrowthRate(mode);
  const labels = ['0'];
  const accumulation = [currentBtc];
  const pricePaths = { reserved: [startingPrice], moderate: [startingPrice], bullish: [startingPrice] };
  let balance = currentBtc;
  let goalMonths = null;
  let currentMonth = 0;
  const totalPeriods = Math.ceil(horizonYears * periodsPerYear);

  for (let period = 1; period <= totalPeriods; period += 1) {
    const yearsElapsed = period / periodsPerYear;
    const currentPrice = startingPrice * (1 + selectedGrowth) ** yearsElapsed;
    balance += dcaAmount / currentPrice;

    const monthProgress = period * monthsPerPeriod;
    while (currentMonth < monthProgress && currentMonth < horizonYears * 12) {
      currentMonth += 1;
      if (currentMonth % 12 === 0) {
        const yearLabel = currentMonth / 12;
        labels.push(yearLabel.toString());
        Object.keys(growthModes).forEach((key) => {
          const rate = growthModes[key];
          pricePaths[key].push(startingPrice * (1 + rate) ** yearLabel);
        });
        accumulation.push(balance);
      }
    }

    if (goalMonths === null && balance >= goalBtc) {
      goalMonths = period * monthsPerPeriod;
      break;
    }
  }

  if (labels.length - 1 < horizonYears) {
    const lastBalance = accumulation[accumulation.length - 1];
    const lastYear = labels.length - 1;
    for (let year = lastYear + 1; year <= horizonYears; year += 1) {
      labels.push(year.toString());
      accumulation.push(lastBalance);
      Object.keys(growthModes).forEach((key) => {
        const rate = growthModes[key];
        pricePaths[key].push(startingPrice * (1 + rate) ** year);
      });
    }
  }

  return { labels, accumulation, pricePaths, goalMonths };
}
