import React, { useContext, useEffect, useMemo, useState } from 'react';
import { ethers } from 'ethers';
import { WalletContext } from '../context/WalletContext';

const WalletConnect = ({ onConnect, onDisconnect, onNetworkMismatch }) => {
  const {
    chain,
    walletAddress,
    providerObject,
    setWalletState,
    resetWallet,
  } = useContext(WalletContext);

  const [mode, setMode] = useState('SOL');
  const [solanaProviders, setSolanaProviders] = useState({
    phantom: null,
    solflare: null,
    ledger: null,
  });
  const [evmProviders, setEvmProviders] = useState({
    metamask: null,
    coinbase: null,
    walletConnect: null,
  });
  const [statusMessage, setStatusMessage] = useState('');

  const chainMismatch = useMemo(
    () => chain && chain !== mode,
    [chain, mode]
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const detectSolanaWallets = () => {
      const detected = {
        phantom: null,
        solflare: null,
        ledger: null,
      };

      const { solana } = window;
      const providers = solana?.providers || [];
      const candidates = Array.isArray(providers) ? providers : [solana].filter(Boolean);

      candidates.forEach((provider) => {
        if (provider?.isPhantom) detected.phantom = provider;
        if (provider?.isSolflare) detected.solflare = provider;
        if (provider?.isLedger) detected.ledger = provider;
      });

      setSolanaProviders(detected);
    };

    const detectEvmWallets = () => {
      const detected = {
        metamask: null,
        coinbase: null,
        walletConnect: null,
      };

      const { ethereum } = window;
      const providers = ethereum?.providers || [];
      const candidates = Array.isArray(providers) ? providers : [ethereum].filter(Boolean);

      candidates.forEach((provider) => {
        if (provider?.isMetaMask) detected.metamask = provider;
        if (provider?.isCoinbaseWallet) detected.coinbase = provider;
        if (provider?.isWalletConnect || provider?.wc || provider?.connector?.id === 'walletconnect') {
          detected.walletConnect = provider;
        }
      });

      setEvmProviders(detected);
    };

    detectSolanaWallets();
    detectEvmWallets();
  }, []);

  const emitNetworkMismatch = () => {
    const payload = { currentChain: chain, requestedChain: mode };
    setStatusMessage('Network mismatch. Please switch modes or disconnect first.');
    if (onNetworkMismatch) onNetworkMismatch(payload);
  };

  const handleSolanaConnect = async (providerName) => {
    if (chainMismatch) {
      emitNetworkMismatch();
      return;
    }

    const provider = providerName ? solanaProviders[providerName] : solanaProviders.phantom || solanaProviders.solflare || solanaProviders.ledger;
    if (!provider) {
      setStatusMessage('No Solana wallet detected.');
      return;
    }

    try {
      const response = await provider.connect();
      const publicKey = response?.publicKey || provider.publicKey;
      const address = publicKey?.toString?.() || publicKey?.toBase58?.();

      setWalletState({
        chain: 'SOL',
        walletAddress: address || null,
        providerObject: provider,
        signer: null,
        publicKey: publicKey || null,
        connectionStatus: 'connected',
      });

      setStatusMessage(`Connected to Solana via ${providerName || provider?.name || 'wallet'}.`);
      if (onConnect) onConnect({ chain: 'SOL', address, provider });
    } catch (error) {
      setStatusMessage(error?.message || 'Failed to connect Solana wallet.');
    }
  };

  const handleEvmConnect = async (providerName) => {
    if (chainMismatch) {
      emitNetworkMismatch();
      return;
    }

    const provider = providerName ? evmProviders[providerName] : evmProviders.metamask || evmProviders.coinbase || evmProviders.walletConnect;
    if (!provider) {
      setStatusMessage('No EVM wallet detected.');
      return;
    }

    try {
      const accounts = await provider.request({ method: 'eth_requestAccounts' });
      const address = Array.isArray(accounts) ? accounts[0] : accounts;
      const ethersProvider = new ethers.providers.Web3Provider(provider);
      const signer = ethersProvider.getSigner();

      setWalletState({
        chain: 'EVM',
        walletAddress: address || null,
        providerObject: provider,
        signer,
        publicKey: null,
        connectionStatus: 'connected',
      });

      setStatusMessage(`Connected to EVM via ${providerName || provider?.name || 'wallet'}.`);
      if (onConnect) onConnect({ chain: 'EVM', address, provider, signer });
    } catch (error) {
      setStatusMessage(error?.message || 'Failed to connect EVM wallet.');
    }
  };

  const handleDisconnect = async () => {
    if (providerObject?.disconnect) {
      try {
        await providerObject.disconnect();
      } catch (error) {
        // disconnect failure should not block reset
        console.warn('Wallet disconnect error', error);
      }
    }

    resetWallet();
    setStatusMessage('Disconnected wallet.');
    if (onDisconnect) onDisconnect();
  };

  const renderSolanaActions = () => {
    const { phantom, solflare, ledger } = solanaProviders;

    if (!phantom && !solflare && !ledger) {
      return (
        <div className="wallet-links">
          <a href="https://phantom.app/" target="_blank" rel="noreferrer">Install Phantom</a>
          <a href="https://solflare.com/" target="_blank" rel="noreferrer">Install Solflare</a>
          <a href="https://www.ledger.com/" target="_blank" rel="noreferrer">Get Ledger</a>
        </div>
      );
    }

    return (
      <div className="wallet-buttons">
        {phantom && (
          <button type="button" onClick={() => handleSolanaConnect('phantom')}>
            Connect Phantom
          </button>
        )}
        {solflare && (
          <button type="button" onClick={() => handleSolanaConnect('solflare')}>
            Connect Solflare
          </button>
        )}
        {ledger && (
          <button type="button" onClick={() => handleSolanaConnect('ledger')}>
            Connect Ledger
          </button>
        )}
      </div>
    );
  };

  const renderEvmActions = () => {
    const { metamask, coinbase, walletConnect } = evmProviders;

    if (!metamask && !coinbase && !walletConnect) {
      return (
        <div className="wallet-links">
          <a href="https://metamask.io/" target="_blank" rel="noreferrer">Install MetaMask</a>
          <a href="https://www.coinbase.com/wallet" target="_blank" rel="noreferrer">Install Coinbase Wallet</a>
          <a href="https://walletconnect.com/" target="_blank" rel="noreferrer">Learn WalletConnect</a>
        </div>
      );
    }

    return (
      <div className="wallet-buttons">
        {metamask && (
          <button type="button" onClick={() => handleEvmConnect('metamask')}>
            Connect MetaMask
          </button>
        )}
        {coinbase && (
          <button type="button" onClick={() => handleEvmConnect('coinbase')}>
            Connect Coinbase Wallet
          </button>
        )}
        {walletConnect && (
          <button type="button" onClick={() => handleEvmConnect('walletConnect')}>
            Connect WalletConnect
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="wallet-connect">
      <div className="mode-toggle">
        <button
          type="button"
          className={mode === 'SOL' ? 'active' : ''}
          onClick={() => setMode('SOL')}
        >
          Solana Mode
        </button>
        <button
          type="button"
          className={mode === 'EVM' ? 'active' : ''}
          onClick={() => setMode('EVM')}
        >
          Ethereum Mode
        </button>
      </div>

      {walletAddress && (
        <div className="wallet-info">
          <div>Connected: {walletAddress}</div>
          <div>Chain: {chain}</div>
        </div>
      )}

      {chainMismatch && (
        <div className="warning">Network mismatch detected. Please switch mode or disconnect.</div>
      )}

      <div className="actions">
        {mode === 'SOL' ? renderSolanaActions() : renderEvmActions()}
        {walletAddress && (
          <button type="button" onClick={handleDisconnect}>
            Disconnect
          </button>
        )}
      </div>

      {statusMessage && <div className="status">{statusMessage}</div>}
    </div>
  );
};

export default WalletConnect;
