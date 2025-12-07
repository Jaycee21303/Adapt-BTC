import React, { useState } from 'react';

const RouteDetailsModal = ({ isOpen, onClose, routeData }) => {
  const [showRaw, setShowRaw] = useState(false);

  if (!isOpen || !routeData) return null;

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div className="modal" onClick={(e) => e.stopPropagation()} role="dialog">
        <div className="header">
          <div>
            <p className="eyebrow">Route Debug</p>
            <h3>Best route: {routeData.source || 'Unknown'}</h3>
          </div>
          <button type="button" className="close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="row">
          <span>Chain</span>
          <strong>{routeData.chain || '-'}</strong>
        </div>
        <div className="row">
          <span>Aggregator</span>
          <strong>{routeData.source || '-'}</strong>
        </div>
        <div className="row">
          <span>Estimated Output</span>
          <strong>{routeData.amountOut || routeData.expectedAmountOut || '-'}</strong>
        </div>
        <div className="row">
          <span>Slippage</span>
          <strong>{routeData.route?.slippageBps ? `${routeData.route.slippageBps / 100}%` : 'N/A'}</strong>
        </div>
        <div className="row">
          <span>Fees</span>
          <strong>DEX + 0.01% AdaptBTC input fee</strong>
        </div>

        <button type="button" className="secondary" onClick={() => setShowRaw((prev) => !prev)}>
          {showRaw ? 'Hide Raw JSON' : 'Show Raw JSON'}
        </button>
        {showRaw && <pre className="raw-box">{JSON.stringify(routeData.raw || routeData, null, 2)}</pre>}

        <style jsx>{`
          .modal-backdrop {
            position: fixed;
            inset: 0;
            background: rgba(15, 23, 42, 0.45);
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
            padding: 1.25rem 1.25rem 1.5rem;
            max-width: 640px;
            width: 100%;
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
            box-shadow: 0 16px 48px rgba(10, 42, 82, 0.16);
            animation: slideIn 0.25s ease-out;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 0.75rem;
          }
          .eyebrow {
            margin: 0;
            font-size: 0.85rem;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            color: #2b6cb0;
            font-weight: 700;
          }
          h3 {
            margin: 0.2rem 0 0;
            color: #0a2a52;
          }
          .row {
            display: flex;
            justify-content: space-between;
            background: #f8fbff;
            padding: 0.75rem 0.85rem;
            border-radius: 0.75rem;
            border: 1px solid #e2e8f0;
            color: #0f172a;
          }
          .secondary {
            background: #e5ecf6;
            color: #0a2a52;
            border: 1px solid #cbd5e1;
            padding: 0.7rem 1rem;
            border-radius: 0.75rem;
            cursor: pointer;
            font-weight: 700;
          }
          .secondary:hover {
            background: #d8e5f7;
          }
          .close {
            background: #eff6ff;
            color: #0a2a52;
            border: none;
            border-radius: 50%;
            width: 38px;
            height: 38px;
            cursor: pointer;
            font-size: 1rem;
            font-weight: 800;
          }
          .raw-box {
            background: #0f172a;
            color: #e2e8f0;
            padding: 0.85rem;
            border-radius: 0.75rem;
            max-height: 260px;
            overflow: auto;
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

export default RouteDetailsModal;
