import React from 'react';

const getExplorerLink = (chain, txId) => {
  if (!txId) return null;
  if (chain === 'SOL') return `https://solscan.io/tx/${txId}`;
  if (chain === 'EVM') return `https://etherscan.io/tx/${txId}`;
  if (chain === 'BTC') return `https://mempool.space/tx/${txId}`;
  return null;
};

const SuccessModal = ({ isOpen, onClose, txId, chain }) => {
  if (!isOpen) return null;
  const explorerLink = getExplorerLink(chain, txId);

  const handleCopy = () => {
    if (txId) {
      navigator.clipboard.writeText(txId);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div className="modal" onClick={(e) => e.stopPropagation()} role="dialog">
        <div className="icon-circle">✓</div>
        <h3>Swap Successful!</h3>
        {txId && (
          <div className="tx-row">
            <p className="txid">TxID: {txId}</p>
            <button type="button" className="copy" onClick={handleCopy}>
              Copy
            </button>
          </div>
        )}
        {explorerLink && (
          <a className="link" href={explorerLink} target="_blank" rel="noreferrer">
            View on {chain === 'EVM' ? 'Etherscan' : chain === 'SOL' ? 'Solscan' : 'Explorer'}
          </a>
        )}
        {!txId && <p className="muted">Awaiting transaction details from wallet...</p>}
        <button type="button" className="primary" onClick={onClose}>
          Close
        </button>
        <style jsx>{`
          .modal-backdrop {
            position: fixed;
            inset: 0;
            background: rgba(10, 42, 82, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 1rem;
            animation: fadeIn 0.2s ease-out;
            z-index: 1200;
          }
          .modal {
            background: #ffffff;
            border-radius: 1rem;
            padding: 1.5rem;
            max-width: 480px;
            width: 100%;
            display: flex;
            flex-direction: column;
            gap: 0.85rem;
            box-shadow: 0 14px 45px rgba(13, 56, 108, 0.18);
            animation: slideIn 0.25s ease-out;
            text-align: center;
          }
          .icon-circle {
            width: 68px;
            height: 68px;
            margin: 0 auto;
            border-radius: 50%;
            background: linear-gradient(135deg, #2b6cb0, #63b3ed);
            color: #ffffff;
            display: grid;
            place-items: center;
            font-size: 2rem;
            font-weight: 800;
            box-shadow: 0 12px 24px rgba(43, 108, 176, 0.25);
          }
          h3 {
            margin: 0;
            color: #0a2a52;
          }
          .tx-row {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            flex-wrap: wrap;
          }
          .txid {
            word-break: break-all;
            margin: 0;
            color: #0f172a;
            font-weight: 600;
          }
          .copy {
            border: 1px solid #d0d7de;
            background: #f8fbff;
            color: #0a2a52;
            border-radius: 0.75rem;
            padding: 0.5rem 0.9rem;
            cursor: pointer;
            font-weight: 700;
          }
          .copy:hover {
            background: #e5f1ff;
          }
          .link {
            color: #2b6cb0;
            font-weight: 700;
          }
          .muted {
            color: #475569;
            margin: 0;
          }
          .primary {
            background: #2b6cb0;
            color: #ffffff;
            border: none;
            padding: 0.85rem 1.1rem;
            border-radius: 0.75rem;
            font-weight: 700;
            cursor: pointer;
          }
          .primary:hover {
            transform: translateY(-1px);
            box-shadow: 0 10px 22px rgba(43, 108, 176, 0.35);
          }
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes slideIn {
            from { transform: translateY(8px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
        `}</style>
      </div>
    </div>
  );
};

export default SuccessModal;
