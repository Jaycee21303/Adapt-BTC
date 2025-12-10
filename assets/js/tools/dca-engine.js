import { formatCurrency, formatTimeline } from '../utils/format.js';
import { computeDcaProjection } from '../utils/math.js';

const colorPalette = {
  reserved: 'rgba(244, 152, 72, 0.9)',
  moderate: 'rgba(37, 99, 235, 0.9)',
  bullish: 'rgba(16, 185, 129, 0.9)',
  accumulation: '#0f172a',
};

let startingPrice = 30000;
let latestPricePaths = { reserved: [], moderate: [], bullish: [] };

const inputs = {
  currentBtc: document.getElementById('current-btc'),
  goalBtc: document.getElementById('goal-btc'),
  dcaAmount: document.getElementById('dca-amount'),
  frequency: document.getElementById('frequency'),
  mode: document.getElementById('mode'),
};

const goalTimelineEl = document.getElementById('goal-timeline');
const livePriceEl = document.getElementById('current-price');
const livePriceStatusEl = document.getElementById('price-status');
const ctx = document.getElementById('dca-chart');

if (ctx) {
  const chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: [],
      datasets: [
        { label: 'BTC accumulation', data: [], borderColor: colorPalette.accumulation, backgroundColor: colorPalette.accumulation, borderWidth: 3, tension: 0.25, yAxisID: 'btc' },
        { label: 'Reserved price path', data: [], borderColor: colorPalette.reserved, backgroundColor: colorPalette.reserved, borderWidth: 2, borderDash: [6, 6], tension: 0.25, yAxisID: 'price' },
        { label: 'Moderate price path', data: [], borderColor: colorPalette.moderate, backgroundColor: colorPalette.moderate, borderWidth: 2, borderDash: [6, 6], tension: 0.25, yAxisID: 'price' },
        { label: 'Bullish price path', data: [], borderColor: colorPalette.bullish, backgroundColor: colorPalette.bullish, borderWidth: 2, borderDash: [6, 6], tension: 0.25, yAxisID: 'price' },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { position: 'bottom' },
        tooltip: {
          callbacks: {
            label: (context) => {
              const label = context.dataset.label || '';
              const value = context.parsed.y;
              const isPrice = context.dataset.yAxisID === 'price';
              if (isPrice) return `${label}: ${formatCurrency(value, 0)}`;
              const modeKey = inputs.mode?.value || 'moderate';
              const priceSeries = latestPricePaths[modeKey] || [];
              const priceAtPoint = priceSeries[context.dataIndex];
              const usdValue = Number.isFinite(priceAtPoint) ? value * priceAtPoint : value * startingPrice;
              return [`${label}: ${value.toFixed(4)} BTC`, `≈ ${formatCurrency(usdValue, 0)}`];
            },
          },
        },
      },
      scales: {
        btc: { type: 'linear', position: 'left', title: { display: true, text: 'BTC Balance' }, grid: { drawOnChartArea: true } },
        price: {
          type: 'linear',
          position: 'right',
          title: { display: true, text: 'BTC Price (USD)' },
          grid: { drawOnChartArea: false },
          ticks: { callback: (value) => formatCurrency(Number(value), 0) },
        },
        x: { title: { display: true, text: 'Years from now' } },
      },
    },
  });

  function readInput(el, fallback = 0) {
    const parsed = parseFloat(el?.value ?? fallback);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  function project() {
    const currentBtc = readInput(inputs.currentBtc, 0);
    const goalBtc = readInput(inputs.goalBtc, 1);
    const dcaAmount = readInput(inputs.dcaAmount, 0);
    const frequency = inputs.frequency?.value || 'weekly';
    const mode = inputs.mode?.value || 'moderate';

    const { labels, accumulation, pricePaths, goalMonths } = computeDcaProjection({
      startingPrice,
      currentBtc,
      goalBtc,
      dcaAmount,
      frequency,
      mode,
    });

    chart.data.labels = labels;
    chart.data.datasets[0].data = accumulation;
    chart.data.datasets[1].data = pricePaths.reserved;
    chart.data.datasets[2].data = pricePaths.moderate;
    chart.data.datasets[3].data = pricePaths.bullish;
    latestPricePaths = pricePaths;
    chart.update();

    const timelineText = goalMonths && goalMonths <= 120 ? formatTimeline(goalMonths) : goalMonths ? formatTimeline(goalMonths) : 'Beyond 10 years with current plan';
    if (goalTimelineEl) goalTimelineEl.textContent = timelineText;
  }

  async function loadLivePrice() {
    const apiUrl = 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true';
    try {
      const response = await fetch(apiUrl, { cache: 'no-store' });
      if (!response.ok) throw new Error('Unable to fetch price');
      const data = await response.json();
      const livePrice = data?.bitcoin?.usd;
      if (Number.isFinite(livePrice)) {
        startingPrice = livePrice;
        if (livePriceEl) livePriceEl.textContent = formatCurrency(livePrice, 0);
        if (livePriceStatusEl) livePriceStatusEl.textContent = 'Live price from CoinGecko';
        project();
        return;
      }
      throw new Error('Invalid price data');
    } catch (error) {
      if (livePriceStatusEl) livePriceStatusEl.textContent = 'Using fallback price due to live data issue';
      if (livePriceEl) livePriceEl.textContent = formatCurrency(startingPrice, 0);
      project();
    }
  }

  [inputs.currentBtc, inputs.goalBtc, inputs.dcaAmount, inputs.frequency, inputs.mode].forEach((input) => {
    input?.addEventListener('input', project);
    input?.addEventListener('change', project);
  });

  project();
  loadLivePrice();
}
