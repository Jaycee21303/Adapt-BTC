import { growthProjection } from '../utils/math.js';
import { formatCurrency, formatBtc } from '../utils/format.js';

function renderSummary(total) {
  const summary = document.getElementById('dca-summary');
  if (!summary) return;
  summary.innerHTML = `
    <div class="card"><strong>Total projected</strong><p>${formatCurrency(total)}</p></div>
  `;
}

function renderChart(data) {
  const canvas = document.getElementById('dca-chart');
  if (!canvas || !window.Chart) return;
  const ctx = canvas.getContext('2d');
  if (canvas.chartInstance) canvas.chartInstance.destroy();
  canvas.chartInstance = new window.Chart(ctx, {
    type: 'line',
    data: {
      labels: data.results.map((r) => r.month),
      datasets: [{ label: 'Projected balance', data: data.results.map((r) => r.total), borderColor: '#0A84FF', fill: false }],
    },
    options: { responsive: true, plugins: { legend: { display: false } } },
  });
}

function initDcaTool() {
  const runBtn = document.getElementById('run-dca');
  if (!runBtn) return;
  const modeButtons = document.querySelectorAll('.mode-select [data-mode]');
  let mode = 'moderate';

  modeButtons.forEach((btn) => btn.addEventListener('click', () => {
    mode = btn.dataset.mode;
    modeButtons.forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
  }));

  runBtn.addEventListener('click', () => {
    const amount = Number(document.getElementById('dca-amount').value || 0);
    const frequency = Number(document.getElementById('dca-frequency').value || 1);
    const projection = growthProjection(amount, frequency, 3, mode);
    renderChart(projection);
    renderSummary(projection.total);
  });
}

document.addEventListener('DOMContentLoaded', initDcaTool);
