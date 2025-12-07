import React from 'react';

const TOKEN_OPTIONS = [
  {
    symbol: 'SOL',
    label: 'SOL (Solana)',
    chain: 'SOL',
    routeParam: 'So11111111111111111111111111111111111111112',
    thorchainAsset: 'SOL.SOL',
  },
  {
    symbol: 'USDC',
    label: 'USDC (Solana)',
    chain: 'SOL',
    routeParam: 'EPjFWdd5AufqSSqeM2qGNcGgSgG5A75daCVQAtF5epQ',
    thorchainAsset: 'USDC.USDC',
  },
  {
    symbol: 'ETH',
    label: 'ETH (Ethereum)',
    chain: 'EVM',
    routeParam: 'ETH',
    thorchainAsset: 'ETH.ETH',
  },
  {
    symbol: 'USDT',
    label: 'USDT (Ethereum)',
    chain: 'EVM',
    routeParam: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    thorchainAsset: 'USDT.USDT',
  },
  {
    symbol: 'BTC',
    label: 'BTC (Bitcoin)',
    chain: 'BTC',
    routeParam: 'BTC',
    thorchainAsset: 'BTC.BTC',
  },
];

const TokenSelector = ({ label, selectedToken, onChange }) => {
  const handleChange = (event) => {
    const next = TOKEN_OPTIONS.find((item) => item.routeParam === event.target.value);
    if (next && onChange) {
      onChange(next);
    }
  };

  return (
    <div className="token-selector">
      <label className="selector-label" htmlFor={`token-${label}`}>
        {label}
      </label>
      <select
        id={`token-${label}`}
        value={selectedToken?.routeParam || ''}
        onChange={handleChange}
        className="selector-input"
      >
        {TOKEN_OPTIONS.map((token) => (
          <option key={token.routeParam} value={token.routeParam}>
            {token.label}
          </option>
        ))}
      </select>
      <style jsx>{`
        .token-selector {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        .selector-label {
          font-size: 0.9rem;
          color: #0a2a52;
          font-weight: 600;
        }
        .selector-input {
          padding: 0.6rem 0.75rem;
          border: 1px solid #d0d7de;
          border-radius: 0.5rem;
          font-size: 1rem;
          color: #0f172a;
          background: #ffffff;
        }
      `}</style>
    </div>
  );
};

export { TOKEN_OPTIONS };
export default TokenSelector;
