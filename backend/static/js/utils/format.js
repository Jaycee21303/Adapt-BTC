export const formatCurrency = (value) => `$${Number(value || 0).toFixed(2)}`;
export const formatBtc = (value) => `${Number(value || 0).toFixed(8)} BTC`;
