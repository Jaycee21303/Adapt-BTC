(function () {
  const HISTORY_CACHE = new Map(https://github.com/Jaycee21303/Adapt-BTC/pull/96/conflicts);
  let snapshotCache = null;
  const API_BASE = 'https://api.coingecko.com/api/v3';

  const defaultColors = {
    line: '#1b73ff',
    fill: 'rgba(27, 115, 255, 0.12)',
    grid: '#e5e7eb',
    tick: '#4b5563',
  };

  function formatCurrency(value) {
    if (typeof value !== 'number' || Number.isNaN(value)) return '—';
    return value.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: value >= 1000 ? 0 : 2,
    });
  }

  function setStatus(statusEl, message, isError = false) {
    if (!statusEl) return;
    statusEl.textContent = message;
    statusEl.classList.toggle('error', Boolean(isError));
  }

  async function fetchHistoricalPrices(rangeDays = 'max') {
    if (HISTORY_CACHE.has(rangeDays)) {
      return HISTORY_CACHE.get(rangeDays);
    }

    const response = await fetch(`${API_BASE}/history?days=${rangeDays}`);
    if (!response.ok) throw new Error('Failed to fetch BTC history');

    const data = await response.json();
    if (!Array.isArray(data?.prices)) throw new Error('Invalid BTC history response');

    const parsed = data.prices.map(([timestamp, price]) => ({ x: timestamp, y: price }));
    HISTORY_CACHE.set(rangeDays, parsed);
    return parsed;
  }

  async function fetchBtcSnapshot() {
    if (snapshotCache) return snapshotCache;

    const response = await fetch(`${API_BASE}/snapshot`);
    if (!response.ok) throw new Error('Failed to fetch BTC snapshot');

    const data = await response.json();
    const market = data?.market_data || {};
    snapshotCache = {
      price: market.current_price?.usd ?? null,
      change24h: market.price_change_percentage_24h ?? null,
      ath: market.ath?.usd ?? null,
      athDate: market.ath_date?.usd ? new Date(market.ath_date.usd) : null,
      lastUpdated: data?.last_updated ? new Date(data.last_updated) : null,
    };
    return snapshotCache;
  }

  function applySummary(snapshot, summarySelectors = {}) {
    if (!snapshot) return;
    const { priceElId, changeElId, athElId } = summarySelectors;

    if (priceElId) {
      const el = document.getElementById(priceElId);
      if (el) el.textContent = formatCurrency(snapshot.price);
    }

    if (changeElId) {
      const el = document.getElementById(changeElId);
      if (el) {
        if (typeof snapshot.change24h === 'number') {
          const isPositive = snapshot.change24h >= 0;
          el.textContent = `${isPositive ? '+' : ''}${snapshot.change24h.toFixed(2)}% 24h`;
          el.classList.toggle('positive', isPositive);
          el.classList.toggle('negative', !isPositive);
        } else {
          el.textContent = '—';
          el.classList.remove('positive', 'negative');
        }
      }
    }

    if (athElId) {
      const el = document.getElementById(athElId);
      if (el) {
        const athValue = formatCurrency(snapshot.ath);
        const athDate = snapshot.athDate
          ? snapshot.athDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
          : '';
        el.textContent = snapshot.ath ? `${athValue} • ${athDate}` : '—';
      }
    }
  }

  function createGradient(ctx, color) {
    const gradient = ctx.createLinearGradient(0, 0, 0, ctx.canvas.height);
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, 'rgba(27, 115, 255, 0)');
    return gradient;
  }

  function buildChart(canvas, data, { compact = false } = {}) {
    if (!window.Chart) return null;

    const ctx = canvas.getContext('2d');
    const lineColor = defaultColors.line;

    return new Chart(ctx, {
      type: 'line',
      data: {
        datasets: [
          {
            label: 'BTC/USD',
            data,
            borderColor: lineColor,
            backgroundColor: createGradient(ctx, defaultColors.fill),
            borderWidth: 2.8,
            pointRadius: 0,
            tension: 0.2,
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context) => {
                const value = context.parsed.y;
                return `BTC/USD: ${formatCurrency(value)}`;
              },
            },
          },
          zoom: {
            pan: { enabled: true, mode: 'x' },
            zoom: {
              wheel: { enabled: true },
              pinch: { enabled: true },
              mode: 'x',
            },
          },
        },
        scales: {
          x: {
            type: 'time',
            time: { unit: compact ? 'month' : 'year' },
            grid: { color: defaultColors.grid, drawBorder: false },
            ticks: { color: defaultColors.tick, autoSkip: true, maxTicksLimit: compact ? 6 : 12 },
          },
          y: {
            title: { display: true, text: 'Price (USD)' },
            ticks: {
              color: defaultColors.tick,
              callback: (value) => formatCurrency(value),
            },
            grid: { color: defaultColors.grid, drawBorder: false },
          },
        },
      },
    });
  }

  async function initBtcPriceChart({
    canvasId,
    statusId,
    rangeDays = 'max',
    summarySelectors,
    compact = false,
  }) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const statusEl = statusId ? document.getElementById(statusId) : null;
    setStatus(statusEl, 'Loading BTC price data…');

    try {
      const [history, snapshot] = await Promise.all([
        fetchHistoricalPrices(rangeDays),
        fetchBtcSnapshot(),
      ]);

      applySummary(snapshot, summarySelectors);
      buildChart(canvas, history, { compact });
      const updatedLabel = snapshot?.lastUpdated
        ? `Updated ${snapshot.lastUpdated.toLocaleString()}`
        : 'Live market data';
      setStatus(statusEl, updatedLabel);
    } catch (error) {
      console.error('BTC price map error', error);
      setStatus(statusEl, 'Unable to load BTC chart right now. Please try again later.', true);
    }
  }

  function registerZoomPlugin() {
    const zoomPlugin = window.ChartZoom || window['chartjs-plugin-zoom'];
    if (window.Chart && zoomPlugin) {
      Chart.register(zoomPlugin);
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    registerZoomPlugin();

    initBtcPriceChart({
      canvasId: 'price-map-chart',
      statusId: 'price-map-status',
      rangeDays: 'max',
      compact: false,
      summarySelectors: {
        priceElId: 'price-map-current',
        changeElId: 'price-map-change',
        athElId: 'price-map-ath',
      },
    });

    initBtcPriceChart({
      canvasId: 'price-map-preview',
      statusId: 'price-map-preview-status',
      rangeDays: 90,
      compact: true,
    });
  });
})();
