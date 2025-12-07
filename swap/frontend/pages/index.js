import React, { useContext, useEffect, useMemo, useState } from 'react';
import WalletConnect from '../components/WalletConnect';
import TokenSelector, { TOKEN_OPTIONS } from '../components/TokenSelector';
import { WalletProvider, WalletContext } from '../context/WalletContext';
import SuccessModal from '../components/SuccessModal';
import ErrorModal from '../components/ErrorModal';
import RouteDetailsModal from '../components/RouteDetailsModal';

const FEE_RATE = 0.0001;
const GAS_WARNING_THRESHOLD = 500000;
const API_BASE = (process.env.NEXT_PUBLIC_SWAP_BACKEND_URL || '').replace(/\/$/, '');

const formatNumber = (value) => {
  if (value === null || value === undefined) return '-';
  const numeric = Number(value);
  if (Number.isNaN(numeric)) return value;
  return numeric.toLocaleString();
};

const Spinner = () => <span className="spinner" aria-label="Loading" />;

const HomeContent = () => {
  const { walletAddress, chain, connectionStatus, providerObject, signer } = useContext(WalletContext);

  const [fromToken, setFromToken] = useState(TOKEN_OPTIONS[0]);
  const [toToken, setToToken] = useState(TOKEN_OPTIONS[1]);
  const [amount, setAmount] = useState('');
  const [quoteResult, setQuoteResult] = useState(null);
  const [loadingQuote, setLoadingQuote] = useState(false);
  const [loadingSwap, setLoadingSwap] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [gasWarning, setGasWarning] = useState('');
  const [btcInstructions, setBtcInstructions] = useState(null);

  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [txId, setTxId] = useState('');
  const [successChain, setSuccessChain] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [toast, setToast] = useState(null);

  useEffect(() => {
    console.log('Wallet state updated', { walletAddress, chain, connectionStatus });
  }, [walletAddress, chain, connectionStatus]);

  const triggerToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const requiredChain = fromToken?.chain;
  const walletConnected = connectionStatus === 'connected' && !!walletAddress;
  const chainMismatch = useMemo(
    () => requiredChain !== 'BTC' && walletConnected && chain && chain !== requiredChain,
    [requiredChain, walletConnected, chain]
  );

  const isAmountValid = useMemo(() => {
    const numeric = Number(amount);
    return Number.isFinite(numeric) && numeric > 0;
  }, [amount]);

  const priceImpactPct = useMemo(() => {
    const pi = quoteResult?.route?.priceImpactPct ?? quoteResult?.route?.priceImpact;
    if (pi === undefined || pi === null) return null;
    return Number(pi);
  }, [quoteResult]);

  const showPriceImpactWarning = useMemo(() => priceImpactPct !== null && priceImpactPct > 0.02, [priceImpactPct]);

  const amountAfterFee = useMemo(() => {
    if (!isAmountValid) return null;
    const numeric = Number(amount);
    const fee = Math.floor(numeric * FEE_RATE);
    return numeric - fee;
  }, [amount, isAmountValid]);

  const walletWarnings = useMemo(() => {
    const warnings = [];
    if (!walletConnected) warnings.push('Wallet not connected');
    if (chainMismatch) warnings.push('Wrong network detected');
    if (!isAmountValid) warnings.push('Enter a valid amount');
    if (!quoteResult) warnings.push('Preview a quote before swapping');
    return warnings;
  }, [walletConnected, chainMismatch, isAmountValid, quoteResult]);

  useEffect(() => {
    // Auto prompt MetaMask to switch to Ethereum mainnet when using EVM tokens
    if (fromToken?.chain === 'EVM' && walletConnected && providerObject?.request) {
      (async () => {
        try {
          const chainId = await providerObject.request({ method: 'eth_chainId' });
          if (chainId !== '0x1') {
            try {
              await providerObject.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: '0x1' }],
              });
            } catch (switchErr) {
              console.warn('Unable to switch to Ethereum mainnet', switchErr);
              setErrorMessage('Please switch to Ethereum Mainnet to perform this swap.');
              setShowError(true);
            }
          }
        } catch (err) {
          console.warn('EVM chain check failed', err);
        }
      })();
    }
  }, [fromToken, walletConnected, providerObject]);

  const handleAmountChange = (event) => {
    const nextValue = event.target.value;
    if (!/^\d*(\.\d*)?$/.test(nextValue)) return;
    setAmount(nextValue);
  };

  const buildParamsForQuote = () => {
    const fromParam = fromToken?.routeParam;
    const toParam = fromToken?.chain === 'BTC' ? toToken?.thorchainAsset : toToken?.routeParam;
    return { fromParam, toParam };
  };

  const renderNetworkBadge = (network) => {
    if (!network) return null;
    return <span className={`badge badge-${network.toLowerCase()}`}>{network}</span>;
  };

  const fetchQuote = async () => {
    if (!walletConnected) {
      setErrorMessage('Connect a wallet to fetch quotes.');
      setShowError(true);
      return;
    }
    if (chainMismatch) {
      setErrorMessage(`Wallet is connected to ${chain}, but ${fromToken.symbol} requires ${requiredChain}.`);
      setShowError(true);
      return;
    }
    if (!isAmountValid) {
      setErrorMessage('Enter a valid amount greater than zero to preview a quote.');
      setShowError(true);
      return;
    }

    const { fromParam, toParam } = buildParamsForQuote();
    setLoadingQuote(true);
    setStatusMessage('Fetching Quote...');
    setGasWarning('');
    setBtcInstructions(null);

    try {
      const query = new URLSearchParams({
        from: fromParam,
        to: toParam,
        amount: Number(amount).toString(),
        address: walletAddress,
      });
      const response = await fetch(`${API_BASE}/quote/universal?${query.toString()}`);
      const data = await response.json();

      if (!data?.success) {
        throw new Error(data?.error || 'Unable to fetch quote');
      }

      setQuoteResult({
        chain: data.chain,
        source: data.source,
        route: data.route,
        inboundAddress: data.inboundAddress,
        memo: data.memo,
        amountOut: data.amountOut || data.expectedAmountOut,
        raw: data.debug,
      });
      const estimatedGas = data?.route?.data?.estimatedGas || data?.route?.estimatedGas || data?.route?.data?.gas;
      if (data.chain === 'EVM' && estimatedGas && estimatedGas > GAS_WARNING_THRESHOLD) {
        setGasWarning('Network congestion detected — gas fees may be high.');
      }
      setStatusMessage('Quote ready');
      triggerToast('Quote updated', 'success');
    } catch (err) {
      console.error('Quote error', err);
      setErrorMessage(err.message || 'Failed to fetch quote');
      setShowError(true);
      setQuoteResult(null);
      triggerToast('Quote request failed', 'error');
    } finally {
      setLoadingQuote(false);
    }
  };

  const renderNetworkFees = () => {
    if (!quoteResult) return '-';
    if (quoteResult.chain === 'BTC' && quoteResult.raw?.fees) return JSON.stringify(quoteResult.raw.fees);
    if (quoteResult.chain === 'EVM' && quoteResult.route?.data?.gasPrice) return `${quoteResult.route.data.gasPrice} gas price`;
    if (quoteResult.chain === 'SOL' && quoteResult.route?.platformFee?.amount)
      return `${quoteResult.route.platformFee.amount} lamports`;
    return 'Not provided';
  };

  const handleSwap = async () => {
    if (!walletConnected || chainMismatch || !isAmountValid || !quoteResult) {
      setErrorMessage('Please connect the correct wallet, enter an amount, and preview a route before swapping.');
      setShowError(true);
      return;
    }

    setLoadingSwap(true);
    setStatusMessage('Preparing Swap...');
    setBtcInstructions(null);

    try {
      if (quoteResult.chain === 'SOL') {
        const response = await fetch(`${API_BASE}/execute/solana`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ route: quoteResult.route, userPublicKey: walletAddress }),
        });
        const data = await response.json();
        if (!data?.success) throw new Error(data?.error || 'Solana execution failed');

        if (providerObject?.signAndSendTransaction) {
          setStatusMessage('Waiting for Wallet...');
          try {
            const rawTx = Uint8Array.from(atob(data.serializedTx), (c) => c.charCodeAt(0));
            setStatusMessage('Broadcasting...');
            const txid = await providerObject.signAndSendTransaction(rawTx);
            setTxId(txid);
          } catch (walletErr) {
            console.warn('Wallet signing not available, surface serialized transaction instead', walletErr);
            setTxId('');
          }
        } else {
          setTxId('');
        }
        setSuccessChain('SOL');
        setShowSuccess(true);
        triggerToast('Solana swap submitted', 'success');
      }

      if (quoteResult.chain === 'EVM') {
        if (!signer) {
          throw new Error('No EVM signer available. Connect an EVM wallet.');
        }
        const response = await fetch(`${API_BASE}/execute/evm`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bestSource: quoteResult.source,
            fromToken: fromToken.routeParam,
            toToken: toToken.routeParam,
            amount: Number(amount),
            userAddress: walletAddress,
          }),
        });
        const data = await response.json();
        if (!data?.success) throw new Error(data?.error || 'EVM execution failed');

        const { swapTx, feeTransfer } = data.txObject || {};
        if (!swapTx) throw new Error('Missing transaction payload.');

        setStatusMessage('Waiting for Wallet...');
        const txResponse = await signer.sendTransaction({
          to: swapTx.to,
          data: swapTx.data,
          value: swapTx.value || '0x0',
          gasLimit: swapTx.gas,
          gasPrice: swapTx.gasPrice,
        });
        setStatusMessage('Broadcasting...');
        const txReceipt = await txResponse.wait();

        if (feeTransfer?.to && feeTransfer?.value) {
          try {
            const feeTx = await signer.sendTransaction({ to: feeTransfer.to, value: feeTransfer.value });
            await feeTx.wait();
          } catch (feeErr) {
            console.warn('Fee transfer submission issue; surface to user', feeErr);
          }
        }

        setTxId(txReceipt?.transactionHash || txResponse?.hash);
        setSuccessChain('EVM');
        setShowSuccess(true);
        triggerToast('EVM swap submitted', 'success');
      }

      if (quoteResult.chain === 'BTC') {
        setStatusMessage('BTC instructions ready');
        const response = await fetch(`${API_BASE}/execute/btc`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            toAsset: toToken.thorchainAsset,
            amount: Number(amount),
            userAddress: walletAddress,
          }),
        });
        const data = await response.json();
        if (!data?.success) throw new Error(data?.error || 'BTC execution failed');

        setBtcInstructions({
          depositAddress: data.swapInfo?.depositAddress,
          memo: data.swapInfo?.memo,
          amountAfterFee: data.amountAfterFee,
        });
        triggerToast('BTC instructions generated', 'info');
      }
    } catch (err) {
      console.error('Swap error', err);
      setErrorMessage(err.message || 'Swap failed');
      setShowError(true);
      triggerToast('Swap failed', 'error');
    } finally {
      setLoadingSwap(false);
      setStatusMessage('');
    }
  };

  return (
    <div className="page">
      {toast && (
        <div className={`toast toast-${toast.type} fade-in`}>{toast.message}</div>
      )}
      <div className="card fade-in">
        <div className="header">
          <div>
            <p className="eyebrow">AdaptBTC Swap</p>
            <h1>Cross-Chain Swap</h1>
            <p className="muted">Connect your wallet, preview the best route, and execute with one click.</p>
          </div>
          <WalletConnect
            onConnect={(payload) => console.log('Connected', payload)}
            onDisconnect={() => console.log('Disconnected')}
            onNetworkMismatch={(payload) => console.warn('Network mismatch', payload)}
          />
        </div>

        <div className="grid">
          <TokenSelector label="From" selectedToken={fromToken} onChange={setFromToken} />
          <TokenSelector label="To" selectedToken={toToken} onChange={setToToken} />
        </div>

        <div className="input-group">
          <label htmlFor="amount">Amount (base units)</label>
          <input
            id="amount"
            type="text"
            value={amount}
            onChange={handleAmountChange}
            placeholder="Enter amount"
          />
        </div>

        <div className="info-row">
          <span>From Chain:</span>
          <strong>{renderNetworkBadge(fromToken?.chain)}</strong>
        </div>
        <div className="info-row">
          <span>Wallet:</span>
          <strong>{walletAddress || 'Not connected'}</strong>
        </div>

        {walletWarnings.length > 0 && (
          <div className="warnings">
            {walletWarnings.map((msg) => (
              <p key={msg} className="warning">
                {msg}
              </p>
            ))}
          </div>
        )}

        {statusMessage && <p className="status">{statusMessage}</p>}
        {gasWarning && <p className="warning highlight">{gasWarning}</p>}
        {showPriceImpactWarning && (
          <p className="warning">
            Mini price impact warning: estimated impact {(priceImpactPct * 100).toFixed(2)}%
          </p>
        )}

        <div className="actions">
          <button
            type="button"
            className="secondary"
            onClick={fetchQuote}
            disabled={loadingQuote || !walletConnected || chainMismatch || !isAmountValid}
          >
            {loadingQuote ? (
              <span className="btn-flex"><Spinner /> Fetching Quote…</span>
            ) : (
              'Preview Quote'
            )}
          </button>
          <button
            type="button"
            className="primary"
            onClick={handleSwap}
            disabled={loadingSwap || !walletConnected || chainMismatch || !isAmountValid || !quoteResult}
          >
            {loadingSwap ? <span className="btn-flex"><Spinner /> Preparing Swap…</span> : 'Swap'}
          </button>
          {quoteResult && (
            <button type="button" className="ghost" onClick={() => setShowDetailsModal(true)}>
              Swap Route Details
            </button>
          )}
        </div>

        <div className="quote-box">
          <div className="quote-row">
            <span>Best Route Source</span>
            <div className="quote-meta">
              {renderNetworkBadge(quoteResult?.chain)}
              <strong>{quoteResult?.source || '-'}</strong>
            </div>
          </div>
          <div className="quote-row">
            <span>Output Estimate</span>
            <strong>{formatNumber(quoteResult?.amountOut)}</strong>
          </div>
          <div className="quote-row">
            <span>Network Fees</span>
            <strong>{renderNetworkFees()}</strong>
          </div>
          <div className="quote-row">
            <span>AdaptBTC Fee (0.01%)</span>
            <strong>{isAmountValid ? formatNumber(Math.floor(Number(amount) * FEE_RATE)) : '-'}</strong>
          </div>
          <div className="quote-row">
            <span>Amount After Fee</span>
            <strong>{amountAfterFee !== null ? formatNumber(amountAfterFee) : '-'}</strong>
          </div>
        </div>

        {quoteResult && (
          <details className="debug-section">
            <summary>Raw debug info</summary>
            <pre className="debug-box">{JSON.stringify(quoteResult.raw || quoteResult, null, 2)}</pre>
          </details>
        )}

        {btcInstructions && (
          <div className="btc-box">
            <h4>Send BTC to Thorchain</h4>
            <p className="muted">Use your own wallet to broadcast the BTC transaction.</p>
            <div className="quote-row">
              <span>Deposit Address</span>
              <strong>{btcInstructions.depositAddress}</strong>
              <button
                type="button"
                className="tiny"
                onClick={() => navigator.clipboard.writeText(btcInstructions.depositAddress || '')}
              >
                Copy
              </button>
            </div>
            <div className="quote-row">
              <span>Memo</span>
              <strong>{btcInstructions.memo}</strong>
              <button type="button" className="tiny" onClick={() => navigator.clipboard.writeText(btcInstructions.memo || '')}>
                Copy
              </button>
            </div>
            <div className="quote-row">
              <span>Amount After Fee</span>
              <strong>{formatNumber(btcInstructions.amountAfterFee)}</strong>
            </div>
          </div>
        )}
      </div>

      <SuccessModal isOpen={showSuccess} onClose={() => setShowSuccess(false)} txId={txId} chain={successChain} />
      <ErrorModal isOpen={showError} onClose={() => setShowError(false)} errorMessage={errorMessage} />
      <RouteDetailsModal isOpen={showDetailsModal} onClose={() => setShowDetailsModal(false)} routeData={quoteResult} />

      <style jsx>{`
        .page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #f0f4ff 0%, #e5f0ff 100%);
          padding: 2rem 1rem;
        }
        .card {
          background: #ffffff;
          border-radius: 1.25rem;
          box-shadow: 0 10px 40px rgba(10, 40, 82, 0.08);
          width: 100%;
          max-width: 980px;
          padding: 1.75rem 2rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .fade-in {
          animation: fadeIn 0.3s ease-out;
        }
        .header {
          display: flex;
          justify-content: space-between;
          gap: 1rem;
          align-items: center;
          flex-wrap: wrap;
        }
        .eyebrow {
          text-transform: uppercase;
          color: #2b6cb0;
          letter-spacing: 0.08em;
          font-weight: 700;
          margin: 0;
        }
        h1 {
          margin: 0.2rem 0;
          color: #0a2a52;
        }
        .muted {
          color: #475569;
          margin: 0;
        }
        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1rem;
        }
        .input-group {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }
        .input-group label {
          font-weight: 600;
          color: #0a2a52;
        }
        .input-group input {
          padding: 0.85rem 1rem;
          border-radius: 0.75rem;
          border: 1px solid #d0d7de;
          font-size: 1rem;
        }
        .info-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          padding: 0.75rem 1rem;
          border-radius: 0.75rem;
          color: #0f172a;
        }
        .quote-meta {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .actions {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
        }
        button {
          border: none;
          cursor: pointer;
          border-radius: 0.75rem;
          padding: 0.85rem 1.25rem;
          font-size: 1rem;
          font-weight: 700;
          transition: transform 0.08s ease, box-shadow 0.1s ease, background 0.2s ease;
        }
        button:disabled {
          cursor: not-allowed;
          opacity: 0.6;
        }
        .primary {
          background: linear-gradient(135deg, #2b6cb0, #63b3ed);
          color: #ffffff;
          box-shadow: 0 10px 20px rgba(43, 108, 176, 0.25);
        }
        .primary:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 12px 24px rgba(43, 108, 176, 0.3);
        }
        .secondary {
          background: #e2e8f0;
          color: #0f172a;
        }
        .secondary:hover:not(:disabled) {
          background: #cbd5e1;
        }
        .ghost {
          background: transparent;
          color: #2b6cb0;
          border: 1px solid #cbd5e1;
        }
        .ghost:hover {
          background: #eff6ff;
        }
        .quote-box {
          border: 1px solid #e2e8f0;
          border-radius: 1rem;
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          background: #f8fbff;
        }
        .quote-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          align-items: center;
          gap: 0.5rem;
        }
        .warning {
          color: #b45309;
          background: #fef3c7;
          border: 1px solid #fcd34d;
          padding: 0.65rem 0.75rem;
          border-radius: 0.75rem;
          margin: 0;
        }
        .warnings {
          display: grid;
          gap: 0.35rem;
        }
        .highlight {
          background: #fff4e5;
          border-color: #fdba74;
        }
        .status {
          color: #0a2a52;
          font-weight: 600;
        }
        .debug-section {
          background: #f8fafc;
          border-radius: 0.75rem;
          border: 1px solid #e2e8f0;
          padding: 0.85rem;
        }
        .debug-section summary {
          cursor: pointer;
          font-weight: 700;
          color: #2b6cb0;
        }
        .debug-box {
          background: #0f172a;
          color: #e2e8f0;
          padding: 0.75rem;
          border-radius: 0.75rem;
          overflow: auto;
          max-height: 220px;
        }
        .btc-box {
          border: 1px solid #e2e8f0;
          border-radius: 1rem;
          padding: 1rem;
          background: #fffaf0;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .tiny {
          padding: 0.4rem 0.75rem;
          border-radius: 0.5rem;
          border: 1px solid #cbd5e1;
          background: #e2e8f0;
          color: #0f172a;
        }
        .btn-flex {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
        }
        .toast {
          position: fixed;
          top: 1rem;
          right: 1rem;
          padding: 0.85rem 1rem;
          border-radius: 0.75rem;
          color: #0f172a;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
          z-index: 20;
          background: #e0f2fe;
          border: 1px solid #bae6fd;
        }
        .toast-success {
          background: #ecfdf3;
          border-color: #bbf7d0;
        }
        .toast-error {
          background: #fef2f2;
          border-color: #fecdd3;
        }
        .badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0.15rem 0.6rem;
          border-radius: 999px;
          font-weight: 700;
          font-size: 0.85rem;
          border: 1px solid transparent;
        }
        .badge-sol {
          background: #ecfeff;
          color: #0ea5e9;
          border-color: #bae6fd;
        }
        .badge-evm {
          background: #f5f3ff;
          color: #7c3aed;
          border-color: #ddd6fe;
        }
        .badge-btc {
          background: #fff7ed;
          color: #c2410c;
          border-color: #fed7aa;
        }
        .spinner {
          width: 16px;
          height: 16px;
          border: 3px solid #cbd5e1;
          border-top-color: #2b6cb0;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @media (max-width: 640px) {
          .card {
            padding: 1.25rem;
          }
          .info-row {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.25rem;
          }
          .quote-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

const HomePage = () => (
  <WalletProvider>
    <HomeContent />
  </WalletProvider>
);

export default HomePage;
