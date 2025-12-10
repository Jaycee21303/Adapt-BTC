import { initNavbar, initScrollAnimations } from './components/navbar.js';
import { formatCurrency, formatPercent } from './utils/format.js';

const priceEl = document.querySelector('[data-btc-price]');
const changeEl = document.querySelector('[data-btc-change]');

async function updateBtcTicker() {
  if (!priceEl || !changeEl) return;
  try {
    const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true', {
      cache: 'no-store',
    });
    if (!response.ok) throw new Error('Failed to fetch BTC price');
    const data = await response.json();
    const price = data?.bitcoin?.usd;
    const change = data?.bitcoin?.usd_24h_change;
    priceEl.textContent = formatCurrency(price, 0);
    changeEl.textContent = `${formatPercent(change)} 24h`;
    const isPositive = Number(change) >= 0;
    changeEl.classList.toggle('positive', isPositive);
    changeEl.classList.toggle('negative', !isPositive);
  } catch (error) {
    priceEl.textContent = '—';
    changeEl.textContent = 'Unavailable';
    changeEl.classList.remove('positive', 'negative');
  }
}

function startTicker() {
  updateBtcTicker();
  setInterval(updateBtcTicker, 60000);
}

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initScrollAnimations();
  startTicker();
});
