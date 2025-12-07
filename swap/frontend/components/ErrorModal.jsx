import React from 'react';

const ErrorModal = ({ isOpen, onClose, errorMessage }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div className="modal" onClick={(e) => e.stopPropagation()} role="dialog">
        <div className="icon-circle">!</div>
        <h3>Something went wrong</h3>
        <p className="message">{errorMessage || 'An unexpected error occurred.'}</p>
        <button type="button" className="primary" onClick={onClose}>
          Try Again
        </button>
        <style jsx>{`
          .modal-backdrop {
            position: fixed;
            inset: 0;
            background: rgba(148, 27, 27, 0.35);
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
            max-width: 460px;
            width: 100%;
            display: flex;
            flex-direction: column;
            gap: 0.8rem;
            box-shadow: 0 14px 45px rgba(148, 27, 27, 0.25);
            animation: slideIn 0.25s ease-out;
            text-align: center;
          }
          .icon-circle {
            width: 68px;
            height: 68px;
            margin: 0 auto;
            border-radius: 50%;
            background: linear-gradient(135deg, #f56565, #b91c1c);
            color: #ffffff;
            display: grid;
            place-items: center;
            font-size: 2rem;
            font-weight: 800;
            box-shadow: 0 12px 24px rgba(185, 28, 28, 0.35);
          }
          h3 {
            margin: 0;
            color: #7f1d1d;
          }
          .message {
            margin: 0;
            color: #1f2937;
          }
          .primary {
            background: #b91c1c;
            color: #ffffff;
            border: none;
            padding: 0.85rem 1.1rem;
            border-radius: 0.75rem;
            font-weight: 700;
            cursor: pointer;
          }
          .primary:hover {
            transform: translateY(-1px);
            box-shadow: 0 10px 22px rgba(185, 28, 28, 0.35);
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

export default ErrorModal;
