export function formatCurrency(value, digits = 0) {
  if (!Number.isFinite(value)) return '—';
  return value.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: digits });
}

export function formatPercent(value, digits = 2) {
  if (!Number.isFinite(value)) return '—';
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(digits)}%`;
}

export function formatBtc(value, digits = 4) {
  if (!Number.isFinite(value)) return '0';
  return `${value.toFixed(digits)} BTC`;
}

export function formatTimeline(months) {
  if (!Number.isFinite(months)) return '—';
  if (months < 1) return 'Already at goal';
  const years = Math.floor(months / 12);
  const remainingMonths = Math.round(months % 12);
  const parts = [];
  if (years > 0) parts.push(`${years} year${years === 1 ? '' : 's'}`);
  if (remainingMonths > 0) parts.push(`${remainingMonths} month${remainingMonths === 1 ? '' : 's'}`);
  return parts.join(' ');
}
